import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './image-dialog.component.html',
    standalone: false
})
export class ImageDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {src: string}) {}

}
