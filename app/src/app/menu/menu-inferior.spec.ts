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

  it('tem as abas Blocos, Descobrir, After e Mapa, na ordem', async () => {
    const fixture = await montar();
    const tela = fixture.nativeElement as HTMLElement;
    const nomes = Array.from(tela.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(nomes).toEqual(['Blocos', 'Descobrir', 'After', 'Mapa']);
  });

  it('marca a aba After quando a pessoa está nela', async () => {
    const fixture = await montar();
    await TestBed.inject(Router).navigateByUrl('/after');
    await fixture.whenStable();
    expect(abaAtual(fixture.nativeElement)).toBe('After');
  });

  it('marca o Descobrir quando a pessoa está nele', async () => {
    const fixture = await montar();
    await TestBed.inject(Router).navigateByUrl('/descobrir');
    await fixture.whenStable();
    expect(abaAtual(fixture.nativeElement)).toBe('Descobrir');
  });

  it('manda o endereço antigo /blocos para a tela principal, na aba Blocos', async () => {
    const fixture = await montar();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/blocos?hoje=2026-02-08T10:00');
    await fixture.whenStable();
    expect(router.url).toBe('/?hoje=2026-02-08T10:00');
    expect(abaAtual(fixture.nativeElement)).toBe('Blocos');
  });

  it('leva cada aba para o seu endereço', async () => {
    const fixture = await montar();
    const tela = fixture.nativeElement as HTMLElement;
    const enderecos = Array.from(tela.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(enderecos).toEqual(['/', '/descobrir', '/after', '/mapa']);
  });

  it('manda os endereços antigos /amigos e /favoritos para a tela principal', async () => {
    const fixture = await montar();
    const router = TestBed.inject(Router);
    for (const antigo of ['/amigos', '/favoritos']) {
      await router.navigateByUrl(antigo);
      await fixture.whenStable();
      expect(router.url, antigo).toBe('/');
      expect(abaAtual(fixture.nativeElement)).toBe('Blocos');
    }
  });

  it('começa marcando a aba Blocos', async () => {
    const fixture = await montar();
    expect(abaAtual(fixture.nativeElement)).toBe('Blocos');
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
