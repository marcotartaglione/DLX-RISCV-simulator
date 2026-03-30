import {BreakpointObserver} from '@angular/cdk/layout';
import {Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {Registers} from '../registers/registers';
import {CodeService} from '../services/code.service';
import { DiagramService } from '../services/diagram.service';
import {MemoryService} from '../services/memory.service';
import {DocumentationComponent} from '../documentation/documentation.component';
import {EditorComponent} from '../editor/editor.component';
import {MatButton} from '@angular/material/button';
import {MemoryComponent} from '../memory/memory.component';
import {DiagramComponent} from '../diagram/diagram.component';
import {RegistersComponent} from '../registers/registers.component';

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
export class MainPageComponent implements OnDestroy{

  private routeDataSub: Subscription;
  private breakpointSub: Subscription;
  private diagramsOpened: boolean = false;//mi dice se i diagrammi sono visibili o no

  registers: Registers;
  sidebarMode: 'over' | 'push' | 'side' = 'side';

  @ViewChild('sidenav', {static: true}) sidenav: MatSidenav;

  @Input() sidebarOpened: boolean;
  @Output() sidebarOpenedChange: EventEmitter<number> = new EventEmitter();

  isFormDirty: boolean;

  constructor(
    public codeService: CodeService,
    public memoryService: MemoryService,
    public diagramService: DiagramService,
    route: ActivatedRoute,
    breakpointObserver: BreakpointObserver
  ) {
    this.breakpointSub = breakpointObserver.observe('(max-width: 935px)').subscribe(result => {
      if (result.matches) {
        this.sidebarMode = 'over';
      } else {
        this.sidebarMode = 'side';
      }
    });
    this.routeDataSub = route.data.subscribe(data => {
      this.registers = data.registers;
      this.codeService.interpreter = data.interpreter;
      this.codeService.editorMode = data.editorMode;
      this.codeService.load();
    });
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  toggleDiagrams(){
    if(!this.diagramsOpened){
      this.diagramsOpened = true;
    }else{
      this.diagramsOpened = false;
    }
  }

  isDiagramsOpened(){
    return this.diagramsOpened;
  }

  ngOnDestroy() {
    if (this.routeDataSub) {
      this.routeDataSub.unsubscribe();
    }
    if (this.breakpointSub) {
      this.breakpointSub.unsubscribe();
    }
  }

}
