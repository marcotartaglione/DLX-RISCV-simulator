import {Device} from './device';

/**
 * standard logical network
 */
export class LogicalNetwork extends Device {

  /**
   * This logical network has a MUX, TRI-STATE and a FFD with SET and RESET Asynchronous func
   */

  ffd: boolean;
  ffd_a_set: boolean;
  ffd_a_res: boolean;

  public a_set() {
    this.ffd = this.ffd_a_set;
  }

  public a_reset() {
    this.ffd = this.ffd_a_res;
  }

  public mux = (zero,one,sel) => {
    return sel==0 ? zero : one;
  }

  public tri = (input,en) => {
    return input && en;
  }

}
