import { BLOCOS } from '../dados/blocos';
import { idDoPonto } from '../dados/concentracoes';
import { famaDoBloco } from '../dados/consultas';
import { trajetoDoBloco } from '../dados/trajetos';
import { blocosPertoDeVoce } from './perto-de-voce';

// Sábado de carnaval de 2026: muitos blocos, alguns já acabando às duas da tarde.
const SABADO = (hora: number, minuto = 0) => new Date(2026, 1, 14, hora, minuto);
const NA_PAULISTA = { lat: -23.5614, lng: -46.6559 };

describe('blocosPertoDeVoce', () => {
  it('só recomenda os blocos que já começaram e ainda não acabaram', () => {
    const perto = blocosPertoDeVoce(NA_PAULISTA, SABADO(14));
    expect(perto.length).toBeGreaterThan(0);
    for (const { bloco, rolando } of perto) {
      expect(rolando).toBe(true);
      expect(bloco.data).toBe('2026-02-14');
      expect(bloco.inicio <= '14:00').toBe(true);
      expect(!bloco.fim || bloco.fim <= bloco.inicio || bloco.fim > '14:00').toBe(true);
    }
  });

  it('recomenda no máximo três', () => {
    expect(blocosPertoDeVoce(NA_PAULISTA, SABADO(14)).length).toBe(3);
  });

  it('põe na frente o mais perto: quem está na concentração vê os blocos dali primeiro', () => {
    const inicio = trajetoDoBloco('bloco-emo')!.inicio;
    const [primeiro] = blocosPertoDeVoce({ lat: inicio[1], lng: inicio[0] }, SABADO(14));
    expect(primeiro.ponto).toBe(idDoPonto(inicio));
    expect(primeiro.metros).toBeLessThan(1);
  });

  it('os grandes blocos (com artista conhecido) contam como se estivessem na metade da distância', () => {
    const peso = ({ bloco, metros }: ReturnType<typeof blocosPertoDeVoce>[number]) =>
      famaDoBloco(bloco) > 0 ? metros / 2 : metros;
    const perto = blocosPertoDeVoce(NA_PAULISTA, SABADO(14));
    const pesos = perto.map(peso);
    expect(pesos).toEqual([...pesos].sort((a, b) => a - b));
  });

  it('sem nenhum rolando, recomenda os que ainda começam hoje', () => {
    const perto = blocosPertoDeVoce(NA_PAULISTA, SABADO(8));
    expect(perto.length).toBeGreaterThan(0);
    expect(perto.every(({ bloco, rolando }) => !rolando && bloco.inicio > '08:00')).toBe(true);
  });

  it('deixa de fora o que já acabou', () => {
    const perto = blocosPertoDeVoce(NA_PAULISTA, SABADO(17, 30));
    const aindaRolando = BLOCOS.filter(
      (bloco) =>
        bloco.data === '2026-02-14' &&
        bloco.inicio <= '17:30' &&
        (!bloco.fim || bloco.fim <= bloco.inicio || bloco.fim > '17:30'),
    ).map((bloco) => bloco.id);
    expect(perto.every(({ bloco }) => aindaRolando.includes(bloco.id))).toBe(true);
  });

  it('não recomenda nada num dia sem bloco', () => {
    expect(blocosPertoDeVoce(NA_PAULISTA, new Date(2026, 0, 30, 12, 0))).toEqual([]);
  });
});
