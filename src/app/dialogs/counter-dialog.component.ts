import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {Counter} from '../memory/model/logicalNetworks/counter';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatButton} from '@angular/material/button';
import {FormatPipe} from '../pipes/format.pipe';
import {MatIcon} from '@angular/material/icon';

export interface CounterDialogData {
  network: Counter;
}

@Component({
  templateUrl: './counter-dialog.component.html',
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
    MatDialogContent,
    MatFormField,
    MatInput,
    FormsModule,
    MatSelect,
    MatOption,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    FormatPipe,
    MatLabel,
    MatIcon
  ]
})
export class CounterDialogComponent implements OnInit {
  private data = inject<CounterDialogData>(MAT_DIALOG_DATA);

  private _formatPipe = inject(FormatPipe);

  protected cloneDevice: Counter;
  protected hexCurrentValueDisplay = signal('');
  protected hexLoadValueDisplay = signal('');
  protected countingBasis = signal(0);

  constructor() {
    this.cloneDevice = new Counter(0, 5);
    this.cloneDevice.updateFrom(this.data.network);

    effect(() => {
      const basis = this.countingBasis();
      this.applyPadding();
    });
  }

  ngOnInit() {
    this.hexCurrentValueDisplay.set(this._formatPipe.transform(this.cloneDevice.currentValue, 'hex', this.cloneDevice.countingBasis));
    this.hexLoadValueDisplay.set(this._formatPipe.transform(this.cloneDevice.loadValue, 'hex', this.cloneDevice.countingBasis));
    this.countingBasis.set(this.cloneDevice.countingBasis);
  }

  protected onCurrentValueChange(newValue: string) {
    this.hexCurrentValueDisplay.set(newValue);
    const hexVal = this._formatPipe.transform(this.hexCurrentValueDisplay(), 'dec', this.cloneDevice.countingBasis);
    if (!isNaN(hexVal)) {
      this.cloneDevice.currentValue = hexVal;
    }
  }

  protected onLoadValueChange(newValue: string) {
    this.hexLoadValueDisplay.set(newValue);
    const hexVal = this._formatPipe.transform(this.hexLoadValueDisplay(), 'dec', this.cloneDevice.countingBasis);
    if (!isNaN(hexVal)) {
      this.cloneDevice.loadValue = hexVal;
    }
  }

  protected applyPadding() {
    this.hexCurrentValueDisplay.set(this._formatPipe.transform(
      this.cloneDevice.currentValue,
      'hex',
      this.cloneDevice.countingBasis
    ));

    this.hexLoadValueDisplay.set(this._formatPipe.transform(
      this.cloneDevice.loadValue,
      'hex',
      this.cloneDevice.countingBasis
    ));
  }

  protected onCountingBasisChange() {
    if (isNaN(this.countingBasis())) {
      this.countingBasis.set(32);
      return;
    }
    else if (this.countingBasis() < 2) {
      this.countingBasis.set(2);
    }
    else if (this.countingBasis() > 32) {
      this.countingBasis.set(32);
    }

    this.cloneDevice.countingBasis = this.countingBasis();
    this.cloneDevice.asyncReset();
  }

  protected downloadImage() {
    const link = document.createElement('a');
    link.href = this.cloneDevice.imagePath;
    link.download = `${this.cloneDevice.name || 'counter'}-schema.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
