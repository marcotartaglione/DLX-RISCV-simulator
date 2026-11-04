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
import {MatIcon} from '@angular/material/icon';

export interface LogicalNetworkDialogData {
  network: LogicalNetwork;
}

@Component({
  templateUrl: './logical-network-dialog.component.html',
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
  imports: [
    MatDialogContent,
    MatFormField,
    MatSelect,
    MatOption,
    FormatPipe,
    MatDialogActions,
    MatButton,
    MatIcon,
    MatDialogClose,
    MatLabel
  ]
})
export class LogicalNetworkDialogComponent {
  private originalDevice = inject<LogicalNetworkDialogData>(MAT_DIALOG_DATA);
  protected cloneDevice: LogicalNetwork;

  constructor() {
    if (this.isLedLogicalNetwork(this.originalDevice.network)) {
      this.cloneDevice = new LedLogicalNetwork(0, 4);
    } else if (this.isStartLogicalNetwork(this.originalDevice.network)) {
      this.cloneDevice = new StartLogicalNetwork(0, 4);
    } else {
      this.cloneDevice = new LogicalNetwork("", 0, 1);
    }

    this.cloneDevice.updateFrom(this.originalDevice.network);
  }

  protected isLedLogicalNetwork(device: LogicalNetwork): device is LedLogicalNetwork {
    return device instanceof LedLogicalNetwork;
  }

  protected isStartLogicalNetwork(device: LogicalNetwork): device is StartLogicalNetwork {
    return device instanceof StartLogicalNetwork;
  }

  protected downloadImage() {
    const link = document.createElement('a');
    link.href = this.cloneDevice.imagePath;
    link.download = `${this.cloneDevice.name || 'network'}-schema.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
