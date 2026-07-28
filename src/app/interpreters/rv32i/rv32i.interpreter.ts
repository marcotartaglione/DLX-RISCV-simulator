import {Memory} from '../../memory/model/memory';
import {Registers} from '../../registers/registers';
import {RV32IRegisters} from '../../registers/rv32i.registers';
import {Interpreter} from '../interpreter';

const BASE = 0;
const instructions_R = 'ADD|SUB|SLL|SLT|SLTU|XOR|SRL|SRA|OR|AND';
const instructions_I = 'ADDI|SLTI|SLTIU|XORI|ORI|ANDI|SLLI|SRLI|SRAI';
const instructions_IL = 'LB|LH|LW|LBU|LHU';
const instructions_IJ = 'JALR';
const instructions_S = 'SB|SH|SW';
const instructions_B = 'BEQ|BNE|BLT|BGE|BLTU|BGEU';
const instructions_U = 'LUI|AUIPC';
const instructions_J = 'JAL';
const instructions = instructions_R + '|' + instructions_I + '|' + instructions_IL + '|' + instructions_IJ + '|' + instructions_S + '|' + instructions_B + '|' + instructions_U + '|' + instructions_J;

export class RV32Interpreter extends Interpreter {

  tmpRegisters: RV32IRegisters = new RV32IRegisters;
  myMem: Memory = new Memory;
  readonly instructions: { [key: string]: (args: number[], registers: RV32IRegisters, memory: Memory, usnigned ?: boolean) => number } = {
    // R-type instructions
    ADD: (args, registers) => {
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value + registers.specialRegisters['rs2'].value;
    },
    SUB: (args, registers) => {
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 32;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value - registers.specialRegisters['rs2'].value;
    },
    SLL: (args, registers) => {
      registers.specialRegisters['f3'].value = 1;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs2'].value > 31 ? 0 : (registers.specialRegisters['rs1'].value << registers.specialRegisters['rs2'].value) >>> 0;
    },
    SLT: (args, registers) => {
      registers.specialRegisters['f3'].value = 2;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value < registers.specialRegisters['rs2'].value ? 1 : 0;
    },
    SLTU: (args, registers) => {
      registers.specialRegisters['f3'].value = 3;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = (registers.specialRegisters['rs1'].value == 0) ? (registers.specialRegisters['rs2'].value != 0 ? 1 : 0) : (registers.specialRegisters['rs1'].value < registers.specialRegisters['rs2'].value ? 1 : 0);
    },
    XOR: (args, registers) => {
      registers.specialRegisters['f3'].value = 4;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value ^ registers.specialRegisters['rs2'].value;
    },
    SRL: (args, registers) => {
      registers.specialRegisters['f3'].value = 5;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value >>> (registers.specialRegisters['rs2'].value & 0x1F);
    },
    SRA: (args, registers) => {
      registers.specialRegisters['f3'].value = 5;
      registers.specialRegisters['f7'].value = 32;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value >> (registers.specialRegisters['rs2'].value & 0x1F);
    },
    OR: (args, registers) => {
      registers.specialRegisters['f3'].value = 6;
      registers.specialRegisters['f7'].value = 32;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value | registers.specialRegisters['rs2'].value & 0x1F;
    },
    AND: (args, registers) => {
      registers.specialRegisters['f3'].value = 7;
      registers.specialRegisters['f7'].value = 32;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepR(args, registers)] = registers.specialRegisters['rs1'].value & registers.specialRegisters['rs2'].value & 0x1F;
    },

    // I-type instructions
    ADDI: (args, registers) => {
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers)] = registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value;
    },
    SLTI: (args, registers) => {
      registers.specialRegisters['f3'].value = 2;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers)] = this.signExtend(registers.specialRegisters['rs1'].value) < registers.specialRegisters['i'].value ? 1 : 0;
    },
    SLTIU: (args, registers) => {
      registers.specialRegisters['f3'].value = 3;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers, true)] = registers.specialRegisters['i'].value == 1 ? (registers.specialRegisters['rs1'].value == 0 ? 1 : 0) : (registers.specialRegisters['rs1'].value < registers.specialRegisters['i'].value ? 1 : 0);
    },
    XORI: (args, registers) => {
      registers.specialRegisters['f3'].value = 4;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers)] = registers.specialRegisters['i'].value == -1 ? (registers.specialRegisters['rs1'].value ^ 1) : (registers.specialRegisters['rs1'].value ^ registers.specialRegisters['i'].value);
    },
    ORI: (args, registers) => {
      registers.specialRegisters['f3'].value = 6;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers)] = registers.specialRegisters['rs1'].value | registers.specialRegisters['i'].value;
    },
    ANDI: (args, registers) => {
      registers.specialRegisters['f3'].value = 7;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers)] = registers.specialRegisters['rs1'].value & registers.specialRegisters['i'].value;
    },
    SLLI: (args, registers) => {
      registers.specialRegisters['f3'].value = 1;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers, true)] = registers.specialRegisters['i'].value > 31 ? 0 : (registers.specialRegisters['rs1'].value << registers.specialRegisters['i'].value) >>> 0;
    },
    SRLI: (args, registers) => {
      registers.specialRegisters['f3'].value = 5;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers, true)] = registers.specialRegisters['rs1'].value >>> (registers.specialRegisters['i'].value & 0x1F);
    },
    SRAI: (args, registers) => {
      registers.specialRegisters['f3'].value = 5;
      registers.specialRegisters['f7'].value = 32;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI(args, registers, true)] = registers.specialRegisters['rs1'].value >> (registers.specialRegisters['i'].value & 0x1F);
    },
    // I-type instructions [LOAD]
    LB: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI_Load(args, registers)] = ((1 << 7) & ((memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4)) & 0x000000FF)) ? (memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4) & 0x000000FF) | 0xFFFFFF00 : (memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4) & 0x000000FF);
    },
    LH: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 1;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI_Load(args, registers)] = ((1 << 15) & (memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4) & 0x0000FFFF)) ? (memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4) & 0x0000FFFF) | 0xFFFF0000 : (memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4) & 0x00000FFFF);
    },
    LW: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 2;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI_Load(args, registers)] = memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4);
    },
    LBU: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 4;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI_Load(args, registers)] = memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4) & 0x000000FF;
    },
    LHU: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 5;
      registers.specialRegisters['f7'].value = 0;
      return registers.specialRegisters['dr'].value = registers.registersValue[this.prepI_Load(args, registers)] = memory.load(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4) & 0x0000FFFF;
    },
    // I-type instructions [JUMP]
    JALR: (args, registers) => {
      console.log('eseguo JALR');
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      registers.specialRegisters['dr'].value = registers.registersValue[this.prepI_Jump(args, registers)] = registers.specialRegisters['pc'].value;
      return registers.specialRegisters['pc'].value = registers.specialRegisters['i'].value = (registers.specialRegisters['rs1'].value + registers.specialRegisters['fo'].value) & ~(1 << 0);
    },

    // S-type instructions
    SB: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      registers.specialRegisters['rs2'].value = registers.registersValue[this.prepS(args, registers)] & 0x000000FF;
      memory.store(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4, registers.specialRegisters['rs2'].value);
      return 0;
    },
    SH: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 1;
      registers.specialRegisters['f7'].value = 0;
      registers.specialRegisters['rs2'].value = registers.registersValue[this.prepS(args, registers)] & 0x0000FFFF;
      memory.store(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4, registers.specialRegisters['rs2'].value);
      return 1;
    },
    SW: (args, registers, memory) => {
      registers.specialRegisters['f3'].value = 2;
      registers.specialRegisters['f7'].value = 0;
      registers.specialRegisters['rs2'].value = registers.registersValue[this.prepS(args, registers)] & 0xFFFFFFFF;
      memory.store(Math.floor(registers.specialRegisters['rs1'].value + registers.specialRegisters['i'].value) / 4, registers.specialRegisters['rs2'].value);
      return 2;
    },

    // B-type instructions
    BEQ: (args, registers) => {
      registers.specialRegisters['f3'].value = 0;
      let jumpOffset = this.prepB(args, registers);
      return registers.specialRegisters['pc'].value += (registers.specialRegisters['rs1'].value == registers.specialRegisters['rs2'].value ? jumpOffset : registers.specialRegisters['pc'].value) - 4;
    },
    BNE: (args, registers) => {
      registers.specialRegisters['f3'].value = 1;
      let jumpOffset = this.prepB(args, registers);
      return registers.specialRegisters['pc'].value += (registers.specialRegisters['rs1'].value != registers.specialRegisters['rs2'].value ? jumpOffset : registers.specialRegisters['pc'].value) - 4;
    },
    BLT: (args, registers) => {
      registers.specialRegisters['f3'].value = 4;
      let jumpOffset = this.prepB(args, registers);
      return registers.specialRegisters['pc'].value += (this.signExtend(registers.specialRegisters['rs1'].value) < this.signExtend(registers.specialRegisters['rs2'].value) ? jumpOffset : registers.specialRegisters['pc'].value) - 4;
    },
    BGE: (args, registers) => {
      registers.specialRegisters['f3'].value = 5;
      let jumpOffset = this.prepB(args, registers);
      return registers.specialRegisters['pc'].value += (this.signExtend(registers.specialRegisters['rs1'].value) >= this.signExtend(registers.specialRegisters['rs2'].value) ? jumpOffset : registers.specialRegisters['pc'].value) - 4;
    },
    BLTU: (args, registers) => {
      registers.specialRegisters['f3'].value = 6;
      let jumpOffset = this.prepB(args, registers);
      return registers.specialRegisters['pc'].value += (registers.specialRegisters['rs1'].value < registers.specialRegisters['rs2'].value ? jumpOffset : registers.specialRegisters['pc'].value) - 4;
    },
    BGEU: (args, registers) => {
      registers.specialRegisters['f3'].value = 7;
      let jumpOffset = this.prepB(args, registers);
      return registers.specialRegisters['pc'].value += (registers.specialRegisters['rs1'].value >= registers.specialRegisters['rs2'].value ? jumpOffset : registers.specialRegisters['pc'].value) - 4;
    },

    // U-type instructions
    LUI: ([rd, immediate], registers) => {
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      registers.specialRegisters['oc'].value = 55;
      return registers.specialRegisters['rd'].value = registers.registersValue[this.prepU([rd, immediate], registers)] = registers.specialRegisters['i'].value;
    },
    AUIPC: ([rd, immediate], registers) => {
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      registers.specialRegisters['oc'].value = 23;
      return registers.specialRegisters['rd'].value = registers.registersValue[this.prepU([rd, immediate], registers)] = (registers.specialRegisters['pc'].value - 4) + registers.specialRegisters['i'].value;
    },

    // J-type instructions
    JAL: ([rd, immediate], registers) => {
      if (rd == 0) {
        throw new Error('Cannot write into register x0');
      }
      registers.specialRegisters['f3'].value = 0;
      registers.specialRegisters['f7'].value = 0;
      registers.specialRegisters['oc'].value = 111;
      registers.specialRegisters['rd'].value = registers.registersValue[rd] = registers.specialRegisters['pc'].value;
      registers.specialRegisters['fo'].value = immediate;
      return registers.specialRegisters['pc'].value = registers.specialRegisters['fo'].value;
    },
  };

  protected resetArchitectureState(registers:Registers): void {}

  // PREP, Prepares args in the right format to be executed by the instructions
  prepR([rd, rs1, rs2]: number[], registers: RV32IRegisters): number {
    if (rd == 0) {
      throw new Error('Cannot write into register x0');
    }
    registers.specialRegisters['oc'].value = 51;
    registers.specialRegisters['rs1'].value = registers.registersValue[rs1];
    registers.specialRegisters['rs2'].value = registers.registersValue[rs2];
    return rd;
  }

  prepI([rd, rs1, immediate]: number[], registers: RV32IRegisters, unsigned: boolean = false): number {
    if (rd == 0) {
      throw new Error('Cannot write into register x0');
    }
    registers.specialRegisters['oc'].value = 19;
    registers.specialRegisters['rs1'].value = registers.registersValue[rs1];
    registers.specialRegisters['i'].value = unsigned ? immediate : this.signExtend(immediate);
    return rd;
  }

  prepI_Load([rd, immediate, rs1]: number[], registers: RV32IRegisters, unsigned: boolean = false): number {
    if (rd == 0) {
      throw new Error('Cannot write into register x0');
    }
    registers.specialRegisters['oc'].value = 3;
    registers.specialRegisters['rs1'].value = registers.registersValue[rs1];
    registers.specialRegisters['i'].value = unsigned ? immediate : this.signExtend(immediate);
    return rd;
  }

  prepI_Jump([rd, rs1, immediate]: number[], registers: RV32IRegisters) {
    registers.specialRegisters['oc'].value = 111;
    registers.specialRegisters['rs1'].value = registers.registersValue[rs1];
    registers.specialRegisters['fo'].value = this.signExtend(immediate);
    return rd;
  }

  prepS([rs2, immediate, rs1]: number[], registers: RV32IRegisters): number {
    registers.specialRegisters['oc'].value = 35;
    registers.specialRegisters['rs1'].value = registers.registersValue[rs1];
    registers.specialRegisters['i'].value = this.signExtend(immediate);
    return rs2;
  }

  prepU([rd, immediate]: number[], registers: RV32IRegisters): number {
    if (rd == 0) {
      throw new Error('Cannot write into register x0');
    }
    registers.specialRegisters['i'].value = (immediate) << 12;
    return rd;
  }

  prepB([rs1, rs2, immediate]: number[], registers: RV32IRegisters): number {
    registers.specialRegisters['oc'].value = 99;
    registers.specialRegisters['f7'].value = 0;
    registers.specialRegisters['rs1'].value = registers.registersValue[rs1];
    registers.specialRegisters['rs2'].value = registers.registersValue[rs2];
    return registers.specialRegisters['fo'].value = this.signExtend(immediate);
  }

  signExtend(immediate: number): number {
    if ((1 << 11) & immediate) {
      return (immediate | 0xFFFFF000);
    } else {
      return immediate;
    }
  }

  execute(line: string, registers: Registers, memory: Memory): number {
    let tokens: string[];
    let lineFixed: string;

    if (!line || line.match(/^;/)) {
      tokens = ['NOP'];
    } else {
      lineFixed = line.split(';')[0].replace(/^(\w+:)?\s+/, '');
      tokens = lineFixed.split(/\W+/);
    }

    let [instruction, ...args] = tokens;
    let argsFixed: number[] = [];
    let size = args.length;
    // Controllo se l'istruione è valida
    console.log(instruction);
    if (!instructions.split('|').includes(instruction)) {
      throw new Error('Instruction doesn\'t exist');
    } else if (instructions_R.split('|').includes(instruction)) {
      if (!args[0].match(/^R[123]?\d/i) || !args[1].match(/^R[123]?\d/i) || !args[2].match(/^R[123]?\d/i) || (size > 3 && args[3] != '')) {
        throw new Error(instruction + ' RD, RS1, RS2');
      }
    } else if (instructions_I.split('|').includes(instruction) || instructions_IJ.split('|').includes(instruction) || instructions_B.split('|').includes(instruction)) {
      if (!args[0].match(/^R[123]?\d/i) || !args[1].match(/^R[123]?\d/i) || !args[2].match(/^0x([0-9A-F]{4})/i) || (size > 3 && args[3] != '')) {
        throw new Error(instruction + ' RD, RS1, Immediate');
      }
    } else if (instructions_S.split('|').includes(instruction) || instructions_IL.split('|').includes(instruction)) {
      if (!args[0].match(/^R[123]?\d/i) || !args[1].match(/^0x([0-9A-F]{4})/i) || !args[2].match(/^R[123]?\d/i) || (size > 3 && args[3] != '')) {
        throw new Error(instruction + ' RD, Immediate, RS1');
      }
    } else if (instructions_U.split('|').includes(instruction)) {
      if (!args[0].match(/^R[123]?\d/i) || !args[1].match(/^0x([0-9A-F]{4})/i) || (size > 2 && args[2] != '')) {
        throw new Error(instruction + ' RD, Immediate');
      }
    } else if (instructions_IJ.split('|').includes(instruction)) {
      if (!args[0].match(/^R[123]?\d/i) || !args[1].match(/^R[123]?\d/i) || (size > 3 && args[3] != '')) {
        throw new Error(instruction + ' RD, RS1, Tag');
      }
    } else if (instructions_J.split('|').includes(instruction) || (size > 2 && args[2] != '')) {
      if (!args[0].match(/^R[123]?\d/i)) {
        throw new Error(instruction + ' RD, Tag');
      }
    }

    argsFixed = args.map<number>(arg => {
      if (arg.match(/^R[123]?\d/i)) {
        return parseInt(arg.substr(1));
      } else if (arg.match(/^0x([0-9A-F]{4})/i)) {
        //console.log(parseInt(arg.substr(2, 4), 16));
        return parseInt(arg.substr(2, 4), 16);
      } else if (this.tags[arg]) {
        return this.tags[arg];
      } else {
        return 0;
      }
    });

    console.log(argsFixed);
    this.myMem = memory;
    if (this.instructions[instruction]) {
      this.instructions[instruction](argsFixed, registers as RV32IRegisters, memory);
    }

    return registers.specialRegisters['pc'].value + 4;
  }

  encode(line: string): number {
    try {
      this.execute(line, this.tmpRegisters, this.myMem);
      this.tmpRegisters.specialRegisters['in'].value = this.tmpRegisters.specialRegisters['oc'].value + this.tmpRegisters.specialRegisters['rd'].value + this.tmpRegisters.specialRegisters['rs1'].value + this.tmpRegisters.specialRegisters['rs2'].value + this.tmpRegisters.specialRegisters['f3'].value + this.tmpRegisters.specialRegisters['f7'].value + this.tmpRegisters.specialRegisters['fo'].value + this.tmpRegisters.specialRegisters['i'].value;
      return this.tmpRegisters.specialRegisters['in'].value;
    } catch (error) {
      return 0;
    }
  }

  public interrupt(registers: Registers): number {
    const beforeInterrupt = registers.specialRegisters['pc'].value;

    if (registers.specialRegisters['ien'].value !== 0) {
      registers.specialRegisters['ien'].value = 0;
      (registers as RV32IRegisters).registersValue[5] = registers.specialRegisters['pc'].value;
      registers.specialRegisters['pc'].value = BASE;
      // in caso di VECTORED INTERRUPTS -> PC = BASE + ExcCode * 4
      // ExcCode = 11 (Machine external interrupt)
    }

    return beforeInterrupt;
  }
}
