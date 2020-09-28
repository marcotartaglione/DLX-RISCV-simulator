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
    this.clkType = "MEMWR*";
    this.cs = [];
    this.mux_status = 1;
    this.a_set_value = "RESET";
    this.a_reset_value = "0";
    this.startOp();
    this.setCS("cs_read_led", this.min_address, this.led);
    this.setCS("cs_inverti_led", this.min_address + 0x00000001, this.mux_status);
    this.setCS("cs_reset", this.min_address + 0x00000002, 0);
    this.setCS("cs_set", this.min_address + 0x00000003, 0);
  }

  public getImageName() {
    return "assets/img/rete-led-" + (this.clkType == "MEMWR*" ? "memwr" : "memrd") + ".png"
  }

  public startOp() {
    if(this.a_set_value == "RESET")
      this.a_set();
    
    if(this.a_reset_value == "RESET")
      this.a_reset();
  }

  public a_set() {
    console.log("LED A_SET()");
    this.ffd_q = true;
    this.ffd_d = this.mux_status ? !this.ffd_q : this.ffd_q;
    this.led = this.ffd_q;
    this.setCS("cs_read_led", this.min_address, this.led);
  }

  public a_reset() {
    console.log("LED A_RESET()");
    this.ffd_q = false;
    this.ffd_d = this.mux_status ? !this.ffd_q : this.ffd_q;
    this.led = this.ffd_q;
    this.setCS("cs_read_led", this.min_address, this.led);
  }

  public load(address: number): number {
    let cs = this.cs.find(el => el.address == address);
    console.log("CLK TYPE() -> " + this.clkType);
    if (this.clkType == "MEMRD*")
      this.clk();
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
          if ("MEMWR*" == this.clkType)
            this.clk();
          break;
        case "cs_set":
          if (word & 0x01 && this.a_set_value=="CS_SET")
            this.a_set();
          break;
        case "cs_reset":
          if (word & 0x01 && this.a_set_value=="CS_RESET")
            this.a_reset();
          break;
      }
    }
  }

  public clk = () => { // EXECUTE THE LOGICAL NETWORK CLK
    this.ffd_q = this.mux(this.ffd_d, !this.ffd_q, this.mux_status);
    this.ffd_d = this.mux(this.ffd_q, !this.ffd_q, this.mux_status);
    let cs_read_led = this.cs.find(el => el.id == "cs_read_led");
    this.led = this.ffd_q;
    if (cs_read_led != null)
      super.store(cs_read_led.address, this.led ? 1 : 0);
  }

  public getLedStatus = () => {
    return this.led;
  }

}
