import { Component, Inject } from '@angular/core';
import { CodeService } from '../services/code.service';

@Component({
  templateUrl: './save-dialog.component.html',
})
export class SaveDialogComponent {

  constructor(private service: CodeService) {
  }

  fileName: string="dlx.txt";

  onSave(){
      this.service.save(this.fileName);
  }

}