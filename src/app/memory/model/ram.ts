import {Device} from './device';

export class Ram extends Device {
  constructor(minAddress: number, maxAddress: number) {
    super('RAM', minAddress, maxAddress);
  }

  public static fromJSON(json: any): Ram {
    const ram = new Ram(json.minAddress, json.maxAddress);
    ram.hydrate(json);
    return ram;
  }

  public override toJSON(): any {
    return super.toJSON();
  }
}
