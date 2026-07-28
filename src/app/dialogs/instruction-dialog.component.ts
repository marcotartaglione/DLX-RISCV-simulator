import {Component, inject, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MemoryService} from '../services/memory.service';
import {FormatPipe} from '../pipes/format.pipe';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {MatCard} from '@angular/material/card';
import {FormatBytePipe, FormatByteType} from '../pipes/formatByte.pipe';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';

@Component({
  templateUrl: './instruction-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatGridList,
    MatGridTile,
    MatCard,
    FormatBytePipe,
    MatButton,
    MatTooltip,
    MatButtonToggleGroup,
    MatButtonToggle,
    FormsModule,
    MatDialogActions,
    MatDialogClose
  ]
})
export class InstructionDialogComponent {
  public data = inject(MAT_DIALOG_DATA);
  private service = inject(MemoryService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<InstructionDialogComponent>);

  protected formatByteType: FormatByteType = 'bin';
  protected instruction: string;
  protected readonly iv: number;

  constructor() {
    this.instruction = '0x' + this.data.values[0].instruction;
    this.iv = this.data.values[0].iv;
  }

  protected isInRange(address: number): boolean {
    if (address < 0)
      return;

    const finalAddr = address >>> 2;
    return this.service.devices.find(el => el.minAddress <= finalAddr && el.maxAddress >= finalAddr) === null;
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
    const d = this.service.devices.find(el => el.minAddress <= finalAddr && el.maxAddress >= finalAddr);
    // per visualizzare sempre il codice a partire da multipli di 4, così da non avere disallineamento tra
    // indirizzo e codifica
    if (next % 4 !== 0) {
      next = (Math.floor(next / 4)) * 4;
    }
    let instr = d.load(finalAddr);
    if (instr === undefined) {
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

    const d = this.service.devices.find(el => el.minAddress <= finalAddr && el.maxAddress >= finalAddr);
    // per visualizzare sempre il codice a partire da multipli di 4, così da non avere disallineamento tra
    // indirizzo e codifica
    if (pre % 4 !== 0) {
      pre = (Math.floor(pre / 4)) * 4;
    }
    let instr = d.load(finalAddr);
    if (instr === undefined) {
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
