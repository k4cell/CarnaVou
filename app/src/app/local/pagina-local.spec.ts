import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { cartoesDaAba } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { destaquesDoLocal } from '../dados/consultas';
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
    const tela = await renderizar('vila-mariana');
    const esperados = BLOCOS.filter((bloco) => bloco.localId === 'vila-mariana');
    expect(tela.querySelector('h2')?.textContent).toContain('Vila Mariana');
    expect(tela.querySelectorAll('app-banner-bloco').length).toBe(esperados.length);
  });

  it('põe os blocos de cada dia em ordem de data', async () => {
    const tela = await renderizar('vila-mariana');
    const datas = Array.from(tela.querySelectorAll('.dia time')).map((t) => t.getAttribute('datetime') ?? '');
    expect(datas.length).toBeGreaterThan(1);
    expect(datas).toEqual([...datas].sort());
  });

  it('leva cada banner para a página do bloco', async () => {
    const tela = await renderizar('se');
    const hrefs = Array.from(tela.querySelectorAll('app-banner-bloco a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/local/se/bloco-skol');
  });

  it('mostra a hora da concentração e a do fim', async () => {
    const tela = await renderizar('vila-mariana');
    const horarios = Array.from(tela.querySelectorAll('.horario')).map((h) => h.textContent ?? '');
    expect(horarios.length).toBeGreaterThan(0);
    expect(horarios.every((h) => /^Começa às \d+h(\d\d)? · vai até \d+h(\d\d)?$/.test(h))).toBe(true);
  });

  it('só mostra a linha de artistas nos blocos que têm artista', async () => {
    const tela = await renderizar('se');
    const comArtista = tela.querySelector('a[href="/local/se/pipoca-da-rainha"] .atracoes');
    const semArtista = tela.querySelector('a[href="/local/se/banda-do-candinho"] .atracoes');
    expect(comArtista?.textContent).toBe('Daniela Mercury');
    expect(semArtista).toBeNull();
  });

  it('mostra a zona do lugar na etiqueta de cor', async () => {
    const tela = await renderizar('vila-mariana');
    const etiqueta = tela.querySelector('.zona');
    expect(etiqueta?.textContent).toBe('Zona Sul');
    expect(etiqueta?.classList.contains('sul')).toBe(true);
  });

  describe('a cor da faixa dos banners', () => {
    const faixasDosBanners = (tela: HTMLElement) =>
      Array.from(tela.querySelectorAll('.banner')).map((banner) => banner.getAttribute('data-faixa'));

    it('é a cor do lugar: rosa para a Vila Mariana, amarelo para a Sé', async () => {
      const vilaMariana = await renderizar('vila-mariana');
      expect(new Set(faixasDosBanners(vilaMariana))).toEqual(new Set(['rosa']));
      TestBed.resetTestingModule();
      const se = await renderizar('se');
      expect(new Set(faixasDosBanners(se))).toEqual(new Set(['amarelo']));
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

  describe('os blocos do mesmo dia', () => {
    it('ficam juntos num cartão só, um por dia, na ordem das datas', async () => {
      const tela = await renderizar('vila-mariana');
      const emDestaque = new Set(destaquesDoLocal('vila-mariana', 4).map((bloco) => bloco.id));
      const datas = BLOCOS.filter((bloco) => bloco.localId === 'vila-mariana' && !emDestaque.has(bloco.id)).map(
        (bloco) => bloco.data,
      );
      const dias = Array.from(tela.querySelectorAll('li.dia'));
      expect(dias.length).toBe(new Set(datas).size);
      const datasDosDias = dias.map((dia) => dia.querySelector('time')?.getAttribute('datetime'));
      expect(datasDosDias).toEqual([...datasDosDias].sort());
    });

    it('juntam os blocos do sábado, 7 de fevereiro, na Vila Mariana, sem perder nenhum', async () => {
      const tela = await renderizar('vila-mariana');
      const sabado = Array.from(tela.querySelectorAll('li.dia')).find(
        (dia) => dia.getAttribute('aria-label') === 'Sábado, 7 de fevereiro',
      );
      const nomes = Array.from(sabado?.querySelectorAll('.nome') ?? []).map((nome) => nome.textContent);
      // O Quem Pede, Pede (Ivete) está nos destaques; no dia ficam os outros dois.
      expect(nomes).toEqual(['Forrozin', 'Bicho Maluco Beleza, com Alceu Valença']);
    });

    it('cada bloco do cartão continua com o dia, o horário e o link dele', async () => {
      const tela = await renderizar('vila-mariana');
      const primeiroDia = tela.querySelector('li.dia')!;
      const banners = Array.from(primeiroDia.querySelectorAll('app-banner-bloco'));
      expect(banners.length).toBeGreaterThan(1);
      for (const banner of banners) {
        expect(banner.querySelector('time')).not.toBeNull();
        expect(banner.querySelector('.horario')?.textContent).toContain('Começa às');
        expect(banner.querySelector('a')?.getAttribute('href')).toMatch(/^\/local\/vila-mariana\//);
      }
    });
  });

  describe('os destaques', () => {
    const nomesDosDestaques = (tela: HTMLElement) =>
      Array.from(tela.querySelectorAll('.destaques .nome')).map((nome) => nome.textContent);

    it('mostra no topo os quatro blocos mais famosos, do mais para o menos', async () => {
      const tela = await renderizar('vila-mariana');
      expect(nomesDosDestaques(tela)).toEqual([
        'Carnafacul - Quem Pede, Pede',
        'Carnafacul - Vem com o Gigante',
        'Bloco da Pabllo',
        'Bloco da Pocah',
      ]);
    });

    it('não repete nos dias o bloco que está nos destaques', async () => {
      const tela = await renderizar('vila-mariana');
      const nosDias = Array.from(tela.querySelectorAll('.dia .nome')).map((nome) => nome.textContent);
      expect(nosDias).not.toContain('Carnafacul - Quem Pede, Pede');
      expect(nosDias).toContain('Forrozin');
    });

    it('não aparecem quando o lugar não tem artista conhecido', async () => {
      const tela = await renderizar('lapa');
      expect(tela.querySelector('.destaques')).toBeNull();
      expect(tela.querySelectorAll('app-banner-bloco').length).toBeGreaterThan(0);
    });
  });

  it('leva para o mapa já com o lugar escolhido', async () => {
    const tela = await renderizar('se');
    expect(tela.querySelector('a.ver-no-mapa')?.getAttribute('href')).toBe('/mapa?lugar=se');
  });

  it('tem o botão de copiar o link do lugar', async () => {
    const tela = await renderizar('se');
    expect(tela.querySelector('app-copiar-link button')?.textContent).toContain('Copiar link');
  });

  it('avisa quando o lugar não existe', async () => {
    const tela = await renderizar('lugar-que-nao-existe');
    expect(tela.textContent).toContain('Não achei esse lugar');
    expect(tela.querySelectorAll('app-banner-bloco').length).toBe(0);
  });
});
