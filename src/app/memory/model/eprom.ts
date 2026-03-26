import {Device} from './device';

export class Eprom extends Device {
  constructor(minAddress: number, maxAddress: number) {
    super('EPROM', minAddress, maxAddress);
  }

  public load(address: number): number {
    return super.load(address);
  }

  public store(address: number, word: number): void {
    super.store(address, word);
  }
}
