import { Bloco, Estilo, MomentoDoBloco, Zona } from './tipos';

const FORMATO_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const FORMATO_MES = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const FORMATO_DATA_LONGA = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export const NOMES_DOS_ESTILOS: Record<Estilo, string> = {
  samba: 'Samba',
  marchinha: 'Marchinha',
  axe: 'Axé',
  funk: 'Funk',
  pop: 'Pop',
  frevo: 'Frevo',
  eletronico: 'Eletrônico',
  sertanejo: 'Sertanejo',
  rock: 'Rock',
  forro: 'Forró',
  mpb: 'MPB',
};

export const NOMES_DAS_ZONAS: Record<Zona, string> = {
  centro: 'Centro',
  sul: 'Zona Sul',
  leste: 'Zona Leste',
  oeste: 'Zona Oeste',
  norte: 'Zona Norte',
};

/** Cria a data a partir de "AAAA-MM-DD" sem mudar de dia por causa do fuso horário. */
function criarData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Tira o ponto que o navegador põe depois da abreviação ("sáb." vira "sáb"). */
function semPonto(texto: string): string {
  return texto.replace('.', '');
}

/** "15:00" vira "15h" e "15:30" vira "15h30". */
export function formatarHora(hora: string): string {
  const [horas, minutos] = hora.split(':');
  return minutos === '00' ? `${Number(horas)}h` : `${Number(horas)}h${minutos}`;
}

/** Dia do banner: "sáb", "30", "jan". */
export function partesDaData(iso: string): { semana: string; dia: string; mes: string } {
  const data = criarData(iso);
  return {
    semana: semPonto(FORMATO_SEMANA.format(data)),
    dia: String(data.getDate()),
    mes: semPonto(FORMATO_MES.format(data)),
  };
}

/** "domingo, 31 de janeiro", com a primeira letra maiúscula. */
export function dataPorExtenso(iso: string): string {
  const texto = FORMATO_DATA_LONGA.format(criarData(iso));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Concentração às 13h · desfile às 14h · termina às 18h", só com as horas que a gente sabe. */
export function horariosDoBloco(bloco: Bloco): string {
  const partes = [`Concentração às ${formatarHora(bloco.inicio)}`];
  if (bloco.desfile) {
    partes.push(`desfile às ${formatarHora(bloco.desfile)}`);
  }
  if (bloco.fim) {
    partes.push(`termina às ${formatarHora(bloco.fim)}`);
  }
  return partes.join(' · ');
}

/**
 * "Começa às 13h" e, quando a gente sabe, "Começa às 13h · vai até 20h". Depois que o bloco
 * começou, "Começou às 13h · vai até 20h"; depois que acabou, "Começou às 13h · acabou às 20h".
 */
export function textoDoHorario(bloco: Bloco, momento: MomentoDoBloco = 'antes'): string {
  const inicio = `${momento === 'antes' ? 'Começa' : 'Começou'} às ${formatarHora(bloco.inicio)}`;
  if (!bloco.fim) {
    return inicio;
  }
  return `${inicio} · ${momento === 'acabou' ? 'acabou às' : 'vai até'} ${formatarHora(bloco.fim)}`;
}
