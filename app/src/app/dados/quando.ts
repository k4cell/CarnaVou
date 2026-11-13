import { diaIso, diaSeguinte, momentoDoBloco } from './agenda';
import { formatarHora, partesDaData } from './formato';
import { Bloco } from './tipos';

/**
 * Quando o bloco acontece, dito para quem está decidindo aonde ir agora: se está rolando (e até
 * quando) ou a hora em que começa. Sem contar os minutos: no carnaval ninguém liga de chegar atrasado.
 */
export interface QuandoComeca {
  /** "Rolando agora, até 18h", "Hoje às 16h", "Amanhã às 13h" ou "sáb 21 fev · 13h". */
  texto: string;
  /** Curto, em cima no quadradinho: "Até" (rolando), "Hoje", "Amanhã" ou "sáb 21". */
  rotulo: string;
  /** Curto, embaixo do rótulo: a hora em que começa ou, rolando, a hora em que acaba ("16h"). */
  hora: string;
  /** Rolando, começando ainda hoje, ou num outro dia. */
  tipo: 'agora' | 'hoje' | 'outro-dia';
}

/** Quando o bloco começa (ou até quando vai, se já está rolando). Só serve para blocos de hoje em diante. */
export function quandoComeca(bloco: Bloco, agora: Date): QuandoComeca {
  const hora = formatarHora(bloco.inicio);
  if (momentoDoBloco(bloco, agora) === 'rolando') {
    // Sem a hora do fim, diz desde quando está rolando.
    return bloco.fim
      ? { texto: `Rolando agora, até ${formatarHora(bloco.fim)}`, rotulo: 'Até', hora: formatarHora(bloco.fim), tipo: 'agora' }
      : { texto: `Rolando agora, desde as ${hora}`, rotulo: 'Desde', hora, tipo: 'agora' };
  }
  if (bloco.data === diaIso(agora)) {
    return { texto: `Hoje às ${hora}`, rotulo: 'Hoje', hora, tipo: 'hoje' };
  }
  if (bloco.data === diaIso(diaSeguinte(agora))) {
    return { texto: `Amanhã às ${hora}`, rotulo: 'Amanhã', hora, tipo: 'outro-dia' };
  }
  const { semana, dia, mes } = partesDaData(bloco.data);
  return { texto: `${semana} ${dia} ${mes} · ${hora}`, rotulo: `${semana} ${dia}`, hora, tipo: 'outro-dia' };
}
