import { ApplicationRef, Injectable, Injector } from '@angular/core';
import { DLXDiagrams } from '../diagram/dlx.diagrams';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  static instance: DiagramService;

  dlxDiagrams: DLXDiagrams;
  pauseEnabled: boolean; //mi dice se il pulsante di pause è cliccabile
  stopEnabled: boolean; //mi dice se il pulsante di stop è cliccabile
  auto: boolean; //definisce se il componente funziona in modalità automatica o manuale
  /*Nella modalità manuale i diagrammi sono controllati dall'utente
    In quella automatica i diagrammi si muovono in base al codice
  */

  constructor(appRef: ApplicationRef) {
    DiagramService.instance = this;
    this.dlxDiagrams = new DLXDiagrams(appRef);
    this.stopEnabled = false;
    this.pauseEnabled = true;
    this.auto = true;
  }

  public resume(){
    this.dlxDiagrams.resume();
    this.pauseEnabled = true;
  }

  public stop(){
    this.dlxDiagrams.stop();
    this.stopEnabled = false;
    this.pauseEnabled = true;
  }

  public pause(){
    this.dlxDiagrams.pause();
    this.pauseEnabled = false;
    this.stopEnabled = true;
  }

  public load(){
    this.dlxDiagrams.load();
    this.pauseEnabled = true;
    this.stopEnabled = true;
  }

  public store(){
    this.dlxDiagrams.store();
    this.pauseEnabled = true;
    this.stopEnabled = true;
  }

  public idle(){
    this.dlxDiagrams.idle();
    this.pauseEnabled = true;
    this.stopEnabled = true;
  }

  public isPauseEnabled(){
    return this.pauseEnabled;
  }

  public isStopEnabled(){
    return this.stopEnabled;
  }

  public setAnimationDuration(animationDuration: number){
    this.dlxDiagrams.setAnimationDuration(animationDuration);
  }

  public setAuto(){
    this.stop();
    this.auto = true;
  }

  public setManual(){
    this.stop();
    this.auto = false;
  }

  public isAuto(){
    return this.auto;
  }

}
