import {Injectable} from '@angular/core';
import {LogicalNetwork} from './logical-network';
import {ChipSelect} from './ChipSelect';

export class Counter extends LogicalNetwork {

  constructor(
    minAddress: number,
    maxAddress: number,
    public countingBasis = 32,
    public loadValue = 0,
    public upCounting = true,
    asyncSetSignal = 'RESET',
    asyncResetSignal = '0',
    clockType: 'MEMWR*' | 'MEMRD*' = 'MEMWR*',
  ) {
    super('COUNTER', minAddress, maxAddress, asyncSetSignal, asyncResetSignal,
      `assets/img/counter/count/count_${clockType === 'MEMWR*' ? 'memwr' : 'memrd'}_${asyncResetSignal}.png`.toLowerCase(),
      clockType);

    // effettuando lettura a questo cs si ottiene currente value del counter
    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
    this.setChipSelect(ChipSelect.of('CS_A_RES_COUNTER', this.minAddress + 0x00000001), 0);
    this.setChipSelect(ChipSelect.of('CS_RES_COUNTER', this.minAddress + 0x00000002), 0);
    this.setChipSelect(ChipSelect.of('CS_ENABLE_COUNTER', this.minAddress + 0x00000003), 1);
    this.setChipSelect(ChipSelect.of('CS_UP_DOWN_COUNTER', this.minAddress + 0x00000004), 1);
    this.setChipSelect(ChipSelect.of('CS_LOAD_VALUE_COUNTER', this.minAddress + 0x00000005), 0);
  }

  // ffd( name, d, a_res, a_set, clk)
  // mux( zero, one, sel)
  // tri( in, en )
  // bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";

  private _currentValue: number;

  public get currentValue(): number {
    return this._currentValue;
  }

  public static fromJSON(json: any) {
    const counter = super.fromJSON(json) as Counter;

    counter.countingBasis = json.counting_basis;
    counter.loadValue = json.load_value;
    counter.upCounting = json.up_counting;

    return counter;
  }

  private updateCurrentValue() {
    this.upCounting ? this.increment() : this.decrement();
    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
  }

  public increment() {
    const max = Math.pow(2, this.countingBasis);
    if (this._currentValue >= max) {
      this._currentValue = 0;
    } else {
      this._currentValue++;
    }
  }

  public decrement() {
    const max = Math.pow(2, this.countingBasis);
    if (this._currentValue <= 0) {
      this._currentValue = max;
    } else {
      this._currentValue--;
    }

  }

  public asyncReset() {
    this._currentValue = 0;
    this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
  }

  public startOperation() {
    if (this.asyncResetSignal.includes('RESET')) {
      this.asyncReset();
    }
  }

  /**
   * If the address corresponds to a chip select, perform the corresponding action based on the chip select ID.
   * Otherwise, perform a standard memory load operation.
   *
   * The logic operates on the assumption of a rising edge for the load operation, meaning that the actions are
   * triggered when a read operation is performed and the clock is at MEMWR*.
   *
   * @return The value read from the specified address, which may be influenced by the chip select logic if the address corresponds to a
   * chip select. If the address does not correspond to any chip select or if the instruction type is "IS", a standard memory load
   * operation is performed and its result is returned.
   *
   * @param address The memory address to store the word at.
   * @param instrType The type of instruction being executed, which may affect the behavior of certain chip selects. For example,
   * if the instruction type is "IS", the method will bypass the custom logic for chip selects and perform a standard memory load operation.
   */
  public load(address: number, instrType?: string): number {
    const cs = this.chipSelects.find(el => el.address === address);
    if (cs == null || instrType === 'IS') {
      return super.load(address);
    } else {
      switch (cs.id) {

        // nel caso della load suppongo di avere un fronte di salita
        // ogni volta che ho un ciclo di bus in lettura :
        // quindi quando viene fatta lettura e il clock vale MEMRD*
        case 'CS_READ_VALUE_COUNTER':
          // se ho un fronte di salita allora aggiorno il valore campionato con il currentValue e
          // aggiorno il cs_read_value_counter
          const readValue = this._currentValue;
          this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);

          // Restitutisco sempre sampleValue. Nel caso ci sia appena stato
          // un fronte di salita verrà restituito il valore
          // aggiornato altrimenti verrà restituito l'ultimo valore campionato.
          return readValue;
        case 'CS_ENABLE_COUNTER':
          if (this.clockType === 'MEMRD*') {
            this.updateCurrentValue();
          }
          return 0;

        // reset sincrono: se ho un fronte di salita resetto il contatore
        // e aggiorno il cs
        case 'CS_RES_COUNTER':
          if (this.clockType === 'MEMRD*') {
            this._currentValue = 0;
          }
          return 0;

        // up/down: se ho un fronte di salita inverto il valore di up/down. Al successivo
        // updateCurrentValue se questo valore sarà uno allora incrementerò altrimenti
        // decrementerò. Aggiorno il valore del cs.

        case 'CS_UP_DOWN_COUNTER':
          if (this.clockType === 'MEMRD*') {
            this.upCounting = this.mux(this.upCounting, !this.upCounting, 1);
            this.setChipSelect(ChipSelect.of('CS_UP_DOWN_COUNTER', this.minAddress + 0x00000004), this.upCounting);
          }
          return this.upCounting ? 1 : 0;

        // loadValue: se ho un fronte di salita carico nel contatore il valore presente sugli ingressi
        // load. Aggiorno il cs.
        case 'CS_LOAD_VALUE_COUNTER' :
          if (this.clockType === 'MEMRD*') {
            this._currentValue = this.loadValue;
            this.setChipSelect( ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
          }
          return 0;

        // a_res: in caso di fronte di salita resetto il contatore in modo asincrono
        case 'CS_A_RES_COUNTER' :
          if (this.asyncResetSignal === 'CS_A_RES_COUNTER') {
            this.asyncReset();
          }
          return 0;
      }
    }

  }

  /**
   * If the address corresponds to a chip select, perform the corresponding action based on the chip select ID.
   * Otherwise, perform a standard memory store operation.
   *
   * The logic operates on the assumption of a rising edge for the store operation, meaning that the actions are
   * triggered when a write operation is performed and the clock is at MEMWR*.
   *
   * @param address The memory address to store the word at.
   * @param word The word to be stored at the specified address.
   */
  public store(address: number, word: number): void {
    const cs = this.chipSelects.find(el => el.address === address);
    if (cs == null) {
      return super.store(address, word);
    } else {

      // nel caso della store suppongo di avere un fronte di salita
      // ogni volta che ho un ciclo di bus in scrittura:
      // quindi quando viene fatta scrittuta e il clock vale MEMWR*

      // VALGONO GLI STESSI DISCORSI PER LA LOAD MA INVERITI: quindi tutto quello
      // che prima accadeva andando a effettuare una lettura al cs con clock a MEMRD*
      // ora nella store succederà andando a effettuare una scrittura al cs e con
      // clock a MEMWR*
      switch (cs.id) {
        case 'CS_ENABLE_COUNTER':
          if (this.clockType === 'MEMWR*') {
            this.updateCurrentValue();
          }
          break;
        case 'CS_A_RES_COUNTER':
          if (this.asyncResetSignal === 'CS_A_RES_COUNTER') {
            this.asyncReset();
          }
          break;
        case 'CS_RES_COUNTER':
          if (this.clockType === 'MEMWR*') {
            this._currentValue = 0;
            this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
          }
          break;
        case 'CS_UP_DOWN_COUNTER':
          if (this.clockType === 'MEMWR*') {
            this.upCounting = this.mux(this.upCounting, !this.upCounting, 1);
            this.setChipSelect(ChipSelect.of('CS_UP_DOWN_COUNTER', this.minAddress + 0x00000004), this.upCounting);
          }
          break;
        case 'CS_LOAD_VALUE_COUNTER':
          if (this.clockType === 'MEMWR*') {
            this._currentValue = this.loadValue;
            this.setChipSelect(ChipSelect.of('CS_READ_VALUE_COUNTER', this.minAddress), this._currentValue);
          }
          break;
      }
    }
  }

  public toJSON(): any {
    const json = super.toJSON();

    json.counting_basis = this.countingBasis;
    json.load_value = this.loadValue;
    json.up_counting = this.upCounting;

    return json;
  }
}
