import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {NgOptimizedImage} from '@angular/common';

export interface ImageDialogData {
  src: string;
}

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
  protected data = inject<ImageDialogData>(MAT_DIALOG_DATA);
}
