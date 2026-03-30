import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {NgOptimizedImage} from '@angular/common';

@Component({
  templateUrl: './image-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    NgOptimizedImage
  ]
})
export class ImageDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {src: string}) {}

}
