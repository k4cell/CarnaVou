import { caminhoDeVolta } from './caminho-de-volta';

describe('caminhoDeVolta', () => {
  it('do bloco volta para o lugar, com o nome dele', () => {
    expect(caminhoDeVolta('/local/consolacao/bloco-skol')).toEqual({
      link: ['/local', 'consolacao'],
      nome: 'Rua da Consolação e Baixo Augusta',
    });
  });

  it('do lugar volta para a Em alta', () => {
    expect(caminhoDeVolta('/local/ibirapuera')).toEqual({ link: ['/descobrir'], nome: 'Em alta' });
  });

  it('ignora a data de teste e o resto do endereço', () => {
    expect(caminhoDeVolta('/local/ibirapuera?hoje=2026-02-07T12:00#topo')).toEqual({
      link: ['/descobrir'],
      nome: 'Em alta',
    });
  });

  it('não tem seta nas abas do menu', () => {
    expect(caminhoDeVolta('/')).toBeNull();
    expect(caminhoDeVolta('/mapa?bloco=agrada-gregos')).toBeNull();
    expect(caminhoDeVolta('/descobrir')).toBeNull();
  });
});
