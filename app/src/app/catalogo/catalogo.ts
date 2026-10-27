import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Bloco } from '../dados/bloco';
import { BLOCOS } from '../dados/blocos';

interface Banner {
  id: string;
  nome: string;
  data: string;
  semana: string;
  dia: string;
  mes: string;
  local: string;
  atracoes: string;
  horario: string;
  estilo: string;
}

const FORMATO_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const FORMATO_MES = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

/** Tira o ponto que o navegador põe depois da abreviação ("sáb." vira "sáb"). */
function semPonto(texto: string): string {
  return texto.replace('.', '');
}

/** "15:00" vira "15h" e "15:30" vira "15h30". */
function formatarHora(hora: string): string {
  const [horas, minutos] = hora.split(':');
  return minutos === '00' ? `${Number(horas)}h` : `${Number(horas)}h${minutos}`;
}

function montarBanner(bloco: Bloco): Banner {
  const [ano, mes, dia] = bloco.data.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  const inicio = `Começa às ${formatarHora(bloco.inicio)}`;

  return {
    id: bloco.id,
    nome: bloco.nome,
    data: bloco.data,
    semana: semPonto(FORMATO_SEMANA.format(data)),
    dia: String(dia),
    mes: semPonto(FORMATO_MES.format(data)),
    local: `${bloco.local} · ${bloco.bairro}`,
    atracoes: bloco.atracoes.join(', '),
    horario: bloco.fim ? `${inicio} · vai até ${formatarHora(bloco.fim)}` : inicio,
    estilo: bloco.estilo,
  };
}

function porDataEHora(a: Bloco, b: Bloco): number {
  return (a.data + a.inicio).localeCompare(b.data + b.inicio);
}

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalogo {
  protected readonly banners = [...BLOCOS].sort(porDataEHora).map(montarBanner);
}
