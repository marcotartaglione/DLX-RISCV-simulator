import {LogicalNetwork} from '../logical-network';
import {DeviceModel} from '../device-registry';
import {ChipSelect} from '../ChipSelect';
import {DeviceDialog} from '../../../decorators/device-dialog.decorator';
import {CounterDialogComponent} from '../../../dialogs/counter-dialog.component';
import {Device} from '../device';

@DeviceDialog(() => CounterDialogComponent)
@DeviceModel()
export class Counter extends LogicalNetwork {
  public static proto = 'Counter';

  constructor(
    minAddress: number,
    maxAddress: number,
    private _countingBasis = 32,
    private _loadValue = 0,
    public upCounting = true,
    asyncSetSignal = '0',
    asyncResetSignal = 'RESET',
    clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
    public asyncCounterResetSignal: 'CS_A_RES_COUNTER' | 'RESET' = 'CS_A_RES_COUNTER',
    private _currentValue = 0
  ) {
    super('COUNTER', minAddress, maxAddress, asyncSetSignal, asyncResetSignal, clockType);

    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
    this.setChipSelect(ChipSelect.of('CS_A_RES_COUNTER', this.minAddress + 0x00000001), 0);
    this.setChipSelect(ChipSelect.of('CS_RES_COUNTER', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('CS_ENABLE_COUNTER', this.minAddress + 0x00000003), 1);
    this.setChipSelect(ChipSelect.of('CS_UP_DOWN_COUNTER', this.minAddress + 0x00000004), 1);
    this.setChipSelect(ChipSelect.of('CS_LOAD_VALUE_COUNTER', this.minAddress + 0x00000005), 0);
  }

  public get svgDiagram(): string {
    const clkLabel = this.clockType;
    const setLabel = this.asyncSetSignal;
    const resLabel = this.asyncResetSignal;
    const cntResLabel = this.asyncCounterResetSignal;

    const gap = 130;
    const ffdX = 1120;
    const ffdY = 170;

    const slash = (x: number, y: number) => `
      <line class="wire" x1="${x - 6}" y1="${y + 9}" x2="${x + 6}" y2="${y - 9}"/>
      <text class="small" x="${x - 10}" y="${y + 22}">N</text>`;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1780 700" width="100%" height="100%">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#777"/>
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066cc"/>
          </marker>
          <marker id="arrowBusBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0066cc"/>
          </marker>
        </defs>
        <style>
          text { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; fill: #777; }
          .small { font-size: 11px; }
          .title { font-size: 26px; }
          .white { fill: #fff; }
          .blue  { fill: #0066cc; }
          .green { fill: #00a651; }
          .mid   { text-anchor: middle; }
          .end   { text-anchor: end; }
          .wire  { stroke: #777; stroke-width: 1.5; fill: none; }
          .wire-white { stroke: #fff; stroke-width: 1.5; fill: none; }
          .wire-blue { stroke: #0066cc; stroke-width: 1.5; fill: none; }
          .bus-blue  { stroke: #0066cc; stroke-width: 4; fill: none; }
          .shape { fill: #fff; stroke: #777; stroke-width: 1.5; }
        </style>

        <!-- ===================== SINISTRA: COUNTER ===================== -->
        <rect x="330" y="30" width="520" height="300" fill="#00b0f0" stroke="#777" stroke-width="1.5"/>
        <text class="mid white title" x="600" y="168">COUNTER</text>
        <text class="mid white title" x="600" y="204">N bit</text>

        <!-- Pin interni -->
        <text class="white" x="340" y="70">ENABLE</text>
        <text class="white" x="340" y="112">U/D</text>
        <text class="white" x="340" y="154">LOAD</text>
        <text class="white" x="340" y="196">L[N-1..0]</text>
        <text class="white" x="340" y="238">RES</text>
        <text class="end white" x="840" y="70">OUT[N-1..0]</text>
        <text class="mid white" x="590" y="316">A_RES</text>

        <!-- Segnali in ingresso -->
        <text class="end" x="270" y="70">CS_ENABLE_COUNTER</text>
        <line class="wire" x1="276" y1="64" x2="328" y2="64" marker-end="url(#arrow)"/>

        <text class="end" x="270" y="112">U/D</text>
        <line class="wire" x1="276" y1="106" x2="328" y2="106" marker-end="url(#arrow)"/>

        <text class="end" x="270" y="154">CS_LOAD_COUNTER</text>
        <line class="wire" x1="276" y1="148" x2="328" y2="148" marker-end="url(#arrow)"/>

        <text class="end blue" x="262" y="196">BD[31..31-N+1]</text>
        <line class="bus-blue" x1="272" y1="190" x2="328" y2="190" marker-end="url(#arrowBusBlue)"/>
        ${slash(300, 190)}

        <text class="end" x="270" y="238">CS_RES_COUNTER</text>
        <line class="wire" x1="276" y1="232" x2="328" y2="232" marker-end="url(#arrow)"/>

        <!-- Clock -->
        <path class="wire-white" d="M 330,270 L 358,286 L 330,302"/>
        <text class="end green" x="270" y="292">${clkLabel}</text>
        <line class="wire" x1="276" y1="286" x2="328" y2="286" marker-end="url(#arrow)"/>

        <!-- Uscita OUT -->
        <line class="wire" x1="856" y1="64" x2="900" y2="64" marker-end="url(#arrow)"/>
        ${slash(878, 64)}
        <text x="910" y="70">OUT[N-1..0]</text>

        <!-- A_RES del contatore (dal basso, centrato sulla freccia) -->
        <line class="wire" x1="590" y1="376" x2="590" y2="332" marker-end="url(#arrow)"/>
        <text class="mid" x="590" y="402">${cntResLabel}</text>

        <!-- ===================== SINISTRA: BUFFER DI LETTURA ===================== -->
        <g transform="translate(0, 500)">
          <text class="mid" x="541" y="20">CS_READ_VALUE_COUNTER·<tspan class="green">MEMRD</tspan></text>
          <line class="wire" x1="541" y1="30" x2="541" y2="58" marker-end="url(#arrow)"/>
          <polygon class="shape" points="520,50 520,110 580,80"/>

          <text class="end" x="320" y="86">OUT[N-1..0]</text>
          <line class="wire" x1="330" y1="80" x2="520" y2="80" marker-end="url(#arrow)"/>
          ${slash(420, 80)}

          <line class="bus-blue" x1="580" y1="80" x2="700" y2="80" marker-end="url(#arrowBusBlue)"/>
          ${slash(640, 80)}
          <text class="blue" x="710" y="86">BD[31..31-N+1]</text>
        </g>

        <!-- ===================== DESTRA: MUX + FFD U/D ===================== -->
        <g transform="translate(${ffdX}, ${ffdY})">

          <!-- CS_UP_DOWN_COUNTER -> select MUX -->
          <text class="mid" x="177" y="52">CS_UP_DOWN_COUNTER</text>
          <line class="wire" x1="177" y1="60" x2="177" y2="87" marker-end="url(#arrow)"/>

          <!-- MUX -->
          <polygon class="shape" points="158,76 196,95 196,152 158,171"/>

          <!-- Ingressi MUX -->
          <text class="end blue" x="122" y="104">BD0</text>
          <line class="wire-blue" x1="128" y1="98" x2="158" y2="98" marker-end="url(#arrowBlue)"/>
          <text x="163" y="102" class="small blue">1</text>

          <text class="end" x="122" y="160">U/D*</text>
          <line class="wire" x1="128" y1="153" x2="158" y2="153" marker-end="url(#arrow)"/>
          <text x="163" y="157" class="small">0</text>

          <!-- MUX -> D -->
          <line class="bus-blue" x1="196" y1="127" x2="${234 + gap}" y2="127" marker-end="url(#arrowBusBlue)"/>

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
            <text class="end green" x="179" y="238">${clkLabel}</text>

            <!-- A_SET (alto) -->
            <text class="mid" x="310" y="48">${setLabel}</text>
            <line class="wire" x1="310" y1="56" x2="310" y2="82" marker-end="url(#arrow)"/>

            <!-- A_RES (basso) -->
            <line class="wire" x1="310" y1="296" x2="310" y2="265" marker-end="url(#arrow)"/>
            <text class="mid" x="310" y="318">${resLabel}</text>

            <!-- Uscita Q -->
            <line class="wire" x1="385" y1="127" x2="420" y2="127" marker-end="url(#arrow)"/>
            <text x="432" y="133">U/D*</text>
          </g>
        </g>
      </svg>
    `;
  }

  public get imagePath(): string {
    const svgEncoded = encodeURIComponent(this.svgDiagram);
    return `data:image/svg+xml;utf8,${svgEncoded}`;
  }

  public get currentValue(): number {
    return this._currentValue;
  }

  public set currentValue(value: number) {
    if (value < 0 || value > Math.pow(2, this.countingBasis) - 1) {
      throw new Error(`Current value must be between 0 and ${Math.pow(2, this.countingBasis) - 1}`);
    }

    this._currentValue = value;
  }

  public get loadValue(): number {
    return this._loadValue;
  }

  public set loadValue(value: number) {
    if (value < 0 || value > Math.pow(2, this.countingBasis) - 1) {
      throw new Error(`Current value must be between 0 and ${Math.pow(2, this.countingBasis) - 1}`);
    }

    this._loadValue = value;
  }

  public get countingBasis(): number {
    return this._countingBasis;
  }

  public set countingBasis(value: number) {
    this._countingBasis = Math.max(1, Math.min(32, value));

    const max = Math.pow(2, this._countingBasis) - 1;
    if (this._currentValue > max) {
      this._currentValue = this._currentValue & max;
      this.updateChipSelectValue();
    }
  }

  public static fromJSON(json: any) {
    const counter = new Counter(json.minAddress, json.maxAddress);
    counter.hydrate(json);
    return counter;
  }

  public override updateFrom(other: Device) {
    if (!(other instanceof Counter)) {
      throw new Error('Cannot update Counter from a different type of device');
    }

    super.updateFrom(other);
    this.countingBasis = other.countingBasis;
    this.loadValue = other.loadValue;
    this.upCounting = other.upCounting;
    this.asyncCounterResetSignal = other.asyncCounterResetSignal;
    this._currentValue = other._currentValue;
    this.updateChipSelectValue();
  }

  public increment() {
    const limit = Math.pow(2, this.countingBasis);
    this._currentValue = (this._currentValue + 1) % limit;
  }

  public decrement() {
    const limit = Math.pow(2, this.countingBasis);
    this._currentValue = (this._currentValue - 1 + limit) % limit;
  }

  public asyncReset() {
    this._currentValue = 0;
    this.updateChipSelectValue();
  }

  public startOperation() {
    if (this.asyncResetSignal.includes('RESET')) {
      this.asyncReset();
    }
  }

  public override load(address: number, instrType?: string): number {
    const cs = this.getChipSelect(address);

    if (cs == null || instrType === 'IS') {
      return super.load(address);
    }

    switch (cs.id) {
      case 'CS_READ_VALUE_COUNTER':
        return this._currentValue >>> 0;

      case 'CS_ENABLE_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.updateCurrentValue();
        }
        return 0;

      case 'CS_RES_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.asyncReset();
        }
        return 0;

      case 'CS_UP_DOWN_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.upCounting = !this.upCounting;
          this.setChipSelect(cs, this.upCounting);
        }
        return this.positionValue(this.upCounting ? 1 : 0, address);

      case 'CS_LOAD_VALUE_COUNTER':
        if (this.clockType === 'MEMRD*') {
          this.loadValueAction();
        }
        return 0;

      case 'CS_A_RES_COUNTER':
        if (this.asyncResetSignal === 'CS_A_RES_COUNTER') {
          this.asyncReset();
        }
        return 0;
    }
    return 0;
  }

  public override store(address: number, word: number): void {
    const cs = this.getChipSelect(address);

    if (cs == null) {
      return super.store(address, word);
    }

    const isActive = word !== 0;

    switch (cs.id) {
      case 'CS_ENABLE_COUNTER':
        if (this.clockType === 'MEMWR*' && isActive) {
          this.updateCurrentValue();
        }
        break;
      case 'CS_A_RES_COUNTER':
        if (this.asyncResetSignal === 'CS_A_RES_COUNTER' && isActive) {
          this.asyncReset();
        }
        break;
      case 'CS_RES_COUNTER':
        if (this.clockType === 'MEMWR*' && isActive) {
          this.asyncReset();
        }
        break;
      case 'CS_UP_DOWN_COUNTER':
        if (this.clockType === 'MEMWR*') {
          this.upCounting = isActive;
          this.setChipSelect(cs, this.upCounting);
        }
        break;
      case 'CS_LOAD_VALUE_COUNTER':
        if (this.clockType === 'MEMWR*' && isActive) {
          this.loadValueAction();
        }
        break;
    }
  }

  public override toJSON(shortVersion: boolean = false): any {
    const json = super.toJSON(shortVersion);
    json.countingBasis = this._countingBasis;
    json.loadValue = this.loadValue;
    json.upCounting = this.upCounting;
    json.currentValue = this._currentValue;
    return json;
  }

  protected override hydrate(json: any) {
    super.hydrate(json);
    this._countingBasis = json.countingBasis ?? 32;
    this.loadValue = json.loadValue ?? 0;
    this.upCounting = json.upCounting ?? true;
    this._currentValue = json.currentValue ?? 0;
  }

  private updateCurrentValue() {
    this.upCounting ? this.increment() : this.decrement();
    this.updateChipSelectValue();
  }

  private loadValueAction() {
    const max = Math.pow(2, this.countingBasis) - 1;
    this._currentValue = this.loadValue & max;
    this.updateChipSelectValue();
  }

  private updateChipSelectValue() {
    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
  }
}
