import type { Feature, FeatureCollection } from 'geojson';

import { Zona } from '../dados/tipos';
import { contornoDoCirculo } from './circulo';
import type { PontoNoMapa, PosicaoNoMapa, TrajetoNoMapa } from './mapa-base';

/*
 * O que o mapa desenha: os dados de cada camada (em GeoJSON) e os elementos da tela que ficam por
 * cima dele (o pino e a bolinha da pessoa). Não depende do MapLibre: o MapaBase pega isto pronto
 * e entrega para ele.
 */

/** Os dados de uma camada do mapa. */
export type Desenho = Feature | FeatureCollection;

/** O fim da linha só ganha a bolinha quando fica longe do começo (numa volta, eles se encontram). */
const DISTANCIA_PARA_MARCAR_O_FIM = 0.0003;

/** A cor de cada zona: a mesma dos pinos e das etiquetas (variáveis de `styles.scss`). */
const CORES_DAS_ZONAS: Record<Zona, [string, string]> = {
  centro: ['--roxo', '#6a0dad'],
  sul: ['--verde', '#00e676'],
  leste: ['--amarelo', '#ffc200'],
  oeste: ['--vermelho', '#d62828'],
  norte: ['--azul', '#2563eb'],
};

/** A cor vem das variáveis do app (`styles.scss`), para o mapa e o resto do site combinarem. */
export function corDoTema(variavel: string, padrao: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variavel).trim() || padrao;
}

function corDaZona(zona: Zona): string {
  const [variavel, padrao] = CORES_DAS_ZONAS[zona];
  return corDoTema(variavel, padrao);
}

/** O círculo de precisão em volta da pessoa (ou nada, quando ela não pediu para aparecer). */
export function areaDaPrecisao(voce: PosicaoNoMapa | null): Desenho {
  if (!voce) {
    return { type: 'FeatureCollection', features: [] };
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [contornoDoCirculo(voce.lat, voce.lng, voce.precisao)] },
  };
}

/** As linhas e, onde cada uma termina longe do começo, uma bolinha de "fim". */
export function linhasDosTrajetos(trajetos: TrajetoNoMapa[], selecionado: string | null): Desenho {
  const linhas: Feature[] = trajetos.map((trajeto) => ({
    type: 'Feature',
    properties: { id: trajeto.id, cor: corDaZona(trajeto.zona), selecionado: trajeto.id === selecionado },
    geometry: { type: 'LineString', coordinates: trajeto.linha },
  }));
  const fins: Feature[] = trajetos.flatMap((trajeto) => {
    const comeco = trajeto.linha[0];
    const fim = trajeto.linha.at(-1);
    if (!comeco || !fim || Math.hypot(fim[0] - comeco[0], fim[1] - comeco[1]) < DISTANCIA_PARA_MARCAR_O_FIM) {
      return [];
    }
    return [
      {
        type: 'Feature',
        properties: { id: trajeto.id, cor: corDaZona(trajeto.zona) },
        geometry: { type: 'Point', coordinates: fim },
      },
    ];
  });
  return { type: 'FeatureCollection', features: [...linhas, ...fins] };
}

/** As bolinhas dos pontos, na cor da zona. O ponto escolhido vira o pino, então sai daqui. */
export function bolinhasDosPontos(pontos: PontoNoMapa[], selecionado: string | null): Desenho {
  return {
    type: 'FeatureCollection',
    features: pontos
      .filter((ponto) => ponto.id !== selecionado)
      .map((ponto) => ({
        type: 'Feature',
        properties: { id: ponto.id, cor: corDaZona(ponto.zona) },
        geometry: { type: 'Point', coordinates: [ponto.lng, ponto.lat] },
      })),
  };
}

export function criarBolinhaDaPessoa(): HTMLDivElement {
  const bolinha = document.createElement('div');
  bolinha.className = 'voce';
  bolinha.setAttribute('role', 'img');
  bolinha.setAttribute('aria-label', 'Você está aqui');
  return bolinha;
}

const PINO_SVG =
  '<svg viewBox="0 0 32 44" aria-hidden="true" focusable="false">' +
  '<path d="M16 1C8 1 2 7.2 2 15c0 10.5 14 28 14 28s14-17.5 14-28C30 7.2 24 1 16 1z"/>' +
  '<circle cx="16" cy="15" r="5.5"/></svg>';

/** O pino do ponto escolhido: um botão com o nome, para o leitor de tela. */
export function criarPino(ponto: PontoNoMapa, aoEscolher: (id: string) => void): HTMLButtonElement {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = `pino pino-${ponto.zona} selecionado`;
  botao.setAttribute('aria-label', ponto.nome);
  botao.setAttribute('aria-pressed', 'true');
  botao.innerHTML = PINO_SVG;
  botao.addEventListener('click', (evento) => {
    evento.stopPropagation();
    aoEscolher(ponto.id);
  });
  return botao;
}
