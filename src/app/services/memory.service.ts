import {Injectable} from '@angular/core';
import {Device} from '../memory/model/device';
import {Eprom} from '../memory/model/eprom';
import {LedLogicalNetwork} from '../memory/model/logicalNetworks/led-logical-network';
import {Counter} from '../memory/model/logicalNetworks/counter';
import {Memory} from '../memory/model/memory';
import {StartLogicalNetwork} from '../memory/model/logicalNetworks/start-logical-network';
import {InputPort} from '../memory/model/logicalNetworks/input-port';
import {Ram} from '../memory/model/ram';

/**
 * Service responsible for managing the memory configuration, including loading and saving the memory state to localStorage, and providing
 * methods to manipulate the memory devices.
 */
@Injectable({
  providedIn: 'root'
})
export class MemoryService {

  private static STORAGE_KEY = 'memory';

  constructor() {
    this.init();
  }

  private _memory!: Memory;

  /**
   * Returns the current memory configuration, which includes all the devices and their respective address ranges.
   * This allows other components to access and manipulate the memory configuration as needed.
   */
  public get memory(): Memory {
    return this._memory;
  }

  /**
   * Loads a value from the memory at the specified address.
   */
  public load(...args: Parameters<typeof this._memory.load>): ReturnType<typeof this._memory.load> {
    return this._memory.load(...args);
  }

  /**
   * Stores a value in the memory at the specified address.
   */
  public store(...args: Parameters<typeof this._memory.store>): ReturnType<typeof this._memory.store> {
    return this._memory.store(...args);
  }

  /**
   * Returns the list of devices currently stored in the memory configuration.
   */
  public get devices(): Memory['devices'] {
    return this._memory.devices;
  }

  /**
   * Returns the Eprom device from the memory configuration. If there is no Eprom device, it returns undefined.
   */
  public get eprom(): Eprom | undefined {
    return this._memory.devices.find((dev): dev is Eprom => dev instanceof Eprom);
  }

  /**
   * Returns the StartLogicalNetwork device from the memory configuration. If there is no StartLogicalNetwork device, it returns undefined.
   */
  public get startup(): StartLogicalNetwork | undefined {
    return this._memory.devices.find((dev): dev is StartLogicalNetwork => dev instanceof StartLogicalNetwork);
  }

  /**
   * Returns the list of InputPort devices currently stored in the memory configuration.
   */
  public get inputPorts(): InputPort[] {
    return this._memory.inputPorts as InputPort[];
  }

  /**
   * Returns the list of LedLogicalNetwork devices currently stored in the memory configuration. If there are no LedLogicalNetwork devices, it returns an empty array.
   */
  public get ledNetworks(): LedLogicalNetwork[] | undefined {
    return this._memory.devices.filter((dev): dev is LedLogicalNetwork => dev instanceof LedLogicalNetwork);
  }

  /**
   * Initializes the memory configuration. If there is a stored memory configuration in localStorage, it loads the memory
   * from it. Otherwise, it creates a default memory configuration.
   */
  public init() {
    const storedMemory = window.localStorage.getItem(MemoryService.STORAGE_KEY);

    if (storedMemory) {
      this._memory = new Memory(storedMemory);
    } else {
      this.default();
    }
  }

  /**
   * Initializes the default memory configuration.
   */
  public default() {
    this._memory = new Memory();
    this._memory.add(new Eprom(0x00000000, 0x1FFFFFFF));
    this._memory.add(new InputPort(0x30000000, 0x3000000C));
    this._memory.add(new Ram(0x40000000, 0x7FFFFFFF));
    this._memory.add(new LedLogicalNetwork(0x90000000, 0x9000000C));
    this._memory.add(new Counter(0xA4000000, 0xA4000014));
    this._memory.add(new StartLogicalNetwork(0xC0000000, 0xC000000C));
    this._memory.add(new Ram(0xE0000000, 0xFFFFFFFF));
  }

  /**
   * Adds a new device to the memory configuration.
   */
  public add(...args: Parameters<typeof this._memory.add>): ReturnType<typeof this._memory.add> {
    return this._memory.add(...args);
  }

  /**
   * Removes a device from the memory configuration.
   */
  public remove(...args: Parameters<typeof this._memory.remove>): ReturnType<typeof this._memory.remove> {
    return this._memory.remove(...args);
  }

  /**
   * Removes the stored memory configuration from localStorage, effectively resetting the memory to its default state on the next
   * initialization.
   */
  public removeFromLocalStorage() {
    window.localStorage.removeItem(MemoryService.STORAGE_KEY);
  }

  /**
   * Converts the current memory configuration in json format
   */
  public memoryAsJson(shortVersion: boolean = false): string {
    return JSON.stringify(this._memory.devices.map(dev => {
      return dev.toJSON(shortVersion);
    }));
  }

  /**
   * Stores the current memory configuration in localStorage, allowing it to be persisted across page reloads and browser sessions.
   * The memory configuration is serialized to JSON format before being stored.
   */
  public storeInLocalStorage() {
    window.localStorage.setItem(MemoryService.STORAGE_KEY, this.memoryAsJson());
  }

  /**
   * Finds the first free address in the memory configuration starting from a given address.
   */
  public firstFreeAddr(...args: Parameters<typeof this._memory.firstFreeAddr>): ReturnType<typeof this._memory.firstFreeAddr> {
    return this._memory.firstFreeAddr(...args);
  }

  /**
   * Triggers the device interrupt logic
   *
   * @param device
   */
  public interrupt(device: Device) {
    if (device instanceof InputPort) {
      device.interrupt();
    }
  }


}
