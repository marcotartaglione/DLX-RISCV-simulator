import {Device} from './device';

/**
 * standard logical network
 */
export class LogicalNetwork extends Device {

  /**
   * This logical network has a MUX, TRI-STATE and a FFD with SET and RESET Asynchronous func
   */

  ffd_d: boolean;
  ffd_q: boolean;
  ffd_a_set: boolean;
  ffd_a_res: boolean;
  image: String;
  led: boolean;

  public a_set() {
    this.ffd_d = this.ffd_a_set;
    this.ffd_q = this.ffd_a_set;
  }

  public a_reset() {
    this.ffd_d = this.ffd_a_res;
    this.ffd_q = this.ffd_a_res;
  }

  public mux = (zero,one,sel) => {
    return sel==0 ? zero : one;
  }

  public tri = (input,en) => {
    return input && en;
  }

}
