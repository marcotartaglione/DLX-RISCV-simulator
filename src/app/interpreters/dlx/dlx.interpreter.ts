import {DLXDocumentation} from 'src/app/documentation/dlx.documentation';
import {Memory} from 'src/app/memory/model/memory';
import {DiagramService} from 'src/app/services/diagram.service';
import {DLXRegisters} from '../../registers/dlx.registers';
import {Registers} from '../../registers/registers';
import {Interpreter} from '../interpreter';
import {NotExistingInstructionError, RegisterNotFoundError, WrongArgumentsError} from '../interpreter-errors';
import {encoder, inputs_encoder} from './dlx.encoder';
import {
  DLXInstructionType,
  DLXStructuredInstruction,
  InstructionConfig,
  instructions,
  signExtend,
  specialRegisters,
  uintToInt
} from './dlx.instructions';

// TODO: la gestione dei diagrammi non deve far parte dell'interprete

interface DLXInstructionContext {
  line: string,
  instruction: string,
  args: number[],
  registers: DLXRegisters,
  memory?: Memory,
  unsigned?: boolean,
  tagged?: boolean,
}

type ALUOperation = (registers: DLXRegisters, args?: number[]) => number;
type InstructionHandler = (ctx: DLXInstructionContext, op: ALUOperation) => void;

export class DLXInterpreter extends Interpreter {
  private readonly _processInstruction: Record<DLXInstructionType, InstructionHandler> = {

    Register: (ctx, func) => {
      const [destination, register1, register2] = ctx.args;
      if (!(/\w+\s+R[123]?\d\s*,\s*R[123]?\d\s*,\s*R[123]?\d/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }

      ctx.registers.a = ctx.registers.registersValue[register1];
      ctx.registers.temp = ctx.registers.b = ctx.registers.registersValue[register2];
      func(ctx.registers);

      if (destination) {
        ctx.registers.registersValue[destination] = ctx.registers.c;
        ctx.registers.setBold(destination);
      }

      this.updateDiagramAuto();
    },

    RegisterMove: (ctx, func) => {
      func(ctx.registers, ctx.args);
      this.updateDiagramAuto();
    },

    Immediate: (ctx, func) => {
      const [rd, rs1, immediate] = ctx.args;
      if (!(/\w+\s+R[123]?\d\s*,\s*R[123]?\d\s*,\s*0x([0-9A-F]{4})/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }
      ctx.registers.a = ctx.registers.registersValue[rs1];
      ctx.registers.b = ctx.registers.registersValue[rd];
      ctx.registers.temp = ctx.unsigned ? immediate : uintToInt(immediate, 16);
      func(ctx.registers);

      if (rd) {
        ctx.registers.registersValue[rd] = ctx.registers.c;
        ctx.registers.setBold(rd);
      }
      this.updateDiagramAuto();
    },

    ImmediateBranch: (ctx, func) => {
      let [rs1, name] = ctx.args;
      if (!(/\w+\s+R[123]?\d\s*,\s*\w+/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }

      if (ctx.tagged === true) {
        ctx.registers.a = ctx.registers.registersValue[rs1];
        ctx.registers.temp = name;
        func(ctx.registers);
      } else {
        ctx.registers.a = ctx.registers.registersValue[rs1];
        name = uintToInt(name, 16);
        ctx.registers.temp = ctx.registers.pc + name;
        func(ctx.registers);
      }

      this.updateDiagramAuto();
    },

    ImmediateJump: (ctx, func) => {
      const [rs1] = ctx.args;
      if (!(/\w+\s+R[123]?\d/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }
      ctx.registers.a = ctx.registers.registersValue[rs1];
      func(ctx.registers);
      this.updateDiagramAuto();
    },

    ImmediateLoad: (ctx, func) => {
      const [rd, offset, rs1] = ctx.args;
      if (!(/\w+\s+R[123]?\d\s*,\s*0x([0-9A-F]{4})\s*\(\s*R[123]?\d\s*\)\s*/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }
      ctx.registers.a = ctx.registers.registersValue[rs1];
      ctx.registers.b = ctx.registers.registersValue[rd];

      ctx.registers.mar = signExtend(offset) + ctx.registers.a;

      let rest = (ctx.registers.mar >>> 0) % 4;
      let addr = (ctx.registers.mar >>> 0);

      ctx.registers.mdr = ctx.memory!.load(addr - rest);
      ctx.registers.temp = rest;

      func(ctx.registers);

      if (rd) {
        ctx.registers.registersValue[rd] = ctx.registers.c;
        ctx.registers.setBold(rd);
      }

      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.load();
      }
    },

    ImmediateStore: (ctx, func) => {
      const [rd, offset, rs1] = ctx.args;
      if (!(/\w+\s+R[123]?\d\s*,\s*0x([0-9A-F]{4})\s*\(\s*R[123]?\d\s*\)\s*/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }
      ctx.registers.a = ctx.registers.registersValue[rs1];
      ctx.registers.mdr = ctx.registers.b = ctx.registers.registersValue[rd];
      ctx.registers.mar = signExtend(offset) + ctx.registers.a;
      ctx.registers.setMarBold();
      ctx.registers.setMdrBold();
      let rest = (ctx.registers.mar >>> 0) % 4;
      ctx.registers.temp = rest;
      let addr = (ctx.registers.mar >>> 0);
      ctx.memory!.store(addr, func(ctx.registers, [ctx.memory!.load(addr)]));

      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.store();
      }
    },

    Jump: (ctx, func) => {
      let [name] = ctx.args;
      if (!(/\w+\s+\w+/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }
      if (ctx.tagged === true) {
        ctx.registers.temp = name;
        func(ctx.registers);
      } else {
        if (ctx.unsigned) {
          ctx.registers.temp = ctx.registers.pc + 4 + name;
        } else {
          name = uintToInt(name, 26);
          ctx.registers.temp = ctx.registers.pc + name;
        }
        func(ctx.registers);
      }
      this.updateDiagramAuto();
    },

    LoadHighImmediate: (ctx, func) => {
      const [rd, immediate] = ctx.args;
      if (!(/\w+\s+R[123]?\d\s*,\s*0x([0-9A-F]{4})/i.test(ctx.line))) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }
      ctx.registers.temp = immediate;
      func(ctx.registers);
      if (rd) {
        ctx.registers.registersValue[rd] = ctx.registers.c;
        ctx.registers.setBold(rd);
      }
      this.updateDiagramAuto();
    },

    NoOperation: (_ctx) => {
      this.updateDiagramAuto();
    },

    ReturnFromException: (ctx, func) => {
      if (ctx.args.length) {
        throw new WrongArgumentsError(ctx.instruction, DLXDocumentation);
      }
      func(ctx.registers);
      this.interruptEnabled = true;
      ctx.registers.ien = 0;
      ctx.registers.resetIenBold();
      DiagramService.instance.dlxDiagrams.ienDown();
      this.updateDiagramAuto();
    }
  };

  /**
   * Executes the given line of DLX assembly code
   *
   * @param line Instruction line
   * @param registers DLX registers
   * @param memory System memory
   * @throws NotExistingInstructionError If the instruction mnemonic is not recognized
   * @return Next Program Counter value after executing the instruction
   */
  public override execute(line: string, registers: Registers, memory: Memory): number {
    let [instructionName, argsFixed, lineFixed, tagged] = this.processLine(line);
    let instructionConfig: InstructionConfig = instructions[instructionName];

    if (!instructionConfig) {
      throw new NotExistingInstructionError(instructionName);
    }

    let [opcode, alucode] = encoder[instructionName];
    (registers as DLXRegisters).ir = parseInt(opcode + inputs_encoder[instructionConfig.type](argsFixed) + alucode, 2); //otteniamo l'istruzione scritta in 32 bit
    (registers as DLXRegisters).setBold(0);
    (registers as DLXRegisters).resetRegistersBoldness();

    const ctx: DLXInstructionContext = {
      line: lineFixed,
      instruction: instructionName,
      args: argsFixed,
      registers: registers as DLXRegisters,
      memory: memory,
      unsigned: instructionConfig.unsigned,
      tagged: tagged
    };

    this._processInstruction[instructionConfig.type](ctx, instructionConfig.func);

    return registers.pc + 4;
  }

  /**
   * Encodes the given instruction string into its corresponding 32-bit binary representation
   *
   * @param line Instruction string
   * @return Instruction 32-bit representation or 0 if the instruction is invalid
   */
  public encode(line: string): number {
    try {
      let [instructionName, argsFixed] = this.processLine(line);
      let instruction = instructions[instructionName];
      let [opCode, aluCode] = encoder[instructionName];

      //NB: inverto ordine dei bit dell'opCode da -sig->+sig a +sig->-sig ; come vengono salvati i valori convertiti in binario
      return parseInt(this.reverseString(opCode) + inputs_encoder[instruction.type](argsFixed) + aluCode, 2);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Handles interrupt requests for the DLX interpreter.
   *
   * @param registers - The DLX registers object to be modified
   * @returns The program counter value before the interrupt jump
   */
  public override interrupt(registers: DLXRegisters): number {
    if (!this.interruptEnabled) {
      return registers.pc;
    }

    const beforeJump = registers.pc;

    registers.iar = registers.pc;
    registers.setIarBold();
    registers.pc = 0;
    registers.ien = 1;
    registers.setIenBold();

    this.interruptEnabled = false;

    DiagramService.instance.dlxDiagrams.ienUp();

    return beforeJump;
  }

  /**
   * Reverse the given string
   *
   * @param str String to revert
   */
  public reverseString(str: string) {
    return str.split('').reverse().join('');
  }

  private updateDiagramAuto() {
    if (DiagramService.instance.isAuto()) {
      DiagramService.instance.addressVisible = false;
      if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
        DiagramService.instance.idle();
      }
    }
  }

  /**
   * Parses a raw assembly line into a structured instruction format.
   *
   * @param line - The raw string from the source code to be processed.
   * @throws {NotExistingInstructionError} If the instruction mnemonic is not recognized.
   * @throws {WrongArgumentsError} If the operands provided do not match the expected format.
   * @throws {RegisterNotFoundError} If a register operand is invalid or out of range.
   * @throws {Error} If an immediate value exceeds its bit-width.
   * @private
   */
  private processLine(line: string): DLXStructuredInstruction {
    const commentIndex = line.indexOf(';');
    const cleanLine = commentIndex !== -1 ? line.substring(0, commentIndex) : line;

    const lineWithoutLabel = cleanLine.replace(/^(\w+:)?\s+/, '');

    if (!lineWithoutLabel) {
      return ['NOP', [], '', false];
    }

    const tokens = lineWithoutLabel.split(/[\s, ()]+/).filter(token => token.length > 0);
    const [instructionName, ...rawArgs] = tokens;
    const instruction = instructionName.toUpperCase();

    const config: InstructionConfig = instructions[instruction];
    if (!config) {
      throw new NotExistingInstructionError(instruction);
    }

    let reliesOnSymbolicTag: boolean = false;

    const argsFixed = rawArgs.map(arg => {
      if (/^R\d{1,2}$/i.test(arg)) {
        const register = parseInt(arg.substring(1), 10);
        if (register < 0 || register > 31) {
          throw new RegisterNotFoundError(arg);
        }

        return register;
      }

      const specialIndex = specialRegisters.indexOf(arg.toUpperCase());
      if (specialIndex !== -1) {
        return specialIndex + 1;
      }

      if (arg.toLowerCase().startsWith('0x')) {
        const hex = parseInt(arg.substring(2), 16);
        if (isNaN(hex)) {
          throw new Error('Invalid hexadecimal number: ' + arg);
        }

        if (config.type === 'Jump') {
          if (hex > 0x3FFFFFF) {
            throw new Error(instruction + ' has 26 bit immediate');
          }
        } else if (hex > 0xFFFF) {
          throw new Error(instruction + ' has 16 bit immediate');
        }

        return hex;
      }

      if (this.tags[arg] !== undefined) {
        reliesOnSymbolicTag = true;
        return this.tags[arg];
      }

      const fallbackCheck: DLXInstructionType[] = ['ImmediateBranch', 'Jump'];
      if (fallbackCheck.includes(config.type)) {
        throw new Error(`Tag ${arg} not found for jump/branch`);
      }

      throw new WrongArgumentsError(instruction, DLXDocumentation);
    });

    return [instruction, argsFixed, lineWithoutLabel, reliesOnSymbolicTag];
  }
}
