import {Injector, Input, Inject, Injectable} from '@angular/core';
import {LogicalNetwork} from './logical-network';

@Injectable()
export class LedLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  mux_status: number;

  constructor(min_address: number, max_address: number, injector: Injector) {
    super('LED', min_address, max_address);
    this.ffd_a_res = true;
    this.ffd_a_set = false;
    this.image = "assets/img/rete-led.png";
    this.cs = [];
    this.a_set();
    this.led = this.ffd;
    this.setCS("cs_inverti_led",this.min_address,1);
    this.setCS("cs_read_led",this.min_address + 0x00000001,1);

  }

  public load(address: number): number {
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) return super.load(address);
    else {
      switch(cs.id) {
        case "cs_read_led":
          return this.led ? 1 : 0;
        case "cs_inverti_led":
          return this.mux_status;
      }
    }
  }

  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) return super.store(address,word);
    else {
      switch(cs.id) {
        case "cs_inverti_led":
          this.mux_status = word&0x01;
          break;
      }
    }
  }

  public clk = () => { // EXECUTE THE LOGICAL NETWORK CLK
    let cs_inverti_led = this.cs.find(el => el.id=="cs_inverti_led");
    if(cs_inverti_led==null) return;
    else {
      let cs_mux = this.load(cs_inverti_led.address);
      this.ffd = this.mux(this.ffd, !this.ffd, cs_mux);
      console.log(this.ffd);
    }
    let cs_read_led = this.cs.find(el => el.id=="cs_read_led");
    if(cs_read_led!=null)
      this.store(cs_read_led.address,this.ffd ? 1 : 0);

    this.led = this.ffd;
  }

  public getLedStatus = () => {
    return this.led;
  }

}
