import {Registers, SpecialRegisterDescriptor} from './registers';

export class DLXRegisters extends Registers {
  constructor() {
    const specialRegisters: SpecialRegisterDescriptor[] = [
      {
        key: 'ien',
        label: 'IEN',
        tooltip: 'Interrupt Enabled',
        value: 0,
        isVisible: true,
      },
      {
        key: 'iar',
        label: 'IAR',
        tooltip: 'Instruction Address Register',
        value: 0,
        isVisible: true
      },
      {
        key: 'ir',
        label: 'IR',
        tooltip: 'Instruction Register',
        value: 0,
        isVisible: true
      },
      {
        key: 'mar',
        label: 'MAR',
        tooltip: 'Memory Address Register',
        value: 0,
        isVisible: true
      },
      {
        key: 'mdr',
        label: 'MDR',
        tooltip: 'Memory Data Register',
        value: 0,
        isVisible: true
      },
      {
        key: 'temp',
        label: 'TEMP',
        tooltip: 'Temporary Register',
        value: 0,
        isVisible: false
      },
      {
        key: 'a',
        label: 'A',
        tooltip: 'Register A',
        value: 0,
        isVisible: false
      },
      {
        key: 'b',
        label: 'B',
        tooltip: 'Register B',
        value: 0,
        isVisible: false
      },
      {
        key: 'c',
        label: 'C',
        tooltip: 'Register C',
        value: 0,
        isVisible: false
      }
    ];

    super(specialRegisters);

    this.registersValue[0] = 0;
    for (let i = 0; i < DLXRegisters.registersCount; i++) {
      if (i === 0) {
        this.registersValue[i] = 0;
      } else {
        this.registersValue[i] = Math.floor(Math.random() * 0x100000000);
      }
    }
  }
}
