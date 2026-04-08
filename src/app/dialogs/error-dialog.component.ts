import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

export interface ErrorDialogData {
  message: string;
}

@Component({
  templateUrl: './error-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ]
})
export class ErrorDialogComponent {
  protected data = inject<ErrorDialogData>(MAT_DIALOG_DATA);
}
