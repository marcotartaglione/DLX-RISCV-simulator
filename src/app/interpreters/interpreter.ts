import {Memory} from '../memory/model/memory';
import {Registers} from '../registers/registers';

export abstract class Interpreter {
  protected _wasInStartup: boolean = true;

  /**
   * From tag name to line number
   *
   * @protected
   */
  protected tags: { [key: string]: number } = {};

  /**
   * Execute a single instruction. This method should be called for each line of code to execute the corresponding instruction.
   *
   * @param line
   * @param registers
   * @param memory
   *
   * @return Next Program Counter value after executing the instruction
   */
  abstract execute(line: string, registers: Registers, memory: Memory): number;

  /**
   * Encodes a single assembly line into its machine-code representation.
   *
   * @param line The source line to encode.
   * @return The encoded instruction value.
   */
  abstract encode(line: string): number;

  /**
   * Handle an interrupt. This method should be called when an interrupt is triggered,
   * and it returns the Program Counter value before the jump.
   *
   * @param registers
   * @return The program counter value before the interrupt jump
   */
  abstract interrupt(registers: Registers): number;

  /**
   * Resets the interpreter to its initial state by disabling interrupts
   * and clearing any architecture-specific state.
   */
  public reset(registers: Registers): void {
    this.resetArchitectureState(registers);
  }

  /**
   * Reset the architecture-specific state. This method is called by the reset()
   */
  protected abstract resetArchitectureState(registers: Registers): void;

  /**
   * Extracts the tags from the code and stores them.
   *
   * @param code The code to parse for tags. Each line containing a tag is expected to be in the format "tag_name: instruction".
   * @param startTag The code starting tag
   */
  public parseTags(code: string, startTag: string) {
    code
      .split('\n')
      .forEach((line, index) => {
        let tag = /^(\w+):/.exec(line);

        if (tag) {
          this.tags[tag[1]] = (index - 1) * 4;
        }
      });

    this.tags['start_tag'] = this.tags[startTag] + 4;
  }

  /**
   * Extract the line number for the given tag. Returns null if the tag does not exist.
   *
   * @param tag The tag which line has to be returned
   */
  public getTag(tag: string) {
    return this.tags[tag] ?? undefined;
  }
}
