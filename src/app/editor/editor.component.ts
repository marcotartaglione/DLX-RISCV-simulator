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
import './modes/dlx';
import './modes/rv32i.js';
import {LogicalNetwork} from '../memory/model/logical-network';
import {MatCard} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import {DLX_INSTRUCTIONS} from '../interpreters/dlx/dlx.instructions';

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
    MatLabel,
    MatSelect,
    MatOption,
    MatTooltip
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
  protected selectedScript = signal('');
  protected readonly CodeService = CodeService;
  private _codeService = inject(CodeService);
  protected editorMode = computed(() => this._codeService.editorMode);
  private _memoryService = inject(MemoryService);
  private _diagramService = inject(DiagramService);
  private _appRef = inject(ApplicationRef);
  private _dialog = inject(MatDialog);
  private _hostElement = viewChild<ElementRef>('hostElement');
  private _form = viewChild<NgForm>('form');
  private _codeMirror = signal<EditorFromTextArea | null>(null);
  protected readonly isContinuousRunDisabled = computed(() =>
    this._codeMirror() ? (this.addressToLine(this.pc()) >= this._codeMirror().lineCount()) : false
  );
  private _isRunning = signal(false);
  protected isStopDisabled = computed(() =>
    !this._isRunning()
  );
  private _formStatusChangeSub: Subscription;
  private _timeout: any;
  private _exRunnedInstruction = -1;
  private _runnedInstruction = -1;

  constructor() {
    this.initEditorSettings();

    effect(() => {
      if (!this._codeMirror()) {
        return;
      }

      this.updateVisuals(this._exRunnedInstruction, this._runnedInstruction, this.pc());
    });

    effect(() => {
      const newContent = this._codeService.content();
      const editor = this._codeMirror();

      if (editor && editor.getValue() !== newContent) {
        editor.setValue(newContent);
      }
    });

    effect(() => {
      const mode = this.editorMode();
      const script = this.selectedScript();

      if (!script && CodeService.STARTING_SCRIPT[mode]?.length > 0) {
        this.selectedScript.set(CodeService.STARTING_SCRIPT[mode][0]);
        return;
      }

      if (script) {
        this._codeService.load(script);
      }
    });
  }

  private _keepRunning = false;

  protected isRunDisabled = computed(() =>
    this._codeMirror() ? (this.addressToLine(this.pc()) >= this._codeMirror().lineCount()) || this._keepRunning : false
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
        'Ctrl-Space': 'autocomplete',
        'Ctrl-S': () => {
          this.save();
          this._appRef.tick();
        }
      },
      hintOptions: {
        hint: (CodeMirror as any).hint[this._codeService.editorMode]
      }
    };
  }

  ngAfterViewInit() {
    const textArea = this._hostElement().nativeElement.querySelector('textarea');

    this._codeMirror.set(CodeMirror.fromTextArea(textArea, this.options));
    this._codeMirror().setValue(this._codeService.content() || '');

    this._codeMirror().on('inputRead', (cm, change) => {
      const cursor = cm.getCursor();
      const posBeforeTrigger = {line: cursor.line, ch: Math.max(0, cursor.ch - 2)};

      const token = cm.getTokenAt(cursor);
      const wordRange = cm.findWordAt(posBeforeTrigger);
      const word = cm.getRange(wordRange.anchor, wordRange.head);
      const upperWord = word.toUpperCase();

      if (!change.origin || change.origin !== '+delete') {
        if (token.type !== 'comment' && /^[a-zA-Z0-9]$/.test(change.text[0])) {
          (cm as any).showHint({completeSingle: false});
        }
      }

      const isInstruction = (DLX_INSTRUCTIONS as readonly string[]).includes(upperWord);
      const isRegister = /^(R([12]?\d|3[01])|IAR)$/i.test(word);

      if (isInstruction || isRegister) {
        if (word !== upperWord) {
          cm.replaceRange(
            upperWord,
            wordRange.anchor,
            wordRange.head,
            '*ignore'
          );
        }
      }
    });

    this._codeMirror().on('change', (instance, _change) => {
      this._codeService.content.set(instance.getValue());
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

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'F8':
        event.preventDefault();
        if (!this.isRunDisabled()) {
          this.executeNextInstruction();
        }
        break;
      case 'F9':
        event.preventDefault();
        if (!this.isContinuousRunDisabled()) {
          this.keepRunning ? this.pause() : this.run();
        }
        break;
      case 'F10':
        event.preventDefault();
        this.stop();
        break;
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

  protected selectedScriptChange(value: string) {
    this.selectedScript.set(value);
    this._codeService.load(value);
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

      this._codeService.interpreter.parseTags(this._codeService.content(), this.startTag());

      if (isNaN(this._codeService.interpreter.getTag('start_tag'))) {
        this.errorMessage.set('Start tag not found');
        return;
      }

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
      const newPc = this._codeService.interpreter.execute(
        this._codeMirror().getLine(this.addressToLine(this.pc())),
        this.registers(),
        this._memoryService.memory
      );

      this.pc.set(newPc);
    } catch (error) {
      const lineWithError = this.addressToLine(this.pc());
      this.stop();

      // Necessary due to visuals update after stop, which removes error highlights
      setTimeout(() => {
        this._codeMirror().addLineClass(lineWithError, 'wrap', 'error');
        this.errorMessage.set(error.message);
        this._appRef.tick();
      }, 0);
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
      this._codeService.saveInLocalStorage();
    }

    this.storeCodeInEprom();
    this.persistSettings();
  }

  protected clear() {
    this._memoryService.removeFromMemory();
    this._codeService.removeFromLocalStorage();
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
    this._codeService.interpreter.parseTags(this._codeService.content(), this.startTag());
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
