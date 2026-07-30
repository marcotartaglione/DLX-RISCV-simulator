import {Device} from './device';
import {DeviceModel} from './device-registry';

@DeviceModel()
export class Ram extends Device {
  public static proto = 'Ram';

  constructor(minAddress: number, maxAddress: number) {
    super('RAM', minAddress, maxAddress);
  }

  public static fromJSON(json: any): Ram {
    const ram = new Ram(json.minAddress, json.maxAddress);
    ram.hydrate(json);
    return ram;
  }

  public updateFrom(other: Device) {
    if (!(other instanceof Ram)) {
      throw new Error('Cannot update Ram from a different type of device');
    }

    super.updateFrom(other);
  }

  public override toJSON(shortVersion: boolean = false): any {
    return super.toJSON(shortVersion);
  }
}
