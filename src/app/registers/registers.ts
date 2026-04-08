export abstract class Registers {
  public readonly registersCount;
  public pc: number;

  protected constructor() {
    this.pc = 0;
  }
}
