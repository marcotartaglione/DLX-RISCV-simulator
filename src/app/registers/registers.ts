export interface SpecialRegisterDescriptor {
  key: string;
  label: string;
  tooltip: string;
  value: number;
  isVisible: boolean;
}

export type SpecialRegistersMap = {
  pc: SpecialRegisterDescriptor;
  [key: string]: SpecialRegisterDescriptor;
}

export abstract class Registers {
  public static readonly registersCount: number = 32;

  public registersValue: number[];
  public specialRegisters: SpecialRegistersMap;

  protected constructor(extraSpecialRegisters?: SpecialRegisterDescriptor[]) {
    this.registersValue = new Array<number>(Registers.registersCount).fill(0);

    const rawSpecialRegisters: SpecialRegistersMap = {
      pc: {
        key: 'pc',
        label: 'PC',
        tooltip: 'Program Counter',
        value: 0,
        isVisible: true,
      },
    };

    if (extraSpecialRegisters) {
      extraSpecialRegisters.forEach((descriptor) => {
        rawSpecialRegisters[descriptor.key] = descriptor;
      });
    }

    this.specialRegisters = new Proxy(rawSpecialRegisters, {
      get: (target, prop: string | symbol) => {
        if (typeof prop === 'string' && prop in target) {
          return target[prop];
        }
        return Reflect.get(target, prop);
      },
      set: (target, prop: string | symbol, value: any) => {
        if (typeof prop === 'string') {
          if (typeof value === 'object' && value !== null && 'key' in value) {
            target[prop] = value;
            return true;
          }

          if (typeof value === 'string' && target[value]) {
            target[prop] = target[value];
            return true;
          }

          if (typeof value === 'number' && target[prop]) {
            target[prop].value = value;
            return true;
          }
        }
        return Reflect.set(target, prop, value);
      }
    });
  }

  public getSpecialRegisters(): SpecialRegisterDescriptor[] {
    return Object.values(this.specialRegisters);
  }
}
