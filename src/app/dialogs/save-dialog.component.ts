import { Component} from '@angular/core';
import { CodeService } from '../services/code.service';
import { CustomErrorStateMatcher } from './custom-state-matcher';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

@Component({
  templateUrl: './save-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogContent,
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatError,
    MatLabel
  ]
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
