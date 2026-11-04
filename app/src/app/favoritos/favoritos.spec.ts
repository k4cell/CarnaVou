import { TestBed } from '@angular/core/testing';

import { BLOCOS } from '../dados/blocos';
import { BotaoFavorito } from './botao-favorito';
import { Favoritos } from './favoritos';

describe('Favoritos', () => {
  const CHAVE = 'carnavou.favoritos';

  beforeEach(() => localStorage.removeItem(CHAVE));
  afterEach(() => localStorage.removeItem(CHAVE));

  it('marca e desmarca um bloco, e guarda no aparelho', () => {
    const favoritos = TestBed.inject(Favoritos);
    favoritos.trocar('agrada-gregos');
    expect(favoritos.tem('agrada-gregos')).toBe(true);
    expect(favoritos.quantos()).toBe(1);
    expect(JSON.parse(localStorage.getItem(CHAVE)!)).toEqual(['agrada-gregos']);
    favoritos.trocar('agrada-gregos');
    expect(favoritos.tem('agrada-gregos')).toBe(false);
    expect(JSON.parse(localStorage.getItem(CHAVE)!)).toEqual([]);
  });

  it('só lê o que foi guardado depois de iniciar', () => {
    localStorage.setItem(CHAVE, JSON.stringify(['agrada-gregos']));
    const favoritos = TestBed.inject(Favoritos);
    expect(favoritos.tem('agrada-gregos')).toBe(false);
    favoritos.iniciar();
    expect(favoritos.tem('agrada-gregos')).toBe(true);
  });

  it('esquece os blocos que saíram da lista', () => {
    localStorage.setItem(CHAVE, JSON.stringify(['agrada-gregos', 'bloco-de-outro-ano']));
    const favoritos = TestBed.inject(Favoritos);
    favoritos.iniciar();
    expect(favoritos.quantos()).toBe(1);
  });

  it('não quebra quando o que está guardado não presta', () => {
    localStorage.setItem(CHAVE, 'isto não é uma lista');
    const favoritos = TestBed.inject(Favoritos);
    expect(() => favoritos.iniciar()).not.toThrow();
    expect(favoritos.quantos()).toBe(0);
  });
});

describe('BotaoFavorito', () => {
  afterEach(() => localStorage.removeItem('carnavou.favoritos'));

  async function montar(comTexto = false) {
    await TestBed.configureTestingModule({ imports: [BotaoFavorito] }).compileComponents();
    const fixture = TestBed.createComponent(BotaoFavorito);
    fixture.componentRef.setInput('bloco', BLOCOS.find((bloco) => bloco.id === 'agrada-gregos'));
    fixture.componentRef.setInput('comTexto', comTexto);
    await fixture.whenStable();
    const botao = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, botao };
  }

  it('avisa o leitor de tela se o bloco está marcado', async () => {
    const { fixture, botao } = await montar();
    expect(botao.getAttribute('aria-label')).toBe('Favorito: Agrada Gregos');
    expect(botao.getAttribute('aria-pressed')).toBe('false');
    botao.click();
    await fixture.whenStable();
    expect(botao.getAttribute('aria-pressed')).toBe('true');
  });

  it('com texto, diz se o bloco está nos favoritos', async () => {
    const { fixture, botao } = await montar(true);
    expect(botao.textContent).toContain('Favoritar');
    botao.click();
    await fixture.whenStable();
    expect(botao.textContent).toContain('Nos favoritos');
  });
});
