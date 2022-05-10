import { Injectable, Injector } from '@angular/core';
import { DiagramComponent } from '../diagram/diagram.component';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  diagrams: DiagramComponent;

  constructor() { }

  /*Quando viene fatta una lettura
  avvia l'animazione di un ciclo di lettura */
  public onLoad(){
    this.diagrams.onLoad();
  }

  /*Quando viene fatta una scrittura
  avvia l'animazione di un ciclo di scrittura */
  public onStore(){
    this.diagrams.onStore();
  }

  /*Quando viene messa in pausa l'esecuzione
  viene messa in pausa l'animazione */
  public onPause(){
    this.diagrams.onPause();
  }

  /*Quando viene ripresa l'esecuzione
  viene ripresa l'animazione */
  public onResume(){
    this.diagrams.onResume();
  }

  /*Quando viene stoppata l'esecuzione
  viene stoppata l'animazione*/
  public onStop(){
    this.diagrams.onStop();
  }

  /*Quando l'esecuzione è in idle (no operazioni di I/O)
  viene messa in Idle l'animazione*/
  public onIdle(){
    this.diagrams.onIdle();
  }

}
