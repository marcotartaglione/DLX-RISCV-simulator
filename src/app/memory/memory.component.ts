import {animate, style, transition, trigger} from '@angular/animations';
import {Component, effect, inject, input, signal, Type, untracked} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MessageDialogComponent} from '../dialogs/message-dialog.component';
import {MemoryService} from '../services/memory.service';
import {Device} from './model/device';
import {LogicalNetwork} from './model/logical-network';
import {LogicalNetworkDialogComponent} from '../dialogs/logical-network-dialog.component';
import {MemoryAddressDialogComponent} from '../dialogs/memory-address-dialog.component';
import {LedLogicalNetwork} from './model/logicalNetworks/led.logical-network';
import {FFDLogicalNetwork} from './model/logicalNetworks/ffd-logical-network';
import {ImageDialogComponent} from '../dialogs/image-dialog.component';
import {ErrorDialogComponent} from '../dialogs/error-dialog.component';
import {InstructionDialogComponent} from '../dialogs/instruction-dialog.component';
import {Counter} from './model/counter';
import {CounterDialogComponent} from '../dialogs/counter-dialog.component';
import {InputPort} from './model/input-port';
import {InputPortDialogComponent} from '../dialogs/input-port-dialog.component';
import {FormatPipe} from '../pipes/format.pipe';
import {Ram} from './model/ram';
import {Eprom} from './model/eprom';
import {StartLogicalNetwork} from './model/logicalNetworks/start.logical-network';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatOption, MatRipple} from '@angular/material/core';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {ChipSelect} from './model/ChipSelect';
import {NgOptimizedImage} from '@angular/common';
import {FormatBytePipe} from '../pipes/formatByte.pipe';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.sass'],
  animations: [
    trigger('showHideTrigger', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('200ms ease-out', style({transform: 'translateY(0)'})),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ],
  standalone: true,
  imports: [
    MatButton,
    MatTooltip,
    MatRipple,
    MatMenuTrigger,
    MatFormField,
    FormsModule,
    FormatPipe,
    MatInput,
    MatSelect,
    MatOption,
    MatMenu,
    MatMenuItem,
    MatLabel,
    NgOptimizedImage
  ]
})

export class MemoryComponent {
  protected memoryService = inject(MemoryService);
  private _dialog = inject(MatDialog);

  protected formatPipe = new FormatPipe();

  protected readonly inputAddr = signal<string>('');
  protected readonly selectedChipSelect = signal<ChipSelect>(null);
  protected readonly selectedDevice = signal<Device>(null);

  constructor() {
    effect(() => {
      const device = this.selectedDevice();

      if (!device)
        return;

      untracked(() => this.inputAddr.set(this.formatPipe.transform(device.minAddress, 'hex')));
    });
  }

  public get canSelectedMoveLeft(): boolean {
    const devices = this.memoryService.devices;
    const index = devices.indexOf(this.selectedDevice());

    return (this.selectedDevice().name !== 'EPROM' && this.selectedDevice().name !== 'RAM_B') && (index > 0);
  }

  public get canSelectedMoveRight(): boolean {
    const devices = this.memoryService.devices;
    const index = devices.indexOf(this.selectedDevice());

    return (this.selectedDevice().name !== 'EPROM') && (index < devices.length - 1);
  }

  protected openDialogImage(n: Device) {
    // TODO: costruire decoratore per i componenti che registri le relative finestre di dialogo,
    //  così da evitare questo tipo di if-else e rendere più scalabile l'aggiunta di nuovi device
    if (this.selectedDevice() instanceof Counter) {
      this._dialog.open(CounterDialogComponent, {
        data: {network: n as Counter}
      });
    } else if (this.selectedDevice() instanceof InputPort) {
      this._dialog.open(InputPortDialogComponent, {
        data: {network: n as InputPort}
      });
    } else {
      this._dialog.open(LogicalNetworkDialogComponent, {
        data: {network: n}
      });
    }
  }

  protected onAdd(type: Type<Device>) {
    const firstAdd = this.memoryService.firstFreeAddr() + 1;
    this.memoryService.add(new type(firstAdd, firstAdd + 0x01FFFFFF));
    this.memoryService.storeInLocalStorage();
  }

  protected onDelete(dev: Device) {
    this.memoryService.remove(dev);
    this.selectedDevice.set(null);
    this.memoryService.storeInLocalStorage();
  }

  protected onChangeCS(newValue: string, id: string) {
    const devices = this.memoryService.devices;
    const indexSelectedDevice = this.memoryService.devices.indexOf(this.selectedDevice());
    const chipSelect = devices[indexSelectedDevice].chipSelects.find(el => el.id === id);

    if (chipSelect === null) {
      return;
    }

    if (newValue.length === 8) {
      const iv = parseInt(newValue, 16);
      if (iv || iv === 0) {
        chipSelect.address = iv >>> 2;
      }
    }
  }

  protected onChange(event: any, side: string) {
    const devices = this.memoryService.devices;
    const indexSelectedDevice = this.memoryService.devices.indexOf(this.selectedDevice());

    if (side === 'min') {
      if (this.selectedDevice().minAddress <= devices[indexSelectedDevice - 1].maxAddress) {
        this.selectedDevice().minAddress = devices[indexSelectedDevice - 1].maxAddress + 1;
      }
    } else if (side === 'max') {
      if (this.selectedDevice().maxAddress >= devices[indexSelectedDevice + 1].minAddress) {
        this.selectedDevice().maxAddress = devices[indexSelectedDevice + 1].minAddress - 1;
      }
    }

    if (this.selectedDevice().size('MB') >= 128 || this.selectedDevice() instanceof LogicalNetwork) {
      this.memoryService.storeInLocalStorage();
    } else {
      this._dialog.open(MessageDialogComponent, {
        data: {message: 'Memory is less than 128MB'}
      });
    }
  }

  protected moveSelectedLeft() {
    let endAddress = 0;
    const indexSelectedDevice = this.memoryService.devices.indexOf(this.selectedDevice());
    const sizeOfSelected = this.selectedDevice().maxAddress - this.selectedDevice().minAddress;
    const spaceBeforeFirstDevice =
      this.memoryService.devices[indexSelectedDevice].minAddress -
      this.memoryService.devices[indexSelectedDevice - 1].maxAddress;

    if (spaceBeforeFirstDevice >= 33554432) {
      this.selectedDevice().maxAddress = this.selectedDevice().maxAddress - 33554432;
      this.selectedDevice().minAddress = this.selectedDevice().minAddress - 33554432;
    } else {
      endAddress = this.spaceBetweenDevices(indexSelectedDevice, sizeOfSelected, 'left');

      if (endAddress !== 0) {
        this.selectedDevice().maxAddress = endAddress - 1;
        this.selectedDevice().minAddress = this.selectedDevice().maxAddress - sizeOfSelected;
      }
    }

    this.memoryService.memory.devices = this.memoryService.devices.sort((a, b) => a.minAddress - b.minAddress);
    this.memoryService.storeInLocalStorage();
  }

  protected moveSelectedRight() {
    let startAddress = 0;
    const indexSelectedDevice = this.memoryService.devices.indexOf(this.selectedDevice());
    const sizeOfSelected = this.selectedDevice().maxAddress - this.selectedDevice().minAddress;
    const spaceBeforeFirstDevice =
      this.memoryService.devices[indexSelectedDevice + 1].minAddress -
      this.memoryService.devices[indexSelectedDevice].maxAddress;

    if (spaceBeforeFirstDevice >= 33554432) { // Muovi avanti 128Mb se c'è abbastanza spazio
      this.selectedDevice().maxAddress = this.selectedDevice().maxAddress + 33554432;
      this.selectedDevice().minAddress = this.selectedDevice().minAddress + 33554432;
    } else {
      startAddress = this.spaceBetweenDevices(indexSelectedDevice, sizeOfSelected, 'right');
      if (startAddress !== 0) { // Muovi tra due device avanti a me
        this.selectedDevice().minAddress = startAddress + 1;
        this.selectedDevice().maxAddress = this.selectedDevice().minAddress + sizeOfSelected;
      }
    }
    this.memoryService.storeInLocalStorage();
  }

  protected memoryInspect(address: string) {
    let startAddress = this.formatPipe.transform(address, 'hex');

    const d = this.memoryService.devices.find(el => el.hasAddress(startAddress));
    if (d == null) {
      this._dialog.open(ErrorDialogComponent, {
        data: {message: 'No memory available in this address'}
      });
      return;
    }

    // memory alignment
    startAddress -= startAddress % 4;
    this._dialog.open(MemoryAddressDialogComponent, {
      data: {startAddress: startAddress, numWords: 4},
    });
  }

  protected isLogicalNetwork(dev: Device): dev is LogicalNetwork {
    return dev instanceof LogicalNetwork;
  }

  protected isLogicalNetworkActive(dev: Device) {
    if (dev instanceof LogicalNetwork) {
      return dev.ffd;
    }

    return false;
  }

  protected isMemory(dev: Device): dev is Ram | Eprom {
    return dev instanceof Ram || dev instanceof Eprom;
  }

  protected openInterruptImage() {
    this._dialog.open(ImageDialogComponent, {
      data: {src: 'assets/img/rete-interrupt2.jpg'}
    });
  }

  private spaceBetweenDevices(indexSelectedDevice: number, sizeOfSelected: number, side: string): number {
    for (let i = indexSelectedDevice; i < this.memoryService.devices.length - 2 && side === 'right'; i++) {
      if ((this.memoryService.devices[i + 2].minAddress - this.memoryService.devices[i + 1].maxAddress) >= sizeOfSelected) {
        return this.memoryService.devices[i + 1].maxAddress;
      }
    }

    for (let i = indexSelectedDevice; i > 1 && side === 'left'; i--) {
      if ((this.memoryService.devices[i - 1].minAddress - this.memoryService.devices[i - 2].maxAddress) >= sizeOfSelected) {
        return this.memoryService.devices[i - 1].minAddress;
      }
    }

    return 0;
  }

  protected deviceImage(device: Device) {
    if (device instanceof LedLogicalNetwork) {
      return device.getChipSelect('CS_READ_LED') ?
        'assets/img/led_on.png' :
        'assets/img/led_off.png';
    }
    else if (device instanceof StartLogicalNetwork) {
      return device.getChipSelect('CS_READ_STARTUP') ?
        'assets/img/led_on.png' :
        'assets/img/led_off.png';
    }
    else if (device instanceof Counter) {
      return 'assets/img/counter/counter.png';
    }
    else if (device instanceof InputPort) {
      return 'assets/img/icon_port.png';
    }

    return '';
  }

  protected isEprom(device: Device): device is Eprom {
    return device instanceof Eprom;
  }

  protected isStartLogicalNetwork(device: Device): device is StartLogicalNetwork {
    return device instanceof StartLogicalNetwork;
  }

  protected readonly Ram = Ram;
  protected readonly FFDLogicalNetwork = FFDLogicalNetwork;
  protected readonly LedLogicalNetwork = LedLogicalNetwork;
  protected readonly Counter = Counter;
  protected readonly InputPort = InputPort;
}






