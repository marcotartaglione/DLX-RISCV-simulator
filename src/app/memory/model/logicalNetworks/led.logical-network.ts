import {Injectable} from '@angular/core';
import {LogicalNetwork} from '../logical-network';
import {ChipSelect} from '../ChipSelect';

export class LedLogicalNetwork extends LogicalNetwork {
  // ffd( name, d, a_res, a_set, clk)
  // mux( zero, one, sel)
  // tri( in, en )
  // bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  private _led = false;

  constructor(
    minAddress: number,
    maxAddress: number,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
    clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
  ) {
    super('LED', minAddress, maxAddress, asyncSetSignal, asyncResetSignal,
      ('assets/img/led/' +
        (clockType === 'MEMWR*' ? 'memwr' : 'memrd') + '/' + asyncSetSignal + '_' + asyncResetSignal + '.jpg').toLowerCase(),
      clockType);

    this.setChipSelect(ChipSelect.of('CS_READ_LED', this.minAddress), this._led);
    this.setChipSelect(ChipSelect.of('CS_SWITCH_LED', this.minAddress + 0x00000001), 1);
    this.setChipSelect(ChipSelect.of('CS_A_RES_LED', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('CS_A_SET_LED', this.minAddress + 0x00000003), 0);
  }

  public get led(): boolean {
    return this._led;
  }

  public asyncSet() {
    this._ffd = true;
    this._led = this.ffd;
    this.setChipSelect(ChipSelect.of('CS_READ_LED', this.minAddress), this._led);
  }

  public asyncReset() {
    this._ffd = false;
    this._led = this.ffd;
    this.setChipSelect(ChipSelect.of('CS_READ_LED', this.minAddress), this._led);
  }

  public load(address: number, instrType?: string): number {
    const cs = this.chipSelects.find(el => el.address === address);
    if (this.clockType === 'MEMRD*') {
      this.clk();
    }

    // se l'istruzione è del tipo IS ritorno il valore salvato in quella cella di memoria perchè significa
    // che questa specifica store proviene da una load effettuata quando si esegue una store (dlx.interpreter.ts - line 103)
    // quindi gli interessa solamente il valore salvato in memoria e non vuole impartire nessun comnando al led.
    if (cs == null || instrType === 'IS') {
      return super.load(address);
    } else {
      switch (cs.id) {
        case 'CS_READ_LED':
          return this._led ? 1 : 0;
      }
    }
  }

  public store(address: number, word: number): void {
    const cs = this.chipSelects.find(el => el.address === address);
    if (cs == null) {
      return super.store(address, word);
    } else {
      switch (cs.id) {
        case 'CS_SWITCH_LED':
          this._ffd = this.mux(this.ffd, !this.ffd, 1);
          if ('MEMWR*' === this.clockType) {
            this.clk();
          }
          break;
        case 'CS_A_SET_LED':
          if (this.asyncSetSignal === 'CS_A_SET_LED') {
            this.asyncSet();
          }
          break;
        case 'CS_A_RES_LED':
          if (this.asyncSetSignal === 'CS_A_RES_LED') {
            this.asyncReset();
          }
          break;
      }
    }
  }

  public clk = () => {
    const CS_READ_LED = this.chipSelects.find(el => el.id === 'CS_READ_LED');
    this._led = this.ffd;
    if (CS_READ_LED != null) {
      super.store(CS_READ_LED.address, this._led ? 1 : 0);
    }
  }
}
