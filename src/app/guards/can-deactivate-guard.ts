import {inject, Injectable} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';
import { MainPageComponent } from '../main-page/main-page.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<MainPageComponent> {

  private dialog = inject(MatDialog);

  canDeactivate(component: MainPageComponent): Observable<boolean> {
    if(component.contentModified()){
      return this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            message: 'Do you have unsaved changes ? If you leave, without saving, your changes will be lost',
            ok: 'Leave',
            ko: 'Cancel'
          }
        })
        .afterClosed();
    }
    return of(true);
  }
}
