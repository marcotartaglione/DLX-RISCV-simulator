import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {Counter} from '../memory/model/counter';
import {ErrorDialogComponent} from './error-dialog.component';
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
export class CounterDialogComponent {
  protected data = inject<CounterDialogData>(MAT_DIALOG_DATA);
  private _dialog = inject(MatDialog);

  protected onCountingBasisChange() {
    this.data.network.asyncReset();
  }

  protected onSubmit() {
    if (this.data.network.countingBasis < 2 || this.data.network.countingBasis > 32) {
      this._dialog.open(ErrorDialogComponent, {
        data: {message: 'Counting Basis: must be between 2 and 32'}
      });
      this.data.network.countingBasis = 32;
      return;
    }

    if (this.data.network.loadValue < 0 || this.data.network.loadValue > Math.pow(2, this.data.network.countingBasis)) {
      this._dialog.open(ErrorDialogComponent, {
        data: {message: 'Load Values: must be between 1 and ' + Math.pow(2, this.data.network.countingBasis)}
      });
      return;
    }
  }
}
