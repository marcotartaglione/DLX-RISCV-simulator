import {animate, group, query, style, transition, trigger} from '@angular/animations';
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import CodeMirror, {EditorFromTextArea} from 'codemirror';
import 'codemirror/addon/selection/active-line';
import {Subscription} from 'rxjs';
import {SaveDialogComponent} from '../dialogs/save-dialog.component';
import {StartLogicalNetwork} from '../memory/model/logicalNetworks/start.logical-network';
import {Registers} from '../registers/registers.js';
import {CodeService} from '../services/code.service.js';
import {DiagramService} from '../services/diagram.service';
import {MemoryService} from '../services/memory.service.js';
import './modes/dlx.js';
import './modes/rv32i.js';
import {LogicalNetwork} from '../memory/model/logical-network';
import {MatCard} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatLabel} from '@angular/material/form-field';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.sass'],
  animations: [
    trigger('showHideTrigger', [
      transition(':enter', [
        group([
          style({height: '0'}),
          animate('200ms ease-out', style({height: '*'})),
          query('mat-card', [
            style({transform: 'translateY(-100%)'}),
            animate('200ms ease-out', style({transform: 'translateY(0)'})),
          ])
        ])
      ]),
      transition(':leave', [
        group([
          animate('200ms ease-out', style({height: '0'})),
          query('mat-card', [
            animate('200ms ease-out', style({transform: 'translateY(-100%)'}))
          ])
        ])
      ])
    ])
  ],
  standalone: true,
  imports: [
    FormsModule,
    MatCard,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatInput,
    MatFormField,
    MatLabel
  ]
})
export class EditorComponent implements AfterViewInit, OnDestroy {

  public registers = input.required<Registers>();
  public pc = model<number>(0, {alias: 'pc'});
  public wasContentModified = output<boolean>();

  protected errorMessage = signal('');
  protected startTag = signal('init');
  protected isInterruptDisabled = signal(true);
  protected intervalTime = signal(1000);

  private _codeService = inject(CodeService);
  private _memoryService = inject(MemoryService);
  private _diagramService = inject(DiagramService);
  private _appRef = inject(ApplicationRef);
  private _dialog = inject(MatDialog);

  private _hostElement = viewChild<ElementRef>('hostElement');
  private _form = viewChild<NgForm>('form');
  private _codeMirror = signal<EditorFromTextArea | null>(null);
  private _isRunning = signal(false);

  private _formStatusChangeSub: Subscription;
  private _timeout: any;
  private _exRunnedInstruction = -1;
  private _runnedInstruction = -1;
  private _keepRunning = false;


  constructor() {
    this.initEditorSettings();

    effect(() => {
      if (!this._codeMirror()) {
        return;
      }

      this.updateVisuals(this._exRunnedInstruction, this._runnedInstruction, this.pc());
    });
  }

  protected isRunDisabled = computed(() =>
    this._codeMirror() ? (this.addressToLine(this.pc()) >= this._codeMirror().lineCount()) || this._keepRunning : false
  );

  protected isStopDisabled = computed(() =>
    !this._isRunning()
  );

  protected readonly isContinuousRunDisabled = computed(() =>
    this._codeMirror() ? (this.addressToLine(this.pc()) >= this._codeMirror().lineCount()) : false
  );

  public get keepRunning() {
    return this._keepRunning;
  }

  public get inputPorts() {
    return this._memoryService.memory.inputPorts;
  }

  public get options(): CodeMirror.EditorConfiguration {
    return {
      lineNumbers: true,
      firstLineNumber: 0,
      lineNumberFormatter: (line: number) => (line * 4).toString(16).toUpperCase(),
      theme: 'dlx-riscv-theme',
      mode: this._codeService.editorMode,
      styleActiveLine: true,
      viewportMargin: Infinity,
      extraKeys: {
        'Ctrl-S': () => {
          this.save();
          this._appRef.tick();
        }
      }
    };
  }

  ngAfterViewInit() {
    const textArea = this._hostElement().nativeElement.querySelector('textarea');

    this._codeMirror.set(CodeMirror.fromTextArea(textArea, this.options));
    this._codeMirror().setValue(this._codeService.content || '');

    this._codeMirror().on('change', (event) => {
      this._codeService.content = event.getValue();
      this._form()?.form.markAsDirty();

      if (this._isRunning()) {
        this.stop();
      }

      if (this.errorMessage()) {
        this._codeMirror().removeLineClass(this.addressToLine(this._runnedInstruction), 'wrap', 'error');
        this.errorMessage.set(undefined);
      }
    });

    this._formStatusChangeSub = this._form()?.statusChanges?.subscribe(() =>
      this.wasContentModified.emit(this._form()?.dirty ?? false)
    );

    this.storeCodeInEprom();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this._form()?.dirty) {
      $event.returnValue = true;
    }
  }

  ngOnDestroy() {
    if (this._codeMirror()) {
      this._codeMirror().toTextArea();
    }

    if (this._formStatusChangeSub) {
      this._formStatusChangeSub.unsubscribe();
    }

    if (this._timeout) {
      clearInterval(this._timeout);
    }
  }

  protected run() {
    this._keepRunning = true;

    if (this.pc() >= this._codeService.linesCount * 4) {
      this.pc.set(0);
    }

    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    this.executeNextInstruction();
    this._timeout = setTimeout(() => this.run(), this.intervalTime());
  }

  protected executeNextInstruction() {
    if (!this._isRunning()) {
      this._codeMirror().removeLineClass(this.addressToLine(this._runnedInstruction), 'wrap', 'error');
      this.errorMessage.set(undefined);

      this._memoryService.devices.forEach(el => {
        if (el instanceof LogicalNetwork) {
          (el as LogicalNetwork).startOperation();
        }
      });

      this._codeService.interpreter.parseTags(this._codeService.content, this.startTag());
      this.pc.set(this._codeService.interpreter.getTag('start_tag'));
      this._isRunning.set(true);

      if (this._diagramService.isAuto()) {
        this._diagramService.setAnimationDuration(this.intervalTime());
        this._diagramService.idle();
      }
    }

    this._exRunnedInstruction = this._runnedInstruction;
    this._runnedInstruction = this.pc();

    if (this._diagramService.isAuto()) {
      this._diagramService.setAnimationDuration(this.intervalTime());
      this._diagramService.resume();
    }
    try {
      const newPc = this._codeService.interpreter.run(
        this._codeMirror().getLine(this.addressToLine(this.pc())),
        this.registers(),
        this._memoryService.memory
      );

      this.pc.set(newPc);
    } catch (error) {
      this.stop();
      this._codeMirror().addLineClass(this._runnedInstruction, 'wrap', 'error');
      this.errorMessage.set(error.message);
    }

    this._memoryService.devices.forEach(el => {
      if (el instanceof StartLogicalNetwork) {
        this.isInterruptDisabled.set((el as StartLogicalNetwork).startup);
      }
    });
  }

  protected pause() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    this._keepRunning = false;

    if (this._diagramService.isAuto()) {
      this._diagramService.pause();
      this._diagramService.setAnimationDuration(this.intervalTime());
    }
  }

  protected stop() {
    this._isRunning.set(false);
    this.pause();

    this._exRunnedInstruction = -1;
    this._runnedInstruction = -1;

    // Dummy update to trigger visuals update and remove runned/next highlights
    this.pc.set(0);
  }

  protected save(download: boolean = false) {
    if (download) {
      this._dialog.open(SaveDialogComponent);
    } else {
      this._codeService.save();
    }

    this.storeCodeInEprom();
    this.persistSettings();
  }

  protected clear() {
    this._memoryService.removeFromMemory();
    this._codeService.clear();
    this._memoryService.init();
    this._codeService.load();
    this.storeCodeInEprom();

    if (this._diagramService.isAuto()) {
      this._diagramService.stop();
    }
  }

  protected onInterrupt() {
    this._exRunnedInstruction = this._runnedInstruction;
    this._runnedInstruction = this.pc();
    this._codeService.interpreter.interrupt(this.registers());
  }

  protected onInterruptPort() {
    this._codeService.interpreter.interrupt(this.registers());
  }

  private storeCodeInEprom() {
    this._codeService.interpreter.parseTags(this._codeService.content, this.startTag());
    for (let i = 0; i < this._codeService.linesCount; i++) {
      this._memoryService.getEprom().store(i, this._codeService.encode(i));
    }
  }

  private initEditorSettings() {
    try {
      const editorSettings = JSON.parse(window.localStorage.getItem('editor_settings'));
      if (editorSettings && editorSettings.start && editorSettings.interval) {
        this.startTag.set(editorSettings.start);
        this.intervalTime.set(editorSettings.interval);
      }
    } catch (error) {
      window.localStorage.removeItem('editor_settings');
    }
  }

  private persistSettings() {
    const settings = {start: this.startTag(), _interval: this.intervalTime()};
    window.localStorage.setItem('editor_settings', JSON.stringify(settings));
  }

  private addressToLine(address: number): number {
    return address / 4;
  }

  private updateVisuals(prevAddr: number, currentAddr: number, nextAddr: number) {
    if (!this._codeMirror()) {
      return;
    }

    if (!this._isRunning()) {
      for (let i = 0; i < this._codeMirror().lineCount(); i++) {
        this._codeMirror().removeLineClass(i, 'wrap', 'error');
        this._codeMirror().removeLineClass(i, 'wrap', 'runned');
        this._codeMirror().removeLineClass(i, 'wrap', 'next');
      }
    } else {
      this._codeMirror().removeLineClass(this.addressToLine(prevAddr), 'wrap', 'runned');
      this._codeMirror().removeLineClass(this.addressToLine(prevAddr), 'wrap', 'next');
      this._codeMirror().removeLineClass(this.addressToLine(currentAddr), 'wrap', 'runned');
      this._codeMirror().removeLineClass(this.addressToLine(currentAddr), 'wrap', 'next');

      this._codeMirror().addLineClass(this.addressToLine(currentAddr), 'wrap', 'runned');
      this._codeMirror().addLineClass(this.addressToLine(nextAddr), 'wrap', 'next');
    }
  }
}
