import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from './error-dialog.component';
import {InputPort} from '../memory/model/input-port';


@Component({
  templateUrl: './input-port-dialog.component.html',
})
export class InputPortDialogComponent implements OnInit {

  dimLast: 8 | 16 | 32;
  urlImage: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { network: InputPort }, private dialog: MatDialog) {
  }

  onSubmit() {
    // setto la lunghezza della porta in input
    const dim = this.data.network.dataSize;
    if (dim !== 8 && dim !== 16 && dim !== 32) {
      this.dialog.open(ErrorDialogComponent, {
        data: {message: 'Size Port must be: 8 / 16 / 32 bit'}
      });
      this.data.network.dataSize = this.dimLast;
      return;
    }
  }

  ngOnInit() {
    this.dimLast = this.data.network.dataSize;
    this.urlImage = 'assets/img/input-port/input_port_bit_' + this.dimLast + '.png';
  }

}
