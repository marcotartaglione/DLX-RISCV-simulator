import {Device} from './device';
import {DeviceModel} from './device-registry';
import {IVisualizable} from './IVisualizable';
import {ChipSelect} from './ChipSelect';

/**
 * Standard logical network implementation.
 * Represents a hardware network with TRI-STATE buffers and Flip-Flops (FFD).
 */
@DeviceModel()
export class LogicalNetwork extends Device implements IVisualizable {
  public static proto = 'LogicalNetwork';

  private _chipSelects: ChipSelect[];

  public constructor(
    name: string,
    minAddress: number,
    maxAddress: number,
    public asyncSetSignal = 'RESET',
    public asyncResetSignal = '0',
    public imagePath = 'assets/img/logical-network/logical_network.jpg',
    public clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
  ) {
    super(name, minAddress, maxAddress);
    this._chipSelects = [];
  }

  public _ffd = false;

  public get ffd(): boolean {
    return this._ffd;
  }

  public get chipSelects(): ChipSelect[] {
    return this._chipSelects;
  }

  public static fromJSON(json: any) {
    const logicalNetwork = new LogicalNetwork(
      json.name,
      json.minAddress,
      json.maxAddress,
      json.asyncSetSignal,
      json.asyncResetSignal,
      json.imagePath,
      json.clockType
    );

    logicalNetwork.hydrate(json);

    return logicalNetwork;
  }

  public updateFrom(other: Device) {
    if (!(other instanceof LogicalNetwork)) {
      throw new Error('Can only update from another LogicalNetwork');
    }

    super.updateFrom(other);

    // Deep copy
    this._chipSelects = other.chipSelects.map((cs: any) => ChipSelect.fromJSON(cs.toJSON()));

    this.asyncSetSignal = other.asyncSetSignal;
    this.asyncResetSignal = other.asyncResetSignal;
    this.imagePath = other.imagePath;
    this.clockType = other.clockType;
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
  };

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
        el.address = super._minAddress - (lastMax - el.address);
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
        el.address = super._minAddress + (el.address - lastMin);
      }
    });
  }

  public get minAddress(): number {
    return this._minAddress;
  }

  public get maxAddress(): number {
    return this._maxAddress;
  }

  public set minAddress(value: number) {
    const lastMinAddress = super._minAddress;
    super.minAddress = value;
    this.updateChipSelectMin(lastMinAddress);
  }

  public set maxAddress(value: number) {
    const lastMaxAddress = super._maxAddress;
    super.maxAddress = value;
    this.updateChipSelectMax(lastMaxAddress);
  }

  public asyncSet() {
    this._ffd = true;
  }

  public asyncReset() {
    this._ffd = false;
  }

  public startOperation() {
    if (this.asyncSetSignal === 'RESET') {
      this.asyncSet();
    } else if (this.asyncResetSignal === 'RESET') {
      this.asyncReset();
    }
  }

  public toJSON(shortVersion: boolean = false): any {
    const json = super.toJSON(shortVersion);

    json.asyncSetSignal = this.asyncSetSignal;
    json.asyncResetSignal = this.asyncResetSignal;

    if (!shortVersion) json.imagePath = this.imagePath;

    json.clockType = this.clockType;
    json.ffd = this._ffd;
    json.chipSelects = this._chipSelects.map(cs => cs.toJSON());

    return json;
  }

  protected hydrate(json) {
    super.hydrate(json);
    this.asyncSetSignal = json.asyncSetSignal;
    this.asyncResetSignal = json.asyncResetSignal;
    this.imagePath = json.imagePath;
    this.clockType = json.clockType;
    this._ffd = json.ffd;
    this._chipSelects = json.chipSelects.map((cs: any) => ChipSelect.fromJSON(cs));
  }

  protected mux = (zero: any, one: any, sel: number) => sel === 0 ? zero : one;

  protected tri = (input: any, en: any) => input && en;

  protected extractByte(word: number, address: number): number {
    const offset = address % 4;
    const shift = (3 - offset) * 8;
    return (word >>> shift) & 0xFF;
  }

  /**
   * Adapts given data inside a word based on given address
   *
   * @param value
   * @param address
   * @protected
   *
   * @example
   * positionValue(0xAB, 1) => 0x00AB0000
   * positionValue(0x9F, 3) => 0x0000009F
   */
  protected positionValue(value: number, address: number): number {
    const offset = address % 4;
    const shift = (3 - offset) * 8;
    return (value << shift) >>> 0;
  }
}
