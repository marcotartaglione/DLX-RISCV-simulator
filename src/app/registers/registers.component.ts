import {Component, Input} from '@angular/core';
import {DLXRegisters} from './dlx.registers';
import {Registers} from './registers';
import {RV32IRegisters} from './rv32i.registers';
import {FormatPipe} from '../pipes/format.pipe';
import {NgStyle} from '@angular/common';
import {MatFormField} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatLabel} from '@angular/material/form-field';

@Component({
  selector: 'app-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.sass'],
  standalone: true,
  imports: [
    NgStyle,
    FormatPipe,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel
  ]
})
export class RegistersComponent {

  @Input() registers: Registers;

  fType: 'dec' | 'bin' | 'hex' = 'hex';

  get dlxRegisters(): DLXRegisters {
    return this.registers as DLXRegisters;
  }

  get rv32iRegisters(): RV32IRegisters {
    return this.registers as RV32IRegisters;
  }

  get isDLX(): boolean {
    return this.registers.constructor.name === DLXRegisters.name;
  }

  get isRV32I(): boolean {
    return this.registers.constructor.name === RV32IRegisters.name;
  }

  constructor() {
  }

}
