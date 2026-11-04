import {LogicalNetwork} from '../logical-network';
import {DeviceModel} from '../device-registry';
import {ChipSelect} from '../ChipSelect';
import {DeviceDialog} from '../../../decorators/device-dialog.decorator';
import {LogicalNetworkDialogComponent} from '../../../dialogs/logical-network-dialog.component';
import {Device} from '../device';

@DeviceDialog(() => LogicalNetworkDialogComponent)
@DeviceModel()
export class LedLogicalNetwork extends LogicalNetwork {
  public static proto = 'LedLogicalNetwork';

  constructor(
    minAddress: number,
    maxAddress: number,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
    clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
    private _led = false
  ) {
    super('LED', minAddress, maxAddress, asyncSetSignal, asyncResetSignal, clockType);

    this.setChipSelect(ChipSelect.of('CS_READ_LED', this.minAddress), this._led);
    this.setChipSelect(ChipSelect.of('CS_SWITCH_LED', this.minAddress + 0x00000001), 1);
    this.setChipSelect(ChipSelect.of('CS_A_RES_LED', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('CS_A_SET_LED', this.minAddress + 0x00000003), 0);
  }

  public get svgDiagram(): string {
    const clkLabel = this.clockType;
    const clkShort = clkLabel.replace('*', '');
    const setLabel = this.asyncSetSignal;
    const resLabel = this.asyncResetSignal;

    const gap = 130;
    const width = 1080 + gap;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 340" width="100%" height="100%">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#777"/>
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066cc"/>
          </marker>
        </defs>
        <style>
          text { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; fill: #777; }
          .small { font-size: 11px; }
          .blue  { fill: #0066cc; }
          .green { fill: #00a651; }
          .mid   { text-anchor: middle; }
          .end   { text-anchor: end; }
          .wire  { stroke: #777; stroke-width: 1.5; fill: none; }
          .bus   { stroke: #777; stroke-width: 4; fill: none; }
          .wire-blue { stroke: #0066cc; stroke-width: 1.5; fill: none; }
          .bus-blue  { stroke: #0066cc; stroke-width: 4; fill: none; }
          .shape { fill: #fff; stroke: #777; stroke-width: 1.5; }
        </style>

        <!-- ===================== SINISTRA: MUX ===================== -->

        <!-- CS_SWITCH_LED -> select MUX (centrato sulla freccia) -->
        <text class="mid" x="177" y="52">CS_SWITCH_LED</text>
        <line class="wire" x1="177" y1="60" x2="177" y2="87" marker-end="url(#arrow)"/>

        <!-- MUX -->
        <polygon class="shape" points="158,76 196,95 196,152 158,171"/>

        <!-- Ingressi MUX -->
        <text class="end" x="122" y="104">LED*</text>
        <line class="wire" x1="128" y1="98" x2="158" y2="98" marker-end="url(#arrow)"/>
        <text x="163" y="102" class="small">1</text>

        <text class="end" x="122" y="160">LED</text>
        <line class="wire" x1="128" y1="153" x2="158" y2="153" marker-end="url(#arrow)"/>
        <text x="163" y="157" class="small">0</text>

        <!-- MUX -> D (allungato di ${gap}px) -->
        <line class="wire" x1="196" y1="127" x2="${234 + gap}" y2="127" marker-end="url(#arrow)"/>

        <!-- ===================== FFD + DESTRA (traslati di ${gap}px) ===================== -->
        <g transform="translate(${gap}, 0)">

          <!-- FFD -->
          <rect x="235" y="82" width="150" height="183" fill="#ffff00" stroke="#777" stroke-width="1.5"/>
          <text class="mid" x="310" y="188" style="font-size:28px">FFD</text>
          <text x="243" y="133">D</text>
          <text class="mid" x="310" y="106">A_SET</text>
          <text class="mid" x="310" y="254">A_RES</text>
          <text class="end" x="378" y="133">Q</text>
          <text class="end" x="378" y="228">Q*</text>

          <!-- Clock -->
          <path class="wire" d="M 235,215 L 262,231 L 235,247"/>
          <line class="wire" x1="185" y1="231" x2="235" y2="231" marker-end="url(#arrow)"/>
          <text class="end" x="179" y="238">${clkLabel}</text>

          <!-- A_SET (alto) - centrato sulla freccia -->
          <text class="mid" x="310" y="48">${setLabel}</text>
          <line class="wire" x1="310" y1="56" x2="310" y2="82" marker-end="url(#arrow)"/>

          <!-- A_RES (basso) - centrato sulla freccia -->
          <line class="wire" x1="310" y1="296" x2="310" y2="265" marker-end="url(#arrow)"/>
          <text class="mid" x="310" y="318">${resLabel}</text>

          <!-- Uscite FFD -->
          <line class="wire" x1="385" y1="127" x2="420" y2="127" marker-end="url(#arrow)"/>
          <text x="432" y="133">LED</text>
          <line class="wire" x1="385" y1="222" x2="420" y2="222" marker-end="url(#arrow)"/>
          <text x="432" y="228">LED*</text>

          <!-- ===================== DESTRA: BUFFER TRI-STATE ===================== -->

          <!-- Buffer 1: LED -> BD0 -->
          <text class="mid" x="845" y="108">CS_READ_LED·<tspan class="green">${clkShort}</tspan></text>
          <line class="wire" x1="845" y1="117" x2="845" y2="142" marker-end="url(#arrow)"/>
          <polygon class="shape" points="822,142 864,160 822,178"/>
          <text class="end" x="779" y="167">LED</text>
          <line class="wire" x1="785" y1="160" x2="822" y2="160" marker-end="url(#arrow)"/>
          <line class="wire-blue" x1="864" y1="160" x2="896" y2="160" marker-end="url(#arrowBlue)"/>
          <text x="905" y="166" class="blue">BD0</text>

          <!-- Buffer 2: (0)^7 -> BD[7..1] -->
          <polygon class="shape" points="822,197 864,214 822,231"/>
          <text class="end" x="779" y="222">(0)<tspan dy="-9" style="font-size:13px">7</tspan></text>
          <line class="bus" x1="788" y1="214" x2="822" y2="214"/>
          <line class="wire" x1="793" y1="222" x2="803" y2="206"/>
          <text x="790" y="236" class="small">7</text>
          <line class="bus-blue" x1="864" y1="214" x2="898" y2="214" marker-end="url(#arrowBlue)"/>
          <line class="wire" x1="869" y1="222" x2="879" y2="206"/>
          <text x="871" y="236" class="small">7</text>
          <text x="905" y="220" class="blue">BD[7..1]</text>

          <line class="wire" x1="845" y1="262" x2="845" y2="231" marker-end="url(#arrow)"/>
          <text class="mid" x="845" y="280">CS_READ_LED·<tspan class="green">${clkShort}</tspan></text>
        </g>
      </svg>
    `;
  }

  public get imagePath(): string {
    const svgEncoded = encodeURIComponent(this.svgDiagram);
    return `data:image/svg+xml;utf8,${svgEncoded}`;
  }

  public get led(): boolean {
    return this._led;
  }

  public static fromJSON(json: any) {
    const ledLogicalNetwork = new LedLogicalNetwork(json.minAddress, json.maxAddress);
    ledLogicalNetwork.hydrate(json);
    return ledLogicalNetwork;
  }

  public updateFrom(other: Device) {
    if (!(other instanceof LedLogicalNetwork)) {
      throw new Error('Cannot update LedLogicalNetwork from a different type of device');
    }

    super.updateFrom(other);
    this._led = other._led;
  }

  public asyncSet() {
    this._ffd = true;
    this._led = this.ffd;
    this.setChipSelect(ChipSelect.of('CS_READ_LED', this.minAddress), this._led);
  }

  public asyncReset() {
    this._ffd = false;
    this._led = this.ffd;
    this.setChipSelect(ChipSelect.of('CS_READ_LED', this.minAddress), this._led);
  }

  public load(address: number): number {
    const cs = this.chipSelects.find(el => el.address === address);

    if (this.clockType === 'MEMRD*') {
      this.clk();
    }

    if (cs == null) {
      return super.load(address);
    }

    switch (cs.id) {
      case 'CS_READ_LED':
        return this.positionValue(this._led ? 1 : 0, address);
    }
  }

  public store(address: number, word: number): void {
    const cs = this.chipSelects.find(el => el.address === address);
    if (cs == null) {
      return super.store(address, word);
    }

    switch (cs.id) {
      case 'CS_SWITCH_LED':
        this._ffd = this.mux(this.ffd, !this.ffd, 1);
        if ('MEMWR*' === this.clockType) {
          this.clk();
        }
        break;
      case 'CS_A_SET_LED':
        if (this.asyncSetSignal === 'CS_A_SET_LED') {
          this.asyncSet();
        }
        break;
      case 'CS_A_RES_LED':
        if (this.asyncSetSignal === 'CS_A_RES_LED') {
          this.asyncReset();
        }
        break;
    }
  }

  public clk = () => {
    const CS_READ_LED = this.chipSelects.find(el => el.id === 'CS_READ_LED');
    this._led = this.ffd;
    if (CS_READ_LED != null) {
      super.store(CS_READ_LED.address, this._led ? 1 : 0);
    }
  };

  public toJSON(shortVersion: boolean = false): any {
    const json = super.toJSON(shortVersion);
    json.led = this._led;
    return json;
  }

  protected hydrate(json) {
    super.hydrate(json);
    this._led = json.led;
  }
}
