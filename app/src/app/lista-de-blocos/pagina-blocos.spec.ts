import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Favoritos } from '../favoritos/favoritos';
import { Relogio } from '../relogio/relogio';
import { PaginaBlocos } from './pagina-blocos';

describe('PaginaBlocos', () => {
  afterEach(() => localStorage.removeItem('carnavou.favoritos'));

  async function renderizar(agora: Date) {
    await TestBed.configureTestingModule({
      imports: [PaginaBlocos],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(Relogio).definir(agora, true);
    const fixture = TestBed.createComponent(PaginaBlocos);
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    const nomes = () => Array.from(tela.querySelectorAll('.nome')).map((nome) => nome.textContent?.trim());
    const buscar = async (texto: string) => {
      const campo = tela.querySelector<HTMLInputElement>('.busca')!;
      campo.value = texto;
      campo.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const escolherLugar = async (id: string) => {
      const lista = tela.querySelector<HTMLSelectElement>('.lugar')!;
      lista.value = id;
      lista.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    return { fixture, tela, nomes, buscar, escolherLugar };
  }

  it('põe num cartão só os blocos do mesmo dia no mesmo lugar, com o nome do lugar no alto', async () => {
    // Sábado, 07/02, meio-dia: no Ibirapuera, Quem Pede, Pede e Forrozin rolando e Bicho Maluco às 14h.
    const { tela } = await renderizar(new Date(2026, 1, 7, 12, 0));
    const cartao = Array.from(tela.querySelectorAll('li.dia')).find((li) =>
      li.textContent?.includes('Quem Pede, Pede'),
    )!;
    const nomes = Array.from(cartao.querySelectorAll('.nome')).map((nome) => nome.textContent?.trim());
    expect(nomes).toEqual(['Carnafacul - Quem Pede, Pede', 'Forrozin', 'Bicho Maluco Beleza, com Alceu Valença']);
    expect(cartao.firstElementChild?.classList.contains('lugar-do-grupo')).toBe(true);
    expect(cartao.querySelector('.lugar-do-grupo')?.textContent?.trim()).toBe('Parque Ibirapuera');
    expect(cartao.getAttribute('data-faixa')).toBe('rosa');
    // O lugar fica só no alto, e não repete dentro dos blocos.
    expect(cartao.querySelectorAll('app-banner-bloco .lugar').length).toBe(0);
    // A data também aparece uma vez só, no primeiro bloco.
    expect(cartao.querySelectorAll('time').length).toBe(1);
  });

  it('deixa sozinho o bloco que não tem outro no mesmo lugar e dia, também com o lugar no alto', async () => {
    // Domingo, 08/02, às 13h: em Santana, cada bloco é numa rua diferente.
    const { tela } = await renderizar(new Date(2026, 1, 8, 13, 0));
    const vemDancar = Array.from(tela.querySelectorAll('.lista > li')).find((li) =>
      li.textContent?.includes('#VemDançar'),
    )!;
    expect(vemDancar.querySelectorAll('app-banner-bloco').length).toBe(1);
    expect(vemDancar.querySelector('.lugar-do-grupo')?.textContent?.trim()).toBe('Santana/Tucuruvi');
  });

  describe('a busca', () => {
    it('acha o artista em qualquer dia que ainda vai acontecer, sem ligar para acento', async () => {
      // Sábado, 07/02: o Bloco Skol, com o Zé Vaqueiro, é amanhã, e a aba aberta é a de Hoje.
      const { nomes, buscar } = await renderizar(new Date(2026, 1, 7, 12, 0));
      await buscar('ze vaqueiro');
      expect(nomes()).toEqual(['Bloco Skol']);
    });

    it('esconde as abas de dia enquanto busca', async () => {
      const { tela, buscar } = await renderizar(new Date(2026, 1, 7, 12, 0));
      expect(tela.querySelector('app-abas-do-dia')).not.toBeNull();
      await buscar('skol');
      expect(tela.querySelector('app-abas-do-dia')).toBeNull();
      await buscar('');
      expect(tela.querySelector('app-abas-do-dia')).not.toBeNull();
    });

    it('avisa quando não acha nada e deixa limpar', async () => {
      const { fixture, tela, nomes, buscar } = await renderizar(new Date(2026, 1, 7, 12, 0));
      await buscar('bloco que não existe');
      expect(tela.querySelector('.vazio')?.textContent).toContain('Não achei nenhum bloco');
      tela.querySelector<HTMLButtonElement>('.limpar')!.click();
      await fixture.whenStable();
      expect(tela.querySelector<HTMLInputElement>('.busca')!.value).toBe('');
      expect(nomes().length).toBeGreaterThan(0);
    });
  });

  describe('o filtro de lugar', () => {
    it('mostra os lugares juntos por zona e filtra a lista', async () => {
      const { tela, nomes, escolherLugar } = await renderizar(new Date(2026, 1, 7, 12, 0));
      const zonas = Array.from(tela.querySelectorAll('optgroup')).map((zona) => zona.label);
      expect(zonas).toEqual(['Centro', 'Zona Sul', 'Zona Oeste', 'Zona Leste', 'Zona Norte']);
      await escolherLugar('ibirapuera');
      // Os três de hoje e, como é pouco, os dois de amanhã ali mesmo.
      expect(nomes()).toEqual([
        'Carnafacul - Quem Pede, Pede',
        'Forrozin',
        'Bicho Maluco Beleza, com Alceu Valença',
        'Quintal dos Pretos',
        'Monobloco',
      ]);
      expect(tela.querySelector('.secao:last-of-type')?.textContent).toContain('Amanhã: Domingo, 8 de fevereiro');
    });

    it('avisa quando o lugar não tem bloco no dia', async () => {
      // Na aba Amanhã (08/02), Perus não tem bloco, e a aba não mostra outros dias.
      const { fixture, tela, escolherLugar } = await renderizar(new Date(2026, 1, 7, 12, 0));
      tela.querySelectorAll<HTMLButtonElement>('.aba')[1].click();
      await fixture.whenStable();
      await escolherLugar('perus');
      expect(tela.querySelector('.vazio')?.textContent).toContain('Nenhum bloco com esses filtros');
    });
  });

  describe('os favoritos', () => {
    it('mostra só os blocos marcados, com a conta no botão', async () => {
      const { fixture, tela, nomes } = await renderizar(new Date(2026, 1, 7, 12, 0));
      const botao = tela.querySelector<HTMLButtonElement>('.so-favoritos')!;
      expect(botao.textContent).toContain('Favoritos (0)');
      TestBed.inject(Favoritos).trocar('forrozin');
      await fixture.whenStable();
      expect(botao.textContent).toContain('Favoritos (1)');
      botao.click();
      await fixture.whenStable();
      expect(botao.getAttribute('aria-pressed')).toBe('true');
      expect(nomes()).toEqual(['Forrozin']);
    });

    it('explica o que fazer quando ainda não tem favorito', async () => {
      const { fixture, tela } = await renderizar(new Date(2026, 1, 7, 12, 0));
      tela.querySelector<HTMLButtonElement>('.so-favoritos')!.click();
      await fixture.whenStable();
      expect(tela.querySelector('.vazio')?.textContent).toContain('Toque na estrela');
    });
  });
});
