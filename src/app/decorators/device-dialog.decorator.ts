import {Type} from '@angular/core';
import {Device} from '../memory/model/device';

/**
 * Registry that maps Device classes to their corresponding dialog components
 */
export class DeviceDialogRegistry {
  private static readonly registry = new Map<Type<Device>, () => Type<any>>();

  /*
  By using a lambda () => Component, we delay the evaluation of the
  Dialog class until it is actually needed, ensuring it is fully
  initialized and not "undefined"
   */

  /**
   * Register a device class with its dialog component
   */
  static registerDialog(deviceClass: Type<Device>, dialogResolver: () => Type<any>): void {
    this.registry.set(deviceClass, dialogResolver);
  }

  /**
   * Get the dialog component for a device instance
   * @param device The device instance to get the dialog for
   * @returns The dialog component class, or null if not registered
   */
  static getDialogComponent(device: Device): Type<any> | null {
    const resolver = this.registry.get(device.constructor as Type<Device>);
    return resolver ? resolver() : null;
  }

  /**
   * Get all registered dialogs
   */
  static getAllRegistrations(): Map<Type<Device>, () => Type<any>> {
    return new Map(this.registry);
  }
}

/**
 * Decorator to associate a Device class with its dialog component
 * @param dialogComponentResolver The dialog component resolver to associate class with this device
 */
export function DeviceDialog(dialogComponentResolver: () => Type<any>) {
  return function <T extends { new(...args: any[]): Device }>(constructor: T) {
    DeviceDialogRegistry.registerDialog(constructor as Type<Device>, dialogComponentResolver);
    return constructor;
  };
}


