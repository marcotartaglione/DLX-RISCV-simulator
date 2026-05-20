import {Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {InputPort, InputPortSizesArray} from '../memory/model/logicalNetworks/input-port';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormGroup, FormsModule} from '@angular/forms';
import {FormatPipe} from '../pipes/format.pipe';
import {MatButton} from '@angular/material/button';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';

export interface InputPortDialogData {
  network: InputPort;
}

@Component({
  templateUrl: './input-port-dialog.component.html',
  standalone: true,
  providers: [FormatPipe],
  imports: [
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
  private data = inject<InputPortDialogData>(MAT_DIALOG_DATA);
  protected cloneDevice: InputPort;

  private _formatPipe = inject(FormatPipe);
  protected readonly InputPortSizesArray = InputPortSizesArray;

  protected hexDisplayValue: string = '';

  constructor() {
    this.cloneDevice = new InputPort(0, 1);
    this.cloneDevice.updateFrom(this.data.network);
  }

  protected get urlImage(): string {
    return 'assets/img/input-port/input_port_bit_' + this.cloneDevice.dataSize + '.png';
  }

  ngOnInit() {
    this.hexDisplayValue = this._formatPipe.transform(this.cloneDevice.data, 'hex', this.cloneDevice.dataSize);
  }

  protected onDataChange(newValue: string) {
    this.hexDisplayValue = newValue;

    let cleanValue = newValue.toLowerCase();
    if (cleanValue.startsWith('0x')) {
      cleanValue = cleanValue.substring(2);
    }

    const parsedValue = parseInt(cleanValue, 16);
    if (!isNaN(parsedValue)) {
      this.cloneDevice.data = parsedValue;
    }
  }

  protected applyPadding() {
    this.hexDisplayValue = this._formatPipe.transform(
      this.cloneDevice.data,
      'hex',
      this.cloneDevice.dataSize
    );
  }
}
