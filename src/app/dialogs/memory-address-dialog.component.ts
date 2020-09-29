import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './memory-address-dialog.component.html',
})
export class MemoryAddressDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

}
