import {Device} from './device';
import {InputPort} from './logicalNetworks/input-port';
import {DeviceFactory} from './DeviceFactoryImpl';
import {LogicalNetwork} from './logical-network';

export class Memory {
  devices: Device[] = [];
  inputPorts: Device[] = [];

  constructor(struct?: string) {
    if (!struct)
      return;

    const rawDevices: Device[] = JSON.parse(struct);
    rawDevices.forEach(d => this.add(DeviceFactory.create(d)))
  }

  public firstFreeAddr(startAddr): number {
    for (let i = 0; i < this.devices.length - 1; i++) {
      if (
        this.devices[i + 1].minAddress - this.devices[i].maxAddress >=
        33554432 &&
        this.devices[i + 1].maxAddress > startAddr
      ) {
        return this.devices[i].maxAddress + 33554432 / 2;
      }
    }
    return 0;
  }

  public add(device: Device): void {
    if (this.devices.every((dev) => !(dev.hasAddress(device.minAddress) || dev.hasAddress(device.maxAddress)))) {
      this.devices.push(device);
      this.devices = this.devices.sort((a, b) => a.minAddress - b.minAddress);

      if (device instanceof InputPort) {
        device.name = this.setNameExt(this.inputPorts.length);
        this.inputPorts.push(device);
      }
    }
  }

  public get(name: string): Device {
    return this.devices.find((dev) => dev.name === name);
  }

  public remove(dev: Device): void {
    this.devices = this.devices.filter((device) => device !== dev);

    if (dev instanceof InputPort) {
      this.inputPorts = this.inputPorts.filter((port) => port !== dev);
    }
  }

  public load(address: number): number {
    const alignedAddress = (address & ~3) >>> 0;
    const device = this.devices.find((dev) => dev.hasAddress(address));

    if (!device) {
      throw new Error('Device not found');
    }

    if (device instanceof LogicalNetwork) {
      return device.load(address);
    }

    return device.load(alignedAddress);
  }

  public store(address: number, word: number): number {
    const alignedAddress = (address & ~3) >>> 0;
    const device = this.findDevice(alignedAddress);

    if (!device) {
      throw new Error('Device not found');
    }

    if (device instanceof LogicalNetwork) {
      device.store(address, word);
    } else {
      device.store(alignedAddress, word);
    }

    return word;
  }

  public removePort(dev: Device) {
    this.inputPorts = this.inputPorts.filter(el => el !== dev);
  }

  // setto i nomi in base a quante input port ho mappato
  public setNameExt(num: number): string {
    let result = 'INPUT_PORT_';

    while (num >= 26) {
      result += String.fromCharCode(65 + (num % 26));
      num = Math.floor(num / 26) - 1;
    }

    result += String.fromCharCode(65 + num);
    return result;
  }

  private findDevice(address: number) {
    return this.devices.find(dev => dev.hasAddress(address));
  }

  private checkOverlap(dev1: Device, dev2: Device): boolean {
    return dev1.minAddress <= dev2.maxAddress && dev1.maxAddress >= dev2.minAddress;
  }
}
