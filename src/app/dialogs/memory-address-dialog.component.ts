import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MemoryService} from '../services/memory.service';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {MatCard} from '@angular/material/card';
import {MatInput} from '@angular/material/input';
import {FormatPipe} from '../pipes/format.pipe';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';

@Component({
  templateUrl: './memory-address-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatGridList,
    MatGridTile,
    MatCard,
    MatInput,
    FormatPipe,
    MatButtonToggleGroup,
    MatButtonToggle,
    FormsModule,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ]
})
export class MemoryAddressDialogComponent {
  protected formatType: string = 'hex';
  protected data = inject<any>(MAT_DIALOG_DATA); // FIXME: cos'è sto 'data'?
  private _service = inject(MemoryService);

  protected onInputChange = (val, el) => {
    if (this.formatType === 'hex' && (val.length != 8 || val.includes('0x')) && val.length != 10) {
      return;
    }

    this.data.values.find(x => x.address == el.address).value = parseInt(val);
  };

  protected onSubmit = () => {
    this.data.values.forEach(el => {
      this._service.memory.store(el.address, el.value);
    });
  }
}






