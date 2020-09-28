import {Device} from './device';

/**
 * standard logical network
 */
export class LogicalNetwork extends Device {

  /**
   * This logical network has a TRI-STATE and a FFD with SET and RESET Asynchronous func
   */

  ffd_d: boolean;
  ffd_q: boolean;
  a_set_value: string;
  a_reset_value: string;
  image: String;
  led: boolean;
  clkType: string = null;

  public a_set() {
    this.ffd_q = true;
  }

  public a_reset() {
    this.ffd_q = true;
  }

  public mux = (zero,one,sel) => {
    return sel==0 ? zero : one;
  }

  public tri = (input,en) => {
    return input && en;
  }

  getImageName() {
    return this.image;
  }

}
