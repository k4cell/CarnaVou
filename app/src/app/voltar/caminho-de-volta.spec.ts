import { caminhoDeVolta } from './caminho-de-volta';

describe('caminhoDeVolta', () => {
  describe('para quem chegou direto por um link', () => {
    it('do bloco sobe para o lugar, com o nome dele', () => {
      expect(caminhoDeVolta('/local/consolacao/bloco-skol')).toEqual({
        url: '/local/consolacao',
        nome: 'Rua da Consolação e Baixo Augusta',
        peloHistorico: false,
      });
    });

    it('do lugar sobe para o Descobrir', () => {
      expect(caminhoDeVolta('/local/ibirapuera')).toEqual({ url: '/descobrir', nome: 'Descobrir', peloHistorico: false });
    });

    it('ignora a data de teste e o resto do endereço', () => {
      expect(caminhoDeVolta('/local/ibirapuera?hoje=2026-02-07T12:00#topo')?.url).toBe('/descobrir');
    });
  });

  describe('para quem veio de outra tela do app', () => {
    it('do bloco volta para a aba Blocos', () => {
      expect(caminhoDeVolta('/local/consolacao/bloco-skol', '/')).toEqual({
        url: '/',
        nome: 'Blocos',
        peloHistorico: true,
      });
    });

    it('do bloco volta para o lugar, se veio dele', () => {
      expect(caminhoDeVolta('/local/consolacao/bloco-skol', '/local/consolacao')).toEqual({
        url: '/local/consolacao',
        nome: 'Rua da Consolação e Baixo Augusta',
        peloHistorico: true,
      });
    });

    it('do lugar volta para o bloco, para o mapa ou para o After, com o nome certo', () => {
      expect(caminhoDeVolta('/local/consolacao', '/local/consolacao/bloco-skol')?.nome).toBe('Bloco Skol');
      expect(caminhoDeVolta('/local/consolacao', '/mapa?bloco=bloco-skol')?.nome).toBe('Mapa');
      expect(caminhoDeVolta('/local/consolacao', '/after')?.nome).toBe('After');
    });
  });

  it('não tem seta nas abas do menu', () => {
    expect(caminhoDeVolta('/')).toBeNull();
    expect(caminhoDeVolta('/mapa?bloco=agrada-gregos')).toBeNull();
    expect(caminhoDeVolta('/descobrir', '/')).toBeNull();
    expect(caminhoDeVolta('/after', '/local/consolacao')).toBeNull();
  });
});
