import {LogicalNetwork} from '../logical-network';
import {ChipSelect} from '../ChipSelect';
import {DeviceDialog} from '../../../decorators/device-dialog.decorator';
import {CounterDialogComponent} from '../../../dialogs/counter-dialog.component';

@DeviceDialog(() => CounterDialogComponent)
export class Counter extends LogicalNetwork {
  constructor(
    minAddress: number,
    maxAddress: number,
    public countingBasis = 32,
    public loadValue = 0,
    public upCounting = true,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
    clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
  ) {
    super('COUNTER', minAddress, maxAddress, asyncSetSignal, asyncResetSignal,
      `assets/img/counter/count/count_${clockType === 'MEMWR*' ? 'memwr' : 'memrd'}_${asyncResetSignal}.png`.toLowerCase(),
      clockType);

    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
    this.setChipSelect(ChipSelect.of('CS_A_RES_COUNTER', this.minAddress + 0x00000001), 0);
    this.setChipSelect(ChipSelect.of('CS_RES_COUNTER', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('CS_ENABLE_COUNTER', this.minAddress + 0x00000003), 1);
    this.setChipSelect(ChipSelect.of('CS_UP_DOWN_COUNTER', this.minAddress + 0x00000004), 1);
    this.setChipSelect(ChipSelect.of('CS_LOAD_VALUE_COUNTER', this.minAddress + 0x00000005), 0);
  }

  private _currentValue: number;

  public get currentValue(): number {
    return this._currentValue;
  }

  public static fromJSON(json: any) {
    const counter = new Counter(json.minAddress, json.maxAddress);
    counter.hydrate(json);
    return counter;
  }

  public increment() {
    const max = Math.pow(2, this.countingBasis);
    if (this._currentValue >= max) {
      this._currentValue = 0;
    } else {
      this._currentValue++;
    }
  }

  public decrement() {
    const max = Math.pow(2, this.countingBasis);
    if (this._currentValue <= 0) {
      this._currentValue = max;
    } else {
      this._currentValue--;
    }
  }

  public asyncReset() {
    this._currentValue = 0;
    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
  }

  public startOperation() {
    if (this.asyncResetSignal.includes('RESET')) {
      this.asyncReset();
    }
  }

  public load(address: number, instrType?: string): number {
    const cs = this.chipSelects.find(el => el.address === address);

    if (cs == null || instrType === 'IS') {
      return super.load(address);
    }

    switch (cs.id) {
      case 'CS_READ_VALUE_COUNTER':
        return this._currentValue >>> 0;

      case 'CS_ENABLE_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.updateCurrentValue();
        }
        return 0;

      case 'CS_RES_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this._currentValue = 0;
        }
        return 0;

      case 'CS_UP_DOWN_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.upCounting = this.mux(this.upCounting, !this.upCounting, 1);
          this.setChipSelect(ChipSelect.of('CS_UP_DOWN_COUNTER', this.minAddress + 0x00000004), this.upCounting);
        }
        return this.positionValue(this.upCounting ? 1 : 0, address);

      case 'CS_LOAD_VALUE_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this._currentValue = this.loadValue;
          this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
        }
        return 0;

      case 'CS_A_RES_COUNTER':
        if (this.asyncResetSignal === 'CS_A_RES_COUNTER') {
          this.asyncReset();
        }
        return 0;
    }
    return 0;
  }

  public store(address: number, word: number): void {
    const cs = this.chipSelects.find(el => el.address === address);

    if (cs == null) {
      return super.store(address, word);
    }

    switch (cs.id) {
      case 'CS_ENABLE_COUNTER':
        if (this.clockType === 'MEMWR*') {
          this.updateCurrentValue();
        }
        break;
      case 'CS_A_RES_COUNTER':
        if (this.asyncResetSignal === 'CS_A_RES_COUNTER') {
          this.asyncReset();
        }
        break;
      case 'CS_RES_COUNTER':
        if (this.clockType === 'MEMWR*') {
          this._currentValue = 0;
          this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
        }
        break;
      case 'CS_UP_DOWN_COUNTER':
        if (this.clockType === 'MEMWR*') {
          this.upCounting = this.mux(this.upCounting, !this.upCounting, 1);
          this.setChipSelect(ChipSelect.of('CS_UP_DOWN_COUNTER', this.minAddress + 0x00000004), this.upCounting);
        }
        break;
      case 'CS_LOAD_VALUE_COUNTER':
        if (this.clockType === 'MEMWR*') {
          this._currentValue = this.loadValue;
          this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
        }
        break;
    }
  }

  public toJSON(): any {
    const json = super.toJSON();
    json.countingBasis = this.countingBasis;
    json.loadValue = this.loadValue;
    json.upCounting = this.upCounting;
    json.currentValue = this._currentValue;
    return json;
  }

  protected hydrate(json) {
    super.hydrate(json);
    this._currentValue = json.currentValue;
  }

  private updateCurrentValue() {
    this.upCounting ? this.increment() : this.decrement();
    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
  }
}
