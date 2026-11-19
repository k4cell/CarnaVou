import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, InjectionToken, inject, signal } from '@angular/core';

const FORMATO_DA_DATA = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/;

/** O carnaval é em São Paulo: o dia e a hora do app são sempre os de lá, seja qual for o fuso do celular. */
const FUSO_DO_CARNAVAL = 'America/Sao_Paulo';

let partesEmSaoPaulo: Intl.DateTimeFormat | undefined;

/**
 * O dia e a hora de São Paulo num instante. Volta uma data cujo dia e hora "do aparelho" (getDate,
 * getHours…) são os de São Paulo: assim o resto do app compara datas sem pensar em fuso, como se o
 * celular estivesse lá. Quem viaja com o fuso de outro lugar continua vendo o horário dos blocos.
 */
export function horaDeSaoPaulo(instante: Date): Date {
  partesEmSaoPaulo ??= new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_DO_CARNAVAL,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });
  const partes = Object.fromEntries(partesEmSaoPaulo.formatToParts(instante).map(({ type, value }) => [type, Number(value)]));
  return new Date(partes['year'], partes['month'] - 1, partes['day'], partes['hour'], partes['minute'], partes['second']);
}

/**
 * O "hoje" de mentira usado enquanto o app só tem os dados de teste do carnaval de 2026: domingo,
 * 08/02/2026 (o dia do Bloco Skol, com o Calvin Harris), meio-dia. Ao trocar os dados de ano, troque
 * esta data também. Para usar o relógio de verdade, troque por nulo
 * (provedor `{ provide: DATA_DE_DEMONSTRACAO, useValue: null }`).
 */
export const DATA_DE_DEMONSTRACAO = new InjectionToken<Date | null>('DATA_DE_DEMONSTRACAO', {
  providedIn: 'root',
  factory: () => new Date(2026, 1, 8, 12, 0),
});

/**
 * `?hoje=relogio` usa o relógio de verdade mesmo enquanto existe a data de demonstração: é como o site
 * publicado vai funcionar no carnaval (e é o que o teste no navegador usa para a virada do dia).
 */
export const RELOGIO_DE_VERDADE = 'relogio';

/**
 * Lê "2026-02-14" ou "2026-02-14T14:00". Sem hora, vale meio-dia.
 * Volta undefined quando o texto não é uma data de verdade (por exemplo, 2026-02-31).
 */
export function lerDataDeTeste(texto: string | null): Date | undefined {
  const partes = texto ? FORMATO_DA_DATA.exec(texto.trim()) : null;
  if (!partes) {
    return undefined;
  }
  const [, ano, mes, dia, hora = '12', minuto = '00'] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto));

  const confere =
    data.getFullYear() === Number(ano) &&
    data.getMonth() === Number(mes) - 1 &&
    data.getDate() === Number(dia) &&
    data.getHours() === Number(hora) &&
    data.getMinutes() === Number(minuto);
  return confere ? data : undefined;
}

/**
 * Sabe que dia e hora são "agora".
 * Ordem: 1) a data do endereço, como `?hoje=2026-02-14T14:00`; 2) o "hoje" de demonstração
 * (08/02/2026), enquanto os dados forem os de teste (menos com `?hoje=relogio`); 3) o relógio do
 * celular, na hora de São Paulo. Nos dois primeiros casos "agora" fica parado e a tela avisa que é uma
 * data de teste. A data de teste já é a hora de São Paulo.
 */
@Injectable({ providedIn: 'root' })
export class Relogio {
  private readonly destruicao = inject(DestroyRef);
  private readonly documento = inject(DOCUMENT);
  private readonly demonstracao = inject(DATA_DE_DEMONSTRACAO);
  private readonly dataAtual = signal<Date | null>(null);
  private readonly dataDeTeste = signal(false);
  private iniciado = false;

  /** Nulo no servidor e antes da primeira pintura, quando ainda não dá para saber. */
  readonly agora = this.dataAtual.asReadonly();
  /** Verdadeiro quando "agora" não vem do relógio do celular. */
  readonly simulado = this.dataDeTeste.asReadonly();

  /** Roda uma vez, no navegador, olhando o endereço com que o site foi aberto. */
  iniciar(busca: string): void {
    if (this.iniciado) {
      return;
    }
    this.iniciado = true;

    const pedido = new URLSearchParams(busca).get('hoje');
    const doEndereco = lerDataDeTeste(pedido);
    if (doEndereco) {
      this.definir(doEndereco, true);
      return;
    }
    if (this.demonstracao && pedido !== RELOGIO_DE_VERDADE) {
      this.definir(new Date(this.demonstracao), true);
      return;
    }

    const acertar = () => this.definir(horaDeSaoPaulo(new Date()));
    acertar();
    // Atualiza a cada minuto, para o "Rolando agora" aparecer na hora certa com o site aberto.
    const intervalo = setInterval(acertar, 60_000);
    // Com o app em segundo plano, o celular segura o intervalo (às vezes por horas): a hora se acerta
    // assim que a tela volta.
    const aoVoltar = () => {
      if (this.documento.visibilityState === 'visible') {
        acertar();
      }
    };
    this.documento.addEventListener('visibilitychange', aoVoltar);
    this.destruicao.onDestroy(() => {
      clearInterval(intervalo);
      this.documento.removeEventListener('visibilitychange', aoVoltar);
    });
  }

  definir(data: Date, simulado = false): void {
    this.dataAtual.set(data);
    this.dataDeTeste.set(simulado);
  }
}
