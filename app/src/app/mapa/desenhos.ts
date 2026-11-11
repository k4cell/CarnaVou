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

export function corDaZona(zona: Zona): string {
  const [variavel, padrao] = CORES_DAS_ZONAS[zona];
  return corDoTema(variavel, padrao);
}

/** As zonas cuja cor (verde e amarelo) pede número escuro; nas outras, o número é branco. */
export const ZONAS_DE_NUMERO_ESCURO: readonly Zona[] = ['sul', 'leste'];

/** A cor dos bares e pontos de encontro do After. */
export function corDoAfter(): string {
  return corDoTema('--azul', '#2563eb');
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

/** O número que vai no ponto: quantos blocos (ou bares) ele junta, só quando são dois ou mais. */
export function numeroDoPonto(ponto: PontoNoMapa): string {
  return (ponto.quantos ?? 1) >= 2 ? String(ponto.quantos) : '';
}

/**
 * Verde e amarelo (Sul e Leste) pedem número escuro; as outras, branco. No pino pequeno do After, o
 * número fica na bolinha branca do meio, então é escuro.
 */
function corDoNumero(ponto: PontoNoMapa): string {
  return ponto.after || ZONAS_DE_NUMERO_ESCURO.includes(ponto.zona)
    ? corDoTema('--texto', '#121214')
    : corDoTema('--cartao', '#fff');
}

/**
 * Os pontos. O de um bloco é uma bolinha cheia, na cor da zona, com a borda branca. O de um lugar do
 * After é um pino pequeno azul, para não se confundir (veja `imagemDoPinoPequeno`). O que junta dois
 * ou mais leva o número dentro. O ponto escolhido vira o pino grande, então sai daqui. Os pontos muito
 * perto um do outro o próprio mapa junta num grupo (veja `MapaBase`).
 */
export function bolinhasDosPontos(pontos: PontoNoMapa[], selecionado: string | null): Desenho {
  return {
    type: 'FeatureCollection',
    features: pontos
      .filter((ponto) => ponto.id !== selecionado)
      .map((ponto) => ({
        type: 'Feature',
        properties: {
          id: ponto.id,
          cor: ponto.after ? corDoAfter() : corDaZona(ponto.zona),
          borda: corDoTema('--cartao', '#fff'),
          after: !!ponto.after,
          // Para o grupo saber de que zona tem mais blocos e ficar na cor dela.
          zona: ponto.zona,
          numero: numeroDoPonto(ponto),
          corDoNumero: corDoNumero(ponto),
          // Para o mapa somar, quando o ponto entra num grupo.
          quantos: ponto.quantos ?? 1,
        },
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

/** A gota do pino, num quadro de 32 × 44. */
const GOTA = 'M16 1C8 1 2 7.2 2 15c0 10.5 14 28 14 28s14-17.5 14-28C30 7.2 24 1 16 1z';
/** O pino pequeno do After, em pixels da tela. */
export const TAMANHO_DO_PINO_PEQUENO = { largura: 22, altura: 30 };

/**
 * O desenho do pino pequeno do After, para o mapa: a gota na cor dada, com a borda e a bolinha do meio
 * brancas, em dobro de resolução (para ficar nítido). Volta nulo onde não dá para desenhar (nos
 * testes, sem canvas).
 */
export function imagemDoPinoPequeno(cor: string): ImageData | null {
  if (typeof Path2D === 'undefined') {
    return null;
  }
  const { largura, altura } = TAMANHO_DO_PINO_PEQUENO;
  const tela = document.createElement('canvas');
  tela.width = largura * 2;
  tela.height = altura * 2;
  const pincel = tela.getContext('2d');
  if (!pincel) {
    return null;
  }
  const branco = corDoTema('--cartao', '#fff');
  pincel.scale(tela.width / 32, tela.height / 44);
  const gota = new Path2D(GOTA);
  pincel.fillStyle = cor;
  pincel.fill(gota);
  pincel.strokeStyle = branco;
  pincel.lineWidth = 2.5;
  pincel.stroke(gota);
  pincel.beginPath();
  pincel.arc(16, 15, 9, 0, 2 * Math.PI);
  pincel.fillStyle = branco;
  pincel.fill();
  return pincel.getImageData(0, 0, tela.width, tela.height);
}

/** A gota do pino com a bolinha branca no meio; com número, a bolinha cresce e leva o número. */
function desenhoDoPino(numero: string): string {
  const meio = numero
    ? `<circle cx="16" cy="15" r="9"/><text class="numero" x="16" y="19.5" text-anchor="middle">${numero}</text>`
    : '<circle cx="16" cy="15" r="5.5"/>';
  return (
    '<svg viewBox="0 0 32 44" aria-hidden="true" focusable="false">' +
    `<path d="${GOTA}"/>${meio}</svg>`
  );
}

/** O pino do ponto escolhido: um botão com o nome, para o leitor de tela. */
export function criarPino(ponto: PontoNoMapa, aoEscolher: (id: string) => void): HTMLButtonElement {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = `pino pino-${ponto.after ? 'after' : ponto.zona} selecionado`;
  botao.setAttribute('aria-label', ponto.nome);
  botao.setAttribute('aria-pressed', 'true');
  botao.innerHTML = desenhoDoPino(numeroDoPonto(ponto));
  botao.addEventListener('click', (evento) => {
    evento.stopPropagation();
    aoEscolher(ponto.id);
  });
  return botao;
}
