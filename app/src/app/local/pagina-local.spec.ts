import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { cartoesDaAba } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { PaginaLocal } from './pagina-local';

describe('PaginaLocal', () => {
  async function renderizar(local: string): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [PaginaLocal],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PaginaLocal);
    fixture.componentRef.setInput('local', local);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra só os blocos do lugar escolhido', async () => {
    const tela = await renderizar('consolacao');
    const esperados = BLOCOS.filter((bloco) => bloco.localId === 'consolacao');
    expect(tela.querySelector('h2')?.textContent).toContain('Rua da Consolação e Baixo Augusta');
    expect(tela.querySelectorAll('app-banner-bloco').length).toBe(esperados.length);
  });

  it('põe os blocos em ordem de data', async () => {
    const tela = await renderizar('ibirapuera');
    const datas = Array.from(tela.querySelectorAll('time')).map((t) => t.getAttribute('datetime') ?? '');
    expect(datas.length).toBeGreaterThan(1);
    expect(datas).toEqual([...datas].sort());
  });

  it('leva cada banner para a página do bloco', async () => {
    const tela = await renderizar('consolacao');
    const hrefs = Array.from(tela.querySelectorAll('app-banner-bloco a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/local/consolacao/bloco-skol-calvin-harris');
  });

  it('mostra a hora que começa e só mostra o fim quando existe', async () => {
    const tela = await renderizar('ibirapuera');
    const horarios = Array.from(tela.querySelectorAll('.horario')).map((h) => h.textContent ?? '');
    expect(horarios.every((h) => h.startsWith('Começa às '))).toBe(true);
    expect(horarios.some((h) => h.includes('vai até'))).toBe(true);
    expect(horarios.some((h) => !h.includes('vai até'))).toBe(true);
  });

  it('só mostra a linha de artistas nos blocos que têm artista', async () => {
    const tela = await renderizar('consolacao');
    const comArtista = tela.querySelector('a[href="/local/consolacao/pipoca-da-rainha"] .atracoes');
    const semArtista = tela.querySelector('a[href="/local/consolacao/eu-sou-do-axe"] .atracoes');
    expect(comArtista?.textContent).toBe('Daniela Mercury');
    expect(semArtista).toBeNull();
  });

  it('mostra a zona do lugar na etiqueta de cor', async () => {
    const tela = await renderizar('ibirapuera');
    const etiqueta = tela.querySelector('.zona');
    expect(etiqueta?.textContent).toBe('Zona Sul');
    expect(etiqueta?.classList.contains('sul')).toBe(true);
  });

  describe('a cor da faixa dos banners', () => {
    const faixasDosBanners = (tela: HTMLElement) =>
      Array.from(tela.querySelectorAll('.banner')).map((banner) => banner.getAttribute('data-faixa'));

    it('é a cor do lugar: amarelo para a Consolação, rosa para o Ibirapuera', async () => {
      const consolacao = await renderizar('consolacao');
      expect(new Set(faixasDosBanners(consolacao))).toEqual(new Set(['amarelo']));
      TestBed.resetTestingModule();
      const ibirapuera = await renderizar('ibirapuera');
      expect(new Set(faixasDosBanners(ibirapuera))).toEqual(new Set(['rosa']));
    });

    it('é a mesma do cartão do lugar na lista, em todos os lugares', async () => {
      for (const cartao of cartoesDaAba('geral', null)) {
        TestBed.resetTestingModule();
        const tela = await renderizar(cartao.local.id);
        const faixas = faixasDosBanners(tela);
        expect(faixas.length, cartao.local.nome).toBeGreaterThan(0);
        expect(new Set(faixas), cartao.local.nome).toEqual(new Set([cartao.faixa]));
      }
    });
  });

  it('leva para o mapa já com o lugar escolhido', async () => {
    const tela = await renderizar('consolacao');
    expect(tela.querySelector('a.ver-no-mapa')?.getAttribute('href')).toBe('/mapa?lugar=consolacao');
  });

  it('tem o botão de copiar o link do lugar', async () => {
    const tela = await renderizar('consolacao');
    expect(tela.querySelector('app-copiar-link button')?.textContent).toContain('Copiar link');
  });

  it('avisa quando o lugar não existe', async () => {
    const tela = await renderizar('lugar-que-nao-existe');
    expect(tela.textContent).toContain('Não achei esse lugar');
    expect(tela.querySelectorAll('app-banner-bloco').length).toBe(0);
  });
});
