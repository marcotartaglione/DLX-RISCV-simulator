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
  protected dataFormat = signal<'b' | 'hw' | 'w'>('w');
  protected formatType = signal<'hex' | 'dec' | 'bin'>('hex');

  constructor() {
    this.loadMemory();
  }

  private loadMemory() {
    const start = this._config.startAddress;
    const numWords = this._config.numWords ?? 16;
    this.memoryValues = [];

    for (let i = 0; i < numWords; i++) {
      const wordAddr = start + (i * 4);
      const word = this._memoryService.memory.load(wordAddr) ?? 0;

      for (let j = 0; j < 4; j++) {
        const byteAddr = wordAddr + j;

        const shift = (3 - j) * 8;
        const byteVal = (word >> shift) & 0xFF;

        this.memoryValues.push({
          address: byteAddr,
          value: byteVal
        });
      }
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
      const byteVal = (numericVal >>> shift) & 0xFF;
      const index = this.memoryValues.findIndex(x => x.address === el.address + i);
      if (index !== -1) {
        this.memoryValues[index].value = byteVal;
      }
    }
  };

  protected onSubmit = () => {
    for (let i = 0; i < this.memoryValues.length; i += 4) {

      const b0 = this.memoryValues[i].value;
      const b1 = this.memoryValues[i + 1].value;
      const b2 = this.memoryValues[i + 2].value;
      const b3 = this.memoryValues[i + 3].value;

      const word = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;

      const wordAddr = this.memoryValues[i].address;

      this._memoryService.memory.store(wordAddr, word);
    }

    this._dialogRef.close();
  };
}
