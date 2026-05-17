import {LogicalNetwork} from '../logical-network';
import {ChipSelect} from '../ChipSelect';
import {DeviceDialog} from '../../../decorators/device-dialog.decorator';
import {CounterDialogComponent} from '../../../dialogs/counter-dialog.component';
import {Device} from '../device';

@DeviceDialog(() => CounterDialogComponent)
export class Counter extends LogicalNetwork {
  constructor(
    minAddress: number,
    maxAddress: number,
    private _countingBasis = 32,
    private _loadValue = 0,
    public upCounting = true,
    asyncSetSignal = '0',
    asyncResetSignal = 'RESET',
    clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
    public asyncCounterResetSignal: 'CS_A_RES_COUNTER' | 'RESET' = 'CS_A_RES_COUNTER',
    private _currentValue = 0
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

  public get currentValue(): number {
    return this._currentValue;
  }

  public set currentValue(value: number) {
    if (value < 0 || value > Math.pow(2, this.countingBasis) - 1) {
      throw new Error(`Current value must be between 0 and ${Math.pow(2, this.countingBasis) - 1}`);
    }

    this._currentValue = value;
  }

  public get loadValue(): number {
    return this._loadValue;
  }

  public set loadValue(value: number) {
    if (value < 0 || value > Math.pow(2, this.countingBasis) - 1) {
      throw new Error(`Current value must be between 0 and ${Math.pow(2, this.countingBasis) - 1}`);
    }

    this._loadValue = value;
  }

  public get countingBasis(): number {
    return this._countingBasis;
  }

  public set countingBasis(value: number) {
    this._countingBasis = Math.max(1, Math.min(32, value));

    const max = Math.pow(2, this._countingBasis) - 1;
    if (this._currentValue > max) {
      this._currentValue = this._currentValue & max;
      this.updateChipSelectValue();
    }
  }

  public static fromJSON(json: any) {
    const counter = new Counter(json.minAddress, json.maxAddress);
    counter.hydrate(json);
    return counter;
  }

  public override updateFrom(other: Device) {
    if (!(other instanceof Counter)) {
      throw new Error('Cannot update Counter from a different type of device');
    }

    super.updateFrom(other);
    this.countingBasis = other.countingBasis;
    this.loadValue = other.loadValue;
    this.upCounting = other.upCounting;
    this.asyncCounterResetSignal = other.asyncCounterResetSignal;
    this._currentValue = other._currentValue;
    this.updateChipSelectValue();
  }

  public increment() {
    const limit = Math.pow(2, this.countingBasis);
    this._currentValue = (this._currentValue + 1) % limit;
  }

  public decrement() {
    const limit = Math.pow(2, this.countingBasis);
    this._currentValue = (this._currentValue - 1 + limit) % limit;
  }

  public asyncReset() {
    this._currentValue = 0;
    this.updateChipSelectValue();
  }

  public startOperation() {
    if (this.asyncResetSignal.includes('RESET')) {
      this.asyncReset();
    }
  }

  public override load(address: number, instrType?: string): number {
    const cs = this.getChipSelect(address);

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
          this.asyncReset();
        }
        return 0;

      case 'CS_UP_DOWN_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.upCounting = !this.upCounting;
          this.setChipSelect(cs, this.upCounting);
        }
        return this.positionValue(this.upCounting ? 1 : 0, address);

      case 'CS_LOAD_VALUE_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.loadValueAction();
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

  public override store(address: number, word: number): void {
    const cs = this.getChipSelect(address);

    if (cs == null) {
      return super.store(address, word);
    }

    const isActive = word !== 0;

    switch (cs.id) {
      case 'CS_ENABLE_COUNTER':
        if (this.clockType === 'MEMWR*' && isActive) {
          this.updateCurrentValue();
        }
        break;
      case 'CS_A_RES_COUNTER':
        if (this.asyncResetSignal === 'CS_A_RES_COUNTER' && isActive) {
          this.asyncReset();
        }
        break;
      case 'CS_RES_COUNTER':
        if (this.clockType === 'MEMWR*' && isActive) {
          this.asyncReset();
        }
        break;
      case 'CS_UP_DOWN_COUNTER':
        if (this.clockType === 'MEMWR*') {
          this.upCounting = isActive;
          this.setChipSelect(cs, this.upCounting);
        }
        break;
      case 'CS_LOAD_VALUE_COUNTER':
        if (this.clockType === 'MEMWR*' && isActive) {
          this.loadValueAction();
        }
        break;
    }
  }

  public override toJSON(): any {
    const json = super.toJSON();
    json.countingBasis = this._countingBasis;
    json.loadValue = this.loadValue;
    json.upCounting = this.upCounting;
    json.currentValue = this._currentValue;
    return json;
  }

  protected override hydrate(json: any) {
    super.hydrate(json);
    this._countingBasis = json.countingBasis ?? 32;
    this.loadValue = json.loadValue ?? 0;
    this.upCounting = json.upCounting ?? true;
    this._currentValue = json.currentValue ?? 0;
  }

  private updateCurrentValue() {
    this.upCounting ? this.increment() : this.decrement();
    this.updateChipSelectValue();
  }

  private loadValueAction() {
    const max = Math.pow(2, this.countingBasis) - 1;
    this._currentValue = this.loadValue & max;
    this.updateChipSelectValue();
  }

  private updateChipSelectValue() {
    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
  }
}
