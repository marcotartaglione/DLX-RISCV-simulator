import { Injectable } from '@angular/core';
import { Interpreter } from '../interpreters/interpreter';

@Injectable({
  providedIn: 'root'
})
export class CodeService {

  public content: string;
  public interpreter: Interpreter;
  public editorMode: string;

  constructor() {
  }

  load() {
    this.content = window.localStorage.getItem(`code-${this.editorMode}`) ||
      (this.editorMode == 'dlx' ?
      'LHI R29, 0xC000\t\t\t\t\t; cs_read_start\nLBU R30, 0x0000(R29)\nBEQZ R30, handler\t\t\t\t; if start == 0 then jump to interrupt handler\nSB 0x0004(R29), R0\t\t\t\t; set start to 0\nJ main\t\t\t\t\t\t\t; jump to start tag defined under this window\n\nhandler: LHI R27, 0x9000\n         SB 0x0004(R27),R0\n         RFE\n\nmain: '
        : 'main: ')
      ;
  }

  save() {
    window.localStorage.setItem(`code-${this.editorMode}`, this.content);
  }

  clear() {
    window.localStorage.removeItem(`code-${this.editorMode}`);
  }

  encode(lineN: number): number {
    return this.interpreter.encode(this.content.split('\n')[lineN]);
  }
}
