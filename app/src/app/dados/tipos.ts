export type Estilo = 'samba' | 'marchinha' | 'axe' | 'funk' | 'pop' | 'frevo' | 'eletronico';

export interface Local {
  id: string;
  nome: string;
  regiao: string;
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
  /** Hora que o bloco começa, no formato HH:mm. */
  inicio: string;
  /** Hora que o bloco termina, no formato HH:mm. Só quando a gente souber. */
  fim?: string;
  localId: string;
  atracoes: Atracao[];
  estilo: Estilo;
}
