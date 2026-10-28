import { DestroyRef, Injectable, inject, signal } from '@angular/core';

const FORMATO_DA_DATA = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/;

/**
 * Lê "2027-02-06" ou "2027-02-06T14:00". Sem hora, vale meio-dia.
 * Volta undefined quando o texto não é uma data de verdade (por exemplo, 2027-02-31).
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
 * Por padrão usa o relógio do celular. Para testar, dá para abrir o site com uma data no
 * endereço, como `?hoje=2027-02-06T14:00`: aí "agora" fica parado nessa data.
 */
@Injectable({ providedIn: 'root' })
export class Relogio {
  private readonly destruicao = inject(DestroyRef);
  private readonly dataAtual = signal<Date | null>(null);
  private readonly dataDeTeste = signal(false);
  private iniciado = false;

  /** Nulo no servidor e antes da primeira pintura, quando ainda não dá para saber. */
  readonly agora = this.dataAtual.asReadonly();
  /** Verdadeiro quando "agora" vem do endereço (?hoje=...) e não do relógio do celular. */
  readonly simulado = this.dataDeTeste.asReadonly();

  /** Roda uma vez, no navegador, olhando o endereço com que o site foi aberto. */
  iniciar(busca: string): void {
    if (this.iniciado) {
      return;
    }
    this.iniciado = true;

    const teste = lerDataDeTeste(new URLSearchParams(busca).get('hoje'));
    if (teste) {
      this.definir(teste, true);
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
