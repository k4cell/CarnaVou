import { Bloco, Local } from '../dados/tipos';
import { dadosDoEvento, textoDoScript } from './dados-do-evento';
import { ENDERECO_DO_SITE } from './endereco-do-site';

const LOCAL: Local = { id: 'ibirapuera', nome: 'Parque Ibirapuera', zona: 'sul' };

const bloco = (mudancas: Partial<Bloco> = {}): Bloco => ({
  id: 'teste-14-02',
  nome: 'Teste',
  data: '2026-02-14',
  inicio: '13:00',
  fim: '18:00',
  localId: 'ibirapuera',
  atracoes: [],
  ...mudancas,
});

describe('os dados do bloco como evento', () => {
  it('a hora vai com o fuso de São Paulo; o fim antes do começo é no dia seguinte', () => {
    expect(dadosDoEvento(bloco(), LOCAL, undefined, undefined)['endDate']).toBe('2026-02-14T18:00:00-03:00');
    const ateDepoisDaMeiaNoite = dadosDoEvento(bloco({ inicio: '20:00', fim: '00:00' }), LOCAL, undefined, undefined);
    expect(ateDepoisDaMeiaNoite['startDate']).toBe('2026-02-14T20:00:00-03:00');
    expect(ateDepoisDaMeiaNoite['endDate']).toBe('2026-02-15T00:00:00-03:00');
    expect(dadosDoEvento(bloco({ data: '2026-02-28', inicio: '22:00', fim: '02:00' }), LOCAL, undefined, undefined)['endDate']).toBe(
      '2026-03-01T02:00:00-03:00',
    );
    expect('endDate' in dadosDoEvento(bloco({ fim: undefined }), LOCAL, undefined, undefined)).toBe(false);
  });

  it('o endereço é o itinerário oficial, e o ponto no mapa só entra quando é exato', () => {
    const exato = dadosDoEvento(bloco(), LOCAL, 'R. Augusta, R. Peixoto Gomide', { inicio: [-46.65, -23.55], aproximado: false });
    const lugar = exato['location'] as Record<string, Record<string, unknown>>;
    expect(lugar['address']['streetAddress']).toBe('R. Augusta, R. Peixoto Gomide');
    expect(lugar['geo']).toEqual({ '@type': 'GeoCoordinates', latitude: -23.55, longitude: -46.65 });
    const aproximado = dadosDoEvento(bloco(), LOCAL, undefined, { inicio: [-46.65, -23.55], aproximado: true });
    const semPonto = aproximado['location'] as Record<string, unknown>;
    expect('geo' in semPonto).toBe(false);
    expect('streetAddress' in (semPonto['address'] as object)).toBe(false);
  });

  it('sem artista, fica sem quem toca; o endereço é o da página do bloco', () => {
    const evento = dadosDoEvento(bloco(), LOCAL, undefined, undefined);
    expect('performer' in evento).toBe(false);
    expect(evento['url']).toBe(`${ENDERECO_DO_SITE}local/ibirapuera/teste-14-02/`);
    expect(evento['isAccessibleForFree']).toBe(true);
  });

  it('o texto do script não fecha a tag antes da hora', () => {
    expect(textoDoScript({ name: '</script><b>' })).toBe('{"name":"\\u003c/script>\\u003cb>"}');
  });
});
