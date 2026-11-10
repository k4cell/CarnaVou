import { Injectable, computed, inject, signal } from '@angular/core';

import { diaIso, diaSeguinte } from '../dados/agenda';
import { montarBusca, textoSemOQuando } from '../dados/busca';
import { acharLocal } from '../dados/consultas';
import { dataPorExtenso } from '../dados/formato';
import { Bloco, Zona } from '../dados/tipos';
import { Favoritos } from '../favoritos/favoritos';
import { Relogio } from '../relogio/relogio';

/**
 * A busca e os filtros da aba Blocos. Ficam aqui, e não na tela, para continuarem valendo quando a
 * pessoa abre um bloco e volta para a lista.
 */
@Injectable({ providedIn: 'root' })
export class FiltrosDaLista {
  private readonly favoritos = inject(Favoritos);
  private readonly relogio = inject(Relogio);

  readonly busca = signal('');
  /** O id do lugar escolhido. Vazio: todos os lugares. */
  readonly lugar = signal('');
  /** A zona escolhida, quando o filtro é por uma zona inteira e não por um lugar só. */
  readonly zona = signal<Zona | ''>('');
  readonly soFavoritos = signal(false);

  readonly buscando = computed(() => this.busca().trim() !== '');
  /** Verdade quando o filtro é por um lugar ou por uma zona. */
  readonly temOnde = computed(() => this.lugar() !== '' || this.zona() !== '');
  readonly algumFiltro = computed(() => this.buscando() || this.temOnde() || this.soFavoritos());

  /** Filtra por um lugar ou por uma zona inteira: um tira o outro. Sem nada, valem todos os lugares. */
  escolherOnde(onde: { lugar?: string; zona?: Zona } = {}): void {
    this.lugar.set(onde.lugar ?? '');
    this.zona.set(onde.zona ?? '');
  }

  /** A busca entendida: as palavras e o dia (ou o "agora") que ela tirou do texto. */
  private readonly buscaMontada = computed(() => montarBusca(this.busca(), this.relogio.agora()));

  /** O dia que a busca entendeu, para a etiqueta: "Hoje", "Amanhã", "Rolando agora" ou a data. */
  readonly quando = computed(() => {
    const quando = this.buscaMontada().quando;
    const agora = this.relogio.agora();
    if (!quando || !agora) {
      return null;
    }
    if (quando.tipo === 'agora') {
      return 'Rolando agora';
    }
    if (quando.dia === diaIso(agora)) {
      return 'Hoje';
    }
    return quando.dia === diaIso(diaSeguinte(agora)) ? 'Amanhã' : dataPorExtenso(quando.dia);
  });

  /** Tira da busca as palavras de tempo, e com elas o filtro do dia. */
  tirarOQuando(): void {
    this.busca.set(textoSemOQuando(this.busca()));
  }

  /** Se o bloco entra na lista, com a busca e os filtros de agora. */
  readonly incluir = computed(() => {
    const combinaComABusca = this.buscaMontada().combina;
    const lugar = this.lugar();
    const zona = this.zona();
    const soFavoritos = this.soFavoritos();
    return (bloco: Bloco) =>
      (lugar === '' || bloco.localId === lugar) &&
      (zona === '' || acharLocal(bloco.localId)?.zona === zona) &&
      (!soFavoritos || this.favoritos.tem(bloco.id)) &&
      combinaComABusca(bloco);
  });

  limpar(): void {
    this.busca.set('');
    this.escolherOnde();
    this.soFavoritos.set(false);
  }
}
