import {Registers} from './registers';

export class DLXRegisters extends Registers {
  public readonly registersCount = 32;

  public registersValue = Array<number>(this.registersCount);
  public registersBoldness = Array<string>(this.registersCount);

  private _previousRegister: number = 0;

  public iar: number = 0;
  public mar: number = 0;
  public ir: number = 0;
  public temp: number = 0;
  public mdr: number = 0;
  public ien: number = 0;
  public a: number = 0;
  public b: number = 0;
  public c: number = 0;

  public marBoldness: string = 'normal';
  public mdrBoldness: string = 'normal';
  public iarBoldness: string = 'normal';
  public ienBoldness: string = 'normal';

  constructor() {
    super();

    this.registersValue[0] = 0;
    for (let i = 0; i < this.registersCount; i++) {
      if (i === 0) {
        this.registersValue[i] = 0;
      } else {
        this.registersValue[i] = Math.floor(Math.random() * 0x100000000);
      }

      this.registersBoldness[i] = 'normal';
    }
  }

  public setBold(registerIndex: number) {
    if (registerIndex < 0 || registerIndex >= this.registersCount) {
      throw new Error(`Invalid register index: ${registerIndex}. It must be between 0 and ${this.registersCount - 1}.`);
    }

    this.registersBoldness[this._previousRegister] = 'normal';
    this._previousRegister = registerIndex;
    this.registersBoldness[registerIndex] = 'bold';
  }

  public resetRegistersBoldness() {
    for (let i = 0; i < this.registersCount; i++) {
      this.registersBoldness[i] = 'normal';
    }

    this.marBoldness = 'normal';
    this.mdrBoldness = 'normal';
    this.iarBoldness = 'normal';
    this.ienBoldness = 'normal';
  }

  public setMarBold() {
    this.marBoldness = 'bold';
  }

  public setMdrBold() {
    this.mdrBoldness = 'bold';
  }

  public setIarBold() {
    this.iarBoldness = 'bold';
  }

  public setIenBold() {
    this.ienBoldness = 'bold';
  }

  public resetIenBold() {
    this.ienBoldness = 'normal'
  }
}
