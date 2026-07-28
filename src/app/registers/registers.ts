export abstract class Registers {
  public static readonly registersCount: number;
  public pc: number;
  public interruptEnabled: number;

  protected constructor() {
    this.pc = 0;
    this.interruptEnabled = 0;
  }
}
