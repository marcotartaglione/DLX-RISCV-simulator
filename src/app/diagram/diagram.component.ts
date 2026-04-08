import {Component, inject, input} from '@angular/core';
import {DLXRegisters} from '../registers/dlx.registers';
import {DiagramService} from '../services/diagram.service';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {NgOptimizedImage, NgStyle} from '@angular/common';
import {FormatPipe} from '../pipes/format.pipe';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.sass'],
  standalone: true,
  imports: [
    MatButton,
    MatFormField,
    MatInput,
    FormsModule,
    NgStyle,
    FormatPipe,
    MatLabel,
    NgOptimizedImage
  ]
})

export class DiagramComponent {
  protected diagramService = inject(DiagramService);
  protected registers = input.required<DLXRegisters>();
}
