import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Counter } from '../memory/model/counter';
import { ErrorDialogComponent } from '../dialogs/error-dialog.component';

@Component({
  templateUrl: './counter-dialog.component.html',
})
export class CounterDialogComponent {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: {network : Counter}, private dialog: MatDialog) {}

  // Quando cambia la base di conteggio reseto il valore di conteggio del counter

  onChange() {
    this.data.network.a_reset();
  }

  // Metodo invocato quando si esce dal form premendo il tasto ok
  
  onSubmit() {
   
    // Controllo che la base di conteggio sia compresa tra 2 e 32 e in caso di errore notifico l'errore
    // all'utente con una finestra di dialogo

    if(this.data.network.counting_basis < 2 || this.data.network.counting_basis > 32) {
      this.dialog.open(ErrorDialogComponent,{
        data: { message: "Counting Basis: must be between 2 and 32" }
      })
      this.data.network.counting_basis = 32 ;
      return;
    }

    // Controllo che il valore caricato con la load sia compreso nel range 0 2^N e in caso di errore notifico
    // l'errore all'utente dialogo

    if(this.data.network.loadValue < 0 || this.data.network.loadValue > Math.pow(2,this.data.network.counting_basis)) {
      this.dialog.open(ErrorDialogComponent,{
        data: { message: "Load Values: must be between 1 and " +  Math.pow(2,this.data.network.counting_basis)}
      })
      return;
    }
  }
}
