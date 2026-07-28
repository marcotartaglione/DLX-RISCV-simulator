import {Registers, SpecialRegisterDescriptor} from './registers';

export interface RegisterChange {
  path: string;
  oldValue: number;
  newValue: number;
}

export function trackRegisters<T extends Registers>(
  registers: T,
  onChange: (change: RegisterChange) => void
): T {
  function wrapRegistersArray(arr: number[]): number[] {
    return new Proxy(arr, {
      set(target, prop, value, receiver) {
        if (typeof prop === 'string' && /^\d+$/.test(prop)) {
          const index = Number(prop);
          const oldValue = target[index];
          const result = Reflect.set(target, prop, value, receiver);

          if (typeof value === 'number' && oldValue !== value) {
            onChange({path: `registersValue[${index}]`, oldValue, newValue: value});
          }
          return result;
        }
        return Reflect.set(target, prop, value, receiver);
      }
    });
  }

  function wrapDescriptor(descriptor: SpecialRegisterDescriptor, key: string): SpecialRegisterDescriptor {
    return new Proxy(descriptor, {
      set(target, prop, value, receiver) {
        if (prop === 'value') {
          const oldValue = target.value;
          const result = Reflect.set(target, prop, value, receiver);

          if (typeof value === 'number' && oldValue !== value) {
            onChange({path: `specialRegisters[${key}]`, oldValue, newValue: value});
          }
          return result;
        }
        return Reflect.set(target, prop, value, receiver);
      }
    });
  }

  registers.registersValue = wrapRegistersArray(registers.registersValue);

  for (const key of Object.keys(registers.specialRegisters)) {
    if (registers.specialRegisters[key] && typeof registers.specialRegisters[key] === 'object') {
      registers.specialRegisters[key] = wrapDescriptor(registers.specialRegisters[key], key);
    }
  }

  return registers;
}
