import {LogicalNetwork} from '../logical-network';
import {ChipSelect} from '../ChipSelect';

// TODO: rimuovere e lasciare solo LogicalNetwork?
export class FFDLogicalNetwork extends LogicalNetwork {
  // ffd( name, d, a_res, a_set, clk)
  // mux( zero, one, sel)
  // tri( in, en )
  // bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  constructor(
    chipSelectRead: number,
    chipSelectWrite: number,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
  ) {
    super('FF-D', chipSelectRead, chipSelectWrite, asyncSetSignal, asyncResetSignal,
      ('assets/img/counter/network/fcb_ffdr_' + asyncResetSignal + '_ffds_' + asyncSetSignal + '.png').toLowerCase());

    this.setChipSelect(ChipSelect.of('cs_read_ff', this.minAddress), 1);
    this.setChipSelect(ChipSelect.of('cs_set_ff', this.minAddress + 0x00000001), 1);
    this.setChipSelect(ChipSelect.of('cs_reset', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('cs_set', this.minAddress + 0x00000003), 0);
  }

  public static fromJSON(json: any) {
    const ffdLogicalNetwork = new FFDLogicalNetwork(json.minAddress, json.maxAddress);
    ffdLogicalNetwork.hydrate(json);
    return ffdLogicalNetwork;
  }

  protected hydrate(json) {
    super.hydrate(json);
  }

  public load(address: number): number {
    let res = 0;
    const cs = this.chipSelects.find(el => el.address === address);
    if (cs == null) {
      res = super.load(address);
    } else {
      switch (cs.id) {
        case 'cs_read_ff':
          res = this.ffd ? 1 : 0;
      }
    }

    return res;
  }

  public store(address: number, word: number): void {
    const cs = this.chipSelects.find(el => el.address === address);
    if (cs == null) {
      return super.store(address, word);
    } else {
      switch (cs.id) {
        case 'cs_set_ff':
          // tslint:disable-next-line:no-bitwise
          this._ffd = (word & 0x1) === 0x1;
          break;
      }
    }
  }

  public toJSON(): any {
    const json = super.toJSON();
    return json;
  }
}
