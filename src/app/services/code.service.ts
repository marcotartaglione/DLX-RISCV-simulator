import {inject, Injectable, signal} from '@angular/core';
import {Interpreter} from '../interpreters/interpreter';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  public static SAVED_SCRIPT = 'storage';

  public static STARTING_SCRIPT = {
    dlx: [CodeService.SAVED_SCRIPT, 'fibonacci', 'array_sum'],
    rv32i: [CodeService.SAVED_SCRIPT]
  }

  public content = signal('');
  public interpreter: Interpreter;
  public editorMode: string;
  private _httpClient = inject(HttpClient);

  public get linesCount(): number {
    return this.content().split('\n').length;
  }

  public load(script?: string) {
    let localCode = window.localStorage.getItem(`code-${this.editorMode}`);

    if (script === CodeService.SAVED_SCRIPT || script === undefined) {
      if (!localCode) {
        localCode = '; No program saved in storage.';
      }

      this.content.set(localCode);
      return;
    }

    if (this.editorMode === 'dlx') {
      const url = `/assets/scripts/${script}.${this.editorMode}`
      this._httpClient.get(url, {responseType: 'text'}).subscribe({
        next: (val) => this.content.set(val),
      });
    }
  }

  public saveInLocalStorage(fileName?: string) { // saves the code locally on a file
    window.localStorage.setItem(`code-${this.editorMode}`, this.content());

    if (fileName && fileName.trim() !== '') {
      this.download(fileName);
    }
  }

  public download(fileName: string) { // downloads the code as a file
    const text = this.content();
    const blob = new Blob([text], {type: 'text/plain'});
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = '_blank';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  public removeFromLocalStorage() {
    window.localStorage.removeItem(`code-${this.editorMode}`);
  }

  public encode(lineIndex: number): number {
    return this.interpreter.encode(this.content().split('\n')[lineIndex]);
  }
}
