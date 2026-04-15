import {ChipSelect} from './ChipSelect';

/**
 * Represents a memory-mapped device with addressable storage and chip select management.
 */
export class Device {
  private _chipSelects: ChipSelect[];
  private _memory: Uint8Array;

  protected constructor(
    public name: string,
    private _minAddress: number,
    private _maxAddress: number,
  ) {
    const size = _maxAddress - _minAddress + 1;
    if (size < 0) {
      throw new Error('Invalid address for device: ' + name);
    }

    this._chipSelects = [];
    this._memory = new Uint8Array(size);
    this._memory.forEach((_, i) => this._memory[i] = Math.floor(Math.random() * 256)); // Simulate uninitialized memory with random data
  }

  public get chipSelects(): ChipSelect[] {
    return this._chipSelects;
  }

  public get memory(): Uint8Array {
    return this._memory;
  }

  public get minAddress(): number {
    return this._minAddress;
  }

  /**
   * Sets the minimum address of the device based on a hexadecimal string input or a number.
   * If the input is a hexadecimal string, it should start with "0x" and be 10 characters long (including "0x").
   *
   *  @param value A number or a hexadecimal string representing the new minimum address for the device.
   */
  public set minAddress(value: number) {
    const lastMinAddress = this._minAddress;
    this._minAddress = value;
    this.updateChipSelectMin(lastMinAddress);
  }

  public get maxAddress(): number {
    return this._maxAddress;
  }

  /**
   * Sets the maximum address of the device based on a hexadecimal string input or a number.
   * If the input is a hexadecimal string, it should start with "0x" and be 10 characters long (including "0x").
   *
   * @param value A number or a hexadecimal string representing the new maximum address for the device.
   */
  public set maxAddress(value: number) {
    const lastMaxAddress = this._maxAddress;
    this._maxAddress = value;
    this.updateChipSelectMax(lastMaxAddress);
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
    this._chipSelects = json.chipSelects.map((cs: any) => ChipSelect.fromJSON(cs));
  }

  /**
   * Calculates the size of the device's memory
   */
  public size(unit: 'B' | 'KB' | 'MB' | 'GB'): number {
    const size = this._maxAddress - this._minAddress + 1;

    switch (unit) {
      case 'B':
        return size / 4;
      case 'KB':
        return size / 4 / 1024;
      case 'MB':
        return size / 4 / 1024 / 1024;
      case 'GB':
        return size / 4 / 1024 / 1024 / 1024;
      default:
        throw new Error('Invalid unit for size: ' + unit);
    }
  }

  /**
   * Sets a chip select with the given name, address, and value. If a chip select with the same name already exists,
   * it updates its address and hexAddress. Otherwise, it creates a new chip select and adds it to the list.
   * Finally, it stores the value at the given address.
   *
   * @param chipSelect The chip select object containing the id and address to be set or updated.
   * @param value The value to be stored at the chip selects address after setting or updating it.
   */
  public setChipSelect = (chipSelect: ChipSelect, value: number | boolean) => {
    const existingChipSelect = this.getChipSelect(chipSelect.id);

    if (existingChipSelect) {
      existingChipSelect.address = chipSelect.address;
    } else {
      this._chipSelects.push(chipSelect);
    }

    if (typeof value === 'boolean') {
      value = value ? 1 : 0;
    }

    // === IMPORTART ===
    // Can't just use this.store because it would call the overridden method in the child class,
    // which may have different logic for handling chip selects
    // =================
    Device.prototype.store.call(this, chipSelect.address, value);
  }

  /**
   * Retrieves a chip select based on the provided value, which can be either a string (id) or a number (address).
   *
   * @param value The value used to search for the chip select. It can be either a string representing the chip select
   * id or a number representing its address.
   */
  public getChipSelect(value: string | number): ChipSelect | undefined {
    if (typeof value === 'number') {
      return this._chipSelects.find(el => el.address === value);
    }
    return this._chipSelects.find(el => el.id === value);
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
   * Reads a byte from the device's memory at the specified address. If the address is out of bounds
   * (less than the minimum address or greater than the maximum address), it throws a MemoryOutOfBoundsError.
   *
   * @param address The memory address to read from. It must be within the range defined by the device's minimum and maximum addresses.
   */
  public load(address: number): number {
    if (address < this.minAddress || address > this.maxAddress) {
      throw new Error('Memory out of bound at address: ' + address);
    }

    return this._memory[address - (this._minAddress)];
  }

  /**
   * Writes a byte to the device's memory at the specified address. If the address is out of bounds (less than the
   * minimum address or greater than the maximum address), it throws a MemoryOutOfBoundsError
   */
  public store(address: number, byte: number): void {
    if (address < this.minAddress || address > this._maxAddress) {
      throw new Error('Memory out of bound at address: ' + address);
    }

    this._memory[address - (this._minAddress)] = byte;
  }

  /**
   * Converts the device instance into a JSON object representation.
   */
  public toJSON(): any {
    return {
      proto: this.constructor.name,
      name: this.name,
      minAddress: this._minAddress,
      maxAddress: this._maxAddress,
      chipSelects: this._chipSelects.map(cs => cs.toJSON()),
    };
  }

  /**
   * Updates the addresses of chip selects that are above the new maximum address.
   * For each chip select with an address greater than the new maximum,
   * it adjusts the address by subtracting the difference between the old maximum and the new maximum from it,
   * effectively shifting it down to be within the new valid range.
   *
   * @param lastMax The previous maximum address before the update. This is used to calculate how much to shift the chip select addresses.
   */
  private updateChipSelectMax(lastMax: number) {
    this._chipSelects.forEach(el => {
      if (el.address > this.maxAddress) {
        el.address = this._minAddress - (lastMax - el.address);
      }
    });
  }

  /**
   * Updates the addresses of chip selects that are below the new minimum address.
   * For each chip select with an address less than the new minimum,
   * it adjusts the address by adding the difference between the new minimum and the old minimum to it,
   * effectively shifting it up to be within the new valid range.
   *
   * @param lastMin The previous minimum address before the update. This is used to calculate how much to shift the chip select addresses.
   */
  private updateChipSelectMin(lastMin: number) {
    this._chipSelects.forEach(el => {
      if (el.address < this.minAddress) {
        el.address = this._minAddress + (el.address - lastMin);
      }
    });
  }
}
