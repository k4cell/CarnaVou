import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { cartoesDaAba } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { definirCorrecoes } from '../dados/correcoes';
import { PaginaBloco } from './pagina-bloco';

describe('PaginaBloco', () => {
  async function renderizar(local: string, bloco: string): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [PaginaBloco],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PaginaBloco);
    fixture.componentRef.setInput('local', local);
    fixture.componentRef.setInput('bloco', bloco);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function atracoesDe(tela: HTMLElement) {
    return Array.from(tela.querySelectorAll('.atracao')).map((a) => ({
      hora: a.querySelector('.hora')?.textContent ?? '',
      nomes: a.querySelector('.nomes-da-hora')?.textContent,
    }));
  }

  describe('a cor da faixa das atrações', () => {
    it('é a cor do lugar do bloco: amarelo na Consolação, rosa no Ibirapuera', async () => {
      const naConsolacao = await renderizar('consolacao', 'pipoca-da-rainha');
      expect(naConsolacao.getAttribute('data-faixa')).toBe('amarelo');
      TestBed.resetTestingModule();
      const noIbirapuera = await renderizar('ibirapuera', 'agrada-gregos');
      expect(noIbirapuera.getAttribute('data-faixa')).toBe('rosa');
    });

    it('é a mesma do cartão do lugar na lista, num bloco de cada lugar', async () => {
      const corNaLista = new Map(cartoesDaAba('geral', null).map((cartao) => [cartao.local.id, cartao.faixa]));
      const umPorLugar = [...new Map(BLOCOS.map((bloco) => [bloco.localId, bloco])).values()];
      for (const bloco of umPorLugar) {
        TestBed.resetTestingModule();
        const tela = await renderizar(bloco.localId, bloco.id);
        expect(tela.getAttribute('data-faixa'), bloco.nome).toBe(corNaLista.get(bloco.localId));
      }
    });
  });

  it('leva para o mapa já com o bloco escolhido', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    expect(tela.querySelector('a.ver-no-mapa')?.getAttribute('href')).toBe('/mapa?bloco=agrada-gregos');
  });

  it('mostra o itinerário oficial do bloco', async () => {
    const tela = await renderizar('ipiranga-sao-joao', 'tarado-ni-voce');
    expect(tela.querySelector('.itinerario')?.textContent).toBe(
      'Itinerário: Av. Ipiranga, Av. São Luiz, Av. Cel. Xavier de Toledo, Teatro Municipal',
    );
  });

  it('tem o botão de copiar o link do bloco', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    expect(tela.querySelector('app-copiar-link button')?.textContent).toContain('Copiar link');
  });

  it('mostra o dia, o lugar e o horário do bloco', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    const texto = tela.textContent ?? '';
    expect(tela.querySelector('h2')?.textContent).toContain('Agrada Gregos');
    expect(texto).toContain('Sábado, 14 de fevereiro');
    expect(texto).toContain('Parque Ibirapuera');
    expect(texto).toContain('Concentração às 13h · desfile às 14h · termina às 18h');
  });

  it('lista as atrações sem hora divulgada numa linha só, lado a lado', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    expect(atracoesDe(tela)).toEqual([{ hora: '', nomes: 'Gloria Groove e Gretchen' }]);
  });

  it('junta por horário quem canta na mesma hora, do mais cedo para o mais tarde', async () => {
    const tela = await renderizar('consolacao', 'bloco-skol');
    expect(atracoesDe(tela)).toEqual([
      { hora: '11h30', nomes: 'Zé Vaqueiro, Nattan, Xand Avião e Felipe Amorim' },
      { hora: '14h', nomes: 'Calvin Harris' },
    ]);
  });

  it('avisa quando o bloco ainda não tem atração divulgada', async () => {
    const tela = await renderizar('ibirapuera', 'galo-da-madrugada');
    expect(tela.querySelectorAll('.atracao').length).toBe(0);
    expect(tela.textContent).toContain('Ainda não tem atrações divulgadas.');
  });

  describe('o Instagram dos artistas', () => {
    it('leva ao perfil de cada artista que tem o perfil nos dados, numa aba nova', async () => {
      // No Agrada Gregos tocam Gloria Groove (com perfil) e Gretchen (sem).
      const tela = await renderizar('ibirapuera', 'agrada-gregos');
      const links = Array.from(tela.querySelectorAll<HTMLAnchorElement>('.instagram a'));
      expect(links.map((link) => link.textContent?.trim())).toEqual(['Gloria Groove']);
      expect(links[0].getAttribute('href')).toBe('https://www.instagram.com/gloriagroove/');
      expect(links[0].getAttribute('target')).toBe('_blank');
      expect(links[0].getAttribute('rel')).toBe('noopener');
      expect(links[0].getAttribute('aria-label')).toBe('Gloria Groove no Instagram');
    });

    it('não aparece quando nenhum artista do bloco tem o perfil', async () => {
      const tela = await renderizar('ibirapuera', 'galo-da-madrugada');
      expect(tela.querySelector('.instagram')).toBeNull();
      expect(tela.textContent).not.toContain('No Instagram');
    });
  });

  it('mostra o estilo só quando alguma fonte diz', async () => {
    const comEstilo = await renderizar('ibirapuera', 'galo-da-madrugada');
    expect(comEstilo.textContent).toContain('Estilo: Frevo');
    TestBed.resetTestingModule();
    const semEstilo = await renderizar('ibirapuera', 'carna-lau');
    expect(semEstilo.textContent).not.toContain('Estilo:');
  });

  describe('um bloco corrigido', () => {
    afterEach(() => definirCorrecoes([]));

    it('cancelado: avisa, mostra a nota e tira o botão do mapa', async () => {
      definirCorrecoes([{ id: 'agrada-gregos', cancelado: true, nota: 'Choveu demais.' }]);
      const tela = await renderizar('ibirapuera', 'agrada-gregos');
      expect(tela.querySelector('.correcao')?.textContent).toContain('Bloco cancelado. Choveu demais.');
      expect(tela.querySelector('.ver-no-mapa')).toBeNull();
    });

    it('com horário mudado: avisa e mostra o horário novo', async () => {
      definirCorrecoes([{ id: 'agrada-gregos', inicio: '07:00', desfile: '07:30', fim: '10:00' }]);
      const tela = await renderizar('ibirapuera', 'agrada-gregos');
      expect(tela.querySelector('.correcao')?.textContent).toContain('O horário mudou.');
      expect(tela.querySelector('.horario')?.textContent).toContain('Concentração às 7h');
      expect(tela.querySelector('.ver-no-mapa')).not.toBeNull();
    });

    it('a tela muda sozinha quando a correção chega com a página aberta', async () => {
      await TestBed.configureTestingModule({ imports: [PaginaBloco], providers: [provideRouter([])] }).compileComponents();
      const fixture = TestBed.createComponent(PaginaBloco);
      fixture.componentRef.setInput('local', 'ibirapuera');
      fixture.componentRef.setInput('bloco', 'agrada-gregos');
      await fixture.whenStable();
      const tela = fixture.nativeElement as HTMLElement;
      expect(tela.querySelector('.correcao')).toBeNull();
      definirCorrecoes([{ id: 'agrada-gregos', cancelado: true }]);
      await fixture.whenStable();
      expect(tela.querySelector('.correcao')?.textContent).toContain('Bloco cancelado.');
    });

    it('sem correção, não mostra aviso nenhum', async () => {
      const tela = await renderizar('ibirapuera', 'agrada-gregos');
      expect(tela.querySelector('.correcao')).toBeNull();
    });
  });

  it('avisa quando o bloco não existe', async () => {
    const tela = await renderizar('ibirapuera', 'bloco-que-nao-existe');
    expect(tela.textContent).toContain('Não achei esse bloco');
  });

  it('não acha um bloco pelo lugar errado', async () => {
    const tela = await renderizar('consolacao', 'agrada-gregos');
    expect(tela.textContent).toContain('Não achei esse bloco');
  });
});
