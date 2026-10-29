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

export interface Local {
  id: string;
  nome: string;
  zona: Zona;
}

export interface Atracao {
  nome: string;
  /** Hora que a atração começa, no formato HH:mm. Só quando a gente souber. */
  inicio?: string;
}

export interface Bloco {
  id: string;
  nome: string;
  /** Dia do bloco, no formato AAAA-MM-DD. */
  data: string;
  /** Hora da concentração (quando o bloco começa), no formato HH:mm. */
  inicio: string;
  /** Hora da dispersão (quando termina), no formato HH:mm. Só quando a gente souber. */
  fim?: string;
  localId: string;
  /** Os artistas que as fontes citam. Pode ficar vazio. */
  atracoes: Atracao[];
  /** Só quando alguma fonte diz o estilo. */
  estilo?: Estilo;
  /** Público-alvo, só quando for claro (ex.: "LGBTQIA+", "Mulheres"). */
  publico?: string;
}
