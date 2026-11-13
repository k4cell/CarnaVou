import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CopiarLink } from '../copiar-link/copiar-link';
import { DadosAtualizados } from '../correcoes/dados-atualizados';
import { TipoDoSelo, diaIso, diaSeguinte, momentoDoBloco } from '../dados/agenda';
import { acharBloco, acharLocal } from '../dados/consultas';
import { faixaDoBloco } from '../dados/cores-dos-cartoes';
import { faixaDoLocal } from '../dados/cores';
import { NOMES_DOS_ESTILOS, dataPorExtenso, formatarHora, horariosDoBloco, textoDoHorario } from '../dados/formato';
import { itinerarioDoBloco } from '../dados/itinerario';
import { Atracao } from '../dados/tipos';
import { trajetoDoBloco } from '../dados/trajetos';
import { dadosDoEvento, textoDoScript } from '../divulgacao/dados-do-evento';
import { BotaoFavorito } from '../favoritos/botao-favorito';
import { Relogio } from '../relogio/relogio';
import { ZonaTag } from '../zona/zona-tag';

/** "A, B e C" */
function juntarNomes(nomes: string[]): string {
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : (nomes[0] ?? '');
}

/**
 * As atrações juntas por horário, com os nomes lado a lado: "11h30 · Zé Vaqueiro, Nattan e Xand
 * Avião". Quem não tem hora divulgada vem primeiro, sem hora; depois, do mais cedo para o mais
 * tarde. Dentro de cada horário fica a ordem dos dados (do mais famoso para o menos). A fonte não
 * diz a ordem de quem canta na mesma hora, então ela não é inventada.
 */
function atracoesPorHorario(atracoes: Atracao[]): { hora: string; nomes: string }[] {
  const porHora = new Map<string, string[]>();
  for (const atracao of atracoes) {
    const hora = atracao.inicio ?? '';
    porHora.set(hora, [...(porHora.get(hora) ?? []), atracao.nome]);
  }
  return [...porHora]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hora, nomes]) => ({ hora: hora ? formatarHora(hora) : '', nomes: juntarNomes(nomes) }));
}

@Component({
  selector: 'app-pagina-bloco',
  imports: [BotaoFavorito, CopiarLink, DadosAtualizados, RouterLink, ZonaTag],
  templateUrl: './pagina-bloco.html',
  styleUrl: './pagina-bloco.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A página inteira leva a cor do bloco (a do cartão dele na aba Blocos), e as atrações herdam essa cor na faixa.
  host: { '[attr.data-faixa]': 'faixa()' },
})
export class PaginaBloco {
  /** Vêm do endereço: /local/:local/:bloco */
  readonly local = input.required<string>();
  readonly bloco = input.required<string>();

  protected readonly faixa = computed(() => {
    const bloco = this.achado();
    return bloco ? faixaDoBloco(bloco) : faixaDoLocal(this.local());
  });

  protected readonly lugar = computed(() => acharLocal(this.local()));
  protected readonly achado = computed(() => acharBloco(this.local(), this.bloco()));

  private readonly relogio = inject(Relogio);

  /**
   * O app só mostra o presente e o futuro: nenhuma lista leva a um bloco de um dia que já passou.
   * Quem chega por um link antigo vê o aviso.
   */
  protected readonly jaPassou = computed(() => {
    const agora = this.relogio.agora();
    const bloco = this.achado();
    return !!agora && !!bloco && bloco.data < diaIso(agora);
  });

  /**
   * Em que pé o bloco está, como nos cartões das listas: rolando (o aviso vermelho ao lado do nome e o
   * horário em verde), ainda vai começar hoje (amarelo) ou já acabou hoje (cinza). Num outro dia, num
   * bloco cancelado ou antes de saber a hora, fica sem.
   */
  protected readonly situacao = computed<TipoDoSelo | null>(() => {
    const bloco = this.achado();
    const agora = this.relogio.agora();
    if (!bloco || !agora || bloco.cancelado || bloco.data !== diaIso(agora)) {
      return null;
    }
    const momento = momentoDoBloco(bloco, agora);
    return momento === 'rolando' ? 'agora' : momento === 'antes' ? 'em-breve' : 'acabou';
  });

  /** "Hoje, sábado, 14 de fevereiro", "Amanhã, domingo, 15 de fevereiro" ou só a data. */
  protected readonly dia = computed(() => {
    const bloco = this.achado();
    if (!bloco) {
      return '';
    }
    const extenso = dataPorExtenso(bloco.data);
    const agora = this.relogio.agora();
    const quando = !agora
      ? ''
      : bloco.data === diaIso(agora)
        ? 'Hoje'
        : bloco.data === diaIso(diaSeguinte(agora))
          ? 'Amanhã'
          : '';
    return quando ? `${quando}, ${extenso.charAt(0).toLowerCase()}${extenso.slice(1)}` : extenso;
  });

  /** O horário completo e, depois que o bloco acabou, "Começou às 13h · acabou às 18h". */
  protected readonly horario = computed(() => {
    const bloco = this.achado();
    if (!bloco) {
      return '';
    }
    return this.situacao() === 'acabou' ? textoDoHorario(bloco, 'acabou') : horariosDoBloco(bloco);
  });

  protected readonly resumo = computed(() => {
    const bloco = this.achado();
    if (!bloco) {
      return undefined;
    }
    return {
      itinerario: itinerarioDoBloco(bloco.id),
      estilo: bloco.estilo ? NOMES_DOS_ESTILOS[bloco.estilo] : undefined,
      atracoes: atracoesPorHorario(bloco.atracoes),
    };
  });

  /**
   * Os artistas do bloco que têm o perfil do Instagram nos dados, do mais famoso para o menos: é lá
   * que costumam sair as novidades de quem toca. Só o link, sem copiar nada de lá.
   */
  constructor() {
    // Os dados do bloco como evento, para o Google: já saem no HTML da página pronta e acompanham as
    // correções (um bloco cancelado vira evento cancelado). Saem do HTML quando a página fecha.
    const documento = inject(DOCUMENT);
    // Na página pronta, o script já vem no HTML: o navegador reaproveita, sem duplicar.
    const script =
      documento.head.querySelector<HTMLScriptElement>('script#dados-do-evento') ?? documento.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dados-do-evento';
    effect(() => {
      const bloco = this.achado();
      if (!bloco) {
        script.remove();
        return;
      }
      script.textContent = textoDoScript(
        dadosDoEvento(bloco, this.lugar(), itinerarioDoBloco(bloco.id), trajetoDoBloco(bloco.id)),
      );
      if (!script.isConnected) {
        documento.head.appendChild(script);
      }
    });
    inject(DestroyRef).onDestroy(() => script.remove());
  }

  protected readonly instagram = computed(() =>
    (this.achado()?.atracoes ?? [])
      .filter((atracao): atracao is Atracao & { perfil: string } => !!atracao.perfil)
      .map((atracao) => ({ nome: atracao.nome, endereco: `https://www.instagram.com/${atracao.perfil}/` })),
  );
}
