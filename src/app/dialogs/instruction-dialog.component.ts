import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MemoryService } from '../services/memory.service';

@Component({
  templateUrl: './instruction-dialog.component.html',
})
export class InstructionDialogComponent {
  fType : string;
  instruction : string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service: MemoryService) {
    this.fType = 'hex'
    this.instruction = "0x"+data.values[0].instruction;
  }
}