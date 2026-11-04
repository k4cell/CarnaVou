import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { ABRIR_ENDERECO, AvisoDeNavegacao } from './aviso-de-navegacao';

@Component({ template: '' })
class TelaVazia {}

describe('AvisoDeNavegacao', () => {
  async function montar() {
    const abrir = vi.fn();
    await TestBed.configureTestingModule({
      imports: [AvisoDeNavegacao],
      providers: [
        provideRouter([
          { path: '', component: TelaVazia },
          { path: 'boa', component: TelaVazia },
          { path: 'ruim', loadComponent: () => Promise.reject(new Error('o pedaço não baixou')) },
          { path: 'lenta', loadComponent: () => new Promise<typeof TelaVazia>(() => undefined) },
        ]),
        { provide: ABRIR_ENDERECO, useValue: abrir },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AvisoDeNavegacao);
    await fixture.whenStable();
    return { fixture, tela: fixture.nativeElement as HTMLElement, router: TestBed.inject(Router), abrir };
  }

  it('não mostra nada quando a tela abre', async () => {
    const { fixture, tela, router } = await montar();
    await router.navigateByUrl('/boa');
    await fixture.whenStable();
    expect(tela.querySelector('.aviso')).toBeNull();
  });

  it('avisa quando a tela não abre e, ao tentar de novo, abre o endereço do zero', async () => {
    const { fixture, tela, router, abrir } = await montar();
    await router.navigateByUrl('/ruim').catch(() => undefined);
    await fixture.whenStable();
    expect(tela.querySelector('.aviso')?.textContent).toContain('Não consegui abrir essa tela.');
    expect(tela.querySelector('.aviso')?.getAttribute('role')).toBe('alert');
    tela.querySelector<HTMLButtonElement>('.aviso button')!.click();
    expect(abrir).toHaveBeenCalledWith('/ruim');
  });

  it('tira o aviso de erro quando outra tela abre', async () => {
    const { fixture, tela, router } = await montar();
    await router.navigateByUrl('/ruim').catch(() => undefined);
    await fixture.whenStable();
    await router.navigateByUrl('/boa');
    await fixture.whenStable();
    expect(tela.querySelector('.aviso')).toBeNull();
  });

  it('mostra "Carregando" só quando a tela demora', async () => {
    const { fixture, tela, router } = await montar();
    void router.navigateByUrl('/lenta');
    await Promise.resolve();
    expect(tela.querySelector('.carregando')).toBeNull();
    await new Promise((pronto) => setTimeout(pronto, 350));
    // Aqui não dá para esperar a tela ficar estável: a navegação continua no meio do caminho.
    fixture.detectChanges();
    expect(tela.querySelector('.carregando')?.textContent).toContain('Carregando');
  });
});
