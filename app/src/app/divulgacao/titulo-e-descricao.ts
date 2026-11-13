import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { DESCRICAO_DO_SITE } from './descricoes';
import { IMAGEM_DA_PREVIA, NOME_DO_SITE, enderecoCompleto } from './endereco-do-site';

/**
 * A cada página: o título, a descrição, o endereço canônico e a prévia do link (Open Graph, que o
 * WhatsApp, o Instagram e o Telegram leem). Nas páginas prontas do `ng build`, tudo isso já sai no
 * HTML, porque quem gera a prévia não roda o JavaScript. A descrição vem do `data.descricao` da rota
 * (veja app.routes.ts).
 */
@Injectable()
export class TituloEDescricao extends TitleStrategy {
  private readonly titulo = inject(Title);
  private readonly meta = inject(Meta);
  private readonly documento = inject(DOCUMENT);

  override updateTitle(estado: RouterStateSnapshot): void {
    let rota = estado.root;
    while (rota.firstChild) {
      rota = rota.firstChild;
    }
    const titulo = this.buildTitle(estado) ?? NOME_DO_SITE;
    const descricao: string = rota.data['descricao'] ?? DESCRICAO_DO_SITE;
    const endereco = enderecoCompleto(estado.url);

    this.titulo.setTitle(titulo);
    this.meta.updateTag({ name: 'description', content: descricao });
    const previa: [string, string][] = [
      ['og:type', 'website'],
      ['og:site_name', NOME_DO_SITE],
      ['og:locale', 'pt_BR'],
      ['og:title', titulo],
      ['og:description', descricao],
      ['og:url', endereco],
      ['og:image', IMAGEM_DA_PREVIA],
      ['og:image:width', '1200'],
      ['og:image:height', '630'],
      ['og:image:alt', NOME_DO_SITE],
    ];
    for (const [propriedade, conteudo] of previa) {
      this.meta.updateTag(
        { property: propriedade, content: conteudo },
        `property="${propriedade}"`,
      );
    }
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.trocarOCanonico(endereco);
  }

  /** O endereço oficial da página: o Google junta nele as cópias (com `?hoje=`, na Cloudflare…). */
  private trocarOCanonico(endereco: string): void {
    let link = this.documento.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.documento.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.documento.head.appendChild(link);
    }
    link.setAttribute('href', endereco);
  }
}
