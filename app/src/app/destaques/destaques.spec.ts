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
});
