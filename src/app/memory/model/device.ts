import {ChipSelect} from './ChipSelect';

/**
 * Represents a memory-mapped device with addressable storage and chip select management.
 */
export class Device {
  private _memory: Uint32Array;
  private _initialized: Uint8Array; // Bitmap

  private static _seed = 1_648_084_197;

  protected constructor(
    public name: string,
    protected _minAddress: number,
    protected _maxAddress: number,
  ) {
    let size = (_maxAddress - _minAddress + 1);
    if (size < 0) {
      throw new Error('Invalid address for device: ' + name);
    }

    size = Math.ceil(size / 4);

    this._memory = new Uint32Array(size);
    this._initialized = new Uint8Array(Math.ceil(size / 8));
  }

  private isInitialized(index: number): boolean {
    return (this._initialized[index >>> 3] & (1 << (index & 7))) !== 0;
  }

  private markInitialized(index: number) {
    this._initialized[index >>> 3] |= (1 << (index & 7));
  }

  private static _fastRandom(): number {
    let x = Device._seed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    Device._seed = x;
    return x >>> 0;
  }

  public get minAddress(): number {
    return this._minAddress;
  }

  public get maxAddress(): number {
    return this._maxAddress;
  }

  /**
   * Sets the minimum address of the device based on a hexadecimal string input or a number.
   * If the input is a hexadecimal string, it should start with "0x" and be 10 characters long (including "0x").
   *
   *  @param value A number or a hexadecimal string representing the new minimum address for the device.
   */
  public set minAddress(value: number) {
    this._minAddress = value;
    this.reallocateMemory();
  }

  /**
   * Sets the maximum address of the device based on a hexadecimal string input or a number.
   * If the input is a hexadecimal string, it should start with "0x" and be 10 characters long (including "0x").
   *
   * @param value A number or a hexadecimal string representing the new maximum address for the device.
   */
  public set maxAddress(value: number) {
    this._maxAddress = value;
    this.reallocateMemory();
  }

  private reallocateMemory() {
    let size = this._maxAddress - this._minAddress + 1;
    if (size < 0) return;

    size = Math.ceil(size / 4);
    const newMemory = new Uint32Array(size);
    newMemory.set(this._memory.subarray(0, size));
    this._memory = newMemory;

    const newInitialized = new Uint8Array(Math.ceil(size / 8));
    newInitialized.set(this._initialized.subarray(0, newInitialized.length));
    this._initialized = newInitialized;
  }

  /**
   * Updates the device based on another device
   * @param other Source device
   */
  public updateFrom(other: Device) {
    this.name = other.name;
    this._minAddress = other._minAddress;
    this._maxAddress = other._maxAddress;

    // Deep copy
    if (this._memory.length !== other._memory.length) {
      this._memory = new Uint32Array(other._memory);
    } else {
      this._memory = other._memory;
    }
  }

  /**
   * Calculates the size of the device's memory
   */
  public size(unit: 'B' | 'KB' | 'MB' | 'GB'): number {
    const size = this._maxAddress - this._minAddress + 1;

    switch (unit) {
      case 'B':
        return size;
      case 'KB':
        return size / 1024;
      case 'MB':
        return size / 1024 / 1024;
      case 'GB':
        return size / 1024 / 1024 / 1024;
      default:
        throw new Error('Invalid unit for size: ' + unit);
    }
  }

  /**
   * Checks if the provided address is within the valid range defined by the device's minimum and maximum addresses.
   *
   * @param address The address to be validated against the device's address range.
   */
  public hasAddress(address: number): boolean {
    return address >= this.minAddress && address <= this.maxAddress;
  }

  /**
   * Reads a word from the device's memory at the specified address. If the address is out of bounds
   * (less than the minimum address or greater than the maximum address), it throws a MemoryOutOfBoundsError.
   *
   * @param address The memory address to read from. It must be within the range defined by the device's minimum and maximum addresses.
   */
  public load(address: number): number {
    if (address < this.minAddress || address > this.maxAddress) {
      throw new Error('Memory out of bound at address: ' + address);
    }

    const index = Math.ceil((address - this._minAddress) / 4);

    if (!this.isInitialized(index)) {
      this._memory[index] = Device._fastRandom();
      this.markInitialized(index);
    }

    return this._memory[index];
  }

  /**
   * Writes a word to the device's memory at the specified address. If the address is out of bounds (less than the
   * minimum address or greater than the maximum address), it throws a MemoryOutOfBoundsError
   */
  public store(address: number, word: number): void {
    if (address < this.minAddress || address > this._maxAddress) {
      throw new Error('Memory out of bound at address: ' + address);
    }

    const index = Math.ceil((address - this._minAddress) / 4);
    this._memory[index] = word;
    this.markInitialized(index);
  }

  /**
   * Converts the device instance into a JSON object representation.
   */
  public toJSON(shortVersion: boolean = false): any {
    const ctor = this.constructor as { name: string; proto?: string };

    return {
      proto: ctor.proto ?? ctor.name,
      name: this.name,
      minAddress: this._minAddress,
      maxAddress: this._maxAddress,
    };
  }

  /**
   * Hydrates a device object with data from a JSON object
   *
   * @param json The JSON object containing the properties of the device
   */
  protected hydrate(json) {
    this.name = json.name;
    this._minAddress = json.minAddress;
    this._maxAddress = json.maxAddress;
  }
}
