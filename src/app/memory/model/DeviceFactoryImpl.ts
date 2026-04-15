import {Device} from './device';
import {StartLogicalNetwork} from './logicalNetworks/start.logical-network';
import {FFDLogicalNetwork} from './logicalNetworks/ffd-logical-network';
import {InputPort} from './input-port';
import {Counter} from './counter';
import {LedLogicalNetwork} from './logicalNetworks/led.logical-network';
import {LogicalNetwork} from './logical-network';
import {Eprom} from './eprom';
import {Ram} from './ram';

type DeviceFactoryImpl = (json: any) => Device;

const DEVICE_FACTORIES: Record<string, DeviceFactoryImpl> = {
  '_Ram': (json) => Ram.fromJSON(json),
  '_Eprom': (json) => Eprom.fromJSON(json),
  '_LogicalNetwork': (json) => LogicalNetwork.fromJSON(json),
  '_LedLogicalNetwork': (json) => LedLogicalNetwork.fromJSON(json),
  '_Counter': (json) => Counter.fromJSON(json),
  '_InputPort': (json) => InputPort.fromJSON(json),
  '_FFDLogicalNetwork': (json) => FFDLogicalNetwork.fromJSON(json),
  '_StartLogicalNetwork': (json) => StartLogicalNetwork.fromJSON(json)
};

export class DeviceFactory {
  public static create(json: any): Device {
    const type = json.proto;
    const factory = DEVICE_FACTORIES[type];

    if (!factory) {
      throw new Error(`Unknown device type: ${type}`);
    }

    return factory(json);
  }
}
