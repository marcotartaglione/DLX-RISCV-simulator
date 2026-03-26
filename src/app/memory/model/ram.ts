import {Device} from './device';

export class Ram extends Device {
  constructor(minAddress: number, maxAddress: number) {
    super('RAM', minAddress, maxAddress);
  }
}
