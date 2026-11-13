import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EMAIL_DE_CONTATO, ESTILO_DAS_PAGINAS_DE_TEXTO, TEXTOS_ATUALIZADOS_EM } from './contato';

/**
 * A política de privacidade (LGPD). Tem que dizer a verdade sobre o código: se o app passar a
 * guardar ou enviar algum dado, este texto muda antes, junto com a data.
 */
@Component({
  selector: 'app-pagina-privacidade',
  imports: [RouterLink],
  template: `
    <h2 class="titulo">Privacidade</h2>
    <p class="atualizado">Atualizada em {{ atualizadaEm }}.</p>

    <p class="resumo">
      <strong>Em resumo:</strong> o CarnaVou não pede cadastro, não usa rastreadores nem propaganda e
      não envia a sua localização para ninguém. O pouco que ele guarda fica só no seu celular.
    </p>

    <h3 class="secao">O que fica guardado no seu celular</h3>
    <ul>
      <li>Os blocos que você marcou com a estrela (os favoritos).</li>
      <li>A última lista de correções de horário e de blocos cancelados que o app baixou.</li>
      <li>Se o aviso de "pronto para usar sem internet" já apareceu.</li>
      <li>
        A data em que você tocou em "Agora não" (ou "Entendi") no convite para instalar o app, para ele
        não aparecer de novo por uma semana.
      </li>
      <li>As páginas e os pedaços do mapa que você abriu, para o app funcionar sem internet.</li>
    </ul>
    <p>
      Nada disso sai do aparelho. Para apagar, limpe os dados do site nas configurações do navegador
      ou desinstale o app.
    </p>

    <h3 class="secao">A sua localização</h3>
    <p>
      O app só procura onde você está quando você toca em "Onde estou" (no mapa) ou em "Perto de mim"
      (no Descobrir): é uma leitura por toque. A posição fica só na memória do celular, enquanto o app
      está aberto, para mostrar você no mapa, a distância até os blocos e os blocos mais perto. Ela não
      é guardada nem enviada. O app nunca acompanha o seu caminho nem usa a localização em segundo
      plano. Se você negar, continua usando o app normalmente.
    </p>

    <h3 class="secao">O que chega até o site</h3>
    <p>
      O CarnaVou não tem servidor próprio nem banco de dados. As páginas ficam hospedadas no
      <a href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub Pages</a>
      e na
      <a href="https://www.cloudflare.com/pt-br/privacypolicy/" target="_blank" rel="noopener">Cloudflare</a>,
      que, como acontece com qualquer site, recebem o endereço de internet (IP) e dados técnicos do
      navegador para entregar as páginas, conforme as políticas de privacidade deles. O CarnaVou não usa
      esses dados.
    </p>
    <p>
      De vez em quando, o app faz um pedido bem pequeno ao próprio site, para saber se a internet está
      passando, e baixa a lista de correções. Esses pedidos não levam nenhum dado seu.
    </p>

    <h3 class="secao">Links para outros apps</h3>
    <p>
      Os botões Ir a pé, Metrô (Google Maps), Uber e Instagram abrem esses serviços. O CarnaVou passa
      para eles só o destino (o ponto do bloco ou do bar), e a partir dali valem as regras de privacidade
      de cada um. O botão de copiar o link só coloca o endereço da página na área de transferência do
      seu celular.
    </p>

    <h3 class="secao">Os seus direitos</h3>
    <p>
      A Lei Geral de Proteção de Dados (LGPD) garante a você saber o que é feito com os seus dados. Como
      o CarnaVou não guarda dados pessoais seus, não há nada do nosso lado para mostrar, corrigir ou
      apagar; o que fica no celular você apaga quando quiser. Responsável: CarnaVou. Para qualquer
      dúvida ou pedido, escreva para <a class="email" [href]="'mailto:' + email">{{ email }}</a>.
    </p>

    <h3 class="secao">Mudanças</h3>
    <p>
      Se esta política mudar, a data no alto da página muda junto. Se um dia o app passar a coletar
      algum dado, isso vai estar escrito aqui antes. Veja também os <a routerLink="/termos">Termos de uso</a>.
    </p>
  `,
  styles: ESTILO_DAS_PAGINAS_DE_TEXTO,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaPrivacidade {
  protected readonly email = EMAIL_DE_CONTATO;
  protected readonly atualizadaEm = TEXTOS_ATUALIZADOS_EM;
}
