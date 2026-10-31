import { DestroyRef, Injectable, InjectionToken, inject, signal } from '@angular/core';

const FORMATO_DA_DATA = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/;

/**
 * O "hoje" de mentira usado enquanto o app só tem os dados de teste do carnaval de 2026: sexta,
 * 13/02/2026 (a véspera do sábado de carnaval), meio-dia. Ao trocar os dados de ano, troque esta
 * data também. Para usar o relógio de verdade, troque por nulo
 * (provedor `{ provide: DATA_DE_DEMONSTRACAO, useValue: null }`).
 */
export const DATA_DE_DEMONSTRACAO = new InjectionToken<Date | null>('DATA_DE_DEMONSTRACAO', {
  providedIn: 'root',
  factory: () => new Date(2026, 1, 13, 12, 0),
});

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
 * (13/02/2026), enquanto os dados forem os de teste; 3) o relógio do celular.
 * Nos dois primeiros casos "agora" fica parado e a tela avisa que é uma data de teste.
 */
@Injectable({ providedIn: 'root' })
export class Relogio {
  private readonly destruicao = inject(DestroyRef);
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

    const doEndereco = lerDataDeTeste(new URLSearchParams(busca).get('hoje'));
    if (doEndereco) {
      this.definir(doEndereco, true);
      return;
    }
    if (this.demonstracao) {
      this.definir(new Date(this.demonstracao), true);
      return;
    }

    this.definir(new Date());
    // Atualiza a cada minuto, para o "Já começou" virar na hora certa com o site aberto.
    const intervalo = setInterval(() => this.definir(new Date()), 60_000);
    this.destruicao.onDestroy(() => clearInterval(intervalo));
  }

  definir(data: Date, simulado = false): void {
    this.dataAtual.set(data);
    this.dataDeTeste.set(simulado);
  }
}
