export type Estilo = 'samba' | 'marchinha' | 'axe' | 'funk' | 'pop' | 'frevo' | 'eletronico';

export interface Bloco {
  id: string;
  nome: string;
  /** Dia do bloco, no formato AAAA-MM-DD. */
  data: string;
  /** Hora que começa, no formato HH:mm. */
  inicio: string;
  /** Hora que termina, no formato HH:mm. Só quando a gente souber. */
  fim?: string;
  local: string;
  bairro: string;
  atracoes: string[];
  estilo: Estilo;
}
