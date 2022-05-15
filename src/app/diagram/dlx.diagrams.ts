import { ApplicationRef } from "@angular/core";
import { Diagram } from "./diagram";

export class DLXDiagrams{

    //in futuro possibile estendere con altri gruppi di segnali oppure singoli segnali
    clock: Diagram;
    address: Diagram;
    memrd: Diagram;
    memwr: Diagram;
    data: Diagram;

    constructor(private appRef: ApplicationRef){
        //creo i 5 diagram per i cicli di bus
        this.clock = new Diagram('clock', 'clock');
        this.address = new Diagram('address', 'general');
        this.memrd = new Diagram('memrd', 'general');
        this.memwr = new Diagram('memwr', 'general');
        this.data = new Diagram('data_in', 'general');
    }

    /*METODI PAUSE*/
  /*Per mettere in pausa le animazioni*/
  private pauseClock(){
    this.clock.setPaused(true);
  }
  
  private pauseAddress(){
    this.address.setPaused(true);
  }

  private pauseMemrd(){
    this.memrd.setPaused(true);
  }

  private pauseMemwr(){
    this.memwr.setPaused(true);
  }

  private pauseData(){
    this.data.setPaused(true);
  }

  /*METODI RESUME*/
  /*Per avviare o riprendere una animazione*/
  private resumeClock(){
    //se l'animazione è stata messa in pausa
    if(this.clock.isPaused()){
      this.clock.setPaused(false);
    }else{
      //se l'animazione viene avviata
      this.clock.setRunning(true);
    }
  }

  private resumeAddress(){
    if(this.address.isPaused()){
      this.address.setPaused(false);
    }else{
      this.address.setRunning(true);
    }
  }

  private resumeMemrd(){
    if(this.memrd.isPaused()){
      this.memrd.setPaused(false);
    }else{
      this.memrd.setRunning(true);
    }
  }

  private resumeMemwr(){
    if(this.memwr.isPaused()){
      this.memwr.setPaused(false);
    }else{
      this.memwr.setRunning(true);
    }
  }

  private resumeData(){
    if(this.data.isPaused()){
      this.data.setPaused(false);
    }else{
      this.data.setRunning(true);
    }
  }

  /*METODI RESET*/
  /*Per resettare le animazioni */
  private stopClock(){
    this.clock.setRunning(false);
    this.clock.setPaused(false);
    //setto la classe a 'none'
    this.clock.setAnimationClass("none");
    //triggero il refresh
    this.appRef.tick();
    //rimetto la classe giusta
    this.clock.setAnimationClass("clock");
  }

  private stopAddress(){
    this.address.setRunning(false);
    this.address.setPaused(false);
    this.address.setAnimationClass("none");
    this.appRef.tick();
    this.address.setAnimationClass("general");
  }

  private stopMemrd(){
    this.memrd.setRunning(false);
    this.memrd.setPaused(false);
    this.memrd.setAnimationClass("none");
    this.appRef.tick();
    this.memrd.setAnimationClass("general");
  }

  private stopMemwr(){
    this.memwr.setRunning(false);
    this.memwr.setPaused(false);
    this.memwr.setAnimationClass("none");
    this.appRef.tick();
    this.memwr.setAnimationClass("general");
  }

  private stopData(){
    this.data.setRunning(false);
    this.data.setPaused(false);
    this.data.setAnimationClass("none");
    this.appRef.tick();
    this.data.setAnimationClass("general");
  }

    public resume(){

    }

    public stop(){

    }

    public pause(){

    }

    public load(){

    }

    public store(){

    }

    public idle(){

    }

}