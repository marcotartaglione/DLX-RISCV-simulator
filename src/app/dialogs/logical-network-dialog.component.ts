import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {LogicalNetwork} from '../memory/model/logical-network';
import {LedLogicalNetwork} from '../memory/model/logicalNetworks/led-logical-network';
import {StartLogicalNetwork} from '../memory/model/logicalNetworks/start-logical-network';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {FormatPipe} from '../pipes/format.pipe';
import {MatButton} from '@angular/material/button';

export interface LogicalNetworkDialogData {
  network: LogicalNetwork;
}

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
  private originalDevice = inject<LogicalNetworkDialogData>(MAT_DIALOG_DATA);
  protected cloneDevice: LogicalNetwork;

  constructor() {

    if (this.isLedLogicalNetwork(this.originalDevice.network)) {
      this.cloneDevice = new LedLogicalNetwork(0, 1);
    }
    else if (this.isStartLogicalNetwork(this.originalDevice.network)) {
      this.cloneDevice = new StartLogicalNetwork(0, 1);
    }
    else {
      this.cloneDevice = new LogicalNetwork( "", 0, 1);
    }

    this.cloneDevice.updateFrom(this.originalDevice.network);
  }

  protected isLedLogicalNetwork(device: LogicalNetwork): device is LedLogicalNetwork {
    return device instanceof LedLogicalNetwork;
  }

  protected isStartLogicalNetwork(device: LogicalNetwork): device is StartLogicalNetwork {
    return device instanceof StartLogicalNetwork;
  }
}
