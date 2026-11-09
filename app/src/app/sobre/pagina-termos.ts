import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EMAIL_DE_CONTATO, ESTILO_DAS_PAGINAS_DE_TEXTO, TEXTOS_ATUALIZADOS_EM } from './contato';

/** Os termos de uso: o que o app é, o que ele não garante e as regras do nome, da logo e dos dados. */
@Component({
  selector: 'app-pagina-termos',
  imports: [RouterLink],
  template: `
    <h2 class="titulo">Termos de uso</h2>
    <p class="atualizado">Atualizados em {{ atualizadosEm }}.</p>

    <h3 class="secao">O que é o CarnaVou</h3>
    <p>
      Um serviço gratuito de informação sobre o carnaval de rua de São Paulo, ainda em versão de teste.
      Ao usar o app, você concorda com estes termos.
    </p>

    <h3 class="secao">Não é oficial</h3>
    <p>
      O CarnaVou não tem vínculo com a Prefeitura de São Paulo, com os blocos nem com os artistas. As
      informações vêm da lista oficial publicada pela Prefeitura e de notícias, e podem estar erradas ou
      mudar sem aviso: um bloco pode mudar de horário, de trajeto ou ser cancelado. Confira antes de sair
      de casa e siga as orientações das autoridades e de quem organiza a festa na rua.
    </p>

    <h3 class="secao">O que o app não garante</h3>
    <p>
      A gente faz o possível para manter tudo certo e no ar, mas o app pode ter erros ou ficar fora do ar.
      O CarnaVou não se responsabiliza por decisões tomadas a partir das informações dele, nem pelos
      serviços de outras empresas que os botões abrem (Google Maps, Uber e Instagram), que têm as suas
      próprias regras.
    </p>

    <h3 class="secao">Na rua</h3>
    <p>
      Use o app com atenção ao que está em volta. No meio da multidão, olhe rapidinho e guarde o celular.
    </p>

    <h3 class="secao">Nome, logo e dados</h3>
    <p>
      O nome CarnaVou e a logo pertencem ao criador do app e não podem ser usados sem autorização. Os
      dados do mapa são do OpenStreetMap, sob a licença ODbL, e os outros créditos estão na página
      <a routerLink="/sobre">Sobre</a>.
    </p>

    <h3 class="secao">Mudanças e contato</h3>
    <p>
      Estes termos podem mudar; quando isso acontecer, a data no alto da página muda junto. Valem as leis
      do Brasil. Dúvidas: <a class="email" [href]="'mailto:' + email">{{ email }}</a>. Veja também a
      <a routerLink="/privacidade">Privacidade</a>.
    </p>
  `,
  styles: ESTILO_DAS_PAGINAS_DE_TEXTO,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaTermos {
  protected readonly email = EMAIL_DE_CONTATO;
  protected readonly atualizadosEm = TEXTOS_ATUALIZADOS_EM;
}
