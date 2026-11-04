import {Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {InputPort, InputPortSizesArray} from '../memory/model/logicalNetworks/input-port';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {FormatPipe} from '../pipes/format.pipe';
import {MatButton} from '@angular/material/button';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';

export interface InputPortDialogData {
  network: InputPort;
}

@Component({
  templateUrl: './input-port-dialog.component.html',
  styles: [`
    .image-container {
      position: relative;
      display: inline-block;
    }
    .image-container .download-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      background: rgba(0, 0, 0, 0.65);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }
    .image-container .download-btn:hover {
      background: rgba(0, 0, 0, 0.85);
    }
    .image-container:hover .download-btn {
      opacity: 1;
    }
  `],
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
    MatSelect,
    MatIcon
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
    return this.cloneDevice.imagePath;
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

  protected downloadImage() {
    const link = document.createElement('a');
    link.href = this.cloneDevice.imagePath;
    link.download = `${this.cloneDevice.name || 'input_port'}-schema.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
