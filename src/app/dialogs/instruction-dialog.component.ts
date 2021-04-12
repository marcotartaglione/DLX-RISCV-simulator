import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MemoryService } from '../services/memory.service';

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

  // I seguenti due metodi verificano se sia codificata un istruzione dopo/prima quella corrente (indirizzo corrente +4).
  // Se nessuna istruzione è codificata allora il button corrispondente verra disabilitato

  isNextDisabled(): boolean {
    let next = this.iv + 4 ; // +4 perchè un'istruzione è lunga 4 byte
    let finalAddr 
    if (next || next === 0) {
      finalAddr = next >>> 2;
    }

    if(this.service.getEprom().load(finalAddr)==null)
      return true;
    
    return false;
  }

  isPreDisabled(): boolean {
    let pre = this.iv - 4 ;
    let finalAddr 
    if (pre || pre === 0) {
      finalAddr = pre >>> 2;
    }

    if(this.service.getEprom().load(finalAddr)==null)
      return true;
    
      return false;
  }

  // Metodo che apre un nuovo componente dialog (chiudendo quello corrente) per visualizzare la codifica byte per byte
  // dell'istruzione successiva a quella corrente. Utilizza gli stessi passaggi già visti in readMemoryAddress nel componente Memory
  
  viewNextInstr() {
    
    let next = this.iv + 4 ;  // +4 perchè un'istruzione è lunga 4 byte
    let finalAddr 
    if (next || next === 0) {
      finalAddr = next >>> 2;
    }

    if(next % 4 !== 0) next = (Math.floor(next/4))*4;
      
      let instr = this.service.getEprom().load(finalAddr);
      let bin=instr.toString(2).padStart(32, '0');
      let arrData = [] ;
      for (let i=0 ; i<32 ; i+=8) {
        arrData.push(
          {
            iv: next,
            instruction : instr.toString(16).toUpperCase() ,
            value: bin.slice(i,i+8) ,  
            address: next + (i/8),
            hexAddress: this.service.getEprom().getAddressHexInstr(next + i/8)
          })
      }

      this.dialog.open(InstructionDialogComponent, {
        data: { values: arrData, service: this.service },
      });

      this.dialogRef.close();


  }

  // Metodo che apre un nuovo componente dialog (chiudendo quello corrente) per visualizzare la codifica byte per byte
  // dell'istruzione precedente a quella corrente. Utilizza gli stessi passaggi già visti in readMemoryAddress nel componente Memory

  viewPreInstr() {
    let pre = this.iv - 4 ;
    let finalAddr 
    if (pre || pre === 0) {
      finalAddr = pre >>> 2;
    }

    if(pre % 4 !== 0) pre = (Math.floor(pre/4))*4;
      
      let instr = this.service.getEprom().load(finalAddr);
      let bin=instr.toString(2).padStart(32, '0');
      let arrData = [] ;
      for (let i=0 ; i<32 ; i+=8) {
        arrData.push(
          {
            iv: pre,
            instruction : instr.toString(16).toUpperCase() ,
            value: bin.slice(i,i+8) ,  
            address: pre + (i/8),
            hexAddress: this.service.getEprom().getAddressHexInstr(pre + i/8)
          })
      }

      this.dialog.open(InstructionDialogComponent, {
        data: { values: arrData, service: this.service },
      });

      this.dialogRef.close();
  }
}