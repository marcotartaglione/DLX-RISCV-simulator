import { DLXRegisters } from 'src/app/registers/dlx.registers';

function overflowCheck(n: number, negative: boolean = false) {
    if (negative) {
        if (n < -0x7FFFFFFF) {
            throw new Error('overflow');
        }
    } else {
        if (n > 0x7FFFFFFF) {
            throw new Error('overflow');
        }
    }
    return n;
}

export function signExtend(n: number, dim: (8|16|26) = 16) {
    let bin = (n >>> 0).toString(2).padStart(dim, '0');
    return parseInt(bin.padStart(32, bin.charAt(0)), 2);
}

// uintToInt(n: number,  dim: (8|16|26) = 16, nbit: number)
//
// Metodo che effettua la conversione del segno restituendo un numero decimale postivo o negativo. 
// è necessario dato che parseInt(10) non mi permette di specificare se il  valore lo voglio convertire 
// come signed o unsigned, ma mi convertirà sempre la stringa interpretandola come unsigned. Quindi tutti
// i numeri restituiti saranno positivi e nel caso di numeri con segno verrebbe restituito un valore decimale errato.
//
// Parametri:
// - n : numero in decimale che voglio convertire
// - dim : dimensione in bit del numero che voglio convertire (specifico se si tratta di un byte, una halfword o una word)
// - nbit : dimensione in bit del valore trasformato con segno che voglio ottenere (solitamente è 32)
//
// Esempio:
// 4 decimale trasformato in binario diventerà 100. Se lo volessi estendere con segno a 8 bit otterrò il numero
// binario 11111100. Facendo la parseInt(10) di ques'ultimo numero binario otterrei 251 cioè il numero binario 
// interpretato come unsigned. Invocando invece uintToInt() si otterrà invece -4
// Effettua al suo interno già la conversione del segno

export function uintToInt(n: number,  dim: (8|16|26) = 16, nbit: number) {

    // Per prima cosa effettuo l'estensione del segno
    
    let uint=signExtend(n,dim)

    if (nbit > 32) throw new Error('uintToInt only supports ints up to 32 bits');
    let bin = uint.toString(2);
    
    // se il numero non è della lunghezza di nbit significa che prima aveva degli zeri che toString nel convertire
    // da per scontato e non visualizza. Riempo la stringa di zeri cosicchè il controllo successivo non dia risultati
    // sbagliati.
    if(bin.length != nbit) {   
        bin = bin.padStart(nbit, '0');
    }
    // se il numero è signed converto nel numero decimale corrispondente. 
    
    if(bin.charAt(0) === "1" ) {
        uint = uint - Math.pow(2,nbit-1)*2
    }
    return uint ;
}


const mask = {
    byte: [
        0x000000FF, 0x0000FF00, 0x00FF0000, 0xFF000000
    ],
    halfword: [
        0x0000FFFF, undefined, 0xFFFF0000, undefined
    ]
}

function load(n: number, offset: number, dim: ('byte'|'halfword')) {
    if (n == 0) return 0;
    if (dim === 'halfword' && offset % 2 != 0) throw new Error('fault');
    return (n & mask[dim][offset % 4]) >>> (offset % 4)*8 ;
}

function store(n: number, dest: number, offset: number, dim: ('byte'|'halfword')) {
    if (n == 0) return 0;
    if (dim === 'halfword' && offset % 2 != 0) throw new Error('fault');
    let m = mask[dim];
    return ((n & m[0]) << ((offset % 4)*8)) | (dest & ~m[offset % 4]);
}

export type InstructionType = 'R'|'RM'|'I'|'IB'|'IJ'|'IL'|'IS'|'J'|'LHI'|'NOP'|'RFE';
export type Instruction = 'ADD'|'ADDI'|'ADDU'|'ADDUI'|'AND'|'ANDI'|'BEQZ'|'BNEZ'|'J'|'JAL'|'JALR'|'JR'|'LB'|'LBU'|'LH'|'LHI'|'LHU'|'LW'|'MOVI2S'|'MOVS2I'|'NOP'|'OR'|'ORI'|'RFE'|'SB'|'SEQ'|'SEQI'|'SGE'|'SGEI'|'SGT'|'SGTI'|'SH'|'SLE'|'SLEI'|'SLL'|'SLLI'|'SLT'|'SLTI'|'SNE'|'SNEI'|'SRA'|'SRAI'|'SRL'|'SRLI'|'SUB'|'SUBI'|'SUBU'|'SUBUI'|'SW'|'TRAP'|'XOR'|'XORI';
export const specialRegisters: string[] = ['IAR'];

export const instructions: {
        [key in Instruction]: {
            type: InstructionType, 
            func: (registers: DLXRegisters, args?: number[]) => number,
            unsigned?: boolean
        }
    } = {

    ADD:    { type: 'R',   func: (registers) => overflowCheck(instructions['ADDUI'].func(registers)) },
    ADDI:   { type: 'I',   func: (registers) => overflowCheck(instructions['ADDUI'].func(registers)) },
    ADDU:   { type: 'R',   func: (registers) => registers.c = registers.a + registers.temp },
    ADDUI:  { type: 'I',   func: (registers) => registers.c = registers.a + registers.temp, unsigned: true },
    AND:    { type: 'R',   func: (registers) => registers.c = registers.a & registers.temp },
    ANDI:   { type: 'I',   func: (registers) => registers.c = registers.a & registers.temp, unsigned: true },
    BEQZ:   { type: 'IB',  func: (registers) => registers.a === 0 ? registers.pc = registers.temp : 0 },
    BNEZ:   { type: 'IB',  func: (registers) => registers.a !== 0 ? registers.pc = registers.temp : 0 },
    J:      { type: 'J',   func: (registers) => registers.pc = registers.temp },
    JAL:    { type: 'J',   func: (registers) => { registers.r[31] = registers.c = registers.pc + 4; return registers.pc = registers.temp; } },
    JALR:   { type: 'IJ',  func: (registers) => { registers.r[31] = registers.c = registers.pc + 4; return registers.pc = registers.a; } },
    JR:     { type: 'IJ',  func: (registers) => registers.pc = registers.a },
    LB:     { type: 'IL',  func: (registers) => registers.c = signExtend(load(registers.mdr, registers.temp, 'byte'), 8) },
    LBU:    { type: 'IL',  func: (registers) => registers.c = load(registers.mdr, registers.temp, 'byte') },
    LH:     { type: 'IL',  func: (registers) => registers.c = signExtend(load(registers.mdr, registers.temp, 'halfword')) },
    LHI:    { type: 'LHI', func: (registers) => registers.c = registers.temp << 16 },
    LHU:    { type: 'IL',  func: (registers) => registers.c = load(registers.mdr, registers.temp, 'halfword') },
    LW:     { type: 'IL',  func: (registers) => registers.c = registers.mdr },
    MOVI2S: { type: 'RM',  func: (registers, [rd, rs1]) => registers[specialRegisters[rd-1].toLowerCase()] = registers.a = registers.r[rs1] },
    MOVS2I: { type: 'RM',  func: (registers, [rd, rs1]) => rd ? registers.r[rd] = registers.c = registers[specialRegisters[rs1-1].toLowerCase()] : 0 },
    NOP:    { type: 'NOP', func: () => null },
    OR:     { type: 'R',   func: (registers) => registers.c = registers.a | registers.temp },
    ORI:    { type: 'I',   func: (registers) => registers.c = registers.a | registers.temp, unsigned: true },
    RFE:    { type: 'RFE', func: (registers) => registers.pc = registers.iar },
    SB:     { type: 'IS',  func: (registers, [stored]) => store(registers.mdr, stored, registers.temp, 'byte') },
    SEQ:    { type: 'R',   func: (registers) => registers.c = registers.a == registers.temp ? 1 : 0 },
    SEQI:   { type: 'I',   func: (registers) => registers.c = registers.a == registers.temp ? 1 : 0 },
    SGE:    { type: 'R',   func: (registers) => registers.c = registers.a >= registers.temp ? 1 : 0 },
    SGEI:   { type: 'I',   func: (registers) => registers.c = registers.a >= registers.temp ? 1 : 0 },
    SGT:    { type: 'R',   func: (registers) => registers.c = registers.a > registers.temp ? 1 : 0 },
    SGTI:   { type: 'I',   func: (registers) => registers.c = registers.a > registers.temp ? 1 : 0 },
    SH:     { type: 'IS',  func: (registers, [stored]) => store(registers.mdr, stored, registers.temp, 'halfword') },
    SLE:    { type: 'R',   func: (registers) => registers.c = registers.a <= registers.temp ? 1 : 0 },
    SLEI:   { type: 'I',   func: (registers) => registers.c = registers.a <= registers.temp ? 1 : 0 },
    SLL:    { type: 'R',   func: (registers) => registers.c = registers.a << (registers.temp & 0x1F) },
    SLLI:   { type: 'I',   func: (registers) => registers.c = registers.a << (registers.temp & 0x1F) },
    SLT:    { type: 'R',   func: (registers) => registers.c = registers.a < registers.temp ? 1 : 0 },
    SLTI:   { type: 'I',   func: (registers) => registers.c = registers.a < registers.temp ? 1 : 0 },
    SNE:    { type: 'R',   func: (registers) => registers.c = registers.a != registers.temp ? 1 : 0 },
    SNEI:   { type: 'I',   func: (registers) => registers.c = registers.a != registers.temp ? 1 : 0 },
    SRA:    { type: 'R',   func: (registers) => registers.c = registers.a >> (registers.temp & 0x1F) },
    SRAI:   { type: 'I',   func: (registers) => registers.c = registers.a >> (registers.temp & 0x1F) },
    SRL:    { type: 'R',   func: (registers) => registers.c = registers.a >>> (registers.temp & 0x1F) },
    SRLI:   { type: 'I',   func: (registers) => registers.c = registers.a >>> (registers.temp & 0x1F) },
    SUB:    { type: 'R',   func: (registers) => overflowCheck(instructions['SUBUI'].func(registers), true) },
    SUBI:   { type: 'I',   func: (registers) => overflowCheck(instructions['SUBUI'].func(registers), true) },
    SUBU:   { type: 'R',   func: (registers) => registers.c = registers.a - registers.temp },
    SUBUI:  { type: 'I',   func: (registers) => registers.c = registers.a - registers.temp, unsigned: true },
    SW:     { type: 'IS',  func: (registers) => registers.mdr },
    TRAP:   { type: 'J',   func: (registers) => { registers.iar = registers.pc + 4; return registers.pc = registers.temp; }, unsigned: true },
    XOR:    { type: 'R',   func: (registers) => registers.c = registers.a ^ registers.temp },
    XORI:   { type: 'I',   func: (registers) => registers.c = registers.a ^ registers.temp, unsigned: true },
};
