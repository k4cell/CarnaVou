import { ResolveFn, Routes } from '@angular/router';

import { PaginaBloco } from './bloco/pagina-bloco';
import { acharBloco, acharLocal } from './dados/consultas';
import { Destaques } from './destaques/destaques';
import { PaginaEmBreve } from './em-breve/pagina-em-breve';
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
  { path: 'local/:local/:bloco', component: PaginaBloco, title: tituloDoBloco },
  {
    path: 'mapa',
    // O mapa (e o MapLibre, que pesa) só é baixado quando a pessoa abre esta aba.
    loadComponent: () => import('./mapa/pagina-mapa').then((modulo) => modulo.PaginaMapa),
    title: `Mapa · ${NOME_DO_SITE}`,
  },
  // Abas do menu que ainda não existem: só mostram "Em breve".
  { path: 'amigos', component: PaginaEmBreve, data: { titulo: 'Amigos' }, title: `Amigos · ${NOME_DO_SITE}` },
  {
    path: 'favoritos',
    component: PaginaEmBreve,
    data: { titulo: 'Favoritos' },
    title: `Favoritos · ${NOME_DO_SITE}`,
  },
  { path: '**', redirectTo: '' },
];
