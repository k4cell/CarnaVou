import { momentoDoBloco } from './agenda';
import { BLOCOS } from './blocos';
import { criarBusca, montarBusca, textoSemOQuando } from './busca';

describe('criarBusca', () => {
  const achados = (texto: string) => BLOCOS.filter(criarBusca(texto)).map((bloco) => bloco.id);

  it('sem nada escrito, todo bloco combina', () => {
    expect(achados('   ').length).toBe(BLOCOS.length);
  });

  it('acha pelo nome do bloco, pelo artista e pelo lugar, sem ligar para acento nem maiúscula', () => {
    expect(achados('FORROZIN')).toEqual(['forrozin']);
    expect(achados('mariana aydar')).toEqual(['forrozin']);
    expect(achados('ze vaqueiro')).toEqual(['bloco-skol']);
    expect(achados('ibirapuera')).toContain('forrozin');
  });

  it('acha pela zona e pelo estilo', () => {
    expect(achados('zona leste').length).toBeGreaterThan(0);
    expect(achados('forro')).toContain('forrozin');
  });

  it('todas as palavras precisam aparecer, em qualquer ordem', () => {
    expect(achados('aydar ibirapuera')).toEqual(['forrozin']);
    expect(achados('ibirapuera emicida anitta')).toEqual([]);
  });

  describe('com erro de digitação', () => {
    it('acha o nome escrito do jeito que se fala, sem as letras dobradas', () => {
      expect(achados('pablo vitar')).toEqual(achados('Pabllo Vittar'));
      expect(achados('pablo vitar').length).toBeGreaterThan(0);
    });

    it('acha com uma letra trocada, faltando, sobrando ou invertida', () => {
      const certo = achados('ivete sangalo');
      expect(certo.length).toBeGreaterThan(0);
      expect(achados('ivete sangalu')).toEqual(certo);
      expect(achados('ivte sangalo')).toEqual(certo);
      expect(achados('iveete sangaloo')).toEqual(certo);
      expect(achados('ivtee sangalo')).toEqual(certo);
    });

    it('acha com o nome pela metade e com erro', () => {
      expect(achados('sangl')).toEqual(achados('ivete sangalo'));
    });

    it('palavra curta precisa estar certa', () => {
      expect(achados('xyz')).toEqual([]);
    });

    it('não acha um nome muito diferente', () => {
      expect(achados('ivete bicicleta')).toEqual([]);
      expect(achados('bicicleta')).toEqual([]);
    });

    it('quem digitou certo não recebe os parecidos', () => {
      expect(achados('forrozin')).toEqual(['forrozin']);
    });
  });
});

describe('montarBusca: o dia escrito na busca', () => {
  // Sábado, 14/02, às 14h.
  const SABADO_14H = new Date(2026, 1, 14, 14, 0);
  const achados = (texto: string, agora: Date = SABADO_14H) =>
    BLOCOS.filter(montarBusca(texto, agora).combina).map((bloco) => bloco.id);
  const datas = (texto: string) => [...new Set(BLOCOS.filter(montarBusca(texto, SABADO_14H).combina).map((b) => b.data))];

  it('"hoje" acha só os blocos de hoje e diz que entendeu o dia', () => {
    const busca = montarBusca('hoje', SABADO_14H);
    expect(busca.quando).toEqual({ tipo: 'dia', dia: '2026-02-14' });
    expect(achados('hoje').length).toBe(BLOCOS.filter((bloco) => bloco.data === '2026-02-14').length);
  });

  it('"amanhã", com ou sem acento, acha os do dia seguinte', () => {
    expect(datas('Amanhã')).toEqual(['2026-02-15']);
    expect(datas('amanha')).toEqual(['2026-02-15']);
  });

  it('"agora" acha só o que já começou e ainda não acabou', () => {
    const busca = montarBusca('agora', SABADO_14H);
    expect(busca.quando).toEqual({ tipo: 'agora' });
    const rolando = BLOCOS.filter(busca.combina);
    expect(rolando.map((bloco) => bloco.id)).toEqual(expect.arrayContaining(['carna-lau', 'agrada-gregos']));
    expect(rolando.every((bloco) => momentoDoBloco(bloco, SABADO_14H) === 'rolando')).toBe(true);
  });

  it('um dia da semana vira o próximo dia com esse nome, a contar de hoje', () => {
    expect(datas('sábado')).toEqual(['2026-02-14']);
    expect(datas('domingo')).toEqual(['2026-02-15']);
    expect(datas('terça-feira')).toEqual(['2026-02-17']);
  });

  it('junta o dia com as outras palavras', () => {
    expect(achados('Gloria Groove hoje')).toEqual(['agrada-gregos']);
    expect(achados('sertanejo amanhã')).toContain('sertanejinho-do-telo');
    expect(datas('sertanejo amanhã')).toEqual(['2026-02-15']);
  });

  it('não procura pelas palavras de ligação', () => {
    expect(achados('bloco da pabllo')).toEqual(['bloco-da-pabllo']);
    expect(achados('o bloco do Teló no Ibirapuera')).toEqual(['sertanejinho-do-telo']);
  });

  it('volta a procurar as palavras no nome quando o dia não acha nada', () => {
    // Segunda, 16/02: o próximo domingo é 22/02, mas o Domingo Ela não Vai foi no dia 15.
    const busca = montarBusca('domingo ela nao vai', new Date(2026, 1, 16, 12, 0));
    expect(busca.quando).toBeNull();
    expect(BLOCOS.filter(busca.combina).map((bloco) => bloco.id)).toEqual(['domingo-ela-nao-vai']);
  });

  it('sem saber o dia de hoje (a página pronta), não filtra por dia', () => {
    expect(montarBusca('Gloria Groove hoje', null).quando).toBeNull();
    expect(BLOCOS.filter(criarBusca('Gloria Groove hoje')).map((bloco) => bloco.id)).toEqual(['agrada-gregos']);
  });
});

describe('textoSemOQuando', () => {
  it('tira as palavras de tempo e deixa o resto como a pessoa escreveu', () => {
    expect(textoSemOQuando('samba hoje')).toBe('samba');
    expect(textoSemOQuando('Axé terça-feira no Centro')).toBe('Axé no Centro');
    expect(textoSemOQuando('agora')).toBe('');
  });
});
