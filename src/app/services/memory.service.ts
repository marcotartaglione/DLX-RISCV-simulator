import {Injectable, Injector} from '@angular/core';
import {Device} from '../memory/model/device';
import {Eprom} from '../memory/model/eprom';
import {LedLogicalNetwork} from '../memory/model/logicalNetworks/led.logical-network';
import {Counter} from '../memory/model/counter';
import {Memory} from '../memory/model/memory';
import {StartLogicalNetwork} from '../memory/model/logicalNetworks/start.logical-network';
import {InputPort} from '../memory/model/input-port';
import {Ram} from '../memory/model/ram';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {

  memory: Memory;
  injector: Injector;

  constructor(injector: Injector) {
    this.injector = injector;
    this.setMemory();
  }

  public setMemory() {
    const tmp = window.localStorage.getItem('memory');
    console.log(tmp);
    if (tmp) {
      this.memory = new Memory(tmp);
    } else {
      this.memory = new Memory();
      this.memory.add(new Eprom(0x00000000, 0x07FFFFFF));
      this.memory.add(new Ram(0x10000000, 0x1FFFFFFF));
      this.memory.add(new StartLogicalNetwork(0x30000000, 0x30000003));
      this.memory.add(new LedLogicalNetwork(0x24000000, 0x24000003));
      this.memory.add(new Counter(0x29000000, 0x29000005));
      this.memory.add(new Ram(0x38000000, 0x3FFFFFFF));
      this.memory.add(new InputPort(0x0C000000, 0x0C000003));
    }
  }

  public add(name: Device): void {
    this.memory.add(name);
  }

  public remove(dev: Device): void {
    this.memory.remove(dev);
  }

  public clearMemory = () => {
    window.localStorage.removeItem('memory');
  }

  save() {
    window.localStorage.setItem('memory', JSON.stringify(this.memory.devices.map(dev => {
      return {proto: dev.constructor.name, name: dev.name, min_address: dev.minAddress, max_address: dev.maxAddress};
    })));
  }

  getEprom(): Eprom {
    return this.memory.get('EPROM') as Eprom;
  }

  getCounter(): Counter {
    console.log('name ' + this.memory.get('COUNTER').name);
    return this.memory.get('COUNTER') as Counter;
  }
}
