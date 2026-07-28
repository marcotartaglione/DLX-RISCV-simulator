import {signal} from '@angular/core';
import {RegisterChange} from './trackRegisters';

export const registerChangeLog = signal<RegisterChange[]>([]);

export function logRegisterChange(change: RegisterChange) {
  registerChangeLog.update(changes => [...changes, change]);
}

export function clearRegistersChangeLog() {
  registerChangeLog.set([]);
}
