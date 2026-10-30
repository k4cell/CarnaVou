import { ResolveFn, Routes } from '@angular/router';

import { acharBloco, acharLocal } from './dados/consultas';
import { Destaques } from './destaques/destaques';
import { PaginaLocal } from './local/pagina-local';

const NOME_DO_SITE = 'CarnaVou';

const tituloDoLocal: ResolveFn<string> = (rota) => {
  const lugar = acharLocal(rota.params['local']);
  return lugar ? `${lugar.nome} · ${NOME_DO_SITE}` : NOME_DO_SITE;
};

const tituloDoBloco: ResolveFn<string> = (rota) => {
  const bloco = acharBloco(rota.params['local'], rota.params['bloco']);
  return bloco ? `${bloco.nome} · ${NOME_DO_SITE}` : NOME_DO_SITE;
};

export const routes: Routes = [
  { path: '', component: Destaques, title: NOME_DO_SITE },
  { path: 'local/:local', component: PaginaLocal, title: tituloDoLocal },
  {
    path: 'local/:local/:bloco',
    // A página do bloco traz o itinerário em texto, que pesa: só é baixada quando alguém abre um bloco.
    loadComponent: () => import('./bloco/pagina-bloco').then((modulo) => modulo.PaginaBloco),
    title: tituloDoBloco,
  },
  {
    path: 'blocos',
    loadComponent: () => import('./lista-de-blocos/pagina-blocos').then((modulo) => modulo.PaginaBlocos),
    title: `Blocos · ${NOME_DO_SITE}`,
  },
  {
    path: 'after',
    loadComponent: () => import('./after/pagina-after').then((modulo) => modulo.PaginaAfter),
    title: `After · ${NOME_DO_SITE}`,
  },
  {
    path: 'mapa',
    // O mapa (e o MapLibre, que pesa) só é baixado quando a pessoa abre esta aba.
    loadComponent: () => import('./mapa/pagina-mapa').then((modulo) => modulo.PaginaMapa),
    title: `Mapa · ${NOME_DO_SITE}`,
  },
  // Endereços que não existem (inclusive os antigos /amigos e /favoritos) voltam para o início.
  { path: '**', redirectTo: '' },
];
