import {Component, computed, effect, input, signal} from '@angular/core';
import {DLXRegisters} from './dlx.registers';
import {Registers} from './registers';
import {RV32IRegisters} from './rv32i.registers';
import {FormatPipe, FormatType} from '../pipes/format.pipe';
import {NgClass, } from '@angular/common';
import {MatFormField} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatLabel} from '@angular/material/form-field';
import {MatTooltip} from '@angular/material/tooltip';
import {registerChangeLog} from './register-change.store';

@Component({
  selector: 'app-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.sass'],
  standalone: true,
  imports: [
    FormatPipe,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    NgClass,
    MatTooltip,
  ]
})
export class RegistersComponent {
  public registers = input.required<Registers>();
  protected fType = signal<FormatType>('hex');

  protected changeLog = registerChangeLog;

  protected dlxRegisters = computed(() => this.registers() instanceof DLXRegisters ? this.registers() as DLXRegisters : null);
  protected rv32iRegisters = computed(() => this.registers() instanceof RV32IRegisters ? this.registers() as RV32IRegisters : null);

  protected tempName = computed(() => {
    const length = FormatPipe.getFormattedLength(this.fType(), 32);
    return `calc(${length}ch)`;
  })

  protected isChanged(path: string): boolean {
    return this.changeLog().some(c => c.path === path);
  }

  protected readonly FormatPipe = FormatPipe;
}
