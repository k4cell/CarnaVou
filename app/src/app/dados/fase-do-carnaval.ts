import { diaIso, horaIso, jaAcabou } from './agenda';
import { todosOsBlocos } from './correcoes';

/** Antes do primeiro bloco, durante a festa ou depois que o último bloco acabou. */
export type FaseDoCarnaval = 'antes' | 'durante' | 'depois';

/** O primeiro e o último dia com bloco (sem os cancelados), como "2026-02-07". */
export function diasDoCarnaval(): { primeiro: string; ultimo: string } | null {
  const dias = todosOsBlocos()
    .filter((bloco) => !bloco.cancelado)
    .map((bloco) => bloco.data)
    .sort();
  return dias.length > 0 ? { primeiro: dias[0], ultimo: dias[dias.length - 1] } : null;
}

/**
 * Em que fase o carnaval está agora. "Depois" começa quando não sobra nenhum bloco para acontecer,
 * nem hoje: no último dia, assim que o último bloco termina. Sem saber o dia de hoje (a página
 * pronta) ou sem blocos, não dá para saber.
 */
export function faseDoCarnaval(agora: Date | null): FaseDoCarnaval | null {
  const dias = diasDoCarnaval();
  if (!agora || !dias) {
    return null;
  }
  const hoje = diaIso(agora);
  if (hoje < dias.primeiro) {
    return 'antes';
  }
  const hora = horaIso(agora);
  const aindaTem = todosOsBlocos().some(
    (bloco) => !bloco.cancelado && (bloco.data > hoje || (bloco.data === hoje && !jaAcabou(bloco, hora))),
  );
  return aindaTem ? 'durante' : 'depois';
}

/** Quantos dias faltam de hoje até o dia, contando no calendário (amanhã é 1). */
export function diasAte(dia: string, agora: Date): number {
  const [ano, mes, dataDoMes] = dia.split('-').map(Number);
  const ate = Date.UTC(ano, mes - 1, dataDoMes);
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((ate - hoje) / 86_400_000);
}
