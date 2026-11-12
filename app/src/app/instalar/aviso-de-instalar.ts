import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { Atualizacao } from '../atualizacao/atualizacao';
import { ProntoSemInternet } from '../atualizacao/aviso-de-pronto';
import { Instalacao } from './instalacao';

/**
 * O convite para instalar o app, logo acima do menu de baixo. Espera a vez quando outro aviso (versão
 * nova, pronto sem internet) está na tela, para não ficar um em cima do outro.
 */
@Component({
  selector: 'app-aviso-de-instalar',
  template: `
    @if (aviso(); as jeito) {
      <div class="aviso aviso-flutuante convite" role="dialog" aria-label="Instalar o CarnaVou">
        @if (jeito === 'botao') {
          <p>Instale o CarnaVou no celular: abre mais rápido e funciona sem internet.</p>
          <div class="botoes">
            <button type="button" class="agora-nao" (click)="instalacao.agoraNao()">Agora não</button>
            <button type="button" (click)="instalar()">Instalar</button>
          </div>
        } @else {
          <!-- No iPhone, a Apple não deixa o site se instalar: só pelo menu do navegador. -->
          <p>Para instalar o CarnaVou no iPhone:</p>
          <ol>
            <li>
              Toque em Compartilhar
              <!-- O ícone de compartilhar do iPhone: Lucide (licença ISC). -->
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
              (fica na barra do Safari ou no menu ⋯).
            </li>
            <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
          </ol>
          <div class="botoes">
            <button type="button" (click)="instalacao.agoraNao()">Entendi</button>
          </div>
        }
      </div>
    }
  `,
  styles: `
    // Em duas linhas: o texto em cima e os botões embaixo, à direita.
    .convite {
      flex-direction: column;
      align-items: stretch;
      padding: 12px 12px 8px 16px;
    }

    p,
    ol {
      margin: 0;
      line-height: 1.4;
    }

    ol {
      padding-left: 20px;
    }

    svg {
      width: 18px;
      height: 18px;
      vertical-align: -3px;
      fill: none;
      stroke: currentcolor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .botoes {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    // "Agora não" fica discreto: o botão amarelo é o convite.
    .aviso-flutuante .agora-nao {
      background: none;
      color: #fff;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoDeInstalar {
  protected readonly instalacao = inject(Instalacao);
  private readonly atualizacao = inject(Atualizacao);
  private readonly pronto = inject(ProntoSemInternet);

  protected readonly aviso = computed(() =>
    this.atualizacao.temVersaoNova() || this.pronto.avisar() ? null : this.instalacao.aviso(),
  );

  protected instalar(): void {
    void this.instalacao.instalar();
  }
}
