import {Device} from './device';
import {IVisualizable} from './IVisualizable';

/**
 * Standard logical network implementation.
 * Represents a hardware network with TRI-STATE buffers and Flip-Flops (FFD).
 */
export class LogicalNetwork extends Device implements IVisualizable {

  protected constructor(
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

  public get ffd(): boolean {
    return this._ffd;
  }
  public _ffd = false;

  public static fromJSON(json: any) {
    const logicalNetwork = super.fromJSON(json) as LogicalNetwork;

    logicalNetwork.asyncSetSignal = json.async_set_signal;
    logicalNetwork.asyncResetSignal = json.async_reset_signal;
    logicalNetwork.imagePath = json.imagePath;
    logicalNetwork.clockType = json.clk_type;

    return logicalNetwork;
  }

  protected mux = (zero: any, one: any, sel: number) => sel === 0 ? zero : one;
  protected tri = (input: any, en: any) => input && en;

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

    json.async_set_signal = this.asyncSetSignal;
    json.async_reset_signal = this.asyncResetSignal;
    json.imagePath = this.imagePath;
    json.clk_type = this.clockType;

    return json;
  }
}
