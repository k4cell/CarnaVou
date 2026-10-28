import { RenderMode, ServerRoute } from '@angular/ssr';

import { BLOCOS } from './dados/blocos';
import { LOCAIS } from './dados/locais';

// Cada lugar e cada bloco vira uma página pronta, para o link abrir rápido e a prévia sair certa.
export const serverRoutes: ServerRoute[] = [
  {
    path: 'local/:local',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => LOCAIS.map((local) => ({ local: local.id })),
  },
  {
    path: 'local/:local/:bloco',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      BLOCOS.map((bloco) => ({ local: bloco.localId, bloco: bloco.id })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
