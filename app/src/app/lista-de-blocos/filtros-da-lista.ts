import { Injectable, computed, inject, signal } from '@angular/core';

import { blocoCombinaComABusca } from '../dados/lista-de-blocos';
import { Bloco } from '../dados/tipos';
import { Favoritos } from '../favoritos/favoritos';

/**
 * A busca e os filtros da aba Blocos. Ficam aqui, e não na tela, para continuarem valendo quando a
 * pessoa abre um bloco e volta para a lista.
 */
@Injectable({ providedIn: 'root' })
export class FiltrosDaLista {
  private readonly favoritos = inject(Favoritos);

  readonly busca = signal('');
  /** O id do lugar escolhido. Vazio: todos os lugares. */
  readonly lugar = signal('');
  readonly soFavoritos = signal(false);

  readonly buscando = computed(() => this.busca().trim() !== '');
  readonly algumFiltro = computed(() => this.buscando() || this.lugar() !== '' || this.soFavoritos());

  /** Se o bloco entra na lista, com a busca e os filtros de agora. */
  readonly incluir = computed(() => {
    const busca = this.busca();
    const lugar = this.lugar();
    const soFavoritos = this.soFavoritos();
    return (bloco: Bloco) =>
      (lugar === '' || bloco.localId === lugar) &&
      (!soFavoritos || this.favoritos.tem(bloco.id)) &&
      blocoCombinaComABusca(bloco, busca);
  });

  limpar(): void {
    this.busca.set('');
    this.lugar.set('');
    this.soFavoritos.set(false);
  }
}
