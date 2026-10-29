import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { routes } from '../app.routes';
import { MenuInferior } from './menu-inferior';

describe('MenuInferior', () => {
  async function montar() {
    await TestBed.configureTestingModule({
      imports: [MenuInferior],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(MenuInferior);
    await fixture.whenStable();
    return fixture;
  }

  function abaAtual(tela: HTMLElement): string | undefined {
    return tela.querySelector('[aria-current="page"]')?.textContent?.trim();
  }

  it('tem só as abas Descobrir e Mapa, na ordem', async () => {
    const fixture = await montar();
    const tela = fixture.nativeElement as HTMLElement;
    const nomes = Array.from(tela.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(nomes).toEqual(['Descobrir', 'Mapa']);
  });

  it('leva cada aba para o seu endereço', async () => {
    const fixture = await montar();
    const tela = fixture.nativeElement as HTMLElement;
    const enderecos = Array.from(tela.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(enderecos).toEqual(['/', '/mapa']);
  });

  it('manda os endereços antigos /amigos e /favoritos para o Descobrir', async () => {
    const fixture = await montar();
    const router = TestBed.inject(Router);
    for (const antigo of ['/amigos', '/favoritos']) {
      await router.navigateByUrl(antigo);
      await fixture.whenStable();
      expect(router.url, antigo).toBe('/');
      expect(abaAtual(fixture.nativeElement)).toBe('Descobrir');
    }
  });

  it('começa marcando o Descobrir', async () => {
    const fixture = await montar();
    expect(abaAtual(fixture.nativeElement)).toBe('Descobrir');
  });

  it('marca o Mapa quando a pessoa está nele', async () => {
    const fixture = await montar();
    await TestBed.inject(Router).navigateByUrl('/mapa');
    await fixture.whenStable();
    expect(abaAtual(fixture.nativeElement)).toBe('Mapa');
  });

  it('continua marcando o Descobrir dentro de um lugar', async () => {
    const fixture = await montar();
    await TestBed.inject(Router).navigateByUrl('/local/consolacao');
    await fixture.whenStable();
    expect(abaAtual(fixture.nativeElement)).toBe('Descobrir');
  });
});
