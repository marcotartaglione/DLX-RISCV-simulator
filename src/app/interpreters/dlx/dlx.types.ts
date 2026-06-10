import {DLXRegisters} from '../../registers/dlx.registers';

export type DLXImmediateValueSize = 8 | 16 | 26;
export type DLXDataSizeName = 'byte' | 'halfword' | 'word';

export type DLXInstructionType =
  'Immediate' | 'ImmediateBranch' | 'ImmediateJump' | 'ImmediateLoad' | 'ImmediateStore' |
  'Jump' |
  'LoadHighImmediate' |
  'NoOperation' |
  'Register' |
  'RegisterMove' |
  'ReturnFromException';

export type InstructionConfig = {
  type: DLXInstructionType,
  func: (registers: DLXRegisters, args?: number[]) => number,
  unsigned?: boolean
};

export type DLXStructuredInstruction = [string, number[], string, boolean];
