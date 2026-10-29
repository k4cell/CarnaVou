import { InjectionToken } from '@angular/core';
import type * as MapLibre from 'maplibre-gl';

/** O MapLibre inteiro, do jeito que o `import()` entrega. */
export type BibliotecaDeMapa = typeof MapLibre;

/** O endereço de um arquivo do site, a partir da base da página (que pode não ser a raiz). */
export function enderecoNoSite(caminho: string): string {
  return new URL(caminho, document.baseURI).href;
}

function carregarOEstiloDoMapLibre(): Promise<void> {
  const endereco = enderecoNoSite('mapa/maplibre-gl.css');
  if (document.querySelector(`link[href="${endereco}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = endereco;
    link.onload = () => resolve();
    // Se o estilo não vier, o mapa ainda abre: só os controles e os créditos ficam sem estilo.
    link.onerror = () => {
      console.warn('Não consegui carregar o estilo do mapa.');
      resolve();
    };
    document.head.appendChild(link);
  });
}

/**
 * O MapLibre não faz parte do código do Angular. O build copia os arquivos dele de
 * `node_modules` para a pasta `mapa/` do site (veja o angular.json) e ele só é baixado aqui,
 * quando a pessoa abre o mapa. Assim o service worker (o que faz o site funcionar como app)
 * não baixa os cerca de 250 kB do MapLibre na primeira visita: só guarda quem abriu o mapa.
 */
async function carregarDoSite(): Promise<BibliotecaDeMapa> {
  const [biblioteca] = await Promise.all([
    import(/* @vite-ignore */ enderecoNoSite('mapa/maplibre-gl.mjs')) as Promise<BibliotecaDeMapa>,
    carregarOEstiloDoMapLibre(),
  ]);
  return biblioteca;
}

/**
 * Como o MapLibre é carregado. Nos testes, este provedor troca o MapLibre por um falso, que não
 * precisa de WebGL nem de internet.
 */
export const CARREGAR_MAPLIBRE = new InjectionToken<() => Promise<BibliotecaDeMapa>>('CARREGAR_MAPLIBRE', {
  providedIn: 'root',
  factory: () => carregarDoSite,
});
