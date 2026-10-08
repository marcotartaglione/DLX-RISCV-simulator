# Processore / Simulatore di Architetture — Reti di Calcolatori

Simulatore di architetture DLX e RISC-V creato come progetto didattico per facilitare l'apprendimento delle architetture di calcolo e dei concetti base di una CPU.
Il simulatore permette di vedere e usare i registri della CPU, eseguire le istruzioni una alla volta e capire come si svolgono le operazioni.

---

## 📋 Indice
- [Informazioni sul Progetto](#-informazioni-sul-progetto)
- [Installazione e Avvio](#-installazione-e-avvio)
- [Deploy e Infrastruttura](#-deploy-e-infrastruttura)
- [Autori e Riconoscimenti](#-autori-e-riconoscimenti)

---

## ℹ️ Informazioni sul Progetto

Questo simulatore permette di comprendere il funzionamento interno di un'architettura DLX o RISC-V, consentendo l'esecuzione di istruzioni
step-by-step, il tracciamento dei registri e la visualizzazione dello stato interno del processore.

Nel caso dell'architettura DLX, si può anche lavorare con la memoria e con diversi dispositivi di input e output.

---

## ⚙️ Installazione e Avvio

Il simulatore è stato sviluppato in Angular con TypeScript e può essere eseguito localmente seguendo questi passaggi:

1. **Clonare il repository**:
   ```bash
   git clone https://github.com/marcotartaglione/DLX-RISCV-simulator

2. **Vai alla cartella del progetto**.
   ```bash
   cd DLX-RISCV-simulator

3. **Installare le dipendenze**:
   ```bash
    npm install

4. **Avviare l'applicazione**:
   ```bash
   npm run start

5. **Apri il browser** e vai all'indirizzo:
   ```
   http://localhost:4200

---

## 🚀 Deploy e Infrastruttura

Ad ogni push su `master` GitHub Actions compila il simulatore e lo pubblica automaticamente su `https://dlx-simulator.disi.unibo.it/simulator/`.

- [`docs/DEPLOY.md`](docs/DEPLOY.md): funzionamento, setup del server da zero, secret, release, rollback e risoluzione dei problemi
- [`infra/`](infra/): copie di riferimento della configurazione del server

Per rilasciare una nuova versione (mostrata nella barra di navigazione):

```bash
npm version patch   # oppure minor / major
git push --follow-tags
```

---

## 🧑‍💻 Autori e Riconoscimenti

Il progetto è stato sviluppato con la supervisione del **Prof. [Stefano Mattoccia](https://github.com/stefanomattoccia)** dell'**Università di Bologna**.
per il corso di Architetture di Calcolatori della facoltà di Ingegneria Informatica. Per altre informazioni o per partecipare al progetto, contatta il team di 
sviluppo usando il repository GitHub.

Autori principali:
- [Marco Tartaglione](https://github.com/marcotartaglione)
- [Gabriele Piazzi](https://github.com/Piazzoscan)
- [Umberto Laghi](https://github.com/ubolakes)
- [Filippo Comastri](https://github.com/FilippoComastri)
- [Federico Pomponi](https://github.com/pmpwith2i)
- [Alessandro Foglia](https://github.com/Leaaaf)
- [Fabrizione Maccagnani](https://github.com/Mack3397)
