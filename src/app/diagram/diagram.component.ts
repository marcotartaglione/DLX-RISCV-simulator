import { ApplicationRef, Component, Input, OnInit} from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { DiagramService } from '../services/diagram.service';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.sass']
})

export class DiagramComponent implements OnInit{

  @Input() diagramService: DiagramService;
  //@Input() editorComponent: EditorComponent //prendo interval che mi servirà per definire l'animationDuration 
  animationDuration: number; //definisce la durata complessiva dell'animazione del diagramma
  private auto: boolean = true; //definisce se il componente funziona in modalità automatica o manuale
  /*Nella modalità manuale i diagrammi sono controllati dall'utente
    In quella automatica i diagrammi si muovono in base al codice
  */

  constructor(private appRef: ApplicationRef) {
    this.animationDuration = 1000;
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
    this.diagramService.stop();
    this.auto = true;
  }

  //imposta il funzionamento dei diagrammi in manuale
  public setManual(){
    this.diagramService.stop();
    this.auto = false;
  }

  public isAuto(){
    return this.auto;
  }
  
  public getAnimationDuration(){
    return this.animationDuration;
  }

}