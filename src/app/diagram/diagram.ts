import { AnimationPlayer } from '@angular/animations';
import {Injector} from '@angular/core';

export interface IDiagram{
  new(animationDuration: number, running: boolean, paused: boolean, type: string, loop:boolean, injector: Injector): Diagram;
}

export class Diagram{
  type: string; //indica il tipo di diagramma
  animationDuration: number; //velocità di scorrimento
  running: boolean; //indica lo stato dell'animazione, se sta scorrendo oppure no
  paused: boolean; //indica se l'animazione è stata messa in pausa
  loop: boolean; //indica se l'animazione è da riprodurre in loop
  animationClass: string; //indica la classe dell'animazione

  constructor() {
    this.type = "none";
    this.animationDuration = 0;
    this.running = false;
    this.paused = false;
    this.loop = false;
    this.animationClass = 'none';
  }

  /*METODI GETTER */
  public getAnimationDuration(){
    return this.animationDuration;
  }
  
  public isRunning(){
    return this.running;
  }

  public isPaused(){
    return this.paused;
  }

  public getType(){
    return this.type;
  }

  public isLoop(){
    return this.loop;
  }

  public getAnimationClass(){
    return this.animationClass;
  }

  /*METODI SETTER*/

  public setAnimationDuration(animationDuration: number){
    //controllo
    if(animationDuration > 0){
        this.animationDuration = animationDuration;
    }
  }

  public setRunning(running: boolean){
    this.running = running;
  }

  public setPaused(paused: boolean){
    this.paused = paused;
  }

  public setType(type: string){
    if(type != ''){
        this.type = type;
    }
  }

  public setLoop(loop: boolean){
    this.loop = loop;
  }

  public setAnimationClass(animationClass: string){
    if(animationClass != "")
      this.animationClass = animationClass;
  }

  /*Metodo che ritorna il nome dell'immagine del componente */
  public getImageName() {
    return ("../assets/img/diagram/"+this.getType()+".png"); //nel progetto finale andrà reso il path coerente
  }

  public getPlayState(){
    if(!this.isPaused() && this.isRunning())
      return 'running';
    else return 'paused';
  }
}