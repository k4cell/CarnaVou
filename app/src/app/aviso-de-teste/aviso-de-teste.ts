import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BLOCOS } from '../dados/blocos';

/** O ano dos dados de teste, tirado dos próprios blocos (hoje, 2026). */
const ANO_DOS_DADOS = BLOCOS[0]?.data.slice(0, 4) ?? '';

/**
 * O aviso de que o site é uma versão de teste: os blocos são de um carnaval que já passou. Fica no
 * alto de todas as páginas, porque quem chega por um link cai direto na página do lugar ou do
 * bloco. (No mapa ele fica embaixo do mapa, mas as abas já mostram a data de teste com o ano.)
 * Sai quando vierem os dados de 2027.
 */
@Component({
  selector: 'app-aviso-de-teste',
  template: `<p class="aviso">Versão de teste: os blocos e os horários são do carnaval de rua de {{ ano }}.</p>`,
  styles: `
    .aviso {
      margin: 0 0 12px;
      padding: 8px 12px;
      border: 1px dashed var(--texto-suave);
      border-radius: 8px;
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoDeTeste {
  protected readonly ano = ANO_DOS_DADOS;
}
