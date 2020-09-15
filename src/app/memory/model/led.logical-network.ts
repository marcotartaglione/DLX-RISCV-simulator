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
    this.clkType = "MEMRD";
    this.image = "assets/img/rete-led.png";
    this.cs = [];
    this.a_set();
    this.led = this.ffd_q;
    this.setCS("cs_inverti_led", this.min_address, 1);
    this.setCS("cs_read_led", this.min_address + 0x00000001, 1);
  }

  public a_set() {
    this.ffd_q = true;
    this.ffd_d = true;
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
          break;
      }
    }
  }

  public clk = () => { // EXECUTE THE LOGICAL NETWORK CLK
    let cs_inverti_led = this.cs.find(el => el.id == "cs_inverti_led");
    this.ffd_q = this.ffd_d;
    if (cs_inverti_led == null) return;
    else {
      let cs_mux = this.load(cs_inverti_led.address);
      console.log("CS_INVERTI_LED -> " + cs_mux);
      this.ffd_d = this.mux(this.ffd_q, !this.ffd_q, cs_mux);
    }
    let cs_read_led = this.cs.find(el => el.id == "cs_read_led");
    this.led = this.ffd_q;
    if (cs_read_led != null)
      this.store(cs_read_led.address, this.led ? 1 : 0);

    console.log("NEW D -> " + this.ffd_d);
    console.log("NEW Q -> " + this.ffd_q);
  }

  public getLedStatus = () => {
    return this.led;
  }

}
