import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: os pedaços do endereço (:local, :bloco) chegam como input().
    provideRouter(
      routes,
      withComponentInputBinding(),
      // A página nova abre no topo, e voltar devolve a lista no ponto em que ela estava.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      // Baixa as outras telas logo depois da primeira: na multidão, o toque não depende da internet.
      // O MapLibre fica de fora: ele só é baixado quando a aba Mapa abre.
      withPreloading(PreloadAllModules),
    ),
    provideClientHydration(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
