export abstract class Registers {
  public static readonly registersCount: number;
  public pc: number;

  protected constructor() {
    this.pc = 0;
  }
}
