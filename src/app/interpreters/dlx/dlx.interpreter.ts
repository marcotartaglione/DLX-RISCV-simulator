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

export class DLXInterpreter extends Interpreter {
  private readonly process_instruction: {
    [key in DLXInstructionType]:
    (line: string, instruction: string, args: number[], func: (registers: DLXRegisters, args?: number[]) => number, registers: DLXRegisters, memory?: Memory, unsigned?: boolean, tagged?: boolean) => void
  } = {
    Register: (line, instruction, [destination, register1, register2], func, registers) => {
      if (!(/\w+\s+R[123]?\d\s*,\s*R[123]?\d\s*,\s*R[123]?\d/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }

      registers.a = registers.registersValue[register1];
      registers.temp = registers.b = registers.registersValue[register2];
      func(registers);


      if (destination) {
        registers.registersValue[destination] = registers.c;
        registers.setBold(destination);
      }

      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    RegisterMove: (_line, _instruction, args, func, registers) => {
      func(registers, args);
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    Immediate: (line, instruction, [rd, rs1, immediate], func, registers, _memory, unsigned = false) => {
      if (!(/\w+\s+R[123]?\d\s*,\s*R[123]?\d\s*,\s*0x([0-9A-F]{4})/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }
      registers.a = registers.registersValue[rs1];
      registers.b = registers.registersValue[rd];
      registers.temp = unsigned ? immediate : uintToInt(immediate, 16);
      func(registers);

      if (rd) {
        registers.registersValue[rd] = registers.c;
        registers.setBold(rd);
      }
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    ImmediateBranch: (line, instruction, [rs1, name], func, registers, _memory, unsigned = false, tagged) => {
      if (!(/\w+\s+R[123]?\d\s*,\s*\w+/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }

      // Se nella branch si fa riferimento a un tag saltiamo direttamente a quello. Nel registro
      // temp ci carico l'indirizzo del tag. Il valore di temp sarà poi caricare nel pc.

      if (tagged === true) {
        registers.a = registers.registersValue[rs1];
        registers.temp = name;
        func(registers);
      } else

        // Se invece al posto del tag c'è un immediato a 16 bit , nel pc dovrò caricare il valore
        // pc + 4 + immediato 16 bit esteso con segno

      {
        registers.a = registers.registersValue[rs1];

        // converto in decimale con segno
        // dentro la uintToInt è già effettuata la conversione del segno

        name = uintToInt(name, 16);
        registers.temp = registers.pc + name;
        func(registers);
      }
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    ImmediateJump: (line, instruction, [rs1], func, registers) => {
      if (!(/\w+\s+R[123]?\d/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }
      registers.a = registers.registersValue[rs1];
      func(registers);
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    ImmediateLoad: (line, instruction, [rd, offset, rs1], func, registers, memory) => {
      if (!(/\w+\s+R[123]?\d\s*,\s*0x([0-9A-F]{4})\s*\(\s*R[123]?\d\s*\)\s*/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }
      registers.a = registers.registersValue[rs1];
      registers.b = registers.registersValue[rd];
      registers.mar = signExtend(offset) + registers.a;
      let rest = (registers.mar >>> 0) % 4;   //permette di capire da quale byte partiamo per l'accesso in memoria  es: FFFF0003 -> 3 byte (quello meno significativo)
      let addr = Math.floor((registers.mar >>> 0) / 4) >>> 0;
      registers.mdr = memory.load(addr, 'IL');
      registers.temp = rest;
      func(registers);
      if (rd) {
        registers.registersValue[rd] = registers.c;
        registers.setBold(rd);
      }
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.load();
      }
    },

    ImmediateStore: (line, instruction, [rd, offset, rs1], func, registers, memory) => {
      if (!(/\w+\s+R[123]?\d\s*,\s*0x([0-9A-F]{4})\s*\(\s*R[123]?\d\s*\)\s*/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }
      registers.a = registers.registersValue[rs1];
      registers.mdr = registers.b = registers.registersValue[rd];
      registers.mar = signExtend(offset) + registers.a;
      registers.setMarBold();
      registers.setMdrBold();
      let rest = (registers.mar >>> 0) % 4;   //permette di capire a da quale byte partiamo per l'accesso in memoria  es: FFFF0003 -> 3 byte (quello meno significativo)
      registers.temp = rest;
      let addr = Math.floor((registers.mar >>> 0) / 4) >>> 0;
      memory.store(addr, func(registers, [memory.load(addr, 'IS')]));
      //se l'esecuzione è impostata su auto, l'animazione viene gestita dall'interprete
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.store();
      }
    },

    Jump: (line, instruction, [name], func, registers, _memory, unsigned = false, tagged) => {
      if (!(/\w+\s+\w+/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }
      if (tagged === true) {
        registers.temp = name;
        func(registers);
      } else {
        if (unsigned) {
          registers.temp = registers.pc + 4 + name;
        } else {
          name = uintToInt(name, 26);
          registers.temp = registers.pc + name;
        }
        func(registers);
      }
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    LoadHighImmediate: (line, instruction, [rd, immediate], func, registers) => {
      if (!(/\w+\s+R[123]?\d\s*,\s*0x([0-9A-F]{4})/i.test(line))) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }
      registers.temp = immediate;
      func(registers);
      if (rd) {
        registers.registersValue[rd] = registers.c;
        registers.setBold(rd);
      }
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    NoOperation: () => {
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
    },

    ReturnFromException: (_line, instruction, args, func, registers) => {
      if (args.length) {
        throw new WrongArgumentsError(instruction, DLXDocumentation);
      }
      func(registers);
      this.interruptEnabled = true;
      (registers as DLXRegisters).ien = 0;
      (registers as DLXRegisters).resetIenBold();
      DiagramService.instance.dlxDiagrams.ienDown();
      if (DiagramService.instance.isAuto()) {
        DiagramService.instance.addressVisible = false;
        if (!DiagramService.instance.dlxDiagrams.getDiagram('clock').isRunning) {
          DiagramService.instance.idle();
        }
      }
      // registers.r = this.tmpReg;
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
    this.process_instruction[instructionConfig.type](lineFixed, instructionName, argsFixed, instructionConfig.func, registers as DLXRegisters, memory, instructionConfig.unsigned, tagged);

    if (instructionConfig.type === 'Jump') {
      return registers.pc;
    }

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
