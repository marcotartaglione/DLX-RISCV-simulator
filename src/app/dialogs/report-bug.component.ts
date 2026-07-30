import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatError, MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';
import {HttpClient} from '@angular/common/http';

@Component({
  templateUrl: './report-bug.component.html',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatButton,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatDialogTitle,
    MatError,
    MatHint
  ]
})
export class ReportBugDialogComponent {
  private readonly _dialogRef = inject(MatDialogRef<ReportBugDialogComponent>);
  private readonly _http = inject(HttpClient);

  public readonly data = inject<{ code?: string, memory?: string | object }>(MAT_DIALOG_DATA, { optional: true });

  private recipientEmail?: string;
  public readonly MAX_MESSAGE_LENGTH = 500;

  public readonly messageControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(this.MAX_MESSAGE_LENGTH)
    ]
  });

  ngOnInit() {
    if (!this.recipientEmail) {
      this._http.get<{ supportEmail: string }>('assets/config.json').subscribe({
        next: (config) => {
          if (config?.supportEmail) {
            this.recipientEmail = config?.supportEmail;
          }
        },
        error: (err) => console.warn('Impossibile caricare config.json, uso email di fallback:', err)
      })
    }
  }

  protected sendEmail(): void {
    if (this.messageControl.invalid) {
      return;
    }

    const fileName = this.downloadStateFile();

    const subject = encodeURIComponent('[ BUG ] DLX-RISCV-Simulator');
    const userMessage = this.messageControl.value.trim();
    const bodyText = `Descrizione del problema:\n${userMessage}\n\n` +
      `-----------------------------------------------------------------\n` +
      `!!! IMPORTANTE - ALLEGATO NECESSARIO !!!\n` +
      `Incolla/Allega il file appena scaricato (${fileName}) prima di inviare.\n` +
      `-----------------------------------------------------------------`;

    const bodyParam = encodeURIComponent(bodyText);
    window.open(`mailto:${this.recipientEmail}?subject=${subject}&body=${bodyParam}`, '_blank');

    this._dialogRef.close(true);
  }

  private downloadStateFile(): string {
    let parsedMemory: unknown = this.data?.memory ?? null;

    if (typeof this.data?.memory === 'string') {
      try {
        parsedMemory = JSON.parse(this.data.memory);
      } catch {
        parsedMemory = this.data.memory;
      }
    }

    const payload = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      code: this.data?.code ?? '',
      memory: parsedMemory
    };

    const dateFormatted = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `simulator-dump-${dateFormatted}.json`;

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);

    return fileName;
  }
}
