import {Injectable, Injector} from '@angular/core';
import {Device} from '../memory/model/device';
import {Eprom} from '../memory/model/eprom';
import {LedLogicalNetwork} from '../memory/model/logicalNetworks/led.logical-network';
import {Counter} from '../memory/model/counter';
import {Memory} from '../memory/model/memory';
import {StartLogicalNetwork} from '../memory/model/logicalNetworks/start.logical-network';
import {InputPort} from '../memory/model/input-port';
import {Ram} from '../memory/model/ram';
import {FFDLogicalNetwork} from '../memory/model/logicalNetworks/ffd-logical-network';

/**
 * Service responsible for managing the memory configuration, including loading and saving the memory state to localStorage, and providing
 * methods to manipulate the memory devices.
 */
@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private _memory: Memory;

  constructor() {
    this.init();
  }

  /**
   * Initializes the memory configuration. If there is a stored memory configuration in localStorage, it loads the memory
   * from it. Otherwise, it creates a default memory configuration.
   */
  public init() {
    const storedMemory = window.localStorage.getItem('memory');

    if (storedMemory) {
      this._memory = new Memory(storedMemory);
    } else {
      this._memory = new Memory();
      this._memory.add(new Eprom(0x00000000, 0x07FFFFFF));
      this._memory.add(new Ram(0x10000000, 0x1FFFFFFF));
      this._memory.add(new StartLogicalNetwork(0x30000000, 0x30000003));
      this._memory.add(new LedLogicalNetwork(0x24000000, 0x24000003));
      this._memory.add(new Counter(0x29000000, 0x29000005));
      this._memory.add(new Ram(0x38000000, 0x3FFFFFFF));
      this._memory.add(new InputPort(0x0C000000, 0x0C000003));
    }
  }

  /**
   * Adds a new device to the memory configuration.
   *
   * @param device The device to be added to the memory.
   */
  public add(device: Device): void {
    this._memory.add(device);
  }

  /**
   * Removes a device from the memory configuration.
   *
   * @param device The device to be removed from the memory.
   */
  public remove(device: Device): void {
    this._memory.remove(device);
  }

  /**
   * Returns the list of devices currently stored in the memory configuration.
   */
  public get devices(): Device[] {
    return this._memory.devices;
  }

  /**
   * Returns the current memory configuration, which includes all the devices and their respective address ranges.
   * This allows other components to access and manipulate the memory configuration as needed.
   */
  public get memory(): Memory {
    return this._memory;
  }

  /**
   * Removes the stored memory configuration from localStorage, effectively resetting the memory to its default state on the next
   * initialization.
   */
  public removeFromMemory = () => {
    window.localStorage.removeItem('memory');
  }

  /**
   * Stores the current memory configuration in localStorage, allowing it to be persisted across page reloads and browser sessions.
   * The memory configuration is serialized to JSON format before being stored.
   */
  public storeInLocalStorage() {
    const json = this._memory.devices.map(dev => {
      return dev.toJSON();
    });
    window.localStorage.setItem('memory', JSON.stringify(json));
  }

  /**
   * Finds the first free address in the memory configuration starting from a given address.
   *
   * @param startAddress The address from which to start searching for a free address.
   */
  public firstFreeAddr(startAddress: number = 0): number {
    return this._memory.firstFreeAddr(startAddress);
  }

  getEprom(): Eprom {
    return this._memory.get('EPROM') as Eprom;
  }

  getCounter(): Counter {
    console.log('name ' + this._memory.get('COUNTER').name);
    return this._memory.get('COUNTER') as Counter;
  }
}
