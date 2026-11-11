import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { cartoesDaAba } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { destaquesDoLocal } from '../dados/consultas';
import { FiltroDeDia } from '../filtro/filtro-de-dia';
import { Relogio } from '../relogio/relogio';
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
    const tela = await renderizar('ibirapuera');
    const esperados = BLOCOS.filter((bloco) => bloco.localId === 'ibirapuera');
    expect(tela.querySelector('h2')?.textContent).toContain('Parque Ibirapuera');
    expect(tela.querySelectorAll('app-banner-bloco').length).toBe(esperados.length);
  });

  it('põe os blocos de cada dia em ordem de data', async () => {
    const tela = await renderizar('ibirapuera');
    const datas = Array.from(tela.querySelectorAll('.grupo time')).map((t) => t.getAttribute('datetime') ?? '');
    expect(datas.length).toBeGreaterThan(1);
    expect(datas).toEqual([...datas].sort());
  });

  it('leva cada banner para a página do bloco', async () => {
    const tela = await renderizar('consolacao');
    const hrefs = Array.from(tela.querySelectorAll('app-banner-bloco a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/local/consolacao/bloco-skol');
  });

  it('mostra a hora da concentração e a do fim', async () => {
    const tela = await renderizar('ibirapuera');
    const horarios = Array.from(tela.querySelectorAll('.horario')).map((h) => h.textContent ?? '');
    expect(horarios.length).toBeGreaterThan(0);
    expect(horarios.every((h) => /^Começa às \d+h(\d\d)? · vai até \d+h(\d\d)?$/.test(h))).toBe(true);
  });

  it('só mostra a linha de artistas nos blocos que têm artista', async () => {
    const tela = await renderizar('ibirapuera');
    const comArtista = tela.querySelector('a[href="/local/ibirapuera/forrozin"] .atracoes');
    const semArtista = tela.querySelector('a[href="/local/ibirapuera/carna-lau"] .atracoes');
    expect(comArtista?.textContent).toBe('Mariana Aydar');
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

    it('é a cor do lugar: rosa para o Ibirapuera, amarelo para a Consolação', async () => {
      const ibirapuera = await renderizar('ibirapuera');
      expect(new Set(faixasDosBanners(ibirapuera))).toEqual(new Set(['rosa']));
      TestBed.resetTestingModule();
      const consolacao = await renderizar('consolacao');
      expect(new Set(faixasDosBanners(consolacao))).toEqual(new Set(['amarelo']));
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
      const tela = await renderizar('ibirapuera');
      const emDestaque = new Set(destaquesDoLocal('ibirapuera', 4).map((bloco) => bloco.id));
      const datas = BLOCOS.filter((bloco) => bloco.localId === 'ibirapuera' && !emDestaque.has(bloco.id)).map(
        (bloco) => bloco.data,
      );
      const dias = Array.from(tela.querySelectorAll('li.grupo'));
      expect(dias.length).toBe(new Set(datas).size);
      const datasDosDias = dias.map((dia) => dia.querySelector('time')?.getAttribute('datetime'));
      expect(datasDosDias).toEqual([...datasDosDias].sort());
    });

    it('juntam os blocos do sábado, 7 de fevereiro, no Ibirapuera, sem perder nenhum', async () => {
      const tela = await renderizar('ibirapuera');
      const sabado = Array.from(tela.querySelectorAll('li.grupo')).find(
        (dia) => dia.getAttribute('aria-label') === 'Sábado, 7 de fevereiro',
      );
      const nomes = Array.from(sabado?.querySelectorAll('.nome') ?? []).map((nome) => nome.textContent);
      // O Quem Pede, Pede (Ivete) está nos destaques; no dia ficam os outros dois.
      expect(nomes).toEqual(['Forrozin', 'Bicho Maluco Beleza, com Alceu Valença']);
    });

    it('o dia aparece uma vez em cada cartão, e cada bloco continua com o horário e o link dele', async () => {
      const tela = await renderizar('ibirapuera');
      const primeiroDia = tela.querySelector('li.grupo')!;
      const banners = Array.from(primeiroDia.querySelectorAll('app-banner-bloco'));
      expect(banners.length).toBeGreaterThan(1);
      // A data fica no cartão, na coluna da esquerda, e não dentro dos blocos.
      expect(primeiroDia.querySelectorAll('time').length).toBe(1);
      expect(primeiroDia.querySelector('.data-do-grupo time')).not.toBeNull();
      expect(banners.some((banner) => banner.querySelector('time'))).toBe(false);
      for (const banner of banners) {
        expect(banner.querySelector('.horario')?.textContent).toContain('Começa às');
        expect(banner.querySelector('a')?.getAttribute('href')).toMatch(/^\/local\/ibirapuera\//);
      }
    });
  });

  describe('com o dia de hoje conhecido (a aba escolhida em qualquer tela vale aqui)', () => {
    // Sábado, 14/02/2026, duas da tarde: no Ibirapuera tem Carna Lau e Agrada Gregos.
    async function renderizarNoDia(local: string, aba?: 'hoje' | 'amanha' | 'geral') {
      await TestBed.configureTestingModule({
        imports: [PaginaLocal],
        providers: [provideRouter([])],
      }).compileComponents();
      TestBed.inject(Relogio).definir(new Date(2026, 1, 14, 14, 0));
      if (aba) {
        TestBed.inject(FiltroDeDia).escolher(aba);
      }
      const fixture = TestBed.createComponent(PaginaLocal);
      fixture.componentRef.setInput('local', local);
      await fixture.whenStable();
      const tela = fixture.nativeElement as HTMLElement;
      const datas = () => Array.from(tela.querySelectorAll('time')).map((t) => t.getAttribute('datetime'));
      return { fixture, tela, datas };
    }

    it('mostra as abas, com a escolhida marcada', async () => {
      const { tela } = await renderizarNoDia('ibirapuera', 'amanha');
      const abas = Array.from(tela.querySelectorAll('app-abas-do-dia button'));
      expect(abas.map((aba) => aba.textContent?.trim())).toEqual(['Hoje', 'Amanhã', 'Geral']);
      expect(abas.map((aba) => aba.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    });

    it('vindo de Hoje, mostra só os blocos de hoje', async () => {
      const { datas } = await renderizarNoDia('ibirapuera', 'hoje');
      expect(datas().length).toBe(BLOCOS.filter((b) => b.localId === 'ibirapuera' && b.data === '2026-02-14').length);
      expect(datas().every((data) => data === '2026-02-14')).toBe(true);
    });

    it('tocar na aba Geral troca os blocos sem sair da página, e vale nas outras telas', async () => {
      const { fixture, tela, datas } = await renderizarNoDia('ibirapuera', 'hoje');
      const geral = Array.from(tela.querySelectorAll<HTMLButtonElement>('app-abas-do-dia button')).find(
        (aba) => aba.textContent?.trim() === 'Geral',
      )!;
      geral.click();
      await fixture.whenStable();
      expect(TestBed.inject(FiltroDeDia).ativa()).toBe('geral');
      expect(tela.querySelectorAll('app-banner-bloco').length).toBe(
        BLOCOS.filter((b) => b.localId === 'ibirapuera' && b.data >= '2026-02-14').length,
      );
      expect(datas().length).toBeGreaterThan(0);
    });

    it('na Geral, os dias que já passaram somem', async () => {
      const { datas } = await renderizarNoDia('ibirapuera', 'geral');
      expect(datas().length).toBeGreaterThan(0);
      expect(datas().every((data) => (data ?? '') >= '2026-02-14')).toBe(true);
    });

    it('diz só o horário no bloco que está rolando', async () => {
      const { tela } = await renderizarNoDia('ibirapuera', 'hoje');
      const horario = (id: string) => tela.querySelector(`a[href="/local/ibirapuera/${id}"] .horario`)?.textContent;
      // Às 14h: o Carna Lau começou ao meio-dia e vai até as 16h; o Agrada Gregos, à uma.
      expect(horario('carna-lau')).toBe('Das 12h às 16h');
      expect(horario('agrada-gregos')).toBe('Das 13h às 18h');
    });

    it('sem bloco no dia da aba, avisa e já mostra os próximos dias do lugar', async () => {
      // A Consolação não tem bloco no sábado, 14/02, mas tem no domingo, 22/02.
      const { tela, datas } = await renderizarNoDia('consolacao', 'hoje');
      expect(tela.querySelector('.vazio')?.textContent).toContain('Nenhum bloco aqui hoje. Estes são os próximos dias:');
      expect(tela.querySelectorAll('app-banner-bloco').length).toBe(
        BLOCOS.filter((b) => b.localId === 'consolacao' && b.data >= '2026-02-14').length,
      );
      expect(datas()).toContain('2026-02-22');
      expect(TestBed.inject(FiltroDeDia).ativa()).toBe('hoje');
    });

    it('sem bloco amanhã, mostra os outros dias do lugar', async () => {
      const { tela } = await renderizarNoDia('consolacao', 'amanha');
      expect(tela.querySelector('.vazio')?.textContent).toContain('Nenhum bloco aqui amanhã. Estes são os outros dias:');
      expect(tela.querySelectorAll('app-banner-bloco').length).toBeGreaterThan(0);
    });

    it('avisa quando o lugar não tem mais nenhum bloco pela frente', async () => {
      // Santo Amaro só teve blocos antes de 14/02.
      const { tela } = await renderizarNoDia('santo-amaro', 'hoje');
      expect(tela.querySelector('.vazio')?.textContent).toContain('Não tem mais blocos aqui.');
      expect(tela.querySelectorAll('app-banner-bloco').length).toBe(0);
    });
  });

  describe('os destaques', () => {
    const nomesDosDestaques = (tela: HTMLElement) =>
      Array.from(tela.querySelectorAll('.destaques .nome')).map((nome) => nome.textContent);

    it('mostra no topo os quatro blocos mais famosos, do mais para o menos', async () => {
      const tela = await renderizar('ibirapuera');
      expect(nomesDosDestaques(tela)).toEqual([
        'Carnafacul - Quem Pede, Pede',
        'Carnafacul - Vem com o Gigante',
        'Bloco da Pabllo',
        'Bloco da Pocah',
      ]);
    });

    it('não repete nos dias o bloco que está nos destaques', async () => {
      const tela = await renderizar('ibirapuera');
      const nosDias = Array.from(tela.querySelectorAll('.grupo .nome')).map((nome) => nome.textContent);
      expect(nosDias).not.toContain('Carnafacul - Quem Pede, Pede');
      expect(nosDias).toContain('Forrozin');
    });

    it('não aparecem quando o lugar não tem artista conhecido', async () => {
      const tela = await renderizar('paulo-vi');
      expect(tela.querySelector('.destaques')).toBeNull();
      expect(tela.querySelectorAll('app-banner-bloco').length).toBeGreaterThan(0);
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
