import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EMAIL_DE_CONTATO, ESTILO_DAS_PAGINAS_DE_TEXTO } from './contato';

/** O que é o CarnaVou, de onde vêm os dados, os créditos e o contato. */
@Component({
  selector: 'app-pagina-sobre',
  imports: [RouterLink],
  template: `
    <h2 class="titulo">Sobre o CarnaVou</h2>
    <p>
      O CarnaVou é um app para achar os blocos do carnaval de rua de São Paulo: o que está rolando
      agora, o que vem depois, onde fica e como chegar. Funciona no celular, sem cadastro, e continua
      funcionando sem internet com o que você já abriu.
    </p>

    <h3 class="secao">Não é oficial</h3>
    <p class="nao-oficial">
      O CarnaVou é independente: não tem vínculo com a Prefeitura de São Paulo, com os blocos nem com
      os artistas. Os horários, os lugares e as atrações podem mudar, e um bloco pode ser cancelado. Na
      dúvida, confira com o bloco e siga as orientações de quem organiza a festa na rua.
    </p>

    <h3 class="secao">De onde vêm os dados</h3>
    <ul>
      <li>
        <strong>Blocos:</strong> a lista oficial dos blocos aprovados, publicada no Diário Oficial da
        Cidade de São Paulo. Os artistas e o estilo vêm de notícias, só quando elas citam.
      </li>
      <li>
        <strong>Mapa:</strong> dados do
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>
        e de quem colabora com ele, sob a licença ODbL, no formato do
        <a href="https://openmaptiles.org" target="_blank" rel="noopener">OpenMapTiles</a>. Achou um erro
        no mapa? Qualquer pessoa pode
        <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener">corrigir no OpenStreetMap</a>.
      </li>
      <li>
        <strong>O que faz o mapa funcionar:</strong> o
        <a href="https://maplibre.org" target="_blank" rel="noopener">MapLibre</a>, o
        <a href="https://github.com/onthegomap/planetiler" target="_blank" rel="noopener">Planetiler</a>, o
        estilo Positron, da <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a>,
        e as letras Noto Sans (licença SIL Open Font License). Os ícones são do
        <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a>.
      </li>
    </ul>

    <h3 class="secao">Contato</h3>
    <p>
      Achou um erro num bloco, quer sugerir alguma coisa ou falar sobre privacidade? Escreva para
      <a class="email" [href]="'mailto:' + email">{{ email }}</a>.
    </p>

    <h3 class="secao">Mais</h3>
    <ul>
      <li><a routerLink="/privacidade">Privacidade</a>: o que o app guarda (quase nada) e o que nunca faz.</li>
      <li><a routerLink="/termos">Termos de uso</a>: as regras de uso do app.</li>
    </ul>
  `,
  styles: ESTILO_DAS_PAGINAS_DE_TEXTO,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaSobre {
  protected readonly email = EMAIL_DE_CONTATO;
}
