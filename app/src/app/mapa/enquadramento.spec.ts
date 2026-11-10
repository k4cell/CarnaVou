import { pontosParaEnquadrar } from './enquadramento';

const SE = { id: 'se', lat: -23.55, lng: -46.63 };
const PINHEIROS = { id: 'pinheiros', lat: -23.56, lng: -46.69 };
const IBIRAPUERA = { id: 'ibirapuera', lat: -23.585, lng: -46.66 };
// A uns 28 km da Sé, na Zona Leste.
const SAO_MIGUEL = { id: 'sao-miguel', lat: -23.5, lng: -46.44 };
// A uns 19 km, na Zona Norte.
const PERUS = { id: 'perus', lat: -23.41, lng: -46.75 };

const ids = (pontos: { id: string }[]) => pontos.map((ponto) => ponto.id);

describe('pontosParaEnquadrar', () => {
  it('deixa de fora o ponto sozinho lá longe, quando quase todos os blocos estão juntos', () => {
    const pontos = [{ ...SE, quantos: 21 }, { ...PINHEIROS, quantos: 5 }, { ...IBIRAPUERA, quantos: 13 }, SAO_MIGUEL, PERUS];
    expect(ids(pontosParaEnquadrar(pontos))).toEqual(['se', 'pinheiros', 'ibirapuera']);
  });

  it('conta os blocos, e não os pontos: um ponto cheio pesa mais que vários de um bloco só', () => {
    // Três pontos de um bloco e um de dois: o meio fica no centro, mas ali só tem 60% dos blocos.
    const espalhados = [SE, PINHEIROS, IBIRAPUERA, { ...SAO_MIGUEL, quantos: 2 }];
    expect(pontosParaEnquadrar(espalhados)).toEqual(espalhados);
    // Com o centro cheio, o de longe passa a ser a exceção.
    const concentrados = [{ ...SE, quantos: 10 }, PINHEIROS, IBIRAPUERA, { ...SAO_MIGUEL, quantos: 2 }];
    expect(ids(pontosParaEnquadrar(concentrados))).toEqual(['se', 'pinheiros', 'ibirapuera']);
  });

  it('enquadra todos quando os pontos estão espalhados', () => {
    const pontos = [SE, SAO_MIGUEL, PERUS];
    expect(pontosParaEnquadrar(pontos)).toEqual(pontos);
  });

  it('com um ou dois pontos, enquadra o que tem', () => {
    expect(pontosParaEnquadrar([SAO_MIGUEL])).toEqual([SAO_MIGUEL]);
    expect(pontosParaEnquadrar([{ ...SE, quantos: 30 }, SAO_MIGUEL])).toEqual([{ ...SE, quantos: 30 }, SAO_MIGUEL]);
    expect(pontosParaEnquadrar([])).toEqual([]);
  });
});
