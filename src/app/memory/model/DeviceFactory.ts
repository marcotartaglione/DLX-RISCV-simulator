import {Device} from './device';
import {getDeviceFactory} from './device-registry';

export class DeviceFactory {
  public static create(json: any): Device {
    if (!json || !json.proto) {
      throw new Error('Invalid device json');
    }

    const rawType: string = String(json.proto);
    const type = rawType.startsWith('_') ? rawType.substring(1) : rawType;

    const normalizedType = type.replace(/\d+$/, '');
    const factory = getDeviceFactory(type) ?? getDeviceFactory(normalizedType);

    if (!factory) {
      throw new Error(`Unknown device type: ${rawType}`);
    }

    return factory(json);
  }
}
