import {LogicalNetwork} from '../logical-network';
import {ChipSelect} from '../ChipSelect';
import {DeviceDialog} from '../../../decorators/device-dialog.decorator';
import {InputPortDialogComponent} from '../../../dialogs/input-port-dialog.component';

export const InputPortSizesArray = [8, 16, 32] as const;
type InputPortSize = typeof InputPortSizesArray[number];

@DeviceDialog(() => InputPortDialogComponent)
export class InputPort extends LogicalNetwork {
  constructor(
    minAddress: number,
    maxAddress: number,
    private _data = 0,
    private _dataSize: InputPortSize = 8,
    private _interrupt = false,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
    clkType: 'MEMWR*' | 'MEMRD*' = 'MEMRD*',
  ) {
    super('INPUT_PORT', minAddress, maxAddress, asyncSetSignal, asyncResetSignal,
      `assets/img/input-port/input_port_bit_${_dataSize}.jpg`, clkType);

    this.setChipSelect(ChipSelect.of('CS_INPUT_PORT', this.minAddress), 0);
    this.setChipSelect(ChipSelect.of('CS_READ_INT_INPUT_PORT', this.minAddress + 0x00000001), 1);
  }

  public get data(): number {
    return this._data;
  }

  public get dataSize(): InputPortSize {
    return this._dataSize;
  }

  public set dataSize(value: InputPortSize) {
    this._dataSize = value;
    this.imagePath = 'assets/img/input-port/input_port_bit_' + this._dataSize + '.jpg';
  }

  public static fromJSON(json: any) {
    const inputPort = new InputPort(json.minAddress, json.maxAddress);
    inputPort.hydrate(json);
    return inputPort;
  }

  public interrupt() {
    this._interrupt = true;
  }

  public load(address: number): number {
    const chipSelect = this.chipSelects.find((el) => el.address === address);

    if (!chipSelect) {
      return super.load(address);
    }

    switch (chipSelect.id) {
      case 'CS_READ_INT_INPUT_PORT':
        return this.positionValue(this._interrupt ? 1 : 0, address);

      case 'CS_INPUT_PORT':
        if (this.clockType === 'MEMRD*') {
          this._interrupt = false;
          this.generateData();
          this.setChipSelect(ChipSelect.of('CS_INPUT_PORT', this.minAddress), this._data);
          return this.positionValue(this._data, address);
        }
    }

    return 0;
  }

  public toJSON(): any {
    const json = super.toJSON();

    json.data = this._data;
    json.dataSize = this._dataSize;
    json.interrupt = this._interrupt;

    return json;
  }

  protected positionValue(value: number, address: number): number {
    const offset = address % 4;
    const shift = (3 - offset) * 8;

    if (this._dataSize === 32) {
      return value >>> 0;
    }

    return (value << shift) >>> 0;
  }

  protected hydrate(json) {
    super.hydrate(json);
    this._data = json.data;
    this._dataSize = json.dataSize;
    this._interrupt = json.interrupt;
  }

  private generateData() {
    const max = Math.pow(2, this._dataSize);
    this._data = Math.floor(Math.random() * max);
  }
}
