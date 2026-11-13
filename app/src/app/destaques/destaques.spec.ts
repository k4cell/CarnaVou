import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Router } from '@angular/router';

import { momentoDoBloco } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { famaDoBloco } from '../dados/consultas';
import { faixaDoLocal } from '../dados/cores';
import { NOMES_DAS_ZONAS, partesDaData } from '../dados/formato';
import { LOCAIS } from '../dados/locais';
import { Favoritos } from '../favoritos/favoritos';
import { FiltrosDaLista } from '../lista-de-blocos/filtros-da-lista';
import { Relogio } from '../relogio/relogio';
import { Destaques } from './destaques';

/** Os lugares juntos por zona, na ordem em que cada zona aparece pela primeira vez. */
const ORDEM_DAS_ZONAS = [...new Set(LOCAIS.map((local) => local.zona))];
const LUGARES_POR_ZONA = ORDEM_DAS_ZONAS.flatMap((zona) => LOCAIS.filter((local) => local.zona === zona));

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

    it('chama a lista dos lugares de "Bairros", sem prometer o que está em alta', async () => {
      const { tela } = await renderizar();
      const partes = Array.from(tela.querySelectorAll('.secao')).map((titulo) => titulo.textContent);
      expect(partes).toEqual(['Bairros']);
    });

    it('ainda sem o dia, mostra só os bairros, sem o destaque nem as fileiras', async () => {
      const { tela } = await renderizar();
      expect(tela.querySelector('app-destaque-do-dia')).toBeNull();
      expect(tela.querySelector('app-fileira-de-blocos')).toBeNull();
      expect(tela.querySelector('app-estilos-do-dia')).toBeNull();
    });

    it('mostra um cartão para cada lugar, juntos por zona, com o link e o nome', async () => {
      const { tela, cartoes } = await renderizar();
      expect(cartoes().length).toBe(LOCAIS.length);
      expect(cartoes()[0].getAttribute('href')).toBe(`/local/${LUGARES_POR_ZONA[0].id}`);
      const nomes = Array.from(tela.querySelectorAll('.nome')).map((nome) => nome.textContent);
      expect(nomes).toEqual(LUGARES_POR_ZONA.map((local) => local.nome));
      const zonas = Array.from(tela.querySelectorAll('.zona-do-grupo')).map((zona) => zona.textContent);
      expect(zonas).toEqual(ORDEM_DAS_ZONAS.map((zona) => NOMES_DAS_ZONAS[zona]));
    });

    it('mostra em cada cartão o selo com a conta dos blocos', async () => {
      const { selos } = await renderizar();
      expect(selos()[0]).toBe('18 blocos');
    });

    it('mostra a zona de cada lugar na sua etiqueta de cor', async () => {
      const { tela } = await renderizar();
      const etiquetas = Array.from(tela.querySelectorAll('.zona')).map((z) => z.textContent);
      expect(etiquetas).toEqual(LUGARES_POR_ZONA.map((local) => NOMES_DAS_ZONAS[local.zona]));
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

    it('dá a cada lugar a sua faixa de cor, a mesma de todas as telas', async () => {
      const { cartoes } = await renderizar();
      const faixas = cartoes().map((c) => c.getAttribute('data-faixa'));
      expect(faixas).toEqual(LUGARES_POR_ZONA.map((local) => faixaDoLocal(local.id)));
    });

  });

  describe('num sábado de carnaval, às 14h', () => {
    it('abre na aba Hoje, só com os lugares que têm bloco hoje', async () => {
      const { abaAtiva, cartoes, selos } = await renderizar(SABADO_14H);
      expect(abaAtiva()).toBe('Hoje');
      expect(cartoes().length).toBe(5);
      expect(selos()).toContain('Rolando agora');
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

    it('marca o selo de quem está rolando (o aviso vermelho) e de quem vai começar (amarelo)', async () => {
      const { tela } = await renderizar(SABADO_14H);
      const tipos = Array.from(tela.querySelectorAll('.selo')).map((selo) => [selo.textContent, selo.getAttribute('data-selo')]);
      expect(tipos).toContainEqual(['Rolando agora', 'agora']);
      expect(tipos.every(([texto, tipo]) => tipo !== 'agora' || texto === 'Rolando agora')).toBe(true);
    });

    it('mantém a cor da faixa do lugar quando troca de aba', async () => {
      const { tela, tocar } = await renderizar(SABADO_14H);
      await tocar('Amanhã');
      const faixaEm = () => tela.querySelector('a[href="/local/faria-lima"]')?.getAttribute('data-faixa');
      const emAmanha = faixaEm();
      await tocar('Geral');
      expect(emAmanha).toBe(faixaDoLocal('faria-lima'));
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

  describe('a vitrine, num sábado de carnaval às 14h', () => {
    afterEach(() => localStorage.removeItem('carnavou.favoritos'));

    const deHoje = BLOCOS.filter((bloco) => bloco.data === '2026-02-14');

    it('põe em destaque o mais famoso do que está rolando agora, com "Rolando agora"', async () => {
      const { tela } = await renderizar(SABADO_14H, true);
      const rolando = deHoje.filter((bloco) => momentoDoBloco(bloco, SABADO_14H) === 'rolando');
      const maisFamoso = rolando.reduce((melhor, bloco) => (famaDoBloco(bloco) > famaDoBloco(melhor) ? bloco : melhor));
      const destaque = tela.querySelector('app-destaque-do-dia')!;
      expect(destaque.querySelector('.rotulo')?.textContent).toBe('Destaque do momento');
      expect(destaque.querySelector('.quando .rolando')?.textContent).toBe('Rolando agora');
      expect(destaque.querySelector('.nome-do-destaque')?.textContent).toBe(maisFamoso.nome);
      expect(destaque.querySelector('a')?.getAttribute('href')).toBe(`/local/${maisFamoso.localId}/${maisFamoso.id}`);
    });

    const fileira = (tela: HTMLElement, titulo: string) => {
      const secao = Array.from(tela.querySelectorAll('.secao')).find((s) => s.textContent === titulo);
      const nomes = secao?.nextElementSibling?.querySelectorAll('.nome-do-item') ?? [];
      return Array.from(nomes).map((nome) => nome.textContent);
    };

    it('em Hoje, mostra o que está rolando e começando, por horário, sem repetir o destaque', async () => {
      const { tela } = await renderizar(SABADO_14H, true);
      const destaque = tela.querySelector('.nome-do-destaque')?.textContent;
      const nomes = fileira(tela, 'Rolando e começando');
      expect(nomes.length).toBeGreaterThanOrEqual(2);
      expect(nomes).not.toContain(destaque);
      const inicios = nomes.map((nome) => deHoje.find((bloco) => bloco.nome === nome)!.inicio);
      expect(inicios).toEqual([...inicios].sort());
      // O que está rolando diz "Agora" no quadradinho.
      expect(tela.querySelector('app-fileira-de-blocos .quadro')?.getAttribute('aria-label')).toBe('Rolando agora');
    });

    it('na Geral, mostra os mais famosos numa fileira, sem repetir o destaque', async () => {
      const { tela, tocar } = await renderizar(SABADO_14H, true);
      await tocar('Geral');
      const destaque = tela.querySelector('.nome-do-destaque')?.textContent;
      const nomes = fileira(tela, 'Os mais famosos do carnaval');
      expect(nomes.length).toBeGreaterThanOrEqual(2);
      expect(nomes).not.toContain(destaque);
      const famas = nomes.map((nome) => famaDoBloco(BLOCOS.find((bloco) => bloco.nome === nome)!));
      expect(famas).toEqual([...famas].sort((a, b) => b - a));
      // O quadradinho destaca o dia (a semana e o número); embaixo do nome, só os artistas.
      const secao = Array.from(tela.querySelectorAll('.secao')).find((s) => s.textContent === 'Os mais famosos do carnaval')!;
      const primeiro = secao.nextElementSibling!.querySelector('.item')!;
      const bloco = BLOCOS.find((b) => b.nome === nomes[0])!;
      const { semana, dia } = partesDaData(bloco.data);
      expect(primeiro.querySelector('.quadro .pequeno')?.textContent).toBe(semana);
      expect(primeiro.querySelector('.quadro .grande')?.textContent).toBe(dia);
      expect(primeiro.querySelector('.sobre')?.textContent?.trim()).not.toMatch(/\d+h|min/);
      expect(fileira(tela, 'Rolando e começando')).toEqual([]);
    });

    it('mostra os blocos LGBTQIA+ do dia (os que uma notícia chama assim) na parte deles', async () => {
      const { tela, tocar } = await renderizar(SABADO_14H, true);
      const lgbtDeHoje = deHoje.filter((bloco) => bloco.lgbt).map((bloco) => bloco.nome);
      expect(lgbtDeHoje.length).toBeGreaterThan(0);
      expect(new Set(fileira(tela, 'LGBTQIA+'))).toEqual(new Set(lgbtDeHoje));
      await tocar('Geral');
      expect(fileira(tela, 'LGBTQIA+').length).toBeGreaterThan(lgbtDeHoje.length);
    });

    it('o quadrado LGBTQIA+ do "Por estilo" abre a aba Blocos buscando "LGBT"', async () => {
      const { tela, tocar } = await renderizar(SABADO_14H, true);
      await tocar('Geral');
      const quadrado = Array.from(tela.querySelectorAll<HTMLButtonElement>('app-estilos-do-dia .estilo')).find(
        (estilo) => estilo.querySelector('.nome-do-estilo')?.textContent === 'LGBTQIA+',
      )!;
      expect(quadrado.classList.contains('orgulho')).toBe(true);
      expect(quadrado.querySelector('.quantos')?.textContent).toBe('3 blocos');
      quadrado.click();
      await new Promise((resolver) => setTimeout(resolver));
      expect(TestBed.inject(FiltrosDaLista).busca()).toBe('LGBT');
    });

    it('na Geral, os estilos abrem a aba Blocos já com a busca do estilo', async () => {
      const { tela, tocar } = await renderizar(SABADO_14H, true);
      await tocar('Geral');
      const estilos = Array.from(tela.querySelectorAll<HTMLButtonElement>('app-estilos-do-dia .estilo'));
      expect(estilos.length).toBeGreaterThanOrEqual(2);
      const nome = estilos[0].querySelector('.nome-do-estilo')!.textContent!;
      estilos[0].click();
      await new Promise((resolver) => setTimeout(resolver));
      expect(TestBed.inject(FiltrosDaLista).busca()).toBe(nome);
      expect(TestBed.inject(Router).url).toBe('/');
    });

    it('com favoritos, mostra o atalho que abre a aba Blocos só com eles', async () => {
      const { tela } = await renderizar(SABADO_14H, true);
      expect(tela.querySelector('.favoritos')).toBeNull();
      TestBed.inject(Favoritos).trocar(deHoje[0].id);
      await TestBed.inject(Router).navigateByUrl('/');
      const fixture = TestBed.createComponent(Destaques);
      await fixture.whenStable();
      const atalho = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.favoritos')!;
      expect(atalho.textContent).toContain('1 bloco');
      atalho.click();
      expect(TestBed.inject(FiltrosDaLista).soFavoritos()).toBe(true);
    });
  });
});
