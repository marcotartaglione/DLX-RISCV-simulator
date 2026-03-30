import {enableProdMode, importProvidersFrom} from '@angular/core';
import '@fortawesome/fontawesome-free/js/all';
import { environment } from './environments/environment';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideRouter, withHashLocation, withRouterConfig} from '@angular/router';
import {MatNativeDateModule} from '@angular/material/core';
import {routes} from './app/app-routing.module';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        onSameUrlNavigation: 'reload',
      }),
      withHashLocation()
    ),
    importProvidersFrom(MatNativeDateModule)
  ]
}).catch(err => console.error(err));
