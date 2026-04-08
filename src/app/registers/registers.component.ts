import {Component, computed, input, Input} from '@angular/core';
import {DLXRegisters} from './dlx.registers';
import {Registers} from './registers';
import {RV32IRegisters} from './rv32i.registers';
import {FormatPipe} from '../pipes/format.pipe';
import {NgStyle} from '@angular/common';
import {MatFormField} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatLabel} from '@angular/material/form-field';
import {FormatByteType} from '../pipes/formatByte.pipe';

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
  protected registers = input.required<Registers>();
  protected fType: FormatByteType = 'hex';

  protected dlxRegisters = computed(() => this.registers() instanceof DLXRegisters ? this.registers() as DLXRegisters : null);
  protected rv32iRegisters = computed(() => this.registers() instanceof RV32IRegisters ? this.registers() as RV32IRegisters : null);

  public isDLX(registers: Registers): boolean {
    return registers instanceof DLXRegisters;
  }

  public isRV32I(registers: Registers): boolean {
    return registers instanceof RV32IRegisters;
  }
}
