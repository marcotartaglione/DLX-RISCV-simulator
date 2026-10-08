# Deploy e infrastruttura

Questa guida descrive come viene pubblicato il simulatore e come rifare l'intera configurazione da zero.
Il perché delle scelte è in [`DECISIONS.md`](DECISIONS.md).

> Nel repository non inserire **MAI** chiavi private, valori dei secret o password.

## 1. Come funziona

```
push su master
   │
   ▼
GitHub Actions (.github/workflows/deploy.yml)
   │  npm ci → ng build (produzione, --base-href=/simulator/)
   ▼
rsync via SSH ──► /home/deploy/incoming/        (limitato da rrsync)
   │
   ▼
ssh ... deploy ──► deploy-wrapper.sh ──► deploy-simulator.sh
                                            │ backup di /var/www/html/simulator
                                            │ rsync --delete incoming/ → /var/www/html/simulator/
                                            ▼
                              https://dlx-simulator.disi.unibo.it/simulator/
```

| Elemento | Posizione |
|---|---|
| Workflow | `.github/workflows/deploy.yml` |
| Sito pubblicato | `/var/www/html/simulator` (proprietario `deploy`) |
| Cartella di upload | `/home/deploy/incoming` |
| Backup | `/var/backups/simulator/<AAAAMMGG-HHMMSS>` (ultimi 5) |
| Script sul server | `/usr/local/bin/deploy-wrapper.sh` e `/usr/local/bin/deploy-simulator.sh` (proprietà di root, 755) |
| Configurazione Apache | `/etc/apache2/conf-available/simulator.conf` |

### Cosa fanno i due script

Gli script vivono sul server in `/usr/local/bin/` e, per sicurezza, non sono modificabili dall'utente `deploy`.
Conviene tenerne una copia in `infra/deploy-wrapper.sh` e `infra/deploy-simulator.sh` (da copiare dal server, vedi sezione 7).

- **`deploy-wrapper.sh`** è l'unico comando che la chiave SSH può eseguire. Legge `$SSH_ORIGINAL_COMMAND` e accetta solo:
  - `rsync --server ...` → esegue `rrsync /home/deploy/incoming` (upload ristretto a quella cartella);
  - `deploy` → esegue `deploy-simulator.sh`;
  - qualunque altra cosa → errore `Comando non permesso`.
- **`deploy-simulator.sh`** controlla che `incoming/index.html` esista, copia il sito attuale in `/var/backups/simulator/<timestamp>`, tiene gli ultimi 5 backup ed esegue `rsync -a --delete incoming/ → /var/www/html/simulator/`.

## 2. Setup del server da zero

Eseguire da un utente amministratore.

### 2.1 Utente dedicato (senza password, senza sudo)

```bash
sudo adduser --disabled-password --gecos "" deploy

sudo mkdir -p /var/www/html/simulator /var/backups/simulator
sudo chown -R deploy:deploy /var/www/html/simulator /var/backups/simulator

sudo -u deploy mkdir -p /home/deploy/incoming
sudo apt install rsync
```

### 2.2 Chiave SSH dedicata

Sul proprio PC (non sul server):

```bash
ssh-keygen -t ed25519 -f dlx_deploy_key -C "github-actions-simulator" -N ""
```

Sul server:

```bash
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys     # vedi infra/ssh/authorized_keys.example
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
```

La riga ha questa forma (con la chiave pubblica reale):

```
restrict,command="/usr/local/bin/deploy-wrapper.sh" ssh-ed25519 AAAA... github-actions-simulator
```

### 2.3 Script e rrsync

```bash
# dopo aver copiato i due script in /usr/local/bin/
sudo chown root:root /usr/local/bin/deploy-wrapper.sh /usr/local/bin/deploy-simulator.sh
sudo chmod 755      /usr/local/bin/deploy-wrapper.sh /usr/local/bin/deploy-simulator.sh

# rrsync: il percorso varia in base alla distribuzione
which rrsync || ls /usr/share/doc/rsync/scripts/rrsync*
# se non è nel PATH:
sudo cp /usr/share/doc/rsync/scripts/rrsync /usr/local/bin/rrsync
sudo chmod 755 /usr/local/bin/rrsync          # richiede python3
# e aggiornare il percorso dentro deploy-wrapper.sh
```

Verifica che `deploy` possa eseguire il wrapper e che il percorso sia attraversabile:

```bash
sudo -u deploy test -x /usr/local/bin/deploy-wrapper.sh && echo OK
namei -l /usr/local/bin/deploy-wrapper.sh
```

### 2.4 Apache

```bash
sudo cp infra/apache/simulator.conf /etc/apache2/conf-available/simulator.conf
sudo a2enconf simulator
sudo apache2ctl configtest        # deve rispondere "Syntax OK"
sudo systemctl reload apache2
```

Verifica:

```bash
curl -I https://dlx-simulator.disi.unibo.it/                 # 302, Location: /simulator/
curl -I https://dlx-simulator.disi.unibo.it/simulator/dlx    # 200
```

### 2.5 Hardening SSH (consigliato)

In `/etc/ssh/sshd_config`:

```
PasswordAuthentication no
PermitRootLogin no
AllowUsers <utente_admin> deploy
```

```bash
sudo systemctl reload ssh
```

Valutare anche `fail2ban` e un firewall (`ufw`) con solo le porte necessarie.

## 3. Secret di GitHub

*Settings → Secrets and variables → Actions*

| Secret | Contenuto | Come ottenerlo |
|---|---|---|
| `SSH_HOST` | `dlx-simulator.disi.unibo.it` | nome pubblico del server |
| `SSH_PORT` | porta SSH (di solito `22`) | configurazione di sshd |
| `SSH_USERNAME` | `deploy` | |
| `SSH_PRIVATE_KEY` | contenuto **intero** di `dlx_deploy_key` (righe `BEGIN`/`END` comprese) | `ssh-keygen`, sezione 2.2 |
| `SSH_KNOWN_HOSTS` | `dlx-simulator.disi.unibo.it ssh-ed25519 AAAA...` | sul server: `cat /etc/ssh/ssh_host_ed25519_key.pub`, anteponendo il nome host |

Note:

- Il nome host in `SSH_KNOWN_HOSTS` deve coincidere **esattamente** con `SSH_HOST`. Con porta diversa da 22 il formato è `[host]:porta ssh-ed25519 AAAA...`.
- Verificare l'impronta confrontando `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` (sul server) con `ssh-keyscan -t ed25519 <host> | ssh-keygen -lf -` (dal PC).
- Caricata la chiave su GitHub, **cancellare la privata dal PC**: `shred -u dlx_deploy_key`.
- Il workflow usa un *Environment* `production`. Se vi si aggiungono approvazioni manuali, il job resta in attesa finché non vengono concesse.

## 4. Procedura di release

Il deploy parte da solo a ogni push su `master`. La versione mostrata nella barra (`vX.Y.Z (sha)`) si aggiorna così:

```bash
git add . && git commit -m "Descrizione"
npm version patch          # oppure minor / major: aggiorna package.json e package-lock.json, crea commit e tag
git push --follow-tags
```

Il file `src/environments/build-info.ts` contiene `sha: 'dev'` in locale; nel workflow viene riscritto con lo SHA e la data reali prima della build.
Dopo il deploy, passando il mouse sulla versione si vede il commit: confrontalo con `git log --oneline -1` per sapere se il sito online è aggiornato.

## 5. Rollback

I backup sono copie complete del sito, in `/var/backups/simulator/`.

```bash
ls -1t /var/backups/simulator/                      # sceglie la versione
sudo -u deploy rsync -a --delete /var/backups/simulator/<AAAAMMGG-HHMMSS>/ /var/www/html/simulator/
```

Se il problema è nel codice, il modo corretto è annullare il commit su `master` (`git revert`) e lasciare che il workflow ridistribuisca.

## 6. Risoluzione dei problemi

| Sintomo | Causa | Soluzione |
|---|---|---|
| `Load key ...: error in libcrypto` | Chiave senza newline finale, CRLF o incollata male | `sed -i 's/\r$//' key; echo >> key; chmod 600 key`; verificare con `ssh-keygen -y -f key`. Nel workflow si usa `printf '%s\n'` |
| `bash: .../deploy-wrapper.sh: Permission denied` | Script non eseguibile o non leggibile da `deploy` | `chown root:root` e `chmod 755` su entrambi gli script |
| `ERRORE: build non trovata in .../incoming` | L'upload non è avvenuto o `incoming/` è vuota | Controllare lo step *Upload build* |
| `Comando non permesso` | `$SSH_ORIGINAL_COMMAND` non previsto dal wrapper | Aggiungere temporaneamente `echo "$SSH_ORIGINAL_COMMAND" >> /tmp/ssh_cmd.log` al wrapper |
| rsync fallisce con `rrsync` | Destinazione assoluta (`:/home/deploy/incoming/`) invece di relativa, `rrsync` mancante, oppure manca `python3` | Usare la destinazione `:./`; vedere sezione 2.3 |
| `npm ci` → `package.json and package-lock.json are not in sync` | Lockfile non allineato | `npm install`, poi committare `package-lock.json` |
| `npm ci` → `can only install with an existing package-lock.json` | Lockfile mancante o ignorato da `.gitignore` | Generarlo e committarlo |
| La build locale non compila: `build-info.ts is not a module` | `build-info.ts` vuoto | Ripristinare i valori di default |
| 404 ricaricando `/simulator/dlx` | Manca il fallback di Angular | Abilitare `../infra/apache/simulator.conf` |
| Pagina bianca o asset 404 | `--base-href` diverso dal percorso pubblico | Deve essere `/simulator/` |
| Timeout dello step SSH su GitHub | Server raggiungibile solo dalla rete di ateneo/VPN | Aprire la porta in modo controllato oppure usare un *self-hosted runner* nella rete dell'università; chiedere al sistemista |

Log utili sul server: `sudo journalctl -u ssh -n 50` e `/var/log/auth.log`.

## 7. Manutenzione

- **Copie di riferimento.** Le versioni ufficiali sono quelle in `infra/`; il server può divergere se qualcuno modifica a mano. Per controllare:
  ```bash
  diff infra/apache/simulator.conf /etc/apache2/conf-available/simulator.conf
  diff infra/deploy-simulator.sh   /usr/local/bin/deploy-simulator.sh
  diff infra/deploy-wrapper.sh     /usr/local/bin/deploy-wrapper.sh
  ```
- **Rotazione della chiave SSH:** generare una nuova coppia, sostituire la riga in `authorized_keys`, aggiornare `SSH_PRIVATE_KEY`, fare un deploy di prova e solo allora rimuovere la vecchia.
- **Aggiornare Node nel workflow:** cambiare `node-version` in `.github/workflows/deploy.yml` e usare la stessa major in locale, per evitare discrepanze nel lockfile.
- **Dockerfile:** non fa parte del processo di deploy ed è obsoleto.
