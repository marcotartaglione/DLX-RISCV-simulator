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
        "LHI R29, 0XC000\t\t\t\t\t\t; load address C0000000h in R29\n" +
        "LBU R30, 0x0000(R29)\t\t\t\t; load STARTUP value in R30\n" +
        "BEQZ R30, handler\t\t\t\t\t; if STARTUP == 0 then jump to interrupt handler\n"+
        "SB 0x0004(R29), R0\t\t\t\t\t; set startup = 0\n"+
        "J main\t\t\t\t\t\t\t\t; jump to main\n"+
        "handler: LHI R28, 0x9000\t\t\t; load address 90000000h in R27\n"+
        "\t\tSB 0x0004(R28), R0\t\t\t; switch led state\n"+
        "\t\tRFE\n\n"+
        "main:\tADDI R1,R0,0x0000\t\t\t; set R1 = 0\n"+
        "\t\tADDI R2,R0,0x0001\t\t\t; set R2 = 1\n"+
        "\t\tADDI R3,R0,0x0001\t\t\t; set R3 = 1\n"+
        "\t\tADDI R4,R0,0x0014\t\t\t; set counter R4 = 20\n"+
        "\t\tLHI R10, 0x4000\t\t\t\t; Load address 40000000h in R10\n\n"+
        "loop:\tADD R1,R2,R0\t\t\t\t; copy the value of R2 in R1\n"+
        "\t\tADD R2,R3,R0\t\t\t\t; copy the value of R3 in R2\n"+
        "\t\tADD R3,R2,R1\t\t\t\t; R3 = R2 + R1\n"+
        "\t\tSUBI R4,R4,0x0001\t\t\t; decrease R4 by 1\n"+
        "\t\tSW 0x0000(R10),R3\t\t\t; Store R3 in memory\n"+
        "\t\tBEQZ R4,main\t\t\t\t; Jump to main if R4 = 0\n"+
        "\t\tADDI R10,R10,0x0004\t\t\t; increase R10 by 0004h\n"+
        "\t\tJ loop\t\t\t\t\t\t; Jump to loop"
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
