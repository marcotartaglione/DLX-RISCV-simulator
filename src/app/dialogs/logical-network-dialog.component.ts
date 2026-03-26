import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LogicalNetwork} from '../memory/model/logical-network';
import {LedLogicalNetwork} from '../memory/model/logicalNetworks/led.logical-network';
import {StartLogicalNetwork} from '../memory/model/logicalNetworks/start.logical-network';

@Component({
  templateUrl: './logical-network-dialog.component.html',
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
