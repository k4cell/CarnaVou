import { CartaoDoLugar } from '../dados/agenda';
import { BLOCOS } from '../dados/blocos';
import { Bloco, Local } from '../dados/tipos';
import { blocosDaVitrine, destaqueDaVitrine, estilosDaVitrine, famososDaVitrine, lugaresPorZona } from './vitrine';

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

  it('junta os lugares por zona, na ordem em que cada zona aparece', () => {
    const cartao = (id: string, zona: Local['zona']) => ({ local: { id, nome: id, zona } }) as CartaoDoLugar;
    const zonas = lugaresPorZona([cartao('a', 'sul'), cartao('b', 'centro'), cartao('c', 'sul')]);
    expect(zonas.map((grupo) => [grupo.zona, grupo.cartoes.map((c) => c.local.id)])).toEqual([
      ['sul', ['a', 'c']],
      ['centro', ['b']],
    ]);
  });
});
