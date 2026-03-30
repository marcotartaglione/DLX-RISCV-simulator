import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {LogicalNetwork} from '../memory/model/logical-network';
import {LedLogicalNetwork} from '../memory/model/logicalNetworks/led.logical-network';
import {StartLogicalNetwork} from '../memory/model/logicalNetworks/start.logical-network';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {FormatPipe} from '../pipes/format.pipe';
import {MatButton} from '@angular/material/button';

@Component({
  templateUrl: './logical-network-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogContent,
    MatFormField,
    MatSelect,
    MatOption,
    FormatPipe,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatLabel
  ]
})
export class LogicalNetworkDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { network: LogicalNetwork }) {
  }

  isLedActive(dev: LogicalNetwork): boolean {
    if (dev instanceof LedLogicalNetwork) {
      return dev.led;
    }
    return null;
  }

  isStartupActive(dev: LogicalNetwork): boolean {
    if (dev instanceof StartLogicalNetwork) {
      return dev.startup;
    }
    return null;
  }
}
