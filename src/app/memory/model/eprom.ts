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

  public static fromJSON(json: any): Eprom {
    const eprom = new Eprom(json.minAddress, json.maxAddress);
    eprom.hydrate(json);
    return eprom;
  }

  public override toJSON(): any {
    return super.toJSON();
  }
}
