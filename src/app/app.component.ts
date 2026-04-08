import {Component, DestroyRef, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {Subscription} from 'rxjs';
import {MainPageComponent} from './main-page/main-page.component';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  standalone: true,
  imports: [
    MatToolbar,
    MatIconButton,
    MatTooltip,
    MatButton,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {
  protected readonly theme = signal<'light' | 'dark'>('light');
  protected readonly currentTheme = signal<'light' | 'dark'>('dark');
  protected readonly isSidebarOpened = signal(false);

  private _activeMainPage: MainPageComponent = null;

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.applyTheme(theme);
    });
  }

  ngOnInit() {
    this.theme.set('dark');
  }

  public onRouterOutletActivate(component: any) {
    if (component instanceof MainPageComponent) {
      this._activeMainPage = component;
      component.sidebarOpened.set(this.isSidebarOpened());

      component.sidebarOpened.subscribe(val => {
        this.isSidebarOpened.set(val);
      })
    } else {
      this._activeMainPage = null;
      throw new Error('Activated component is not an instance of MainPageComponent');
    }
  }

  protected toggleSidenav() {
    this.isSidebarOpened.update(val => !val);
    this._activeMainPage?.toggleSidenav();
  }

  protected toggleTheme() {
    this.currentTheme.update(theme => theme === 'light' ? 'dark' : 'light');
  }

  private applyTheme(theme: 'light' | 'dark') {
    const htmlElement = document.documentElement;
    const classes = htmlElement.classList;

    const toRemove = Array.from(classes).filter(c => c.includes('-theme'));
    if (toRemove.length) {
      classes.remove(...toRemove);
    }

    classes.add(`${theme}-theme`);
  }
}
