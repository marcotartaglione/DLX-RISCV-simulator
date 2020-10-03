import {Injector, Input, Inject, Injectable} from '@angular/core';
import {LogicalNetwork} from './logical-network';

@Injectable()
export class StartLogicalNetwork extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";


  constructor(cs_read: number, cs_write: number, injector: Injector) {
    super('Start', cs_read, cs_write);
    super.devType = "Start";
    this.image = "assets/img/rete-start.png"
    this.cs = [];
    this.a_set_value="RESET";
    this.a_reset_value="0";
    this.setCS("cs_read_start",this.min_address,1);
    this.setCS("cs_set_start",this.min_address + 0x00000001,1);
  }

  public startOp() {
    if(this.a_set_value == "RESET")
      this.a_set();
    
    if(this.a_reset_value == "RESET")
      this.a_reset();
  }
  
  public load(address: number): number {
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) return super.load(address);
    else {
      switch(cs.id) {
        case "cs_read_start":
          return this.ffd_q ? 1 : 0;
      }
    }
    
    return 0;
  }

  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if(cs==null) return super.store(address,word);
    else {
      switch(cs.id) {
        case "cs_set_start":
          this.ffd_q = (word & 0x1) == 0x1;
          break;
      }
    }
  }
}
