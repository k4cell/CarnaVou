import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Relogio } from '../relogio/relogio';
import { PaginaBlocos } from './pagina-blocos';

describe('PaginaBlocos', () => {
  async function renderizar(agora: Date) {
    await TestBed.configureTestingModule({
      imports: [PaginaBlocos],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(Relogio).definir(agora, true);
    const fixture = TestBed.createComponent(PaginaBlocos);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('põe num cartão só os blocos do mesmo dia no mesmo lugar, com o lugar só no primeiro', async () => {
    // Sábado, 07/02, meio-dia: no Ibirapuera, Quem Pede, Pede e Forrozin rolando e Bicho Maluco às 14h.
    const tela = await renderizar(new Date(2026, 1, 7, 12, 0));
    const cartao = Array.from(tela.querySelectorAll('li.dia')).find((li) =>
      li.textContent?.includes('Quem Pede, Pede'),
    )!;
    const nomes = Array.from(cartao.querySelectorAll('.nome')).map((nome) => nome.textContent?.trim());
    expect(nomes).toEqual(['Carnafacul - Quem Pede, Pede', 'Forrozin', 'Bicho Maluco Beleza, com Alceu Valença']);
    const lugares = Array.from(cartao.querySelectorAll('app-banner-bloco')).map(
      (banner) => banner.querySelector('.lugar')?.textContent?.trim() ?? null,
    );
    expect(lugares).toEqual(['Parque Ibirapuera', null, null]);
  });

  it('deixa sozinho o bloco que não tem outro no mesmo lugar e dia', async () => {
    // Domingo, 08/02, às 13h: em Santana, cada bloco é numa rua diferente.
    const tela = await renderizar(new Date(2026, 1, 8, 13, 0));
    const vemDancar = Array.from(tela.querySelectorAll('.lista > li')).find((li) =>
      li.textContent?.includes('#VemDançar'),
    )!;
    expect(vemDancar.classList.contains('dia')).toBe(false);
    expect(vemDancar.querySelectorAll('app-banner-bloco').length).toBe(1);
    expect(vemDancar.querySelector('.lugar')?.textContent?.trim()).toBe('Santana/Tucuruvi');
  });
});
