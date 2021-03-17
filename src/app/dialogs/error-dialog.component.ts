import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './error-dialog.component.html',
})
export class ErrorDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}) {}

}
