import {BreakpointObserver} from '@angular/cdk/layout';
import {Component, computed, inject, model, signal, viewChild} from '@angular/core';
import {MatDrawerMode, MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs';
import {CodeService} from '../services/code.service';
import {DocumentationComponent} from '../documentation/documentation.component';
import {EditorComponent} from '../editor/editor.component';
import {MatButton} from '@angular/material/button';
import {MemoryComponent} from '../memory/memory.component';
import {DiagramComponent} from '../diagram/diagram.component';
import {RegistersComponent} from '../registers/registers.component';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.sass'],
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatSidenav,
    DocumentationComponent,
    EditorComponent,
    MatButton,
    MemoryComponent,
    DiagramComponent,
    RegistersComponent,
    MatSidenavContent
  ]
})
export class MainPageComponent {
  private readonly _codeService = inject(CodeService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _breakpointObserver = inject(BreakpointObserver);

  private readonly sidenav = viewChild.required<MatSidenav>('sidenav');

  private readonly _routeData = toSignal(this._route.data);
  protected readonly registers = computed(() => this._routeData()?.['registers']);

  public readonly sidebarOpened = model<boolean>(true, {alias: 'sidebarOpened'});
  public readonly contentModified = signal(false);
  protected readonly diagramsOpened = signal(false);

  private readonly _isMobile = toSignal(
    this._breakpointObserver.observe('(max-width: 953px)').pipe(map(result => result.matches))
  );
  protected readonly sidebarMode = computed<MatDrawerMode>(() => this._isMobile() ? 'over' : 'side');

  constructor() {
    const data = this._routeData();

    if (!data) {
      return;
    }

    this._codeService.interpreter = data.interpreter;
    this._codeService.editorMode = data.editorMode;
    this._codeService.load();
  }

  public toggleSidenav() {
    this.sidenav().toggle();
  }

  public toggleDiagrams() {
    this.diagramsOpened.update(opened => !opened);
  }
}
