import { ApplicationRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import { DiagramService } from '../services/diagram.service';
import { Diagram } from './diagram';
import { DLXDiagrams } from './dlx.diagrams';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.sass']
})

export class DiagramComponent implements OnInit{

  //dlxDiagrams: DLXDiagrams;
  @Input() diagramService: DiagramService;
  //@Input() editor: EditorComponent; //prendo interval che mi servirà per definire l'animationDuration 
  animationDuration: number; //definisce la durata complessiva dell'animazione del diagramma
  private auto: boolean = true; //definisce se il componente funziona in modalità automatica o manuale
  /*Nella modalità manuale i diagrammi sono controllati dall'utente
    In quella automatica i diagrammi si muovono in base al codice*/
  /*
  get dlxDiagrams(): DLXDiagrams{
    return this.diagrams as DLXDiagrams;
  }*/
  /*
  get isDLX(): boolean{
    return this.dlxDiagrams.constructor.name === DLXDiagrams.name;
  }*/

  constructor(private appRef: ApplicationRef) {
    this.animationDuration = this.calculateAnimationDuration();//default
    //mettere un algoritmo per il calcolo della speed in base a interval 
    //this.diagrams = new DLXDiagrams(this.animationDuration);
  }
  
  ngOnInit(): void {
    //this.dlxDiagrams = new DLXDiagrams(this.appRef);  
  }

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

  /*METODI PAUSE*/
  /*Per mettere in pausa le animazioni*/
  /*public pauseClock(){
    this.dlxDiagrams.clock.setPaused(true);
  }
  
  public pauseAddress(){
    this.dlxDiagrams.address.setPaused(true);
  }

  public pauseMemrd(){
    this.dlxDiagrams.memrd.setPaused(true);
  }

  public pauseMemwr(){
    this.dlxDiagrams.memwr.setPaused(true);
  }

  public pauseData(){
    this.dlxDiagrams.data.setPaused(true);
  }*/

  /*METODI RESUME*/
  /*Per avviare o riprendere una animazione*/
  /*public resumeClock(){
    //se l'animazione è stata messa in pausa
    if(this.dlxDiagrams.clock.isPaused()){
      this.dlxDiagrams.clock.setPaused(false);
    }else{
      //se l'animazione viene avviata
      this.dlxDiagrams.clock.setRunning(true);
    }
  }

  public resumeAddress(){
    if(this.dlxDiagrams.address.isPaused()){
      this.dlxDiagrams.address.setPaused(false);
    }else{
      this.dlxDiagrams.address.setRunning(true);
    }
  }

  public resumeMemrd(){
    if(this.dlxDiagrams.memrd.isPaused()){
      this.dlxDiagrams.memrd.setPaused(false);
    }else{
      this.dlxDiagrams.memrd.setRunning(true);
    }
  }

  public resumeMemwr(){
    if(this.dlxDiagrams.memwr.isPaused()){
      this.dlxDiagrams.memwr.setPaused(false);
    }else{
      this.dlxDiagrams.memwr.setRunning(true);
    }
  }

  public resumeData(){
    if(this.dlxDiagrams.data.isPaused()){
      this.dlxDiagrams.data.setPaused(false);
    }else{
      this.dlxDiagrams.data.setRunning(true);
    }
  }*/

  /*METODI RESET*/
  /*Per resettare le animazioni */
  /*public stopClock(){
    this.dlxDiagrams.clock.setRunning(false);
    this.dlxDiagrams.clock.setPaused(false);
    //setto la classe a 'none'
    this.dlxDiagrams.clock.setAnimationClass("none");
    //triggero il refresh
    this.appRef.tick();
    //rimetto la classe giusta
    this.dlxDiagrams.clock.setAnimationClass("clock");
  }

  public stopAddress(){
    this.dlxDiagrams.address.setRunning(false);
    this.dlxDiagrams.address.setPaused(false);
    this.dlxDiagrams.address.setAnimationClass("none");
    this.appRef.tick();
    this.dlxDiagrams.address.setAnimationClass("general");
  }

  public stopMemrd(){
    this.dlxDiagrams.memrd.setRunning(false);
    this.dlxDiagrams.memrd.setPaused(false);
    this.dlxDiagrams.memrd.setAnimationClass("none");
    this.appRef.tick();
    this.dlxDiagrams.memrd.setAnimationClass("general");
  }

  public stopMemwr(){
    this.dlxDiagrams.memwr.setRunning(false);
    this.dlxDiagrams.memwr.setPaused(false);
    this.dlxDiagrams.memwr.setAnimationClass("none");
    this.appRef.tick();
    this.dlxDiagrams.memwr.setAnimationClass("general");
  }

  public stopData(){
    this.dlxDiagrams.data.setRunning(false);
    this.dlxDiagrams.data.setPaused(false);
    this.dlxDiagrams.data.setAnimationClass("none");
    this.appRef.tick();
    this.dlxDiagrams.data.setAnimationClass("general");
  }*/

  /*METODI PER TESTING */
  /*public onResume(){
    this.resumeClock();
    this.resumeAddress();
    this.resumeMemrd();
    this.resumeMemwr();
    this.resumeData();
  }

  public onStop(){
    this.stopClock();
    this.stopAddress();
    this.stopMemrd();
    this.stopMemwr();
    this.stopData();
  }

  public onPause(){
    this.pauseClock();
    this.pauseAddress();
    this.pauseMemrd();
    this.pauseMemwr();
    this.pauseData();
  }*/

  /*CICLO DI BUS DI LETTURA*/
  /*public onLoad(){
    //setto data come data_in
    this.dlxDiagrams.data.setType("data_in");
    //resetto e faccio partire
    //clock
    this.stopClock();
    this.resumeClock();
    //address
    this.stopAddress();
    this.resumeAddress();
    //memwr
    this.stopMemwr();
    //memrd
    this.stopMemrd();
    this.resumeMemrd();
    //data
    this.stopData();
    this.resumeData();
  }*/

  /*CICLO DI BUS DI SCRITTURA */
  /*public onStore(){
    //setto data come data_out
    this.dlxDiagrams.data.setType("data_out");
    //resetto e faccio partire
    //clock
    this.stopClock();
    this.resumeClock();
    //address
    this.stopAddress();
    this.resumeAddress();
    //memwr
    this.stopMemwr();
    this.resumeMemwr();
    //memrd
    this.stopMemrd();
    //data
    this.stopData();
    this.resumeData();
  }*/

  /*ANIMAZIONE DI IDLE*/
  /*Quando non vengono fatte operazione di I/O*/
  /*public onIdle(){
    this.stopClock();
    this.resumeClock();
    //faccio un reset degli altri
    this.stopAddress();
    this.stopMemrd();
    this.stopMemwr();
    this.stopData();
  }*/

  //imposta il funzionamento dei diagrammi in automatico
  public setAuto(){
    this.auto = true;
  }

  //imposta il funzionamento dei diagrammi in manuale
  public setManual(){
    this.auto = false;
  }

  public isAuto(){
    return this.auto;
  }
}