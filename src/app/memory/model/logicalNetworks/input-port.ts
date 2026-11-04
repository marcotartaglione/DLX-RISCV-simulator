import {LogicalNetwork} from '../logical-network';
import {DeviceModel} from '../device-registry';
import {ChipSelect} from '../ChipSelect';
import {DeviceDialog} from '../../../decorators/device-dialog.decorator';
import {InputPortDialogComponent} from '../../../dialogs/input-port-dialog.component';
import {Device} from '../device';

export const InputPortSizesArray = [8, 16, 32] as const;
type InputPortSize = typeof InputPortSizesArray[number];

@DeviceDialog(() => InputPortDialogComponent)
@DeviceModel()
export class InputPort extends LogicalNetwork {
  public static proto = 'InputPort';

  constructor(
    minAddress: number,
    maxAddress: number,
    private _data: number | undefined = 0,
    private _dataSize: InputPortSize = 8,
    private _interrupt = false,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
    clkType: 'MEMWR*' | 'MEMRD*' = 'MEMRD*',
  ) {
    super('INPUT_PORT', minAddress, maxAddress, asyncSetSignal, asyncResetSignal, clkType);

    if (_data === undefined) {
      this._data = Math.floor(Math.random() * (2 ** _dataSize));
    }

    this.setChipSelect(ChipSelect.of('CS_INPUT_PORT', this.minAddress), 0);
    this.setChipSelect(ChipSelect.of('CS_READ_INT_INPUT_PORT', this.minAddress + 0x00000001), 1);
  }

  public get svgDiagram(): string {
    const n = this._dataSize;                 // 8 | 16 | 32
    const hi = n - 1;                         // 7 | 15 | 31
    const clkShort = 'MEMRD';
    const resetLabel = this.asyncSetSignal;   // 'RESET' di default

    // Barretta diagonale sul bus con il numero di bit
    const slash = (x: number, y: number, label: string | number) => `
      <line class="wire" x1="${x - 6}" y1="${y + 9}" x2="${x + 6}" y2="${y - 9}"/>
      <text class="small" x="${x - 10}" y="${y + 22}">${label}</text>`;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 590" width="100%" height="100%">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#777"/>
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066cc"/>
          </marker>
          <!-- Frecce dei bus (stroke 4px, quindi marker più piccolo) -->
          <marker id="arrowBus" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#777"/>
          </marker>
          <marker id="arrowBusBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066cc"/>
          </marker>
        </defs>
        <style>
          text { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; fill: #777; }
          .small { font-size: 11px; }
          .title { font-size: 24px; }
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

        <!-- ===================== INPUT PORT ===================== -->
        <rect x="300" y="40" width="320" height="300" fill="#ffcc66" stroke="#777" stroke-width="1.5"/>
        <text class="mid title" x="460" y="170">INPUT</text>
        <text class="mid title" x="460" y="198">PORT</text>

        <!-- CS -->
        <text class="end" x="270" y="82">CS_INPUT_PORT</text>
        <line class="wire" x1="276" y1="76" x2="300" y2="76" marker-end="url(#arrow)"/>
        <text x="310" y="82">CS</text>

        <!-- RD -->
        <text class="end green" x="270" y="122">${clkShort}</text>
        <line class="wire" x1="276" y1="116" x2="300" y2="116" marker-end="url(#arrow)"/>
        <text x="310" y="122">RD</text>

        <!-- RESET -->
        <text class="end" x="610" y="82">RESET</text>
        <line class="wire" x1="700" y1="76" x2="620" y2="76" marker-end="url(#arrow)"/>
        <text x="710" y="82">${resetLabel}</text>

        <!-- STB -->
        <text class="end" x="610" y="166">STB</text>
        <line class="wire" x1="720" y1="160" x2="620" y2="160" marker-end="url(#arrow)"/>
        <text class="mid" x="670" y="150">STB</text>

        <!-- IBF -->
        <text class="end" x="610" y="212">IBF</text>
        <line class="wire" x1="620" y1="206" x2="720" y2="206" marker-end="url(#arrow)"/>
        <text class="mid" x="670" y="196">IBF</text>

        <!-- INT_INPUT -->
        <text x="310" y="256">INT_INPUT</text>
        <line class="wire" x1="300" y1="250" x2="276" y2="250" marker-end="url(#arrow)"/>
        <text class="end" x="270" y="256">INT_INPUT_PORT</text>

        <!-- D[n-1..0] -> BD[n-1..0] -->
        <text class="blue" x="310" y="318">D[${hi}..0]</text>
        <line class="bus-blue" x1="300" y1="312" x2="152" y2="312" marker-end="url(#arrowBusBlue)"/>
        ${slash(226, 312, n)}
        <text class="end blue" x="140" y="318">BD[${hi}..0]</text>

        <!-- DATA_IN[n-1..0] -->
        <text class="end blue" x="610" y="318">DATA_IN[${hi}..0]</text>
        <line class="bus-blue" x1="720" y1="312" x2="622" y2="312" marker-end="url(#arrowBusBlue)"/>
        ${slash(672, 312, n)}

        <!-- ===================== EXT PORT ===================== -->
        <rect x="720" y="130" width="180" height="210" fill="#cc99ff" stroke="#777" stroke-width="1.5"/>
        <text x="730" y="166">STB</text>
        <text x="730" y="212">IBF</text>
        <text class="mid title" x="810" y="250">EXT</text>
        <text class="mid title" x="810" y="278">PORT</text>
        <text class="blue" x="730" y="318">D[${hi}..0]</text>

        <!-- ===================== BUFFER: BD[n-1..1] ===================== -->
        <text class="mid" x="460" y="382">CS_READ_INT_INPUT_PORT·<tspan class="green">${clkShort}</tspan></text>
        <line class="wire" x1="458" y1="390" x2="458" y2="430" marker-end="url(#arrow)"/>
        <polygon class="shape" points="479,420 437,440 479,460"/>

        <line class="bus-blue" x1="437" y1="440" x2="282" y2="440" marker-end="url(#arrowBusBlue)"/>
        ${slash(360, 440, hi)}
        <text class="end blue" x="270" y="446">BD[${hi}..1]</text>

        <line class="bus" x1="645" y1="440" x2="481" y2="440" marker-end="url(#arrowBus)"/>
        ${slash(565, 440, hi)}
        <text x="655" y="446">(0)<tspan dy="-9" style="font-size:13px">${hi}</tspan></text>

        <!-- ===================== BUFFER: BD[0] ===================== -->
        <text class="mid" x="460" y="505">CS_READ_INT_INPUT_PORT·<tspan class="green">${clkShort}</tspan></text>
        <line class="wire" x1="458" y1="513" x2="458" y2="545" marker-end="url(#arrow)"/>
        <polygon class="shape" points="479,535 437,555 479,575"/>

        <line class="wire-blue" x1="437" y1="555" x2="282" y2="555" marker-end="url(#arrowBlue)"/>
        ${slash(360, 555, 1)}
        <text class="end blue" x="270" y="561">BD[0]</text>

        <line class="wire" x1="645" y1="555" x2="481" y2="555" marker-end="url(#arrow)"/>
        ${slash(565, 555, 1)}
        <text x="655" y="561">INT_INPUT_PORT</text>
      </svg>
    `;
  }

  public get imagePath(): string {
    const svgEncoded = encodeURIComponent(this.svgDiagram);
    return `data:image/svg+xml;utf8,${svgEncoded}`;
  }

  public get data(): number {
    return this._data;
  }

  public set data(value: number) {
    this._data = value;
  }

  public get dataSize(): InputPortSize {
    return this._dataSize;
  }

  public set dataSize(value: InputPortSize) {
    this._dataSize = value;
  }

  public static fromJSON(json: any) {
    const inputPort = new InputPort(json.minAddress, json.maxAddress);
    inputPort.hydrate(json);
    return inputPort;
  }

  public updateFrom(other: Device) {
    if (!(other instanceof InputPort)) {
      throw new Error('Cannot update InputPort from a different type of device');
    }

    super.updateFrom(other);
    this._data = other._data;
    this._dataSize = other._dataSize;
    this._interrupt = other._interrupt;
  }

  public interrupt() {
    this._interrupt = true;
  }

  public load(address: number): number {
    const chipSelect = this.chipSelects.find((el) => el.address === address);

    if (!chipSelect) {
      return super.load(address);
    }

    switch (chipSelect.id) {
      case 'CS_READ_INT_INPUT_PORT':
        return this.positionValue(this._interrupt ? 1 : 0, address);

      case 'CS_INPUT_PORT':
        if (this.clockType === 'MEMRD*') {
          this._interrupt = false;
          this.setChipSelect(ChipSelect.of('CS_INPUT_PORT', this.minAddress), this._data);
          return this.positionValue(this._data, address);
        }
    }

    return 0;
  }

  public toJSON(shortVersion: boolean = false): any {
    const json = super.toJSON(shortVersion);

    json.data = this._data;
    json.dataSize = this._dataSize;
    json.interrupt = this._interrupt;

    return json;
  }

  protected positionValue(value: number, address: number): number {
    const offset = address % 4;
    const shift = (3 - offset) * 8;

    if (this._dataSize === 32) {
      return value >>> 0;
    }

    return (value << shift) >>> 0;
  }

  protected hydrate(json) {
    super.hydrate(json);
    this._data = json.data;
    this._dataSize = json.dataSize;
    this._interrupt = json.interrupt;
  }
}
