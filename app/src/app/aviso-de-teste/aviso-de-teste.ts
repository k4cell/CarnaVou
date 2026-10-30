import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { diaIso, horaIso } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { dataPorExtenso, formatarHora } from '../dados/formato';
import { Relogio } from '../relogio/relogio';

/** O ano dos dados de teste, tirado dos próprios blocos (hoje, 2026). */
const ANO_DOS_DADOS = BLOCOS[0]?.data.slice(0, 4) ?? '';

/**
 * O aviso de que o site é uma versão de teste: os blocos são de um carnaval que já passou. É uma
 * linha fina no cabeçalho, em todas as páginas (quem chega por um link cai direto num lugar ou num
 * bloco), e diz também a data de teste quando "hoje" não vem do relógio do celular. Sai quando
 * vierem os dados de 2027.
 */
@Component({
  selector: 'app-aviso-de-teste',
  template: `<p class="aviso">
    <span class="selo-teste">Teste</span> Blocos de {{ ano }}@if (dataDeTeste(); as data) {<span class="data"> · {{ data }}</span>}
  </p>`,
  styles: `
    .aviso {
      margin: 0;
      overflow: hidden;
      font-size: 0.8125rem;
      line-height: 24px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    // Amarelo só como fundo, com texto escuro.
    .selo-teste {
      margin-right: 4px;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--amarelo);
      color: var(--texto);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoDeTeste {
  private readonly relogio = inject(Relogio);

  protected readonly ano = ANO_DOS_DADOS;

  /**
   * "sáb, 7/2/2026, 12h": só aparece quando a data não vem do relógio do celular. O ano fica à
   * vista, para ninguém achar que é o carnaval que vem.
   */
  protected readonly dataDeTeste = computed(() => {
    const agora = this.relogio.agora();
    if (!agora || !this.relogio.simulado()) {
      return '';
    }
    const semana = dataPorExtenso(diaIso(agora)).split(',')[0].slice(0, 3).toLowerCase();
    const data = `${agora.getDate()}/${agora.getMonth() + 1}/${agora.getFullYear()}`;
    return `hoje é ${semana}, ${data}, ${formatarHora(horaIso(agora))}`;
  });
}
