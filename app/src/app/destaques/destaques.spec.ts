import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BLOCOS } from '../dados/blocos';
import { LOCAIS } from '../dados/locais';
import { Relogio } from '../relogio/relogio';
import { Destaques } from './destaques';

/** As sete cores das faixas, do rosa ao azul. Com mais de sete lugares, elas recomeçam. */
const SETE_CORES = ['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul'];

// Sábado de carnaval de 2026, duas da tarde.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);

describe('Destaques', () => {
  async function renderizar(agora?: Date, simulado = false) {
    await TestBed.configureTestingModule({
      imports: [Destaques],
      providers: [provideRouter([])],
    }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora, simulado);
    }
    const fixture = TestBed.createComponent(Destaques);
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;

    const abaAtiva = () => tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim();
    const cartoes = () => Array.from(tela.querySelectorAll('.cartao'));
    const selos = () => cartoes().map((c) => c.querySelector('.selo')?.textContent);
    const tocar = async (nome: string) => {
      const botao = Array.from(tela.querySelectorAll<HTMLButtonElement>('.aba')).find(
        (aba) => aba.textContent?.trim() === nome,
      );
      botao?.click();
      await fixture.whenStable();
    };
    return { tela, abaAtiva, cartoes, selos, tocar };
  }

  describe('sem saber a data ainda', () => {
    it('mostra as três abas, na ordem do esboço, e abre na Geral', async () => {
      const { tela, abaAtiva } = await renderizar();
      const abas = Array.from(tela.querySelectorAll('.aba')).map((a) => a.textContent?.trim());
      expect(abas).toEqual(['Hoje', 'Amanhã', 'Geral']);
      expect(abaAtiva()).toBe('Geral');
    });

    it('chama a lista de "Em alta"', async () => {
      const { tela } = await renderizar();
      expect(tela.querySelector('h2')?.textContent).toContain('Em alta');
    });

    it('mostra um cartão para cada lugar, com o link e o nome', async () => {
      const { tela, cartoes } = await renderizar();
      expect(cartoes().length).toBe(LOCAIS.length);
      expect(cartoes()[0].getAttribute('href')).toBe(`/local/${LOCAIS[0].id}`);
      const nomes = Array.from(tela.querySelectorAll('.nome')).map((nome) => nome.textContent);
      expect(nomes).toEqual(LOCAIS.map((local) => local.nome));
    });

    it('mostra em cada cartão o selo com a conta dos blocos', async () => {
      const { selos } = await renderizar();
      expect(selos()[0]).toBe('18 blocos');
    });

    it('mostra a zona de cada lugar na sua etiqueta de cor', async () => {
      const { tela } = await renderizar();
      const etiquetas = Array.from(tela.querySelectorAll('.zona')).map((z) => z.textContent);
      expect(etiquetas.slice(0, 4)).toEqual(['Zona Sul', 'Centro', 'Zona Sul', 'Zona Oeste']);
    });

    it('mostra os artistas, o primeiro em destaque, nos lugares que têm artista', async () => {
      const { cartoes } = await renderizar();
      const ibirapuera = cartoes().find((c) => c.getAttribute('href') === '/local/ibirapuera');
      expect(ibirapuera?.querySelector('.nomes')?.textContent).toMatch(/^Artistas: Ivete Sangalo, /);
      expect(ibirapuera?.querySelector('.nomes .principal')?.textContent).toBe('Ivete Sangalo');
    });

    it('mostra os nomes dos blocos nos lugares sem artista divulgado', async () => {
      const { cartoes } = await renderizar();
      const pauloVi = cartoes().find((c) => c.getAttribute('href') === '/local/paulo-vi');
      expect(pauloVi?.querySelector('.nomes')?.textContent).toMatch(/^Blocos: /);
    });

    it('dá a cada lugar a sua faixa de cor, do rosa ao azul', async () => {
      const { cartoes } = await renderizar();
      const faixas = cartoes().map((c) => c.getAttribute('data-faixa'));
      expect(faixas).toEqual(faixas.map((_, i) => SETE_CORES[i % SETE_CORES.length]));
    });

  });

  describe('num sábado de carnaval, às 14h', () => {
    it('abre na aba Hoje, só com os lugares que têm bloco hoje', async () => {
      const { abaAtiva, cartoes, selos } = await renderizar(SABADO_14H);
      expect(abaAtiva()).toBe('Hoje');
      expect(cartoes().length).toBe(5);
      expect(selos()).toContain('Já começou');
    });

    it('mostra os lugares de amanhã, cada um com a hora do primeiro bloco, ao tocar em Amanhã', async () => {
      const { abaAtiva, cartoes, selos, tocar } = await renderizar(SABADO_14H);
      await tocar('Amanhã');
      expect(abaAtiva()).toBe('Amanhã');
      expect(cartoes().length).toBe(4);
      expect(selos().every((selo) => selo?.startsWith('Amanhã às '))).toBe(true);
    });

    it('mostra ao tocar em Geral os lugares que ainda têm bloco, e some com os que já passaram', async () => {
      const { abaAtiva, cartoes, tocar } = await renderizar(SABADO_14H);
      await tocar('Geral');
      expect(abaAtiva()).toBe('Geral');
      const comBlocoPelaFrente = LOCAIS.filter((local) =>
        BLOCOS.some((bloco) => bloco.localId === local.id && bloco.data >= '2026-02-14'),
      );
      expect(cartoes().length).toBe(comBlocoPelaFrente.length);
      // Santo Amaro só tinha o Modo Surto, no dia 8: no dia 14 ele já não aparece.
      expect(cartoes().some((cartao) => cartao.getAttribute('href') === '/local/santo-amaro')).toBe(false);
    });

    it('pinta o selo de quem já começou (verde) e de quem vai começar (amarelo)', async () => {
      const { tela } = await renderizar(SABADO_14H);
      const tipos = Array.from(tela.querySelectorAll('.selo')).map((selo) => [selo.textContent, selo.getAttribute('data-selo')]);
      expect(tipos).toContainEqual(['Já começou', 'agora']);
      expect(tipos.every(([texto, tipo]) => tipo !== 'agora' || texto === 'Já começou')).toBe(true);
    });

    it('mantém a cor da faixa do lugar quando troca de aba', async () => {
      const { tela, tocar } = await renderizar(SABADO_14H);
      await tocar('Amanhã');
      const faixaEm = () => tela.querySelector('a[href="/local/faria-lima"]')?.getAttribute('data-faixa');
      const emAmanha = faixaEm();
      await tocar('Geral');
      expect(emAmanha).toBe('laranja');
      expect(faixaEm()).toBe(emAmanha);
    });

  });

  describe('num dia sem bloco nenhum', () => {
    const SEM_BLOCOS = new Date(2026, 0, 30, 12, 0);

    it('abre na aba Geral, para não abrir numa lista vazia', async () => {
      const { abaAtiva, selos } = await renderizar(SEM_BLOCOS);
      expect(abaAtiva()).toBe('Geral');
      expect(selos()[0]).toBe('18 blocos');
    });

    it('avisa que não tem bloco hoje, ao tocar em Hoje', async () => {
      const { tela, cartoes, tocar } = await renderizar(SEM_BLOCOS);
      await tocar('Hoje');
      expect(cartoes().length).toBe(0);
      expect(tela.querySelector('.vazio')?.textContent).toBe('Nenhum bloco hoje. Veja a aba Geral.');
    });

    it('avisa que não tem bloco amanhã, ao tocar em Amanhã', async () => {
      const { tela, tocar } = await renderizar(SEM_BLOCOS);
      await tocar('Amanhã');
      expect(tela.querySelector('.vazio')?.textContent).toBe('Nenhum bloco amanhã. Veja a aba Geral.');
    });
  });
});
