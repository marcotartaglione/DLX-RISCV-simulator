import {Component, inject, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {ErrorDialogComponent} from './error-dialog.component';
import {InputPort, InputPortSizesArray} from '../memory/model/input-port';
import {NgOptimizedImage} from '@angular/common';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {FormatPipe} from '../pipes/format.pipe';
import {MatButton} from '@angular/material/button';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';

export interface InputPortDialogData {
  network: InputPort
}

@Component({
  templateUrl: './input-port-dialog.component.html',
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatFormField,
    MatInput,
    FormsModule,
    MatDialogContent,
    FormatPipe,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatLabel,
    MatOption,
    MatSelect
  ]
})
export class InputPortDialogComponent implements OnInit {
  protected data = inject<InputPortDialogData>(MAT_DIALOG_DATA);
  protected urlImage: string;

  ngOnInit() {
    this.urlImage = 'assets/img/input-port/input_port_bit_' + this.data.network.dataSize + '.png';
  }

  protected readonly InputPortSizesArray = InputPortSizesArray;
}
