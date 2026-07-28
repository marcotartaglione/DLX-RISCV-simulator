import {Registers, SpecialRegisterDescriptor} from './registers';

export class RV32IRegisters extends Registers {
  constructor() {
    const specialRegisters: SpecialRegisterDescriptor[] = [
      {
        key: 'in',
        label: 'IN',
        tooltip: "Instruction",
        value: 0,
        isVisible: false,
      },
      {
        key: 'oc',
        label: 'OC',
        tooltip: "Opcode",
        value: 0,
        isVisible: true,
      },
      {
        key: 'dr',
        label: 'DR',
        tooltip: "Destination Register",
        value: 0,
        isVisible: true
      },
      {
        key: 'rs1',
        label: 'RS1',
        tooltip: "Source Register 1",
        value: 0,
        isVisible: true
      },
      {
        key: 'rs2',
        label: 'RS2',
        tooltip: "Source Register 2",
        value: 0,
        isVisible: true
      },
      {
        key: 'f3',
        label: 'F3',
        tooltip: "Function 3",
        value: 0,
        isVisible: true
      },
      {
        key: 'f7',
        label: 'F7',
        tooltip: "Function 7",
        value: 0,
        isVisible: true
      },
      {
        key: 'i',
        label: 'I',
        tooltip: "Immediate",
        value: 0,
        isVisible: true
      },
      {
        key: 'jo',
        label: 'JO',
        tooltip: "Jump Offset",
        value: 0,
        isVisible: true
      },
    ];

    super(specialRegisters);

    this.registersValue[0] = 0;
    for (let i = 0; i < RV32IRegisters.registersCount; i++) {
      if (i === 0) {
        this.registersValue[i] = 0;
      } else {
        this.registersValue[i] = Math.floor(Math.random() * 0x100000000);
      }
    }
  }
}
