import { ApplicationRef, Injectable, Injector } from '@angular/core';
import { DLXDiagrams } from '../diagram/dlx.diagrams';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  dlxDiagrams: DLXDiagrams;
  injector: Injector; //serve davvero?

  constructor(injector: Injector, appRef: ApplicationRef) {
    this.injector = injector;
    this.dlxDiagrams = new DLXDiagrams(appRef);
  }

  public resume(){
    this.dlxDiagrams.resume();
  }

  public stop(){
    this.dlxDiagrams.stop();
  }

  public pause(){
    this.dlxDiagrams.pause();
  }

  public load(){
    this.dlxDiagrams.load();
  }

  public store(){
    this.dlxDiagrams.store();
  }

  public idle(){
    this.dlxDiagrams.idle();
  }

}
