import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** O fim de cada página: o aviso de que o app não é oficial e os links Sobre, Privacidade e Termos. */
@Component({
  selector: 'app-rodape',
  imports: [RouterLink],
  template: `
    <footer class="rodape">
      <p class="aviso">O CarnaVou é independente e não é oficial. Os horários podem mudar.</p>
      <nav class="links" aria-label="Sobre o CarnaVou">
        <a routerLink="/sobre">Sobre</a>
        <a routerLink="/privacidade">Privacidade</a>
        <a routerLink="/termos">Termos de uso</a>
      </nav>
    </footer>
  `,
  styles: `
    .rodape {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid var(--borda);
      color: var(--texto-suave);
      font-size: 0.875rem;
      text-align: center;
    }

    .aviso {
      margin: 0;
    }

    // Os links com área de toque de 44 px de altura, mesmo com a letra pequena.
    .links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      column-gap: 16px;
    }

    a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rodape {}
