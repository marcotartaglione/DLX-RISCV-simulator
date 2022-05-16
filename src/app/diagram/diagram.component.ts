import { ApplicationRef, Component, Input, OnInit} from '@angular/core';
import { DiagramService } from '../services/diagram.service';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.sass']
})

export class DiagramComponent implements OnInit{

  @Input() diagramService: DiagramService;
  //@Input() editor: EditorComponent; //prendo interval che mi servirà per definire l'animationDuration 
  animationDuration: number; //definisce la durata complessiva dell'animazione del diagramma
  private auto: boolean = true; //definisce se il componente funziona in modalità automatica o manuale
  /*Nella modalità manuale i diagrammi sono controllati dall'utente
    In quella automatica i diagrammi si muovono in base al codice
  */

  constructor(private appRef: ApplicationRef) {
    this.animationDuration = this.calculateAnimationDuration();//default
    //mettere un algoritmo per il calcolo della speed in base a interval 
    //this.diagrams = new DLXDiagrams(this.animationDuration);
  }
  
  ngOnInit(): void {}

  /*Metodo di utility per calcolare la durata dell'animazione in base all'interval scelto*/
  private calculateAnimationDuration(/*Prende l'interval come input*/){
    /*Nel disegno un ciclo di clock è lungo 60 pixel
      deve scorrere nell'interval passato
      nel disegno ci sono N cicli di clock
      la durata complessiva dell'animazione è data dal prodotto N * Interval 
      l'unità di misura sono i ms
    */
    //return N * editor.getInterval();  
    /*Per scopi di testing ritorna un valore di default*/
    return 4000;
  }

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
  
}