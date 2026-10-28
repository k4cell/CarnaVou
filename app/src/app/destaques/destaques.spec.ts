import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LOCAIS } from '../dados/locais';
import { Relogio } from '../relogio/relogio';
import { Destaques } from './destaques';

// Sábado de carnaval de 2027, duas da tarde.
const SABADO_14H = new Date(2027, 1, 6, 14, 0);

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
      expect(selos()[0]).toBe('4 blocos');
    });

    it('mostra a zona de cada lugar na sua etiqueta de cor', async () => {
      const { tela } = await renderizar();
      const etiquetas = Array.from(tela.querySelectorAll('.zona')).map((z) => z.textContent);
      expect(etiquetas.slice(0, 3)).toEqual(['Zona Sul', 'Centro', 'Zona Oeste']);
    });

    it('mostra os artistas em cada lugar, o primeiro em destaque, sem dizer "da semana"', async () => {
      const { tela } = await renderizar();
      const artistas = Array.from(tela.querySelectorAll('.artistas')).map((a) => a.textContent ?? '');
      expect(artistas.length).toBe(LOCAIS.length);
      expect(artistas[0]).toBe('Artistas: Banda Serpentina, Mariana Tamborim, DJ Purpurina e mais 4');
      expect(artistas.some((texto) => texto.includes('da semana'))).toBe(false);
      expect(tela.querySelector('.artistas .principal')?.textContent).toBe('Banda Serpentina');
    });

    it('dá a cada lugar a sua faixa de cor, do rosa ao azul', async () => {
      const { cartoes } = await renderizar();
      const faixas = cartoes().map((c) => c.getAttribute('data-faixa'));
      expect(faixas.slice(0, 7)).toEqual(['rosa', 'amarelo', 'verde', 'laranja', 'roxo', 'vermelho', 'azul']);
    });

    it('não mostra aviso de data de teste', async () => {
      const { tela } = await renderizar();
      expect(tela.querySelector('.teste')).toBeNull();
    });
  });

  describe('num sábado de carnaval, às 14h', () => {
    it('abre na aba Hoje, só com os lugares que têm bloco hoje', async () => {
      const { abaAtiva, cartoes, selos } = await renderizar(SABADO_14H);
      expect(abaAtiva()).toBe('Hoje');
      expect(cartoes().length).toBe(5);
      expect(selos()).toContain('Já começou');
      expect(selos()).toContain('Hoje às 16h');
    });

    it('mostra os lugares de amanhã, cada um com a hora do primeiro bloco, ao tocar em Amanhã', async () => {
      const { abaAtiva, cartoes, selos, tocar } = await renderizar(SABADO_14H);
      await tocar('Amanhã');
      expect(abaAtiva()).toBe('Amanhã');
      expect(cartoes().length).toBe(6);
      expect(selos()[0]).toBe('Amanhã às 12h');
      expect(selos().every((selo) => selo?.startsWith('Amanhã às '))).toBe(true);
    });

    it('mostra todos os lugares ao tocar em Geral', async () => {
      const { abaAtiva, cartoes, tocar } = await renderizar(SABADO_14H);
      await tocar('Geral');
      expect(abaAtiva()).toBe('Geral');
      expect(cartoes().length).toBe(LOCAIS.length);
    });

    it('mantém a cor da faixa do lugar quando troca de aba', async () => {
      const { tela, tocar } = await renderizar(SABADO_14H);
      const faixaEm = () => tela.querySelector('a[href="/local/berrini"]')?.getAttribute('data-faixa');
      const emHoje = faixaEm();
      await tocar('Geral');
      expect(emHoje).toBe('laranja');
      expect(faixaEm()).toBe(emHoje);
    });

    it('não mostra aviso de data de teste quando é o relógio de verdade', async () => {
      const { tela } = await renderizar(SABADO_14H, false);
      expect(tela.querySelector('.teste')).toBeNull();
    });

    it('mostra a data de teste quando ela vem do endereço', async () => {
      const { tela } = await renderizar(SABADO_14H, true);
      expect(tela.querySelector('.teste')?.textContent).toBe('Data de teste: Sábado, 6 de fevereiro, 14h');
    });
  });

  describe('num dia sem bloco nenhum', () => {
    const SEM_BLOCOS = new Date(2026, 9, 28, 12, 0);

    it('abre na aba Geral, para não abrir numa lista vazia', async () => {
      const { abaAtiva, selos } = await renderizar(SEM_BLOCOS);
      expect(abaAtiva()).toBe('Geral');
      expect(selos()[0]).toBe('4 blocos');
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
