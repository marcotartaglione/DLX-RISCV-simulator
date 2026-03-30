import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {Counter} from '../memory/model/counter';
import {ErrorDialogComponent} from '../dialogs/error-dialog.component';

@Component({
    templateUrl: './counter-dialog.component.html',
    standalone: false
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
