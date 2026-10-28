import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { artistasDaSemana } from '../dados/consultas';
import { LOCAIS } from '../dados/locais';
import { ZonaTag } from '../zona/zona-tag';

const MAXIMO_DE_ARTISTAS = 3;

/**
 * Separa o primeiro artista (que aparece em destaque) dos outros.
 * "resto" vem pronto com a vírgula: ", B, C e mais 4".
 */
function artistasDoCartao(localId: string): { principal: string; resto: string } {
  const [principal = '', ...outros] = artistasDaSemana(localId);
  const mostrados = outros.slice(0, MAXIMO_DE_ARTISTAS - 1);
  const escondidos = outros.length - mostrados.length;

  let resto = mostrados.length > 0 ? `, ${mostrados.join(', ')}` : '';
  if (escondidos > 0) {
    resto += ` e mais ${escondidos}`;
  }
  return { principal, resto };
}

@Component({
  selector: 'app-destaques',
  imports: [RouterLink, ZonaTag],
  templateUrl: './destaques.html',
  styleUrl: './destaques.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destaques {
  protected readonly itens = LOCAIS.map((local) => ({
    ...local,
    ...artistasDoCartao(local.id),
  }));
}
