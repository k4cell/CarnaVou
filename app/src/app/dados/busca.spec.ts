import { BLOCOS } from './blocos';
import { criarBusca } from './busca';

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
