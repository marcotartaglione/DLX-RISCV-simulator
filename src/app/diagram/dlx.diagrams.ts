import {Diagram} from './diagram';

export class DLXDiagrams {

  private _diagrams = new Map<string, Diagram>();

  constructor() {
    this._diagrams.set('clock', new Diagram('clock', 'clock'));
    this._diagrams.set('address', new Diagram('address', 'general'));
    this._diagrams.set('memrd', new Diagram('memrd', 'general'));
    this._diagrams.set('memwr', new Diagram('memwr', 'general'));
    this._diagrams.set('data', new Diagram('data_in', 'general'));
    this._diagrams.set('ien', new Diagram('fronte_salita', 'general'));
  }

  public getDiagram(diagram: string) {
    return this._diagrams.get(diagram);
  }

  public resume() {
    this.getDiagram('clock').resume();
    this.getDiagram('address').resume();
    this.getDiagram('memrd').resume();
    this.getDiagram('memwr').resume();
    this.getDiagram('data').resume();
    this.getDiagram('ien').resume();
  }

  public stop() {
    this.getDiagram('clock').stop();
    this.getDiagram('address').stop();
    this.getDiagram('memrd').stop();
    this.getDiagram('memwr').stop();
    this.getDiagram('data').stop();
    this.getDiagram('ien').stop();
  }

  public pause() {
    this.getDiagram('clock').pause();
    this.getDiagram('address').pause();
    this.getDiagram('memrd').pause();
    this.getDiagram('memwr').pause();
    this.getDiagram('data').pause();
    this.getDiagram('ien').pause();
  }

  public load() {
    this.getDiagram('data').type = 'data_in';

    this.getDiagram('clock').step();
    this.getDiagram('address').step();

    this.getDiagram('memwr').stop();

    this.getDiagram('memrd').step()
    this.getDiagram('data').step()
  }

  public store() {
    this.getDiagram('data').type = 'data_out';

    this.getDiagram('clock').step();
    this.getDiagram('address').step();
    this.getDiagram('memwr').step();

    this.getDiagram('memrd').stop();

    this.getDiagram('data').step()
  }

  public idle() {
    this.getDiagram('clock').step();

    this.getDiagram('address').stop();
    this.getDiagram('memrd').stop();
    this.getDiagram('memwr').stop();
    this.getDiagram('data').stop();
  }

  public setAnimationDuration(animationDuration: number) {
    this.getDiagram('clock').animationDuration = animationDuration;
    this.getDiagram('address').animationDuration = animationDuration;
    this.getDiagram('memrd').animationDuration = animationDuration;
    this.getDiagram('memwr').animationDuration = animationDuration;
    this.getDiagram('data').animationDuration = animationDuration;
    this.getDiagram('ien').animationDuration = animationDuration;
  }

  public ienUp() {
    this.getDiagram('ien').type = 'fronte_salita';
    this.getDiagram('ien').step();
    this.stableFronte('fronte_discesa');
  }

  public stableFronte(img: string) {
    this.getDiagram('ien').type = img;
  }

  public ienDown() {
    this.getDiagram('ien').type = 'fronte_discesa';
    this.getDiagram('ien').step();
    this.stableFronte('fronte_salita');
  }
}
