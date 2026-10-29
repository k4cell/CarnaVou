import { InjectionToken } from '@angular/core';
import type * as MapLibre from 'maplibre-gl';

/** O MapLibre inteiro, do jeito que o `import('maplibre-gl')` entrega. */
export type BibliotecaDeMapa = typeof MapLibre;

/**
 * Como o MapLibre é carregado. É um `import()` dinâmico: o MapLibre pesa uns 200 kB, então só
 * é baixado quando a pessoa abre o mapa. Nos testes, este provedor troca o MapLibre por um falso.
 */
export const CARREGAR_MAPLIBRE = new InjectionToken<() => Promise<BibliotecaDeMapa>>('CARREGAR_MAPLIBRE', {
  providedIn: 'root',
  factory: () => () => import('maplibre-gl'),
});
