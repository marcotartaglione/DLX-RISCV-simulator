import { Component} from '@angular/core';
import { CodeService } from '../services/code.service';
import { CustomErrorStateMatcher } from './custom-state-matcher';
import {FormControl, Validators} from '@angular/forms';

@Component({
  templateUrl: './save-dialog.component.html',
})
export class SaveDialogComponent {

  constructor(private service: CodeService) {
  }

  fileName: string="";

  customErrorStateMatcher = new CustomErrorStateMatcher();
  fileFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/\.txt$/),
  ]);

  
  onSave(){
    this.service.save(this.fileName);
  }

}