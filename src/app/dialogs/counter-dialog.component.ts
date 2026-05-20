import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {Counter} from '../memory/model/logicalNetworks/counter';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatButton} from '@angular/material/button';
import {FormatPipe} from '../pipes/format.pipe';

export interface CounterDialogData {
  network: Counter;
}

@Component({
  templateUrl: './counter-dialog.component.html',
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
    MatLabel
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
}
