import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AbasDoDia } from '../abas/abas-do-dia';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { ZonaTag } from '../zona/zona-tag';
import { linkDoGoogleMaps, linkDoWaze } from './links';
import { MapaBase, PontoNoMapa } from './mapa-base';

/** A aba Mapa: os lugares da aba escolhida (Hoje, Amanhã ou Geral) como pontos no mapa. */
@Component({
  selector: 'app-pagina-mapa',
  imports: [AbasDoDia, MapaBase, RouterLink, ZonaTag],
  templateUrl: './pagina-mapa.html',
  styleUrl: './pagina-mapa.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaMapa {
  private readonly filtro = inject(FiltroDeDia);

  /** O lugar em que a pessoa tocou. */
  private readonly escolhido = signal<string | null>(null);

  protected readonly vazio = computed(() => this.filtro.cartoes().length === 0);
  protected readonly mensagemVazia = this.filtro.mensagemVazia;

  protected readonly pontos = computed<PontoNoMapa[]>(() =>
    this.filtro.cartoes().map(({ local }) => ({
      id: local.id,
      nome: local.nome,
      lat: local.lat,
      lng: local.lng,
      zona: local.zona,
    })),
  );

  /** O lugar escolhido, se ele ainda está na aba de agora (trocar de aba pode tirá-lo). */
  protected readonly cartao = computed(() =>
    this.filtro.cartoes().find((cartao) => cartao.local.id === this.escolhido()),
  );

  protected readonly links = computed(() => {
    const local = this.cartao()?.local;
    return local
      ? { google: linkDoGoogleMaps(local.lat, local.lng), waze: linkDoWaze(local.lat, local.lng) }
      : undefined;
  });

  protected escolher(id: string): void {
    this.escolhido.set(id);
  }

  protected fechar(): void {
    this.escolhido.set(null);
  }
}
