import { ResolveFn, Routes } from '@angular/router';

import { PaginaBloco } from './bloco/pagina-bloco';
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
  { path: 'local/:local/:bloco', component: PaginaBloco, title: tituloDoBloco },
  { path: '**', redirectTo: '' },
];
