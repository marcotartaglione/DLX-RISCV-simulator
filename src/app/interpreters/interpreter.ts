import {Memory} from '../memory/model/memory';
import {Registers} from '../registers/registers';

export abstract class Interpreter {
  protected interruptEnabled: boolean = true;

  //dizionario tag -> numero riga
  protected tags: { [key: string]: number } = {};

  /**
   * Execute a single instruction. This method should be called for each line of code to execute the corresponding instruction.
   * Returns the next Program Counter value after executing the instruction.
   *
   * @param line
   * @param registers
   * @param memory
   */
  abstract run(line: string, registers: Registers, memory: Memory): number;

  abstract encode(line: string): number;

  /**
   * Handle an interrupt. This method should be called when an interrupt is triggered,
   * and it returns the Program Counter value before the jump.
   *
   * @param registers
   */
  abstract interrupt(registers: Registers): number;

  parseTags(code: string, startTag: string) {
    code.split('\n').forEach((line, index) => {
      let tag = /^(\w+):/.exec(line);
      if (tag) {
        this.tags[tag[1]] = index * 4;
      }
    });
    this.tags['start_tag'] = this.tags[startTag];
  }

  getTag(name: string): number {
    return this.tags[name];
  }
}
