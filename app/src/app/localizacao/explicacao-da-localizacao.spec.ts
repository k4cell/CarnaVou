import { TestBed } from '@angular/core/testing';

import { ExplicacaoDaLocalizacao } from './explicacao-da-localizacao';

describe('ExplicacaoDaLocalizacao', () => {
  async function renderizar() {
    await TestBed.configureTestingModule({ imports: [ExplicacaoDaLocalizacao] }).compileComponents();
    const fixture = TestBed.createComponent(ExplicacaoDaLocalizacao);
    const respostas = { continuar: 0, agoraNao: 0 };
    fixture.componentInstance.continuar.subscribe(() => respostas.continuar++);
    fixture.componentInstance.agoraNao.subscribe(() => respostas.agoraNao++);
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    const botao = (nome: string) =>
      Array.from(tela.querySelectorAll('button')).find((b) => b.textContent?.trim() === nome)!;
    const apertar = (alvo: HTMLElement, tecla: string, shift = false) => {
      const evento = new KeyboardEvent('keydown', { key: tecla, shiftKey: shift, cancelable: true, bubbles: true });
      alvo.dispatchEvent(evento);
      return evento;
    };
    return { tela, respostas, botao, apertar };
  }

  it('é uma janela de diálogo com título, para o leitor de tela', async () => {
    const { tela } = await renderizar();
    expect(tela.getAttribute('role')).toBe('dialog');
    expect(tela.getAttribute('aria-modal')).toBe('true');
    const id = tela.getAttribute('aria-labelledby')!;
    expect(tela.querySelector(`#${id}`)?.textContent).toContain('Mostrar onde você está');
  });

  it('explica para que serve, o que não faz e que dá para não usar', async () => {
    const { tela } = await renderizar();
    const texto = tela.textContent ?? '';
    expect(texto).toContain('distância até cada lugar');
    expect(texto).toContain('Não sigo o seu caminho');
    expect(texto).toContain('Não é guardada nem enviada a ninguém');
    expect(texto).toContain('o celular vai perguntar se pode');
    expect(texto).toContain('o mapa funciona do mesmo jeito');
  });

  it('abre com o foco no botão Continuar', async () => {
    const { botao } = await renderizar();
    expect(document.activeElement).toBe(botao('Continuar'));
  });

  it('avisa que a pessoa quer continuar', async () => {
    const { botao, respostas } = await renderizar();
    botao('Continuar').click();
    expect(respostas).toEqual({ continuar: 1, agoraNao: 0 });
  });

  it('avisa que a pessoa não quer agora', async () => {
    const { botao, respostas } = await renderizar();
    botao('Agora não').click();
    expect(respostas).toEqual({ continuar: 0, agoraNao: 1 });
  });

  it('fecha no Esc, como o "Agora não"', async () => {
    const { tela, apertar, respostas } = await renderizar();
    apertar(tela, 'Escape');
    expect(respostas).toEqual({ continuar: 0, agoraNao: 1 });
  });

  it('prende o foco: Tab no último botão volta para o primeiro', async () => {
    const { tela, botao, apertar } = await renderizar();
    botao('Agora não').focus();
    const evento = apertar(tela, 'Tab');
    expect(evento.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(botao('Continuar'));
  });

  it('prende o foco: Shift+Tab no primeiro botão vai para o último', async () => {
    const { tela, botao, apertar } = await renderizar();
    botao('Continuar').focus();
    const evento = apertar(tela, 'Tab', true);
    expect(evento.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(botao('Agora não'));
  });

  it('deixa o Tab andar do primeiro para o segundo botão sem interferir', async () => {
    const { tela, botao, apertar } = await renderizar();
    botao('Continuar').focus();
    const evento = apertar(tela, 'Tab');
    expect(evento.defaultPrevented).toBe(false);
  });
});
