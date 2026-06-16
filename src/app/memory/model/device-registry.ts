import {Device} from './device';

type DeviceFactoryImpl = (json: any) => Device;
type DeviceConstructor = {
  new(...args: any[]): any;
  fromJSON?: (json: any) => Device;
  proto?: string;
  name: string;
};

const registry = new Map<string, DeviceFactoryImpl>();

export function registerDeviceFactory(name: string, factory: DeviceFactoryImpl) {
  registry.set(name, factory);
}

export function getDeviceFactory(name: string): DeviceFactoryImpl | undefined {
  return registry.get(name);
}

/**
 * Class decorator to automatically register a Device class using its constructor name
 * and its static `fromJSON` factory method.
 */
export function DeviceModel() {
  return function <T extends DeviceConstructor>(constructor: T) {
    const ctor = constructor as DeviceConstructor;
    if (typeof ctor.fromJSON === 'function') {
      const stableProto = ctor.proto ?? ctor.name;
      const factory = (json: any) => ctor.fromJSON(json);

      registerDeviceFactory(stableProto, factory);
      registerDeviceFactory(ctor.name, factory);
      registerDeviceFactory(`_${stableProto}`, factory);
      registerDeviceFactory(`_${ctor.name}`, factory);
    }
    return constructor;
  };
}

