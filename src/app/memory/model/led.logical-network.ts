import {Injector} from '@angular/core';
import {LogicalNetwork} from './logical-network';

export class LedLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  led: boolean;

  constructor(cs_read: number, cs_write: number, injector: Injector) {
    super('Led', cs_read, cs_write);
    this.a_set();
  }

  handleLedValue = () => {
    if(this.ffd) this.led = !this.led;
  }

  public load(address: number): number {
    this.handleLedValue();
    if (address == this.min_address) {
      return this.ffd ? 1 : 0;
    } 
    return 0;
  }

  public store(address: number, word: number): void {
    console.log("STORING -> " + word);
    if (address == this.max_address) {
      this.ffd = (word & 0x1) == 0x1;
    }
  }
}
