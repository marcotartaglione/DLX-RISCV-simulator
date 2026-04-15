import {LogicalNetwork} from './logical-network';
import {ChipSelect} from './ChipSelect';

export const InputPortSizesArray = [8, 16, 32] as const;
type InputPortSize = typeof InputPortSizesArray[number];

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

  public interrupt() {
    this._interrupt = true;
  }

  public load(address: number): number {
    const chipSelect = this.chipSelects.find((el) => el.address === address);

    switch (chipSelect.id) {
      case 'CS_READ_INT_INPUT_PORT':
        return this._interrupt ? 1 : 0;
      case 'CS_INPUT_PORT':
        if (this.clockType === 'MEMRD*') {
          this._interrupt = false;
          this.generateData();
          this.setChipSelect(ChipSelect.of('CS_INPUT_PORT', this.minAddress), this._data);
          return this._data;
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
}
