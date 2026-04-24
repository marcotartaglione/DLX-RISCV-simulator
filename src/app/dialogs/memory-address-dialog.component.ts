import {Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MemoryService} from '../services/memory.service';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatInput} from '@angular/material/input';
import {FormatPipe} from '../pipes/format.pipe';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';

export interface MemoryAddressDialogData {
  startAddress: number;
  numWords?: number;
}

@Component({
  templateUrl: './memory-address-dialog.component.html',
  styleUrls: ['./memory-address-dialog.component.sass'],
  standalone: true,
  imports: [
    MatDialogTitle, MatDialogContent, MatGridList, MatGridTile, MatCard,
    MatInput, FormatPipe, MatButtonToggleGroup, MatButtonToggle, FormsModule,
    MatDialogActions, MatButton, MatDialogClose, MatFormField,
    MatCardHeader, MatCardTitle, MatCardContent
  ]
})
export class MemoryAddressDialogComponent {
  private _dialogRef = inject(MatDialogRef<MemoryAddressDialogComponent>);
  private _memoryService = inject(MemoryService);
  private _config = inject<MemoryAddressDialogData>(MAT_DIALOG_DATA);

  protected memoryValues: { address: number; value: number }[] = [];

  protected formatPipe = new FormatPipe();
  protected dataFormat = signal<'b' | 'hw' | 'w'>('b');
  protected formatType = signal<'hex' | 'dec' | 'bin'>('hex');

  constructor() {
    this.loadMemory();
  }

  private loadMemory() {
    const start = this._config.startAddress;
    const count = this._config.numWords ?? 16;

    for (let i = 0; i < count * 4; i++) {
      const addr = start + i;
      this.memoryValues.push({
        address: addr,
        value: this._memoryService.memory.load(addr) ?? 0
      });
    }
  }

  protected dataSizeBytes = computed(() => this.dataFormat() === 'b' ? 1 : this.dataFormat() === 'hw' ? 2 : 4);

  protected viewData = computed(() => {
    const raw = this.memoryValues;
    const size = this.dataSizeBytes();
    const result = [];

    for (let i = 0; i < raw.length; i += size) {
      let value = 0;
      for (let j = 0; j < size && i + j < raw.length; j++) {
        value = (value << 8) + raw[i + j].value;
      }
      result.push({ address: raw[i].address, value });
    }
    return result;
  });

  protected onInputChange = (val: string, el: { address: number }) => {
    const numericVal = this.formatPipe.transform(val, 'dec');
    const size = this.dataSizeBytes();

    for (let i = 0; i < size; i++) {
      const shift = (size - 1 - i) * 8;
      const byteVal = (numericVal >> shift) & 0xFF;
      const index = this.memoryValues.findIndex(x => x.address === el.address + i);
      if (index !== -1) {
        this.memoryValues[index].value = byteVal;
      }
    }
  };

  protected onSubmit = () => {
    this.memoryValues.forEach(el => {
      this._memoryService.memory.store(el.address, el.value);
    });
    this._dialogRef.close();
  };
}
