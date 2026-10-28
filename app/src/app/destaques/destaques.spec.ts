import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LOCAIS } from '../dados/locais';
import { Destaques } from './destaques';

describe('Destaques', () => {
  async function renderizar(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [Destaques],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Destaques);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra um link para cada lugar em destaque', async () => {
    const tela = await renderizar();
    const links = Array.from(tela.querySelectorAll('a'));
    expect(links.length).toBe(LOCAIS.length);
    expect(links[0].getAttribute('href')).toBe(`/local/${LOCAIS[0].id}`);
  });

  it('mostra o nome de cada lugar', async () => {
    const tela = await renderizar();
    const nomes = Array.from(tela.querySelectorAll('.nome')).map((nome) => nome.textContent);
    expect(nomes).toEqual(LOCAIS.map((local) => local.nome));
  });

  it('mostra os artistas da semana em cada lugar', async () => {
    const tela = await renderizar();
    const artistas = Array.from(tela.querySelectorAll('.artistas')).map((a) => a.textContent ?? '');
    expect(artistas.length).toBe(LOCAIS.length);
    expect(artistas.every((texto) => texto.startsWith('Artistas da semana: '))).toBe(true);
  });

  it('mostra só os três primeiros artistas e conta os outros', async () => {
    const tela = await renderizar();
    // O Ibirapuera tem sete artistas na semana: três aparecem e "mais 4" resume o resto.
    const ibirapuera = tela.querySelector('a[href="/local/ibirapuera"] .artistas')?.textContent;
    expect(ibirapuera).toBe(
      'Artistas da semana: Banda Serpentina, Mariana Tamborim, DJ Purpurina e mais 4',
    );
  });
});
