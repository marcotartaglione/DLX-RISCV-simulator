import {Device} from './device';
import {IVisualizable} from './IVisualizable';

/**
 * Standard logical network implementation.
 * Represents a hardware network with TRI-STATE buffers and Flip-Flops (FFD).
 */
export class LogicalNetwork extends Device implements IVisualizable {
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
  }

  public _ffd = false;

  public get ffd(): boolean {
    return this._ffd;
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
    this.asyncSetSignal = other.asyncSetSignal;
    this.asyncResetSignal = other.asyncResetSignal;
    this.imagePath = other.imagePath;
    this.clockType = other.clockType;
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

  public toJSON(): any {
    const json = super.toJSON();

    json.asyncSetSignal = this.asyncSetSignal;
    json.asyncResetSignal = this.asyncResetSignal;
    json.imagePath = this.imagePath;
    json.clkType = this.clockType;
    json.ffd = this._ffd;

    return json;
  }

  protected hydrate(json) {
    super.hydrate(json);
    this.asyncSetSignal = json.asyncSetSignal;
    this.asyncResetSignal = json.asyncResetSignal;
    this.imagePath = json.imagePath;
    this.clockType = json.clockType;
    this._ffd = json.ffd;
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
