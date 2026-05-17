import {LogicalNetwork} from '../logical-network';
import {ChipSelect} from '../ChipSelect';
import {DeviceDialog} from '../../../decorators/device-dialog.decorator';
import {LogicalNetworkDialogComponent} from '../../../dialogs/logical-network-dialog.component';
import {Device} from '../device';
import {StartLogicalNetwork} from './start-logical-network';

@DeviceDialog(() => LogicalNetworkDialogComponent)
export class FFDLogicalNetwork extends LogicalNetwork {
  constructor(
    chipSelectRead: number,
    chipSelectWrite: number,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
  ) {
    super('FF-D', chipSelectRead, chipSelectWrite, asyncSetSignal, asyncResetSignal,
      ('assets/img/counter/network/fcb_ffdr_' + asyncResetSignal + '_ffds_' + asyncSetSignal + '.png').toLowerCase());

    this.setChipSelect(ChipSelect.of('cs_read_ff', this.minAddress), 1);
    this.setChipSelect(ChipSelect.of('cs_set_ff', this.minAddress + 0x00000001), 1);
    this.setChipSelect(ChipSelect.of('cs_reset', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('cs_set', this.minAddress + 0x00000003), 0);
  }

  public static fromJSON(json: any) {
    const ffdLogicalNetwork = new FFDLogicalNetwork(json.minAddress, json.maxAddress);
    ffdLogicalNetwork.hydrate(json);
    return ffdLogicalNetwork;
  }

  public updateFrom(other: Device) {
    if (!(other instanceof FFDLogicalNetwork)) {
      throw new Error('Cannot update FFDLogicalNetwork from a different type of device');
    }

    super.updateFrom(other);
  }

  protected hydrate(json) {
    super.hydrate(json);
  }

  public load(address: number): number {
    const cs = this.chipSelects.find(el => el.address === address);

    if (cs == null) {
      return super.load(address);
    }

    switch (cs.id) {
      case 'cs_read_ff':
        return this.positionValue(this.ffd ? 1 : 0, address);
      default:
        return 0;
    }
  }

  public store(address: number, word: number): void {
    const cs = this.chipSelects.find(el => el.address === address);

    if (cs == null) {
      return super.store(address, word);
    }

    const commandByte = this.extractByte(word, address);

    switch (cs.id) {
      case 'cs_set_ff':
        this._ffd = (commandByte !== 0);
        break;
    }
  }

  public toJSON(): any {
    const json = super.toJSON();
    return json;
  }
}
