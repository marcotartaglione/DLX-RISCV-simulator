export const specialRegisters = ['IAR'] as const;
export type SpecialRegisters = typeof specialRegisters[number];

export const DLX_INSTRUCTIONS_R = [
  'ADD', 'ADDU', 'AND', 'MOVI2S', 'MOVS2I', 'NOP', 'OR',
  'SEQ', 'SGE', 'SGT', 'SLE', 'SLL', 'SLT', 'SNE', 'SRA', 'SRL',
  'SUB', 'SUBU', 'XOR'
] as const;

export const DLX_INSTRUCTIONS_I = [
  'ADDI', 'ADDUI', 'ANDI', 'LB', 'LBU', 'LH', 'LHI', 'LHU', 'LW',
  'ORI', 'SB', 'SEQI', 'SGEI', 'SGTI', 'SH', 'SLEI', 'SLLI', 'SLTI',
  'SNEI', 'SRAI', 'SRLI', 'SUBI', 'SUBUI', 'SW', 'XORI'
] as const;

export const DLX_INSTRUCTIONS_IJ = [
  'BEQZ', 'BNEZ', 'JALR', 'JR'
] as const;

export const DLX_INSTRUCTIONS_J = [
  'J', 'JAL', 'RFE', 'TRAP'
] as const;

export const DLX_INSTRUCTIONS = [
  ...DLX_INSTRUCTIONS_R,
  ...DLX_INSTRUCTIONS_I,
  ...DLX_INSTRUCTIONS_IJ,
  ...DLX_INSTRUCTIONS_J
] as const;

export type DLXInstruction = typeof DLX_INSTRUCTIONS[number];
