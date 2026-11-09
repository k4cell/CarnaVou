import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EMAIL_DE_CONTATO } from './contato';
import { PaginaPrivacidade } from './pagina-privacidade';
import { PaginaSobre } from './pagina-sobre';
import { PaginaTermos } from './pagina-termos';

describe('as páginas Sobre, Privacidade e Termos', () => {
  async function renderizar(pagina: Type<unknown>) {
    await TestBed.configureTestingModule({ imports: [pagina], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(pagina);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const enderecos = (tela: HTMLElement) => Array.from(tela.querySelectorAll('a')).map((link) => link.getAttribute('href'));

  it('todas têm o e-mail de contato, que abre o e-mail do celular', async () => {
    for (const pagina of [PaginaSobre, PaginaPrivacidade, PaginaTermos]) {
      TestBed.resetTestingModule();
      const tela = await renderizar(pagina);
      const email = tela.querySelector<HTMLAnchorElement>('a.email');
      expect(email?.getAttribute('href')).toBe(`mailto:${EMAIL_DE_CONTATO}`);
      expect(email?.textContent).toBe(EMAIL_DE_CONTATO);
    }
  });

  describe('Sobre', () => {
    it('diz que o app não é oficial e que os horários podem mudar', async () => {
      const tela = await renderizar(PaginaSobre);
      expect(tela.querySelector('.nao-oficial')?.textContent).toContain('não tem vínculo com a Prefeitura');
      expect(tela.textContent).toContain('podem mudar');
    });

    it('dá os créditos do mapa, com a licença do OpenStreetMap e o link para corrigir o mapa', async () => {
      const tela = await renderizar(PaginaSobre);
      expect(tela.textContent).toContain('ODbL');
      expect(enderecos(tela)).toEqual(
        expect.arrayContaining([
          'https://www.openstreetmap.org/copyright',
          'https://www.openstreetmap.org/fixthemap',
          '/privacidade',
          '/termos',
        ]),
      );
    });

    it('diz de onde vêm os blocos: o Diário Oficial', async () => {
      expect((await renderizar(PaginaSobre)).textContent).toContain('Diário Oficial da Cidade de São Paulo');
    });
  });

  describe('Privacidade', () => {
    it('resume que não tem cadastro, rastreador nem envio da localização', async () => {
      const resumo = (await renderizar(PaginaPrivacidade)).querySelector('.resumo')?.textContent ?? '';
      expect(resumo).toContain('não pede cadastro');
      expect(resumo).toContain('não usa rastreadores');
      expect(resumo).toContain('não envia a sua localização');
    });

    it('explica que a localização só é lida no toque em "Onde estou" e nunca é guardada', async () => {
      const tela = await renderizar(PaginaPrivacidade);
      expect(tela.textContent).toContain('"Onde estou"');
      expect(tela.textContent).toContain('não é guardada nem enviada');
    });

    it('tem a data da última mudança e leva aos Termos', async () => {
      const tela = await renderizar(PaginaPrivacidade);
      expect(tela.querySelector('.atualizado')?.textContent).toMatch(/^Atualizada em \d+ de \w+ de \d{4}\.$/);
      expect(enderecos(tela)).toContain('/termos');
    });
  });

  describe('Termos de uso', () => {
    it('diz que o app não é oficial, não garante as informações e leva ao Sobre e à Privacidade', async () => {
      const tela = await renderizar(PaginaTermos);
      expect(tela.textContent).toContain('não tem vínculo com a Prefeitura');
      expect(tela.textContent).toContain('O que o app não garante');
      expect(enderecos(tela)).toEqual(expect.arrayContaining(['/sobre', '/privacidade']));
    });
  });
});
