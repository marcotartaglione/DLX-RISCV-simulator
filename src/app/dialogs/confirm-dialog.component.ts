import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  templateUrl: './confirm-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatButton,
    MatDialogClose
  ]
})
export class ConfirmDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string, ok: string, ko: string}) {}

}
