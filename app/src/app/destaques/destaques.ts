import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { artistasDaSemana } from '../dados/consultas';
import { LOCAIS } from '../dados/locais';

const MAXIMO_DE_ARTISTAS = 3;

/** "A, B, C e mais 4": mostra só os primeiros para o cartão não ficar enorme. */
function resumoDosArtistas(localId: string): string {
  const nomes = artistasDaSemana(localId);
  const mostrados = nomes.slice(0, MAXIMO_DE_ARTISTAS);
  const resto = nomes.length - mostrados.length;
  return resto > 0 ? `${mostrados.join(', ')} e mais ${resto}` : mostrados.join(', ');
}

@Component({
  selector: 'app-destaques',
  imports: [RouterLink],
  templateUrl: './destaques.html',
  styleUrl: './destaques.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destaques {
  protected readonly itens = LOCAIS.map((local) => ({
    ...local,
    artistas: resumoDosArtistas(local.id),
  }));
}
