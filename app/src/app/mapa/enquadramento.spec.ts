import { pontosParaEnquadrar } from './enquadramento';
import { estaNoCentroExpandido } from './limites';

// No centro expandido.
const REPUBLICA = { id: 'republica', lat: -23.5435, lng: -46.6425 };
const FARIA_LIMA = { id: 'faria-lima', lat: -23.592, lng: -46.681 };
const IBIRAPUERA = { id: 'ibirapuera', lat: -23.585, lng: -46.656 };
// Fora dele: ao norte do Tietê, na Zona Leste e em Perus.
const FREGUESIA = { id: 'freguesia', lat: -23.5016, lng: -46.698 };
const SAO_MIGUEL = { id: 'sao-miguel', lat: -23.483, lng: -46.387 };
const PERUS = { id: 'perus', lat: -23.407, lng: -46.758 };

const ids = (pontos: { id: string }[]) => pontos.map((ponto) => ponto.id);

describe('pontosParaEnquadrar', () => {
  it('sabe o que fica no centro expandido', () => {
    for (const ponto of [REPUBLICA, FARIA_LIMA, IBIRAPUERA]) {
      expect(estaNoCentroExpandido(ponto.lat, ponto.lng), ponto.id).toBe(true);
    }
    for (const ponto of [FREGUESIA, SAO_MIGUEL, PERUS]) {
      expect(estaNoCentroExpandido(ponto.lat, ponto.lng), ponto.id).toBe(false);
    }
  });

  it('com quase todos os blocos no centro expandido, deixa de fora os pontos de longe', () => {
    const pontos = [
      { ...REPUBLICA, quantos: 21 },
      { ...FARIA_LIMA, quantos: 7 },
      { ...IBIRAPUERA, quantos: 13 },
      { ...FREGUESIA, quantos: 2 },
      SAO_MIGUEL,
      PERUS,
    ];
    expect(ids(pontosParaEnquadrar(pontos))).toEqual(['republica', 'faria-lima', 'ibirapuera']);
  });

  it('conta os blocos, e não os pontos', () => {
    // Dois pontos no centro e dois fora: com um bloco em cada, o centro só tem metade.
    const espalhados = [REPUBLICA, IBIRAPUERA, SAO_MIGUEL, PERUS];
    expect(pontosParaEnquadrar(espalhados)).toEqual(espalhados);
    // Com o centro cheio, os de longe passam a ser a exceção.
    const concentrados = [{ ...REPUBLICA, quantos: 10 }, IBIRAPUERA, SAO_MIGUEL, PERUS];
    expect(ids(pontosParaEnquadrar(concentrados))).toEqual(['republica', 'ibirapuera']);
  });

  it('enquadra todos quando nenhum está no centro expandido', () => {
    const pontos = [FREGUESIA, SAO_MIGUEL, PERUS];
    expect(pontosParaEnquadrar(pontos)).toEqual(pontos);
    expect(pontosParaEnquadrar([])).toEqual([]);
  });
});
