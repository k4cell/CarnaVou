import { TestBed } from '@angular/core/testing';

import { criarGeolocalizacaoFalsa, Resposta } from './geolocalizacao-falsa';
import { CONSULTAR_PERMISSAO, GEOLOCALIZACAO, Localizacao, PermissaoDoCelular } from './localizacao';

const IBIRAPUERA = { ok: { lat: -23.58485, lng: -46.65482, precisao: 25 } } satisfies Resposta;

describe('Localizacao', () => {
  function criar(opcoes: {
    resposta?: Resposta;
    semApi?: boolean;
    permissao?: PermissaoDoCelular | null;
  }) {
    const falsa = criarGeolocalizacaoFalsa(opcoes.resposta ?? IBIRAPUERA);
    let consultas = 0;
    TestBed.configureTestingModule({
      providers: [
        { provide: GEOLOCALIZACAO, useValue: opcoes.semApi ? null : falsa.api },
        {
          provide: CONSULTAR_PERMISSAO,
          useValue: async () => {
            consultas++;
            return opcoes.permissao ?? null;
          },
        },
      ],
    });
    return { localizacao: TestBed.inject(Localizacao), falsa, consultas: () => consultas };
  }

  it('começa desligada e sem posição', () => {
    const { localizacao } = criar({});
    expect(localizacao.estado()).toBe('desligada');
    expect(localizacao.posicao()).toBeNull();
  });

  describe('proximoPasso', () => {
    it('manda explicar quando o celular ainda vai perguntar', async () => {
      const { localizacao, falsa } = criar({ permissao: 'prompt' });
      expect(await localizacao.proximoPasso()).toBe('explicar');
      expect(falsa.chamadas.length).toBe(0);
    });

    it('manda explicar quando o navegador não sabe dizer se a pessoa já deixou', async () => {
      const { localizacao } = criar({ permissao: null });
      expect(await localizacao.proximoPasso()).toBe('explicar');
    });

    it('manda procurar direto quando a pessoa já deixou', async () => {
      const { localizacao } = criar({ permissao: 'granted' });
      expect(await localizacao.proximoPasso()).toBe('procurar');
    });

    it('avisa que está negada, sem tentar, quando a pessoa já disse não', async () => {
      const { localizacao, falsa } = criar({ permissao: 'denied' });
      expect(await localizacao.proximoPasso()).toBe('negada');
      expect(localizacao.estado()).toBe('negada');
      expect(falsa.chamadas.length).toBe(0);
    });

    it('avisa que não existe quando o navegador não tem localização', async () => {
      const { localizacao } = criar({ semApi: true });
      expect(await localizacao.proximoPasso()).toBe('indisponivel');
      expect(localizacao.estado()).toBe('indisponivel');
    });

    it('esquece o aviso de uma tentativa antiga quando o celular voltou a perguntar', async () => {
      const { localizacao } = criar({ permissao: 'prompt', resposta: { erro: 1 } });
      await localizacao.procurar();
      expect(localizacao.estado()).toBe('negada');
      expect(await localizacao.proximoPasso()).toBe('explicar');
      expect(localizacao.estado()).toBe('desligada');
    });

    it('vai procurar sem perguntar de novo quando já achou a pessoa nesta visita', async () => {
      const { localizacao, consultas } = criar({ permissao: 'prompt' });
      await localizacao.procurar();
      expect(await localizacao.proximoPasso()).toBe('procurar');
      expect(consultas()).toBe(0);
    });
  });

  describe('procurar', () => {
    it('guarda a posição e a precisão que o celular informou', async () => {
      const { localizacao } = criar({});
      await localizacao.procurar();
      expect(localizacao.estado()).toBe('ligada');
      expect(localizacao.posicao()).toEqual({ lat: -23.58485, lng: -46.65482, precisao: 25 });
    });

    it('pede a posição uma vez só, sem acompanhar a pessoa', async () => {
      const { localizacao, falsa } = criar({});
      await localizacao.procurar();
      expect(falsa.chamadas.length).toBe(1);
      expect(falsa.chamadas[0].enableHighAccuracy).toBe(true);
    });

    it('fica "procurando" enquanto o celular não responde e não pede de novo no meio', async () => {
      let responder!: PositionCallback;
      let pedidos = 0;
      TestBed.configureTestingModule({
        providers: [
          {
            provide: GEOLOCALIZACAO,
            useValue: {
              getCurrentPosition: (sucesso: PositionCallback) => {
                pedidos++;
                responder = sucesso;
              },
            },
          },
        ],
      });
      const localizacao = TestBed.inject(Localizacao);
      const primeira = localizacao.procurar();
      expect(localizacao.estado()).toBe('procurando');
      await localizacao.procurar();
      expect(pedidos).toBe(1);
      responder({ coords: { latitude: 1, longitude: 2, accuracy: 3 } } as GeolocationPosition);
      await primeira;
      expect(localizacao.estado()).toBe('ligada');
    });

    it('vira "negada" quando a pessoa diz não ao aviso do celular', async () => {
      const { localizacao } = criar({ resposta: { erro: 1 } });
      await localizacao.procurar();
      expect(localizacao.estado()).toBe('negada');
      expect(localizacao.posicao()).toBeNull();
    });

    it('vira "sem sinal" quando o celular não acha a posição', async () => {
      const { localizacao } = criar({ resposta: { erro: 2 } });
      await localizacao.procurar();
      expect(localizacao.estado()).toBe('sem-sinal');
    });

    it('vira "sem sinal" quando demora demais', async () => {
      const { localizacao } = criar({ resposta: { erro: 3 } });
      await localizacao.procurar();
      expect(localizacao.estado()).toBe('sem-sinal');
    });

    it('mantém a última posição quando uma nova tentativa falha', async () => {
      const { localizacao, falsa } = criar({});
      await localizacao.procurar();
      const anterior = localizacao.posicao();
      falsa.responder({ erro: 2 });
      await localizacao.procurar();
      expect(localizacao.estado()).toBe('sem-sinal');
      expect(localizacao.posicao()).toEqual(anterior);
    });

    it('troca a posição quando a pessoa toca de novo e o celular acha outra', async () => {
      const { localizacao, falsa } = criar({});
      await localizacao.procurar();
      falsa.responder({ ok: { lat: -23.55, lng: -46.63, precisao: 10 } });
      await localizacao.procurar();
      expect(localizacao.posicao()).toEqual({ lat: -23.55, lng: -46.63, precisao: 10 });
    });

    it('avisa que não existe quando o navegador não tem localização', async () => {
      const { localizacao } = criar({ semApi: true });
      await localizacao.procurar();
      expect(localizacao.estado()).toBe('indisponivel');
    });
  });
});
