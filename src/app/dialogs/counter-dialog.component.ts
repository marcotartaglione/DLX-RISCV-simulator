import {Component, Inject} from '@angular/core';
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { network: Counter }, private dialog: MatDialog) {
  }

  // Quando cambia la base di conteggio reseto il valore di conteggio del counter

  onChange() {
    this.data.network.asyncReset();
  }

  // Metodo invocato quando si esce dal form premendo il tasto ok

  onSubmit() {

    // Controllo che la base di conteggio sia compresa tra 2 e 32 e in caso di errore notifico l'errore
    // all'utente con una finestra di dialogo

    if (this.data.network.countingBasis < 2 || this.data.network.countingBasis > 32) {
      this.dialog.open(ErrorDialogComponent, {
        data: {message: 'Counting Basis: must be between 2 and 32'}
      });
      this.data.network.countingBasis = 32;
      return;
    }

    // Controllo che il valore caricato con la load sia compreso nel range 0 2^N e in caso di errore notifico
    // l'errore all'utente dialogo

    if (this.data.network.loadValue < 0 || this.data.network.loadValue > Math.pow(2, this.data.network.countingBasis)) {
      this.dialog.open(ErrorDialogComponent, {
        data: {message: 'Load Values: must be between 1 and ' + Math.pow(2, this.data.network.countingBasis)}
      });
      return;
    }
  }
}
