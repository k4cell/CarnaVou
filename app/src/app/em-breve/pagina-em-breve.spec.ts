import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../app.routes';
import { PaginaEmBreve } from './pagina-em-breve';

describe('PaginaEmBreve', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

  it('mostra o título e o aviso "Em breve"', async () => {
    const fixture = TestBed.createComponent(PaginaEmBreve);
    fixture.componentRef.setInput('titulo', 'Mapa');
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    expect(tela.querySelector('h2')?.textContent).toBe('Mapa');
    expect(tela.textContent).toContain('Em breve');
  });

  for (const [endereco, titulo] of [
    ['/mapa', 'Mapa'],
    ['/amigos', 'Amigos'],
    ['/favoritos', 'Favoritos'],
  ]) {
    it(`a rota ${endereco} mostra "${titulo}" com "Em breve"`, async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(endereco, PaginaEmBreve);
      const tela = harness.routeNativeElement as HTMLElement;
      expect(tela.querySelector('h2')?.textContent).toBe(titulo);
      expect(tela.textContent).toContain('Em breve');
    });
  }
});
