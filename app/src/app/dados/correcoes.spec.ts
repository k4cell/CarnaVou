import { blocosDaAba, cartoesDaAba } from './agenda';
import { BLOCOS } from './blocos';
import { concentracoesDaAba } from './concentracoes';
import { acharBlocoPeloId, artistasDoLugar, maisFamosos } from './consultas';
import { definirCorrecoes, lerCorrecoes, problemasDoArquivo, todosOsBlocos } from './correcoes';
import { blocosDaNoite, secaoDoQueJaAconteceu, secoesDosBlocos } from './lista-de-blocos';

describe('as correções', () => {
  afterEach(() => definirCorrecoes([]));

  const ids = (secao?: { grupos: { id: string }[][] }) => secao?.grupos.flat().map((bloco) => bloco.id) ?? [];
  // O dia e a hora em que o bloco está rolando, para testar as listas com ele no meio.
  const bloco = BLOCOS.find(({ fim, atracoes }) => fim && atracoes.some(({ seguidores }) => seguidores))!;
  const [ano, mes, dia] = bloco.data.split('-').map(Number);
  const [hora] = bloco.inicio.split(':').map(Number);
  const rolando = new Date(ano, mes - 1, dia, hora, 1);

  describe('sem nenhuma correção', () => {
    it('os blocos são os da lista oficial', () => {
      expect(todosOsBlocos()).toBe(BLOCOS);
    });
  });

  describe('um bloco cancelado', () => {
    beforeEach(() => definirCorrecoes([{ id: bloco.id, cancelado: true, nota: 'Choveu.' }]));

    it('fica marcado, com a nota', () => {
      expect(acharBlocoPeloId(bloco.id)).toMatchObject({ cancelado: true, nota: 'Choveu.' });
    });

    it('vai para o fim da lista, à parte, e não aparece como rolando', () => {
      const secoes = secoesDosBlocos('hoje', rolando);
      expect(secoes.at(-1)?.titulo).toBe('Cancelados');
      expect(ids(secoes.at(-1))).toEqual([bloco.id]);
      expect(ids(secoes.find(({ titulo }) => titulo === 'Rolando agora'))).not.toContain(bloco.id);
    });

    it('continua na página do lugar, onde quem ia nele vai olhar', () => {
      expect(blocosDaAba('hoje', bloco.localId, rolando).map(({ id }) => id)).toContain(bloco.id);
    });

    it('sai do mapa, do After, dos destaques e do que já aconteceu', () => {
      expect(concentracoesDaAba('hoje', rolando).flatMap(({ blocos }) => blocos.map(({ id }) => id))).not.toContain(bloco.id);
      expect(blocosDaNoite('hoje', rolando).map(({ id }) => id)).not.toContain(bloco.id);
      expect(maisFamosos(blocosDaAba('hoje', bloco.localId, rolando), 100).map(({ id }) => id)).not.toContain(bloco.id);
      const depois = new Date(ano, mes - 1, dia + 1, 12);
      expect(ids(secaoDoQueJaAconteceu(depois, () => true) ?? undefined)).not.toContain(bloco.id);
    });

    it('não conta nos artistas nem no selo do lugar', () => {
      const artistas = bloco.atracoes.map(({ nome }) => nome);
      const deOutroBloco = BLOCOS.filter(({ id, localId }) => id !== bloco.id && localId === bloco.localId).flatMap(({ atracoes }) =>
        atracoes.map(({ nome }) => nome),
      );
      const soDele = artistas.filter((nome) => !deOutroBloco.includes(nome));
      expect(soDele.length).toBeGreaterThan(0);
      expect(artistasDoLugar(bloco.localId)).not.toContain(soDele[0]);
      const cartao = cartoesDaAba('hoje', rolando).find(({ local }) => local.id === bloco.localId);
      expect(`${cartao?.principal}${cartao?.resto}`).not.toContain(soDele[0]);
    });
  });

  describe('um horário mudado', () => {
    it('vale nas listas, e o bloco muda de seção na hora certa', () => {
      expect(ids(secoesDosBlocos('hoje', rolando).find(({ titulo }) => titulo === 'Rolando agora'))).toContain(bloco.id);
      definirCorrecoes([{ id: bloco.id, inicio: '23:00', desfile: '23:10', fim: '23:50' }]);
      expect(acharBlocoPeloId(bloco.id)).toMatchObject({ inicio: '23:00', horarioMudou: true });
      expect(ids(secoesDosBlocos('hoje', rolando).find(({ titulo }) => titulo === 'Rolando agora'))).not.toContain(bloco.id);
      expect(ids(secoesDosBlocos('hoje', rolando).find(({ titulo }) => titulo === 'Mais tarde hoje'))).toContain(bloco.id);
    });

    it('uma nota sozinha não diz que o horário mudou', () => {
      definirCorrecoes([{ id: bloco.id, nota: 'Vai ter chuva.' }]);
      expect(acharBlocoPeloId(bloco.id)?.horarioMudou).toBeUndefined();
    });
  });

  describe('o arquivo', () => {
    const linha = (campos: object) => ({ blocos: [{ id: bloco.id, ...campos }] });

    it('aceita o que está certo', () => {
      expect(problemasDoArquivo({ blocos: [] })).toEqual([]);
      expect(problemasDoArquivo(linha({ cancelado: true, nota: 'Choveu.' }))).toEqual([]);
      expect(problemasDoArquivo(linha({ inicio: '08:00', desfile: '08:30', fim: '09:00' }))).toEqual([]);
      expect(problemasDoArquivo(linha({ fim: '01:00' }))).toEqual([]);
    });

    it.each([
      ['sem a lista', {}],
      ['bloco que não existe', { blocos: [{ id: 'nao-existe', cancelado: true }] }],
      ['linha que não diz o que mudou', linha({})],
      ['campo com o nome errado', linha({ horario: '10:00' })],
      ['hora escrita errado', linha({ inicio: '10h' })],
      ['hora que não existe', linha({ inicio: '25:00' })],
      ['data de outro ano', linha({ data: '1999-02-10' })],
      ['cancelado entre aspas', linha({ cancelado: 'sim' })],
      ['horários fora de ordem', linha({ inicio: '20:00', desfile: '10:00' })],
      ['fim antes do desfile', linha({ inicio: '08:00', desfile: '12:00', fim: '11:00' })],
      ['o mesmo bloco em duas linhas', { blocos: [{ id: bloco.id, cancelado: true }, { id: bloco.id, nota: 'Oi.' }] }],
    ])('reclama de: %s', (_, arquivo) => {
      expect(problemasDoArquivo(arquivo).length).toBeGreaterThan(0);
    });

    it('no app, a linha errada fica de fora e a certa continua valendo', () => {
      const outro = BLOCOS.find(({ id }) => id !== bloco.id)!;
      const certa = { id: outro.id, cancelado: true };
      expect(lerCorrecoes({ blocos: [{ id: bloco.id, inicio: '10h' }, certa, 'bagunça', null] })).toEqual([certa]);
    });

    it('não troca nada além do que a correção pode trocar', () => {
      definirCorrecoes(lerCorrecoes({ blocos: [{ id: bloco.id, nome: 'Outro', localId: 'x', cancelado: true }] }));
      expect(acharBlocoPeloId(bloco.id)?.nome).toBe(bloco.nome);
    });
  });
});
