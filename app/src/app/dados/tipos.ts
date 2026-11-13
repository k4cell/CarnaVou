export type Estilo =
  | 'samba'
  | 'marchinha'
  | 'axe'
  | 'funk'
  | 'pop'
  | 'frevo'
  | 'eletronico'
  | 'sertanejo'
  | 'rock'
  | 'forro'
  | 'mpb';

/** As zonas de São Paulo. Cada uma tem a sua cor (ver zona-tag). */
export type Zona = 'centro' | 'sul' | 'leste' | 'oeste' | 'norte';

/** Um lugar: um grande ponto do carnaval (como o Parque Ibirapuera) ou uma subprefeitura. */
export interface Local {
  id: string;
  nome: string;
  zona: Zona;
}

export interface Atracao {
  nome: string;
  /** Hora que a atração começa, no formato HH:mm. Só quando a gente souber. */
  inicio?: string;
  /** Seguidores no Instagram, para saber quem é mais famoso. Só quando a gente souber. */
  seguidores?: number;
  /** O perfil do artista no Instagram, sem o @. Só quando a gente souber. */
  perfil?: string;
}

export interface Bloco {
  id: string;
  nome: string;
  /** Dia do bloco, no formato AAAA-MM-DD. */
  data: string;
  /** Hora da concentração (quando o bloco começa), no formato HH:mm. */
  inicio: string;
  /** Hora em que o desfile sai, no formato HH:mm. Só quando a gente souber. */
  desfile?: string;
  /** Hora do término, no formato HH:mm. Só quando a gente souber. */
  fim?: string;
  localId: string;
  /**
   * De qual ponto de saída do lugar o bloco sai. Blocos do mesmo lugar com o mesmo número saem
   * juntos (a menos de 300 m). Não existe quando a gente não sabe onde o bloco se concentra.
   */
  ponto?: number;
  /** Os artistas que as fontes citam. Pode ficar vazio. */
  atracoes: Atracao[];
  /** Só quando alguma fonte diz o estilo. */
  estilo?: Estilo;
  /** Uma notícia chama o bloco de LGBT+ ou LGBTQIA+ (veja scripts/dados/<ano>/lgbt-das-noticias.json). */
  lgbt?: boolean;
  /**
   * Uma notícia chama o bloco de megabloco (veja scripts/dados/<ano>/megablocos-das-noticias.json):
   * ele entra mesmo sem artista divulgado e, na ordem por fama, não fica lá embaixo.
   */
  megabloco?: boolean;
  /** O bloco foi cancelado. Vem do arquivo de correções, como os dois campos abaixo. */
  cancelado?: boolean;
  /** A data ou um dos horários mudou depois da lista oficial. */
  horarioMudou?: boolean;
  /** Uma frase curta sobre a correção, para a página do bloco. */
  nota?: string;
}

/** Em que pé o bloco está agora: ainda vai começar, já começou (está rolando) ou já acabou. */
export type MomentoDoBloco = 'antes' | 'rolando' | 'acabou';

/** Onde um bloco se concentra e por onde ele passa. */
export interface Trajeto {
  /** O ponto da concentração, como [longitude, latitude]. */
  inicio: [number, number];
  /** A linha, como [longitude, latitude], da concentração até o fim. Bloco parado não tem. */
  linha?: [number, number][];
  /** O ponto ou a linha não são exatos (o itinerário não diz o bastante para ter certeza). */
  aproximado: boolean;
}
