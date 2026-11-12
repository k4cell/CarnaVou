import { diaIso, diaSeguinte, momentoDoBloco } from './agenda';
import { formatarHora, partesDaData } from './formato';
import { Bloco } from './tipos';

/** Até quantos minutos antes de começar o bloco diz "em 35 min", e não a hora. */
const CONTA_OS_MINUTOS_ATE = 60;

/** Quando o bloco acontece, dito para quem está decidindo aonde ir agora. */
export interface QuandoComeca {
  /** "Rolando agora", "Começa em 35 min", "Hoje às 16h", "Amanhã às 13h" ou "sáb 21 fev · 13h". */
  texto: string;
  /** Curto, para um quadradinho: "Agora", "Hoje", "Amanhã" ou "sáb 21". */
  dia: string;
  /** Curto, embaixo do dia: "16h" ou, quando falta pouco, "35 min". */
  hora: string;
  /** Rolando, começando ainda hoje, ou num outro dia. */
  tipo: 'agora' | 'hoje' | 'outro-dia';
}

/** Quanto falta, em minutos, de agora até a hora dada (no mesmo dia). */
function minutosAte(hora: string, agora: Date): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos - (agora.getHours() * 60 + agora.getMinutes());
}

/** Quando o bloco começa, contando de agora. Só serve para blocos de hoje em diante. */
export function quandoComeca(bloco: Bloco, agora: Date): QuandoComeca {
  const hora = formatarHora(bloco.inicio);
  if (momentoDoBloco(bloco, agora) === 'rolando') {
    return { texto: 'Rolando agora', dia: 'Agora', hora, tipo: 'agora' };
  }
  if (bloco.data === diaIso(agora)) {
    const faltam = minutosAte(bloco.inicio, agora);
    return faltam <= CONTA_OS_MINUTOS_ATE
      ? { texto: `Começa em ${faltam} min`, dia: 'Hoje', hora: `${faltam} min`, tipo: 'hoje' }
      : { texto: `Hoje às ${hora}`, dia: 'Hoje', hora, tipo: 'hoje' };
  }
  if (bloco.data === diaIso(diaSeguinte(agora))) {
    return { texto: `Amanhã às ${hora}`, dia: 'Amanhã', hora, tipo: 'outro-dia' };
  }
  const { semana, dia, mes } = partesDaData(bloco.data);
  return { texto: `${semana} ${dia} ${mes} · ${hora}`, dia: `${semana} ${dia}`, hora, tipo: 'outro-dia' };
}
