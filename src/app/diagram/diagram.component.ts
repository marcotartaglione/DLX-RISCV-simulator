import { ApplicationRef, Component, Input, OnInit} from '@angular/core';
import { DLXRegisters } from '../registers/dlx.registers';
import { DiagramService } from '../services/diagram.service';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.sass']
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