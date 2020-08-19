import {Injector} from '@angular/core';
import {LogicalNetwork} from './logical-network';

export class LedLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  led: boolean;

  constructor(min_address: number, max_address: number, injector: Injector) {
    super('LED', min_address, max_address);
    this.ffd_a_res = false;
    this.ffd_a_set = true;
    this.cs = [];
    this.a_reset();
    
    this.setCS("mux_en",0x24000001,1);
    this.setCS("read_out",0x24000003,1);
  }

  public load(address: number): number {
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) return super.load(address);
    else {
      console.log("ACCESS CS -> " + cs.id);
      switch(cs.id) {
        case "read_out":
          return this.getLedStatus() ? 1 : 0;
      }
      return super.load(address);
    }
  }

  public store(address: number, word: number): void {
    if (address == this.max_address) {
      this.ffd = (word & 0x1) == 0x1;
    }
  }

  public clk = () => { // EXECUTE THE LOGICAL NETWORK CLK
    let cs_mux = this.cs.find(el => el.id=="mux_en");
    if(cs_mux==null) return;
    else this.ffd = this.mux(this.ffd, !this.ffd, this.load(cs_mux.address));
    let cs_read_out = this.cs.find(el => el.id=="read_out");
    if(cs_read_out!=null)
      this.store(cs_read_out.address,this.ffd ? 1 : 0);

    console.log("LED STATUS -> " + this.getLedStatus());
  }

  public getLedStatus = () => {
    return this.ffd;
  }

}
