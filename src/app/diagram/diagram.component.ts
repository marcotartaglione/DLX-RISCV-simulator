import { ApplicationRef, Component, Input, OnInit} from '@angular/core';
import { DLXRegisters } from '../registers/dlx.registers';
import { DiagramService } from '../services/diagram.service';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {NgStyle} from '@angular/common';
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
    MatLabel
  ]
})

export class DiagramComponent implements OnInit{

  @Input() diagramService: DiagramService;
  @Input() registers: DLXRegisters;

  constructor(private appRef: ApplicationRef) {
  }

  ngOnInit(): void {}

  public onPause(){
    this.diagramService.pause();
  }

  public onResume(){
    this.diagramService.resume();
  }

  public onStop(){
    this.diagramService.stop();
  }

  public onLoad(){
    this.diagramService.load();
  }

  public onStore(){
    this.diagramService.store();
  }

  public onIdle(){
    this.diagramService.idle();
  }

  //imposta il funzionamento dei diagrammi in automatico
  public setAuto(){
    this.diagramService.setAuto();
  }

  //imposta il funzionamento dei diagrammi in manuale
  public setManual(){
    this.diagramService.setManual();
  }

  public isAuto(){
    return this.diagramService.isAuto();
  }

}
