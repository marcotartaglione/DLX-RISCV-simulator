import { Injector, Input, Inject, Injectable } from '@angular/core';
import { LogicalNetwork } from './logical-network';

@Injectable()
export class LedLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  mux_status: number;

  constructor(min_address: number, max_address: number, injector: Injector) {
    super('LED', min_address, max_address);
    super.devType = "Led";
    this.image = "assets/img/rete-led.png";
    this.cs = [];
    this.mux_status=0;
    this.a_set();
    this.setCS("cs_inverti_led", this.min_address, this.mux_status);
    this.setCS("cs_read_led", this.min_address + 0x00000001, this.led);
  }


  public a_set() {
    this.ffd_q = false;
    this.ffd_d = this.mux(this.ffd_q, !this.ffd_q, this.mux_status);
    this.led = this.ffd_q;
    console.log("MUX SET -> " + this.mux_status);
  }

  public load(address: number): number {
    let cs = this.cs.find(el => el.address == address);
    if (cs == null) return super.load(address);
    else {
      switch (cs.id) {
        case "cs_read_led":
          return this.led ? 1 : 0;
        case "cs_inverti_led":
          return this.mux_status;
      }
    }
  }

  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if (cs == null) return super.store(address, word);
    else {
      switch (cs.id) {
        case "cs_inverti_led":
          this.mux_status = word & 0x01;
          console.log("AGGIORNATO MUX -> " + this.mux_status);
          break;
      }
    }
  }

  public clk = () => { // EXECUTE THE LOGICAL NETWORK CLK
    console.log("MUX STATUS -> " + this.mux_status);
    this.ffd_q = this.mux(this.ffd_d, !this.ffd_q, this.mux_status);
    this.ffd_d = this.mux(this.ffd_q, !this.ffd_q, this.mux_status);
    let cs_read_led = this.cs.find(el => el.id == "cs_read_led");
    this.led = this.ffd_q;
    if (cs_read_led != null)
      this.store(cs_read_led.address, this.led ? 1 : 0);
  }

  public getLedStatus = () => {
    return this.led;
  }

}
