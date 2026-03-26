import {LogicalNetwork} from '../logical-network';
import {ChipSelect} from '../ChipSelect';

export class StartLogicalNetwork extends LogicalNetwork {
  // ffd( name, d, a_res, a_set, clk)
  // mux( zero, one, sel)
  // tri( in, en )
  // bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  private _startup = false;

  constructor(
    chipSelectRead: number,
    chipSelectWrite: number,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
    clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
  ) {
    super('Start', chipSelectRead, chipSelectWrite, asyncSetSignal, asyncResetSignal,
      ('assets/img/startup/' +
        (clockType === 'MEMWR*' ? 'memwr' : 'memrd') + '/' + asyncSetSignal + '_' + asyncResetSignal + '.jpg').toLowerCase(),
      clockType);

    this.setChipSelect(ChipSelect.of('CS_READ_STARTUP', this.minAddress), 1);
    this.setChipSelect(ChipSelect.of('CS_WRITE_STARTUP', this.minAddress + 0x00000001), 1);
    this.setChipSelect(ChipSelect.of('CS_A_RES_STARTUP', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('CS_A_SET_STARTUP', this.minAddress + 0x00000003), 0);
  }

  public get startup(): boolean {
    return this._startup;
  }

  public asyncSet() {
    this._ffd = true;
    this._startup = this.ffd;
    this.setChipSelect(ChipSelect.of('CS_READ_STARTUP', this.minAddress), this._startup);
  }

  public asyncReset() {
    this._ffd = false;
    this._startup = this.ffd;
    this.setChipSelect(ChipSelect.of('CS_READ_STARTUP', this.minAddress), this._startup);
  }

  public load(address: number, instrType?: string): number {
    const cs = this.chipSelects.find(el => el.address === address);
    if (this.clockType === 'MEMRD*') {
      this.clk();
    }

    // Metto il controllo instrType==IS per gli stessi motivi per cui lo metto in  led e counter.
    // Vedere commenti nei rispettivi componenti.
    if (cs == null || instrType === 'IS') {
      return super.load(address);
    } else {
      switch (cs.id) {
        case 'CS_READ_STARTUP':
          return this.ffd ? 1 : 0;
      }
    }

    return 0;
  }

  public store(address: number, word: number): void {
    const cs = this.chipSelects.find(el => el.address === address);
    if (cs == null) {
      return super.store(address, word);
    } else {
      switch (cs.id) {
        case 'CS_WRITE_STARTUP':
          // tslint:disable-next-line:no-bitwise
          this._ffd = (word & 0x1) === 0x1;
          if (this.clockType === 'MEMWR*') {
            this.clk();
          }
          break;
        case 'CS_A_SET_STARTUP':
          if (this.asyncSetSignal === 'CS_A_SET_STARTUP') {
            this.asyncSet();
          }
          break;
        case 'CS_A_RES_STARTUP':
          if (this.asyncSetSignal === 'CS_A_RES_STARTUP') {
            this.asyncReset();
          }
          break;
      }
    }
  }

  public clk() {
    this._startup = this.ffd;
    super.store(this.chipSelects.find(el => el.id === 'CS_READ_STARTUP').address, this.ffd ? 1 : 0);
  }
}
