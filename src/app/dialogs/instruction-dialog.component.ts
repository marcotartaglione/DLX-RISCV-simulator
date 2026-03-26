import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MemoryService} from '../services/memory.service';
import {isUndefined} from 'util';
import {FormatPipe} from '../pipes/format.pipe';

@Component({
  templateUrl: './instruction-dialog.component.html'
})
export class InstructionDialogComponent {
  fType: string;
  instruction: string;
  iv: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service: MemoryService,
              private dialog: MatDialog, private dialogRef: MatDialogRef<InstructionDialogComponent>) {
    this.fType = 'bin';
    this.instruction = '0x' + data.values[0].instruction;
    this.iv = data.values[0].iv;
  }

  // I seguenti due metodi verificano che ci siano dei dispositivi mappati nel range di 4 byte successivo.
  // In caso negativo i button per scorrere avanti o indietro vengono disabilitati

  isNextDisabled(): boolean {
    const next = this.iv + 4; // il range che visualizzo con la "show detail" è di 4 byte
    let finalAddr;
    if (next || next === 0) {
      // tslint:disable-next-line:no-bitwise
      finalAddr = next >>> 2;
    }
    if (this.service.memory.devices.find(el => el.minAddress <= finalAddr && el.maxAddress >= finalAddr) == null) {
      return true;
    }

    return false;
  }

  isPreDisabled(): boolean {
    const pre = this.iv - 4;
    let finalAddr;
    if (pre || pre === 0) {
      // tslint:disable-next-line:no-bitwise
      finalAddr = pre >>> 2;
    }

    if (this.service.memory.devices.find(el => el.minAddress <= finalAddr && el.maxAddress >= finalAddr) == null) {
      return true;
    }

    return false;
  }

  // Metodo che apre un nuovo componente dialog (chiudendo quello corrente) per visualizzare la codifica byte per byte
  // del range di memoria da 4 byte successivo a quella corrente. Utilizza gli stessi passaggi già visti in readMemoryDetail
  // nel componente Memory

  viewNextInstr() {

    let next = this.iv + 4;
    let finalAddr;
    if (next || next === 0) {
      // tslint:disable-next-line:no-bitwise
      finalAddr = next >>> 2;
    }
    const d = this.service.memory.devices.find(el => el.minAddress <= finalAddr && el.maxAddress >= finalAddr);
    // per visualizzare sempre il codice a partire da multipli di 4, così da non avere disallineamento tra
    // indirizzo e codifica
    if (next % 4 !== 0) {
      next = (Math.floor(next / 4)) * 4;
    }
    let instr = d.load(finalAddr);
    if (isUndefined(instr)) {
      instr = Math.floor(Math.random() * 4294967296);
    }
    // tslint:disable-next-line:no-bitwise
    const bin = (instr >>> 0).toString(2).padStart(32, '0');
    const arrData = [];
    for (let i = 0; i < 32; i += 8) {
      arrData.push(
        {
          iv: next,
          // tslint:disable-next-line:no-bitwise
          instruction: (instr >>> 0).toString(16).padStart(8, '0').toUpperCase(),
          value: bin.slice(24 - i, 32 - i),
          address: next + (i / 8),
          // tslint:disable-next-line:no-bitwise
          hexAddress: new FormatPipe().transform(next + i / 8 << 2, 'hex')
        });
    }

    // Inverto l'array per visualizzare gli indirizzi dal più significativo
    // al meno significativo

    arrData.reverse();

    this.dialog.open(InstructionDialogComponent, {
      data: {values: arrData, service: this.service},
    });

    this.dialogRef.close();  // per chiudere il dialog corrente altrimenti verrebbero visualizzati uno sopra l'altro


  }

  // Metodo che apre un nuovo componente dialog (chiudendo quello corrente) per visualizzare la codifica byte per byte
  // del range di memoria da 4 byte precedente a quella corrente. Utilizza gli stessi passaggi già visti in readMemoryDetail
  // nel componente Memory

  viewPreInstr() {
    let pre = this.iv - 4;
    let finalAddr;
    if (pre || pre === 0) {
      // tslint:disable-next-line:no-bitwise
      finalAddr = pre >>> 2;
    }

    const d = this.service.memory.devices.find(el => el.minAddress <= finalAddr && el.maxAddress >= finalAddr);
    // per visualizzare sempre il codice a partire da multipli di 4, così da non avere disallineamento tra
    // indirizzo e codifica
    if (pre % 4 !== 0) {
      pre = (Math.floor(pre / 4)) * 4;
    }
    let instr = d.load(finalAddr);
    if (isUndefined(instr)) {
      instr = Math.floor(Math.random() * 4294967296);
    }
    // tslint:disable-next-line:no-bitwise
    const bin = (instr >>> 0).toString(2).padStart(32, '0');
    const arrData = [];
    for (let i = 0; i < 32; i += 8) {
      arrData.push(
        {
          iv: pre,
          // tslint:disable-next-line:no-bitwise
          instruction: (instr >>> 0).toString(16).padStart(8, '0').toUpperCase(),
          value: bin.slice(24 - i, 32 - i),
          address: pre + (i / 8),
          // tslint:disable-next-line:no-bitwise
          hexAddress: new FormatPipe().transform((pre + i / 8) << 2, 'hex')
        });
    }

    // Inverto l'array per visualizzare gli indirizzi dal più significativo
    // al meno significativo

    arrData.reverse();

    this.dialog.open(InstructionDialogComponent, {
      data: {values: arrData, service: this.service},
    });

    this.dialogRef.close();
  }

}
