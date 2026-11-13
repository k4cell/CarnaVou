import { CartaoDoLugar } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { Bloco, Local } from '../dados/tipos';
import { montarBusca } from '../dados/busca';
import {
  blocosDaVitrine,
  destaqueDaVitrine,
  estilosDaVitrine,
  famososDaVitrine,
  lgbtDaVitrine,
  lugaresPorZona,
  naVitrine,
  proximosDaVitrine,
} from './vitrine';

const bloco = (id: string, inicio: string, fim: string, seguidores = 0, estilo?: Bloco['estilo']): Bloco => ({
  id,
  nome: id,
  data: '2026-02-14',
  inicio,
  fim,
  localId: 'ibirapuera',
  atracoes: seguidores ? [{ nome: `Artista de ${id}`, seguidores }] : [],
  estilo,
});

// Sábado, 14/02/2026, duas da tarde.
const AGORA = new Date(2026, 1, 14, 14, 0);

describe('A vitrine do Descobrir', () => {
  it('pega os blocos da aba que ainda dá para aproveitar: sem os que já acabaram', () => {
    const deHoje = blocosDaVitrine('hoje', AGORA);
    expect(deHoje.length).toBeGreaterThan(0);
    expect(deHoje.every((b) => b.data === '2026-02-14' && !(b.fim && b.fim > b.inicio && b.fim <= '14:00'))).toBe(true);
    const deAmanha = blocosDaVitrine('amanha', AGORA);
    expect(deAmanha.every((b) => b.data === '2026-02-15')).toBe(true);
    const geral = blocosDaVitrine('geral', AGORA);
    expect(geral.length).toBe(
      BLOCOS.filter((b) => b.data > '2026-02-14').length + deHoje.length,
    );
  });

  describe('o destaque', () => {
    const famosoMasDepois = bloco('famoso-depois', '16:00', '20:00', 9_000_000);
    const rolandoPequeno = bloco('rolando-pequeno', '13:00', '17:00', 100);
    const rolandoGrande = bloco('rolando-grande', '12:00', '18:00', 5_000);

    it('é o mais famoso do que está rolando, mesmo com um mais famoso mais tarde', () => {
      expect(destaqueDaVitrine([rolandoGrande, rolandoPequeno, famosoMasDepois], AGORA)).toBe(rolandoGrande);
    });

    it('sem nada rolando, é o mais famoso do que vem; no empate, o que começa antes', () => {
      const cedo = bloco('cedo', '15:00', '19:00', 10);
      const tarde = bloco('tarde', '17:00', '21:00', 10);
      expect(destaqueDaVitrine([cedo, famosoMasDepois, tarde], AGORA)).toBe(famosoMasDepois);
      expect(destaqueDaVitrine([cedo, tarde], AGORA)).toBe(cedo);
      expect(destaqueDaVitrine([], AGORA)).toBeNull();
    });

    it('os mais famosos ficam sem o destaque e sem quem não tem artista', () => {
      const semArtista = bloco('sem-artista', '15:00', '19:00');
      expect(famososDaVitrine([rolandoPequeno, semArtista, rolandoGrande, famosoMasDepois], famosoMasDepois)).toEqual([
        rolandoGrande,
        rolandoPequeno,
      ]);
    });
  });

  describe('o que está rolando e começando', () => {
    const a = bloco('a', '13:00', '17:00');
    const b = bloco('b', '14:30', '18:00');
    const c = bloco('c', '15:00', '19:00');
    const d = bloco('d', '16:00', '20:00');
    const metros: Record<string, number | undefined> = { a: 1_500, b: 900, c: undefined, d: 200 };

    it('vem por horário, sem o destaque', () => {
      expect(proximosDaVitrine([a, b, c, d], a)).toEqual([b, c, d]);
    });

    it('sabendo onde a pessoa está, vem do mais perto para o mais longe; sem ponto no mapa, no fim', () => {
      expect(proximosDaVitrine([a, b, c, d], null, (x) => metros[x.id])).toEqual([d, b, a, c]);
    });

    it('cada bloco diz a distância e o tempo a pé, quando se sabe', () => {
      expect(naVitrine(d, AGORA, (x) => metros[x.id]).distancia).toBe('200 m · uns 4 min a pé');
      expect(naVitrine(c, AGORA, (x) => metros[x.id]).distancia).toBeNull();
      expect(naVitrine(d, AGORA).distancia).toBeNull();
    });
  });

  it('conta os estilos, do que tem mais para o que tem menos, com o dia na busca', () => {
    const blocos = [
      bloco('a', '15:00', '18:00', 0, 'axe'),
      bloco('b', '15:00', '18:00', 0, 'pop'),
      bloco('c', '15:00', '18:00', 0, 'axe'),
      bloco('d', '15:00', '18:00'),
    ];
    expect(estilosDaVitrine(blocos, 'hoje')).toEqual([
      { estilo: 'axe', nome: 'Axé', quantos: 2, busca: 'Axé hoje' },
      { estilo: 'pop', nome: 'Pop', quantos: 1, busca: 'Pop hoje' },
    ]);
    expect(estilosDaVitrine(blocos, 'amanha')[0].busca).toBe('Axé amanhã');
    expect(estilosDaVitrine(blocos, 'geral')[0].busca).toBe('Axé');
  });

  it('põe os blocos LGBTQIA+ junto dos estilos, com a busca por "LGBT"', () => {
    const lgbt = { ...bloco('e', '15:00', '18:00', 0, 'pop'), lgbt: true };
    const estilos = estilosDaVitrine([lgbt, bloco('f', '15:00', '18:00', 0, 'pop')], 'hoje');
    expect(estilos).toEqual([
      { estilo: 'pop', nome: 'Pop', quantos: 2, busca: 'Pop hoje' },
      { estilo: 'lgbt', nome: 'LGBTQIA+', quantos: 1, busca: 'LGBT hoje' },
    ]);
  });

  it('separa os blocos LGBTQIA+, que a busca também acha por "LGBT"', () => {
    const lgbt = BLOCOS.filter((b) => b.lgbt);
    expect(lgbt.map((b) => b.nome).sort()).toEqual(['Agrada Gregos', 'Bloco Minhoqueens', 'Bloco da Pabllo']);
    expect(lgbtDaVitrine([...BLOCOS])).toEqual(lgbt);
    const { combina } = montarBusca('lgbt');
    expect(BLOCOS.filter(combina)).toEqual(lgbt);
  });

  it('junta os lugares por zona, na ordem em que cada zona aparece', () => {
    const cartao = (id: string, zona: Local['zona']) => ({ local: { id, nome: id, zona } }) as CartaoDoLugar;
    const zonas = lugaresPorZona([cartao('a', 'sul'), cartao('b', 'centro'), cartao('c', 'sul')]);
    expect(zonas.map((grupo) => [grupo.zona, grupo.cartoes.map((c) => c.local.id)])).toEqual([
      ['sul', ['a', 'c']],
      ['centro', ['b']],
    ]);
  });
});
