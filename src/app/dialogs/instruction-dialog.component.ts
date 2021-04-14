import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MemoryService } from '../services/memory.service';
import { isUndefined } from 'util';

@Component({
  templateUrl: './instruction-dialog.component.html'
})
export class InstructionDialogComponent {
  fType : string;
  instruction : string;
  iv: number;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service: MemoryService, 
  private dialog: MatDialog, private dialogRef: MatDialogRef<InstructionDialogComponent>) 
  {
    this.fType = 'hex'
    this.instruction = "0x"+data.values[0].instruction;
    this.iv = data.values[0].iv;
  }

  // I seguenti due metodi verificano che ci siano dei dispositivi mappati nel range di 4 byte successivo.
  // In caso negativo i button per scorrere avanti o indietro vengono disabilitati 

  isNextDisabled(): boolean {
    let next = this.iv + 4 ; // il range che visualizzo con la "show detail" è di 4 byte
    let finalAddr 
    if (next || next === 0) {
      finalAddr = next >>> 2;
    }
    if(this.service.memory.devices.find(el => el.min_address <= finalAddr && el.max_address >= finalAddr)==null)
      return true;
    
    return false;
  }

  isPreDisabled(): boolean {
    let pre = this.iv - 4 ;
    let finalAddr 
    if (pre || pre === 0) {
      finalAddr = pre >>> 2;
    }

    if(this.service.memory.devices.find(el => el.min_address <= finalAddr && el.max_address >= finalAddr)==null)
      return true;
    
      return false;
  }

  // Metodo che apre un nuovo componente dialog (chiudendo quello corrente) per visualizzare la codifica byte per byte
  // del range di memoria da 4 byte successivo a quella corrente. Utilizza gli stessi passaggi già visti in readMemoryDetail 
  // nel componente Memory
  
  viewNextInstr() {
    
    let next = this.iv + 4 ;  
    let finalAddr 
    if (next || next === 0) {
      finalAddr = next >>> 2;
    }
    let d = this.service.memory.devices.find(el => el.min_address <= finalAddr && el.max_address >= finalAddr);
    // per visualizzare sempre il codice a partire da multipli di 4, così da non avere disallineamento tra
    // indirizzo e codifica 
    if(next % 4 !== 0) next = (Math.floor(next/4))*4;
    let instr = d.load(finalAddr);
    if(isUndefined(instr)) instr= Math.floor(Math.random()*4294967296);
      let bin=instr.toString(2).padStart(32, '0');
      let arrData = [] ;
      for (let i=0 ; i<32 ; i+=8) {
        arrData.push(
          {
            iv: next,
            instruction : instr.toString(16).toUpperCase() ,
            value: bin.slice(24-i,32-i) ,  
            address: next + (i/8),
            hexAddress: d.getAddressHexInstr(next + i/8)
          })
      }
      
      this.dialog.open(InstructionDialogComponent, {
        data: { values: arrData, service: this.service },
      });

      this.dialogRef.close();  // per chiudere il dialog corrente altrimenti verrebbero visualizzati uno sopra l'altro


  }

  // Metodo che apre un nuovo componente dialog (chiudendo quello corrente) per visualizzare la codifica byte per byte
  // del range di memoria da 4 byte precedente a quella corrente. Utilizza gli stessi passaggi già visti in readMemoryDetail 
  // nel componente Memory

  viewPreInstr() {
    let pre = this.iv - 4 ;
    let finalAddr 
    if (pre || pre === 0) {
      finalAddr = pre >>> 2;
    }

    let d = this.service.memory.devices.find(el => el.min_address <= finalAddr && el.max_address >= finalAddr);
    // per visualizzare sempre il codice a partire da multipli di 4, così da non avere disallineamento tra
    // indirizzo e codifica 
    if(pre % 4 !== 0) pre = (Math.floor(pre/4))*4;
    let instr = d.load(finalAddr);
    if(isUndefined(instr)) instr= Math.floor(Math.random()*4294967296);
      let bin=instr.toString(2).padStart(32, '0');
      let arrData = [] ;
      for (let i=0 ; i<32 ; i+=8) {
        arrData.push(
          {
            iv: pre,
            instruction : instr.toString(16).toUpperCase() ,
            value: bin.slice(24-i,32-i) ,  
            address: pre + (i/8),
            hexAddress: d.getAddressHexInstr(pre + i/8)
          })
      }

      this.dialog.open(InstructionDialogComponent, {
        data: { values: arrData, service: this.service },
      });

      this.dialogRef.close();
  }
}