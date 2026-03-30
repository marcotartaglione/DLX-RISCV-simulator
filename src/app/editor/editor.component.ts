import {animate, group, query, style, transition, trigger} from '@angular/animations';
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import CodeMirror from 'codemirror';
import {EditorFromTextArea} from 'codemirror';
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

  @ViewChild('hostElement', {static: false}) hostElement: ElementRef;
  @ViewChild('form', {static: false}) form: NgForm;
  @Input() public codeService: CodeService;
  @Input() memoryService: MemoryService;
  @Input() diagramService: DiagramService;
  @Input() registers: Registers;
  @Output() pcChange: EventEmitter<number> = new EventEmitter();
  @Output() formDirtyChange: EventEmitter<boolean> = new EventEmitter();
  continuousRunning = false;
  errorMessage: string;
  start = 'init';
  interval = 1000;
  isInterruptDisabled = true;
  private codeMirrorInstance: EditorFromTextArea;
  private formStatusChangeSub: Subscription;
  private timeout;
  private previousLine = 0;
  private runnedLine = 0;
  private running = false;

  constructor(
    private appRef: ApplicationRef,
    private dialog: MatDialog
  ) {
    try {
      const editorSettings = JSON.parse(window.localStorage.getItem('editor_settings'));
      if (editorSettings && editorSettings.start && editorSettings.interval) {
        this.start = editorSettings.start;
        this.interval = editorSettings.interval;
      }
    } catch (error) {
      window.localStorage.removeItem('editor_settings');
    }
  }

  private _pc: number;

  get pc(): number {
    return this._pc;
  }

  @Input()
  set pc(val: number) {
    if (this.doc && (val !== this._pc || !this.running)) {
      const pre = Math.floor(this._pc / 4);
      const cur = Math.floor(val / 4);

      if (!this.running) {
        this.doc.removeLineClass(this.previousLine, 'wrap', 'runned');
        this.doc.removeLineClass(pre, 'wrap', 'next');
      } else {
        this.doc.removeLineClass(this.previousLine, 'wrap', 'runned');
        this.doc.removeLineClass(pre, 'wrap', 'next');
        this.doc.addLineClass(this.runnedLine, 'wrap', 'runned');
        if (cur < this.doc.lineCount()) {
          this.doc.addLineClass(cur, 'wrap', 'next');
        }
        this.previousLine = this.runnedLine;
      }
    }
    this._pc = val;
  }

  get options() {
    return {
      lineNumbers: true,
      firstLineNumber: 0,
      lineNumberFormatter: (line: number) => (line * 4).toString(16).toUpperCase(),
      theme: 'dlx-riscv-theme',
      mode: this.codeService.editorMode,
      styleActiveLine: true,
      viewportMargin: Infinity,
      extraKeys: {
        // associa allo shortcut Ctrl + S la funzione onSave e forza un refresh della view ad Angular.
        'Ctrl-S': cm => {
          this.onSave();
          this.appRef.tick();
        }
      }
    };
  }

  get doc(): EditorFromTextArea {
    return this.codeMirrorInstance;
  }

  get currentLine(): number {
    return this.pc / 4;
  }

  set currentLine(val: number) {
    this.pc = val * 4;
    this.pcChange.emit(this.pc);
  }

  get isContinuousRunDisabled(): boolean {
    if (this.doc) {
      return (this.currentLine >= this.doc.lineCount());
    } else {
      return false;
    }
  }

  get isRunDisabled(): boolean {
    if (this.doc) {
      return (this.currentLine >= this.doc.lineCount()) || this.continuousRunning;
    } else {
      return false;
    }
  }

  get isStopDisabled(): boolean {
    return !this.running;
  }

  ngAfterViewInit() {
    const textArea = this.hostElement.nativeElement.querySelector('textarea');

    this.codeMirrorInstance = CodeMirror.fromTextArea(textArea, this.options);

    this.doc.setValue(this.codeService.content || '');

    this.doc.on('change', (event) => {
      const newValue = event.getValue();
      this.codeService.content = newValue;
      this.form.form.markAsDirty();

      if (this.running) {
        this.onStop();
      }
      if (this.errorMessage) {
        this.doc.removeLineClass(this.runnedLine, 'wrap', 'error');
        this.errorMessage = undefined;
      }
    });

    this.formStatusChangeSub = this.form.statusChanges.subscribe(v => this.formDirtyChange.emit(this.form.dirty));

    this.storeCode();
  }

  continuousRun() {
    this.continuousRunning = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.onRun();
    this.timeout = setInterval(() => {
      if (this._pc >= this.codeService.content.split('\n').length * 4) {
        clearTimeout(this.timeout);
      }
      this.onRun();
    }, this.interval);
  }

  onPause() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.continuousRunning = false;
    if (this.diagramService.isAuto()) {
      this.diagramService.pause();
      this.diagramService.setAnimationDuration(this.interval);
    }
  }

  startResetSignal() {
    // WHEN THE APPLICATION START SEND THE RESET SIGNAL TO THE LOGICAL NETWORKS
    this.memoryService.devices.forEach(el => {
      if (el instanceof LogicalNetwork) {
        (el as LogicalNetwork).startOperation();
      }
    });
  }

  onRun() {
    /*se l'interprete non sta eseguendo
    inizia da capo, ovvero va a cercare il tag di avvio ed inizia l'esecuzione dal tag
    */
    if (!this.running) {
      this.doc.removeLineClass(this.runnedLine, 'wrap', 'error');
      this.errorMessage = undefined;
      this.codeService.interpreter.parseTags(this.codeService.content, this.start);
      this.startResetSignal();
      this._pc = this.codeService.interpreter.getTag('start_tag');
      this.running = true;
      if (this.diagramService.isAuto()) {
        this.diagramService.setAnimationDuration(this.interval);
        this.diagramService.idle();
      }
    }
    /*Altrimenti riprendo da una pausa e quindi l'esecuzione riprende dalla linea in cui era stata messa in pausa */
    this.runnedLine = this.currentLine;
    this.currentLine++;
    if (this.diagramService.isAuto()) {
      this.diagramService.setAnimationDuration(this.interval);
      this.diagramService.resume();
    }
    try {
      this.codeService.interpreter.run(this.doc.getLine(this.runnedLine), this.registers, this.memoryService.memory);
    } catch (error) {
      this.onStop();
      this.doc.addLineClass(this.runnedLine, 'wrap', 'error');
      this.errorMessage = error.message;
    }

    this.memoryService.devices.forEach(el => {
      if (el instanceof StartLogicalNetwork) {
        this.isInterruptDisabled = (el as StartLogicalNetwork).startup;
      }
    });
  }

  onStop() {
    this.running = false;
    this.currentLine = 0;
    clearTimeout(this.timeout);
    this.continuousRunning = false;
    if (this.diagramService.isAuto()) {
      this.diagramService.stop();
      this.diagramService.setAnimationDuration(this.interval);
    }
  }

  onSave() {
    this.dialog.open(SaveDialogComponent);
    this.storeCode();
    window.localStorage.setItem('editor_settings', `{"start": "${this.start}", "interval": ${this.interval}}`);
  }

  browserSave() {
    this.storeCode();
    this.codeService.browserSave();
    window.localStorage.setItem('editor_settings', `{"start": "${this.start}", "interval": ${this.interval}}`);
  }

  onClear() {
    this.memoryService.removeFromMemory();
    this.codeService.clear();
    this.memoryService.init();
    this.codeService.load();
    this.storeCode();
    if (this.diagramService.isAuto()) {
      this.diagramService.stop();
    }
  }

  onInterrupt() {
    this.codeService.interpreter.interrupt(this.registers);
  }

  onInterruptPort(devName: string) {
    this.codeService.interpreter.interrupt(this.registers);
  }

  // METODO CHE SALVA IL CODICE IN MEMORIA (nella EPROM)
  // Per ogni riga invoca il metodo encode che restituisce la codifica di quella riga di comando

  storeCode() {
    this.codeService.interpreter.parseTags(this.codeService.content, this.start);
    let lines = this.codeService.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      this.memoryService.getEprom().store(i, this.codeService.encode(i));
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.form.dirty) {
      $event.returnValue = true;
    }
  }

  ngOnDestroy() {
    if (this.codeMirrorInstance) {
      this.codeMirrorInstance.toTextArea();
    }
    if (this.formStatusChangeSub) {
      this.formStatusChangeSub.unsubscribe();
    }
  }

}
