import {ApplicationRef, inject} from '@angular/core';

export class Diagram {
  private _appRef = inject(ApplicationRef);

  constructor(
    private _type: string,
    private _animationClass: string) {
  }

  private _animationDuration = 4000;

  public get animationDuration() {
    return this._animationDuration;
  }

  public set animationDuration(animationDuration: number) {
    if (animationDuration < 0) {
      throw new Error('Animation duration must be a non-negative number');
    }

    this._animationDuration = animationDuration;
  }

  public get type() {
    return this._type;
  }

  public set type(type: string) {
    if (type === '') {
      throw new Error('Type cannot be an empty string');
    }

    this._type = type;
  }

  public get animationClass() {
    return this._animationClass;
  }

  private set animationClass(animationClass: string) {
    if (animationClass === '') {
      throw new Error('Animation class cannot be an empty string');
    }

    this._animationClass = animationClass;
  }

  public get isRunning() {
    return this._running;
  }

  public get isPaused() {
    return this._paused;
  }

  public get imagePath() {
    return ('assets/img/diagram/' + this.type + '.png');
  }

  public get playState() {
    if (!this.isPaused && this.isRunning) {
      return 'running';
    } else {
      return 'paused';
    }
  }

  private _running = false;

  private set running(running: boolean) {
    this._running = running;
  }

  private _paused = false;

  private set paused(paused: boolean) {
    this._paused = paused;
  }

  public pause() {
    this.paused = true;
  }

  public start() {
    this.paused = false;
    this.running = true;
  }

  public resume() {
    this.paused = false;
  }

  public stop() {
    this.running = false;
    this.paused = false;

    this.animationClass = 'none';

    // Force refresh
    this._appRef.tick();

    this.animationClass = this.animationClassFromType;
  }

  public step() {
    this.stop();
    this.start();
  }

  private get animationClassFromType() {
    if (this.type === 'clock') {
      return 'clock';
    } else {
      return 'general';
    }
  }
}
