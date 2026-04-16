import {Component, inject, signal} from '@angular/core';
import {CodeService} from '../services/code.service';
import {CustomErrorStateMatcher} from './custom-state-matcher';
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
  private _codeService = inject(CodeService);

  protected fileName = signal('');
  protected customErrorStateMatcher = new CustomErrorStateMatcher();
  protected fileFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/\.txt$/),
  ]);

  protected onSave() {
    this._codeService.saveInLocalStorage(this.fileName());
  }
}
