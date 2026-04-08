import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

export interface MessageDialogData {
  message: string;
}

@Component({
  templateUrl: './message-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ]
})
export class MessageDialogComponent {
  public data = inject<MessageDialogData>(MAT_DIALOG_DATA);
}
