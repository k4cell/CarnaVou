import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { blocosDaNoite } from '../dados/lista-de-blocos';
import { LUGARES_DO_AFTER } from '../dados/lugares-do-after';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { estaNaGrandeSP } from '../mapa/limites';
import { Relogio } from '../relogio/relogio';
import { PaginaAfter } from './pagina-after';

describe('PaginaAfter', () => {
  async function renderizar(agora?: Date, aba?: 'hoje' | 'amanha' | 'geral') {
    await TestBed.configureTestingModule({
      imports: [PaginaAfter],
      providers: [provideRouter([])],
    }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora);
    }
    if (aba) {
      TestBed.inject(FiltroDeDia).escolher(aba);
    }
    const fixture = TestBed.createComponent(PaginaAfter);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const nomesDosBlocos = (tela: HTMLElement) =>
    Array.from(tela.querySelectorAll('app-banner-bloco .nome')).map((nome) => nome.textContent);

  it('tem as abas do dia no alto, como as outras abas', async () => {
    const tela = await renderizar();
    expect(tela.querySelector('app-abas-do-dia')).not.toBeNull();
  });

  it('mostra os blocos da noite da aba escolhida, com o lugar de cada um', async () => {
    const sabado = new Date(2026, 1, 7, 12, 0);
    const tela = await renderizar(sabado, 'amanha');
    expect(nomesDosBlocos(tela)).toEqual(blocosDaNoite('amanha', sabado).map((bloco) => bloco.nome));
    expect(tela.querySelector('app-banner-bloco .lugar')).not.toBeNull();
  });

  it('avisa quando não tem bloco da noite no dia', async () => {
    const tela = await renderizar(new Date(2026, 1, 7, 19, 0), 'hoje');
    expect(nomesDosBlocos(tela)).toEqual([]);
    expect(tela.querySelector('.vazio')?.textContent).toContain('Nenhum bloco da noite hoje.');
  });

  it('mostra os bares e pontos de encontro, com Ir, Waze e Uber', async () => {
    const tela = await renderizar();
    const cartoes = Array.from(tela.querySelectorAll('.lugar-do-after'));
    expect(cartoes.map((cartao) => cartao.querySelector('.nome')?.textContent)).toEqual(
      LUGARES_DO_AFTER.map((lugar) => lugar.nome),
    );
    expect(cartoes[0].querySelector('.nome')?.textContent).toBe('Beco do Batman');
    for (const cartao of cartoes) {
      const links = Array.from(cartao.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      expect(links.map((link) => link.textContent?.trim())).toEqual(['Ir', 'Waze', 'Uber']);
      expect(links.every((link) => link.getAttribute('target') === '_blank')).toBe(true);
    }
  });

  it('cada lugar está na Grande São Paulo e tem endereço', () => {
    for (const lugar of LUGARES_DO_AFTER) {
      expect(estaNaGrandeSP(lugar.lat, lugar.lng), lugar.nome).toBe(true);
      expect(lugar.endereco.length, lugar.nome).toBeGreaterThan(5);
    }
  });

  it('as faixas dos lugares se revezam nas cores', async () => {
    const tela = await renderizar();
    const faixas = Array.from(tela.querySelectorAll('.lugar-do-after')).map((cartao) => cartao.getAttribute('data-faixa'));
    expect(faixas.slice(0, 3)).toEqual(['rosa', 'amarelo', 'verde']);
  });
});
