import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { blocosDaAba, cartoesDaAba } from '../dados/agenda';
import { circuitoDoLocal } from '../dados/trajetos';
import { LOCAIS } from '../dados/locais';
import { MENSAGENS_DA_ABA_VAZIA } from '../filtro/filtro-de-dia';
import { distanciaEmMetros, textoDaDistancia } from '../localizacao/distancia';
import { criarGeolocalizacaoFalsa, Resposta } from '../localizacao/geolocalizacao-falsa';
import { CONSULTAR_PERMISSAO, GEOLOCALIZACAO, PermissaoDoCelular } from '../localizacao/localizacao';
import { Relogio } from '../relogio/relogio';
import { CARREGAR_MAPLIBRE } from './maplibre';
import { criarMapLibreFalso, esperarOMapa } from './maplibre-falso';
import { PaginaMapa } from './pagina-mapa';

// Sábado de carnaval de 2026, duas da tarde: tem bloco hoje e amanhã.
const SABADO_14H = new Date(2026, 1, 14, 14, 0);
// Sexta, antes do pré-carnaval: não tem bloco hoje nem amanhã.
const SEXTA_ANTES = new Date(2026, 0, 30, 12, 0);

// Uma pessoa na Avenida Paulista, e outra no Rio de Janeiro.
const NA_PAULISTA: Resposta = { ok: { lat: -23.5614, lng: -46.6559, precisao: 40 } };
const NO_RIO: Resposta = { ok: { lat: -22.9068, lng: -43.1729, precisao: 40 } };

interface Celular {
  /** O que o celular responde quando a posição é pedida. */
  resposta?: Resposta;
  /** O que o navegador diz sobre a permissão, sem abrir o aviso do celular. */
  permissao?: PermissaoDoCelular | null;
  /** O navegador não tem localização. */
  semLocalizacao?: boolean;
}

describe('PaginaMapa', () => {
  async function renderizar(agora?: Date, celular: Celular = {}, lugar?: string) {
    const falso = criarMapLibreFalso();
    const geo = criarGeolocalizacaoFalsa(celular.resposta ?? NA_PAULISTA);
    let consultas = 0;
    await TestBed.configureTestingModule({
      imports: [PaginaMapa],
      providers: [
        provideRouter([]),
        { provide: CARREGAR_MAPLIBRE, useValue: () => Promise.resolve(falso.biblioteca) },
        { provide: GEOLOCALIZACAO, useValue: celular.semLocalizacao ? null : geo.api },
        {
          provide: CONSULTAR_PERMISSAO,
          useValue: async () => {
            consultas++;
            return celular.permissao === undefined ? 'prompt' : celular.permissao;
          },
        },
      ],
    }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora);
    }
    const fixture = TestBed.createComponent(PaginaMapa);
    if (lugar) {
      fixture.componentRef.setInput('lugar', lugar);
    }
    await esperarOMapa(fixture);
    const tela = fixture.nativeElement as HTMLElement;

    const nomesDosPinos = () => falso.pinos().map((pino) => pino.elemento.getAttribute('aria-label'));
    const cartao = () => tela.querySelector<HTMLElement>('.cartao-do-ponto');
    const tocarNoPino = async (nome: string) => {
      falso.pinos().find((pino) => pino.elemento.getAttribute('aria-label') === nome)?.elemento.click();
      await esperarOMapa(fixture);
    };
    const tocarNaAba = async (nome: string) => {
      Array.from(tela.querySelectorAll<HTMLButtonElement>('.aba'))
        .find((aba) => aba.textContent?.trim() === nome)
        ?.click();
      await esperarOMapa(fixture);
    };
    const botaoOndeEstou = () => tela.querySelector<HTMLButtonElement>('.botao-redondo')!;
    const tocarEmOndeEstou = async () => {
      botaoOndeEstou().click();
      await esperarOMapa(fixture);
    };
    const botaoDaExplicacao = (nome: string) =>
      Array.from(tela.querySelectorAll<HTMLButtonElement>('app-explicacao-da-localizacao button')).find(
        (botao) => botao.textContent?.trim() === nome,
      );
    const explicacao = () => tela.querySelector('app-explicacao-da-localizacao');
    const aviso = () => tela.querySelector('.aviso')?.textContent?.trim() ?? null;
    return {
      fixture,
      tela,
      falso,
      geo,
      consultas: () => consultas,
      nomesDosPinos,
      cartao,
      tocarNoPino,
      tocarNaAba,
      botaoOndeEstou,
      tocarEmOndeEstou,
      botaoDaExplicacao,
      explicacao,
      aviso,
    };
  }

  describe('num dia de carnaval', () => {
    it('abre na aba Hoje, com um pino para cada lugar que tem bloco hoje', async () => {
      const { tela, nomesDosPinos } = await renderizar(SABADO_14H);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Hoje');
      const esperados = cartoesDaAba('hoje', SABADO_14H).map((c) => c.local.nome);
      expect(esperados.length).toBeGreaterThan(0);
      expect(nomesDosPinos()).toEqual(esperados);
    });

    it('mostra todos os lugares na aba Geral', async () => {
      const { nomesDosPinos, tocarNaAba } = await renderizar(SABADO_14H);
      await tocarNaAba('Geral');
      // A ordem muda (a Geral põe os lugares em alta primeiro), mas todos os lugares aparecem.
      expect(nomesDosPinos().sort()).toEqual(LOCAIS.map((local) => local.nome).sort());
    });

    it('não mostra o cartão do lugar enquanto ninguém tocou num pino', async () => {
      const { cartao } = await renderizar(SABADO_14H);
      expect(cartao()).toBeNull();
    });

    it('mostra o cartão do lugar quando alguém toca no pino', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const primeiro = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(primeiro.local.nome);
      expect(cartao()?.querySelector('.nome')?.textContent).toContain(primeiro.local.nome);
      expect(cartao()?.querySelector('.selo')?.textContent).toBe(primeiro.selo);
      expect(cartao()?.querySelector('app-zona-tag')).not.toBeNull();
    });

    it('mostra os artistas do lugar, o primeiro em destaque', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const comArtistas = cartoesDaAba('hoje', SABADO_14H).find((c) => c.principal);
      expect(comArtistas).toBeDefined();
      await tocarNoPino(comArtistas!.local.nome);
      expect(cartao()?.querySelector('.principal')?.textContent).toBe(comArtistas!.principal);
    });

    it('leva o botão "Como chegar" ao Google Maps e o outro ao Waze, com o destino do lugar', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const { local } = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(local.nome);
      const links = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a'));
      const comoChegar = links.find((link) => link.textContent?.trim() === 'Como chegar');
      const waze = links.find((link) => link.textContent?.trim() === 'Waze');
      expect(comoChegar?.getAttribute('href')).toBe(
        `https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`,
      );
      expect(waze?.getAttribute('href')).toBe(`https://waze.com/ul?ll=${local.lat}%2C${local.lng}&navigate=yes`);
      expect(comoChegar?.getAttribute('rel')).toBe('noopener');
      expect(comoChegar?.getAttribute('target')).toBe('_blank');
    });

    it('tem um botão para ver a página do lugar', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const { local } = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(local.nome);
      const ver = Array.from(cartao()!.querySelectorAll<HTMLAnchorElement>('.acoes a')).find(
        (link) => link.textContent?.trim() === 'Ver o lugar',
      );
      expect(ver?.getAttribute('href')).toBe(`/local/${local.id}`);
    });

    it('destaca o pino do lugar escolhido', async () => {
      const { falso, tocarNoPino } = await renderizar(SABADO_14H);
      const { local } = cartoesDaAba('hoje', SABADO_14H)[0];
      await tocarNoPino(local.nome);
      const selecionados = falso.pinos().filter((pino) => pino.elemento.classList.contains('selecionado'));
      expect(selecionados.map((pino) => pino.elemento.getAttribute('aria-label'))).toEqual([local.nome]);
    });

    it('fecha o cartão no botão ×', async () => {
      const { fixture, cartao, tocarNoPino } = await renderizar(SABADO_14H);
      await tocarNoPino(cartoesDaAba('hoje', SABADO_14H)[0].local.nome);
      cartao()!.querySelector<HTMLButtonElement>('.fechar')!.click();
      await esperarOMapa(fixture);
      expect(cartao()).toBeNull();
    });

    it('fecha o cartão quando alguém toca no mapa fora dos pinos', async () => {
      const { fixture, falso, cartao, tocarNoPino } = await renderizar(SABADO_14H);
      await tocarNoPino(cartoesDaAba('hoje', SABADO_14H)[0].local.nome);
      expect(cartao()).not.toBeNull();
      falso.mapas[0].tocar();
      await esperarOMapa(fixture);
      expect(cartao()).toBeNull();
    });

    it('troca o cartão quando alguém toca noutro pino', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const [primeiro, segundo] = cartoesDaAba('hoje', SABADO_14H);
      await tocarNoPino(primeiro.local.nome);
      await tocarNoPino(segundo.local.nome);
      expect(cartao()?.querySelector('.nome')?.textContent).toContain(segundo.local.nome);
    });

    it('tira o cartão quando a aba nova não tem aquele lugar', async () => {
      const { cartao, tocarNoPino, tocarNaAba } = await renderizar(SABADO_14H);
      const hoje = cartoesDaAba('hoje', SABADO_14H);
      const amanha = new Set(cartoesDaAba('amanha', SABADO_14H).map((c) => c.local.id));
      const soDeHoje = hoje.find((c) => !amanha.has(c.local.id));
      expect(soDeHoje).toBeDefined();
      await tocarNoPino(soDeHoje!.local.nome);
      expect(cartao()).not.toBeNull();
      await tocarNaAba('Amanhã');
      expect(cartao()).toBeNull();
    });
  });

  describe('os trajetos dos megablocos', () => {
    const daAbaHoje = () => cartoesDaAba('hoje', SABADO_14H).map((cartao) => cartao.local);

    it('manda para o mapa o trajeto dos lugares da aba que têm circuito', async () => {
      const { fixture, falso } = await renderizar(SABADO_14H);
      falso.mapas[0].carregar();
      await esperarOMapa(fixture);
      const dados = falso.mapas[0].fontes.get('trajetos')?.dados as { features: { properties: { id: string } }[] };
      const esperados = daAbaHoje()
        .filter((local) => circuitoDoLocal(local.id))
        .map((local) => local.id);
      expect(esperados.length).toBeGreaterThan(0);
      expect(dados.features.map((linha) => linha.properties.id)).toEqual(esperados);
    });

    it('mostra o trajeto em palavras no cartão de um lugar que tem circuito', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const comCircuito = daAbaHoje().find((local) => circuitoDoLocal(local.id))!;
      await tocarNoPino(comCircuito.nome);
      expect(cartao()?.querySelector('.trajeto')?.textContent).toBe(
        `Trajeto: ${circuitoDoLocal(comCircuito.id)!.descricao}`,
      );
    });

    it('não inventa trajeto para um lugar sem circuito nas fontes', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      const semCircuito = daAbaHoje().find((local) => !circuitoDoLocal(local.id));
      expect(semCircuito).toBeDefined();
      await tocarNoPino(semCircuito!.nome);
      expect(cartao()?.querySelector('.trajeto')).toBeNull();
    });
  });

  describe('os blocos no cartão do ponto', () => {
    const linhasDosBlocos = (cartao: HTMLElement | null) =>
      Array.from(cartao?.querySelectorAll<HTMLAnchorElement>('.blocos a') ?? []);

    it('lista os blocos de hoje do lugar, com a hora, levando para a página do bloco', async () => {
      const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
      await tocarNoPino('Parque Ibirapuera');
      const deHoje = blocosDaAba('hoje', 'ibirapuera', SABADO_14H);
      const links = linhasDosBlocos(cartao());
      expect(links.length).toBe(deHoje.length);
      expect(links[0].textContent?.trim()).toBe('13h · Agrada Gregos');
      expect(links[0].getAttribute('href')).toBe('/local/ibirapuera/agrada-gregos');
    });

    it('na Geral, põe o dia na frente, mostra só três e diz quantos ficaram de fora', async () => {
      const { cartao, tocarNoPino, tocarNaAba } = await renderizar(SABADO_14H);
      await tocarNaAba('Geral');
      await tocarNoPino('Parque Ibirapuera');
      const daGeral = blocosDaAba('geral', 'ibirapuera', SABADO_14H);
      const links = linhasDosBlocos(cartao());
      expect(daGeral.length).toBeGreaterThan(3);
      expect(links.length).toBe(3);
      expect(links[0].textContent?.trim()).toBe('sáb 14 fev · 13h · Agrada Gregos');
      expect(cartao()?.querySelector('.mais')?.textContent).toBe(`E mais ${daGeral.length - 3} na página do lugar.`);
    });
  });

  describe('"Ver no mapa" (o lugar vem no endereço)', () => {
    it('abre o mapa já com o cartão do lugar', async () => {
      const { cartao } = await renderizar(SABADO_14H, {}, 'ibirapuera');
      expect(cartao()?.querySelector('.nome')?.textContent).toContain('Parque Ibirapuera');
    });

    it('continua na aba Hoje quando o lugar tem bloco hoje', async () => {
      const { tela } = await renderizar(SABADO_14H, {}, 'ibirapuera');
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Hoje');
    });

    it('passa para a Geral quando o lugar não tem bloco hoje', async () => {
      const { tela, cartao } = await renderizar(SABADO_14H, {}, 'consolacao');
      expect(cartoesDaAba('hoje', SABADO_14H).some((c) => c.local.id === 'consolacao')).toBe(false);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Geral');
      expect(cartao()?.querySelector('.nome')?.textContent).toContain('Rua da Consolação');
    });
  });

  describe('"onde estou"', () => {
    it('tem um botão redondo com nome para o leitor de tela', async () => {
      const { botaoOndeEstou } = await renderizar(SABADO_14H);
      expect(botaoOndeEstou().getAttribute('aria-label')).toBe('Mostrar onde eu estou');
    });

    it('não pede a localização de cara, nem pergunta nada ao celular, ao abrir o mapa', async () => {
      const { geo, consultas, falso, aviso } = await renderizar(SABADO_14H);
      expect(geo.chamadas.length).toBe(0);
      expect(consultas()).toBe(0);
      expect(falso.bolinha()).toBeUndefined();
      expect(aviso()).toBeNull();
    });

    it('explica para que serve antes de pedir, quando o celular ainda vai perguntar', async () => {
      const { tocarEmOndeEstou, explicacao, geo } = await renderizar(SABADO_14H, { permissao: 'prompt' });
      await tocarEmOndeEstou();
      expect(explicacao()).not.toBeNull();
      expect(geo.chamadas.length).toBe(0);
    });

    it('"Agora não" fecha a explicação sem pedir nada e devolve o foco ao botão', async () => {
      const { fixture, tocarEmOndeEstou, botaoDaExplicacao, explicacao, geo, botaoOndeEstou } = await renderizar(
        SABADO_14H,
      );
      await tocarEmOndeEstou();
      botaoDaExplicacao('Agora não')!.click();
      await esperarOMapa(fixture);
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(0);
      expect(document.activeElement).toBe(botaoOndeEstou());
    });

    it('"Continuar" pede a posição, põe a bolinha no mapa e leva o mapa até a pessoa', async () => {
      const { fixture, tocarEmOndeEstou, botaoDaExplicacao, explicacao, geo, falso } = await renderizar(SABADO_14H);
      await tocarEmOndeEstou();
      botaoDaExplicacao('Continuar')!.click();
      await esperarOMapa(fixture);
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(1);
      expect(falso.bolinha()?.posicao).toEqual([-46.6559, -23.5614]);
      const movimento = falso.mapas[0].movimentos.at(-1);
      expect(movimento?.['center']).toEqual([-46.6559, -23.5614]);
      expect(movimento?.['zoom']).toBe(15);
    });

    it('vai direto procurar, sem explicar, quando a pessoa já deixou', async () => {
      const { tocarEmOndeEstou, explicacao, geo, falso } = await renderizar(SABADO_14H, { permissao: 'granted' });
      await tocarEmOndeEstou();
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(1);
      expect(falso.bolinha()).toBeDefined();
    });

    it('depois de achar a pessoa, um novo toque procura de novo sem explicar outra vez', async () => {
      const { tocarEmOndeEstou, explicacao, geo, falso } = await renderizar(SABADO_14H, { permissao: 'granted' });
      await tocarEmOndeEstou();
      geo.responder({ ok: { lat: -23.57, lng: -46.66, precisao: 15 } });
      await tocarEmOndeEstou();
      expect(explicacao()).toBeNull();
      expect(geo.chamadas.length).toBe(2);
      expect(falso.bolinha()?.posicao).toEqual([-46.66, -23.57]);
    });

    it('avisa, sem pedir de novo, quando a pessoa já tinha dito não', async () => {
      const { tocarEmOndeEstou, aviso, geo, explicacao } = await renderizar(SABADO_14H, { permissao: 'denied' });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('não deixou o CarnaVou ver onde você está');
      expect(aviso()).toContain('O mapa continua funcionando');
      expect(geo.chamadas.length).toBe(0);
      expect(explicacao()).toBeNull();
    });

    it('avisa quando a pessoa diz não ao aviso do celular', async () => {
      const { fixture, tocarEmOndeEstou, botaoDaExplicacao, aviso, falso } = await renderizar(SABADO_14H, {
        resposta: { erro: 1 },
      });
      await tocarEmOndeEstou();
      botaoDaExplicacao('Continuar')!.click();
      await esperarOMapa(fixture);
      expect(aviso()).toContain('não deixou o CarnaVou ver onde você está');
      expect(falso.bolinha()).toBeUndefined();
    });

    it('avisa para tentar de novo em lugar aberto quando o celular não acha a pessoa', async () => {
      const { tocarEmOndeEstou, aviso, falso } = await renderizar(SABADO_14H, {
        permissao: 'granted',
        resposta: { erro: 2 },
      });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('Tente de novo em um lugar aberto');
      expect(falso.bolinha()).toBeUndefined();
    });

    it('avisa quando o navegador não tem localização', async () => {
      const { tocarEmOndeEstou, aviso } = await renderizar(SABADO_14H, { semLocalizacao: true });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('Este navegador não consegue dizer onde você está');
    });

    it('avisa e não leva o mapa quando a pessoa está fora da Grande São Paulo', async () => {
      const { tocarEmOndeEstou, aviso, falso } = await renderizar(SABADO_14H, {
        permissao: 'granted',
        resposta: NO_RIO,
      });
      await tocarEmOndeEstou();
      expect(aviso()).toContain('fora da Grande São Paulo');
      expect(falso.mapas[0].movimentos.some((movimento) => movimento['zoom'] === 15)).toBe(false);
    });

    it('fecha o aviso no ×, e o aviso volta se a pessoa tentar de novo', async () => {
      const { fixture, tela, tocarEmOndeEstou, aviso } = await renderizar(SABADO_14H, {
        permissao: 'granted',
        resposta: { erro: 2 },
      });
      await tocarEmOndeEstou();
      tela.querySelector<HTMLButtonElement>('.aviso .fechar')!.click();
      await esperarOMapa(fixture);
      expect(aviso()).toBeNull();
      await tocarEmOndeEstou();
      expect(aviso()).not.toBeNull();
    });

    describe('a distância no cartão do ponto', () => {
      it('não aparece enquanto a pessoa não mostrou onde está', async () => {
        const { cartao, tocarNoPino } = await renderizar(SABADO_14H);
        await tocarNoPino(cartoesDaAba('hoje', SABADO_14H)[0].local.nome);
        expect(cartao()?.querySelector('.distancia')).toBeNull();
      });

      it('aparece, em linha reta, depois que a pessoa mostrou onde está', async () => {
        const { cartao, tocarNoPino, tocarEmOndeEstou } = await renderizar(SABADO_14H, { permissao: 'granted' });
        await tocarEmOndeEstou();
        const { local } = cartoesDaAba('hoje', SABADO_14H)[0];
        await tocarNoPino(local.nome);
        const metros = distanciaEmMetros({ lat: -23.5614, lng: -46.6559 }, local);
        expect(cartao()?.querySelector('.distancia')?.textContent).toBe(
          `A ${textoDaDistancia(metros)} de você, em linha reta.`,
        );
      });

      it('troca junto com o lugar escolhido', async () => {
        const { cartao, tocarNoPino, tocarEmOndeEstou } = await renderizar(SABADO_14H, { permissao: 'granted' });
        await tocarEmOndeEstou();
        const [primeiro, segundo] = cartoesDaAba('hoje', SABADO_14H);
        await tocarNoPino(primeiro.local.nome);
        const textoDoPrimeiro = cartao()?.querySelector('.distancia')?.textContent;
        await tocarNoPino(segundo.local.nome);
        const textoDoSegundo = cartao()?.querySelector('.distancia')?.textContent;
        expect(textoDoPrimeiro).toBeTruthy();
        expect(textoDoSegundo).toBeTruthy();
        expect(textoDoSegundo).not.toBe(textoDoPrimeiro);
      });
    });
  });

  describe('num dia sem bloco', () => {
    it('abre na aba Geral, com todos os lugares', async () => {
      const { tela, nomesDosPinos } = await renderizar(SEXTA_ANTES);
      expect(tela.querySelector('.aba[aria-pressed="true"]')?.textContent?.trim()).toBe('Geral');
      expect(nomesDosPinos().sort()).toEqual(LOCAIS.map((local) => local.nome).sort());
    });

    it('avisa e fica sem pinos na aba Hoje', async () => {
      const { tela, falso, tocarNaAba } = await renderizar(SEXTA_ANTES);
      await tocarNaAba('Hoje');
      expect(falso.pinos().length).toBe(0);
      expect(tela.querySelector('.vazio')?.textContent).toContain(MENSAGENS_DA_ABA_VAZIA.hoje);
    });
  });
});
