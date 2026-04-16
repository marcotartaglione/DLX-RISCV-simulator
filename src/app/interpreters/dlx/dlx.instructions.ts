import {DLXRegisters} from 'src/app/registers/dlx.registers';

type DLXImmediateValueSize = 8 | 16 | 26;
type DLXDataSizeName = 'byte' | 'halfword' | 'word';

/**
 * Verifies if the given number respects the DLX standard min and max values for signed and unsigned numbers.
 * If the number is out of bounds, an error is thrown.
 *
 * @param value The checked value
 * @param signed If the value is signed or unsigned (default: `false`)
 */
function overflowCheck(value: number, signed: boolean = false) {
  if (!Number.isSafeInteger(value)) {
    throw new Error('overflow');
  }

  if (signed) {
    if (value < -0x80000000 || value > 0x7FFFFFFF) {
      throw new Error('overflow');
    }
  } else {
    if (value < 0 || value > 0xFFFFFFFF) {
      throw new Error('overflow');
    }
  }

  return value;
}

/**
 * Performs sign extension on the given value, treating it as a signed number of the specified size (in bits).
 *
 * @param value The value to be sign-extended
 * @param size The expected result size
 */
export function signExtend(value: number, size: DLXImmediateValueSize = 16) {
  const shift = 32 - size;
  return (value << shift) >> shift;
}

/**
 * Converts an unsigned value to a signed 32 bits value
 *
 * @param value
 * @param size
 */
export function uintToInt(value: number, size: DLXImmediateValueSize = 16) {
  const extended = signExtend(value, size);
  return extended | 0;
}

const maskMap = {byte: 0xFF, halfword: 0xFFFF, word: 0xFFFFFFFF};

/**
 * Extracts a specific data segment (byte, halfword, or word) from a 32-bit value
 * based on the provided offset and dimension.
 *
 * @param value The 32-bit source word to read from.
 * @param offset The memory offset used to determine the byte position within the word.
 * @param dim The size of the data to load ('byte', 'halfword', or 'word').
 */
function load(value: number, offset: number, dim: DLXDataSizeName) {
  const byteOffset = offset % 4;

  if ((dim === 'word' && byteOffset !== 0) || (dim === 'halfword' && byteOffset % 2 !== 0)) {
    throw new Error('alignment fault');
  }

  const shift = byteOffset * 8;
  const mask = maskMap[dim]; // Note: Ensure your local variable uses 'dim' as the key

  return ((value >> shift) & mask) >>> 0;
}

/**
 * Updates a specific segment of a destination 32-bit word with a new value.
 * This performs a Read-Modify-Write bitwise operation to preserve the surrounding bits.
 *
 * @param value The new data value to be stored.
 * @param destination The original 32-bit word where the data will be injected.
 * @param offset The memory offset determining where the value starts within the destination.
 * @param dim The size of the data to store ('byte', 'halfword', or 'word').
 */
function store(value: number, destination: number, offset: number, dim: DLXDataSizeName): number {
  const byteOffset = offset % 4;

  if ((dim === 'word' && byteOffset !== 0) || (dim === 'halfword' && byteOffset % 2 !== 0)) {
    throw new Error('alignment fault');
  }

  const shift = byteOffset * 8;
  const mask = maskMap[dim];

  const clearMask = ~(mask << shift);
  const cleanedDest = destination & clearMask;

  const valueToInsert = (value & mask) << shift;

  return (cleanedDest | valueToInsert) >>> 0;
}

export const specialRegisters: string[] = ['IAR'];
export type DLXInstructionType =
  'Immediate' | 'ImmediateBranch' | 'ImmediateJump' | 'ImmediateLoad' | 'ImmediateStore' |
  'Jump' |
  'LoadHighImmediate' |
  'NoOperation' |
  'Register' |
  'RegisterMove' |
  'ReturnFromException';

export type DLXInstruction =
  'ADD' | 'ADDI' | 'ADDU' | 'ADDUI' |
  'SUB' | 'SUBI' | 'SUBU' | 'SUBUI' |

  'AND' | 'ANDI' |
  'OR' | 'ORI' |
  'XOR' | 'XORI' |
  'LHI' |

  'SLL' | 'SLLI' |
  'SRA' | 'SRAI' |
  'SRL' | 'SRLI' |

  'SEQ' | 'SEQI' |
  'SGE' | 'SGEI' |
  'SGT' | 'SGTI' |
  'SLE' | 'SLEI' |
  'SLT' | 'SLTI' |
  'SNE' | 'SNEI' |

  'LB' | 'LBU' | 'LH' | 'LHU' | 'LW' |
  'SB' | 'SH' | 'SW' |

  'BEQZ' | 'BNEZ' |
  'J' | 'JAL' | 'JALR' | 'JR' |

  'MOVI2S' | 'MOVS2I' |
  'NOP' |
  'RFE' |
  'TRAP';

export type InstructionConfig = { type: DLXInstructionType, func: (registers: DLXRegisters, args?: number[]) => number, unsigned?: boolean };

/**
 * Represents the structured data of a parsed DLX assembly instruction.
 *
 * @item 0 - The uppercase instruction mnemonic (e.g., 'ADD', 'LW').
 * @item 1 - An array of processed numerical operands (registers indices or immediate values).
 * @item 2 - The sanitized source line, stripped of labels and comments.
 * @item 3 - A flag indicating if the instruction relies on a symbolic tag (label) for its value.
 */
export type DLXStructuredInstruction = [string, number[], string, boolean];

export const instructions: {
  [key in DLXInstruction]: InstructionConfig
} = {
  ADD: {
    type: 'Register',
    func: (registers) => overflowCheck(instructions['ADDUI'].func(registers))
  },
  ADDI: {
    type: 'Immediate',
    func: (registers) => overflowCheck(instructions['ADDUI'].func(registers))
  },
  ADDU: {
    type: 'Register',
    func: (registers) => registers.c = registers.a + registers.temp
  },
  ADDUI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a + registers.temp,
    unsigned: true
  },
  AND: {
    type: 'Register',
    func: (registers) => registers.c = registers.a & registers.temp
  },
  ANDI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a & registers.temp,
    unsigned: true
  },
  BEQZ: {
    type: 'ImmediateBranch',
    func: (registers) => registers.a === 0 ? registers.pc = registers.temp : 0
  },
  BNEZ: {
    type: 'ImmediateBranch',
    func: (registers) => registers.a !== 0 ? registers.pc = registers.temp : 0
  },
  J: {
    type: 'Jump',
    func: (registers) => registers.pc = registers.temp
  },
  JAL: {
    type: 'Jump',
    func: (registers) => {
      registers.registersValue[31] = registers.c = registers.pc + 4;
      return registers.pc = registers.temp;
    }
  },
  JALR: {
    type: 'ImmediateJump', func: (registers) => {
      registers.registersValue[31] = registers.c = registers.pc + 4;
      return registers.pc = registers.a;
    }
  },
  JR: {
    type: 'ImmediateJump',
    func: (registers) => registers.pc = registers.a
  },
  LB: {
    type: 'ImmediateLoad',
    func: (registers) => registers.c = signExtend(load(registers.mdr, registers.temp, 'byte'), 8)
  },
  LBU: {
    type: 'ImmediateLoad',
    func: (registers) => registers.c = load(registers.mdr, registers.temp, 'byte')
  },
  LH: {
    type: 'ImmediateLoad',
    func: (registers) => registers.c = signExtend(load(registers.mdr, registers.temp, 'halfword'))
  },
  LHI: {
    type: 'LoadHighImmediate',
    func: (registers) => registers.c = registers.temp << 16
  },
  LHU: {
    type: 'ImmediateLoad',
    func: (registers) => registers.c = load(registers.mdr, registers.temp, 'halfword')
  },
  LW: {
    type: 'ImmediateLoad',
    func: (registers) => registers.c = load(registers.mdr, registers.temp, 'word')
  },
  MOVI2S: {
    type: 'RegisterMove',
    func: (registers, [rd, rs1]) => registers[specialRegisters[rd - 1].toLowerCase()] = registers.a = registers.registersValue[rs1]
  },
  MOVS2I: {
    type: 'RegisterMove',
    func: (registers, [rd, rs1]) => rd ? registers.registersValue[rd] = registers.c = registers[specialRegisters[rs1 - 1].toLowerCase()] : 0
  },
  NOP: {
    type: 'NoOperation',
    func: () => null
  },
  OR: {
    type: 'Register',
    func: (registers) => registers.c = registers.a | registers.temp
  },
  ORI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a | registers.temp, unsigned: true
  },
  RFE: {
    type: 'ReturnFromException',
    func: (registers) => registers.pc = registers.iar
  },
  SB: {
    type: 'ImmediateStore',
    func: (registers, [stored]) => store(registers.mdr, stored, registers.temp, 'byte')
  },
  SEQ: {
    type: 'Register',
    func: (registers) => registers.c = registers.a == registers.temp ? 1 : 0
  },
  SEQI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a == registers.temp ? 1 : 0
  },
  SGE: {
    type: 'Register',
    func: (registers) => registers.c = registers.a >= registers.temp ? 1 : 0
  },
  SGEI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a >= registers.temp ? 1 : 0
  },
  SGT: {
    type: 'Register',
    func: (registers) => registers.c = registers.a > registers.temp ? 1 : 0
  },
  SGTI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a > registers.temp ? 1 : 0
  },
  SH: {
    type: 'ImmediateStore',
    func: (registers, [stored]) => store(registers.mdr, stored, registers.temp, 'halfword')
  },
  SLE: {
    type: 'Register',
    func: (registers) => registers.c = registers.a <= registers.temp ? 1 : 0
  },
  SLEI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a <= registers.temp ? 1 : 0
  },
  SLL: {
    type: 'Register',
    func: (registers) => registers.c = registers.a << (registers.temp & 0x1F)
  },
  SLLI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a << (registers.temp & 0x1F)
  },
  SLT: {
    type: 'Register',
    func: (registers) => registers.c = registers.a < registers.temp ? 1 : 0
  },
  SLTI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a < registers.temp ? 1 : 0
  },
  SNE: {
    type: 'Register',
    func: (registers) => registers.c = registers.a != registers.temp ? 1 : 0
  },
  SNEI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a != registers.temp ? 1 : 0
  },
  SRA: {
    type: 'Register',
    func: (registers) => registers.c = registers.a >> (registers.temp & 0x1F)
  },
  SRAI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a >> (registers.temp & 0x1F)
  },
  SRL: {
    type: 'Register',
    func: (registers) => registers.c = registers.a >>> (registers.temp & 0x1F)
  },
  SRLI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a >>> (registers.temp & 0x1F)
  },
  SUB: {
    type: 'Register',
    func: (registers) => overflowCheck(instructions['SUBUI'].func(registers), true)
  },
  SUBI: {
    type: 'Immediate',
    func: (registers) => overflowCheck(instructions['SUBUI'].func(registers), true)
  },
  SUBU: {
    type: 'Register',
    func: (registers) => registers.c = registers.a - registers.temp
  },
  SUBUI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a - registers.temp, unsigned: true
  },
  SW: {
    type: 'ImmediateStore',
    func: (registers, [stored]) => store(registers.mdr, stored, registers.temp, 'word')
  },
  TRAP: {
    type: 'Jump', func: (registers) => {
      registers.iar = registers.pc + 4;
      return registers.pc = registers.temp;
    }, unsigned: true
  },
  XOR: {
    type: 'Register',
    func: (registers) => registers.c = registers.a ^ registers.temp
  },
  XORI: {
    type: 'Immediate',
    func: (registers) => registers.c = registers.a ^ registers.temp,
    unsigned: true
  },
};
