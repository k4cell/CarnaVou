import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PaginaBloco } from './pagina-bloco';

describe('PaginaBloco', () => {
  async function renderizar(local: string, bloco: string): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [PaginaBloco],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PaginaBloco);
    fixture.componentRef.setInput('local', local);
    fixture.componentRef.setInput('bloco', bloco);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function atracoesDe(tela: HTMLElement) {
    return Array.from(tela.querySelectorAll('.atracao')).map((a) => ({
      hora: a.querySelector('.hora')?.textContent,
      nome: a.querySelector('.hora + span')?.textContent,
    }));
  }

  it('mostra o dia, o lugar e o horário do bloco', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    const texto = tela.textContent ?? '';
    expect(tela.querySelector('h2')?.textContent).toContain('Agrada Gregos');
    expect(texto).toContain('Sábado, 14 de fevereiro');
    expect(texto).toContain('Parque Ibirapuera');
    expect(texto).toContain('Começa às 13h · vai até 18h');
  });

  it('lista todas as atrações do bloco', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    expect(atracoesDe(tela).map((a) => a.nome)).toEqual(['Gloria Groove', 'Gretchen']);
  });

  it('mostra a hora da atração quando existe, da mais cedo para a mais tarde', async () => {
    const tela = await renderizar('consolacao', 'bloco-skol-calvin-harris');
    expect(atracoesDe(tela)).toEqual([
      { hora: '11h30', nome: 'Nattan' },
      { hora: '11h30', nome: 'Xand Avião' },
      { hora: '11h30', nome: 'Zé Vaqueiro' },
      { hora: '11h30', nome: 'Felipe Amorim' },
      { hora: '14h', nome: 'Calvin Harris' },
    ]);
  });

  it('avisa quando o bloco ainda não tem atração divulgada', async () => {
    const tela = await renderizar('ibirapuera', 'galo-da-madrugada');
    expect(tela.querySelectorAll('.atracao').length).toBe(0);
    expect(tela.textContent).toContain('Ainda não tem atrações divulgadas.');
  });

  it('volta para a página do lugar', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    expect(tela.querySelector('.voltar')?.getAttribute('href')).toBe('/local/ibirapuera');
  });

  it('mostra o estilo só quando alguma fonte diz', async () => {
    const comEstilo = await renderizar('ibirapuera', 'galo-da-madrugada');
    expect(comEstilo.textContent).toContain('Estilo: Frevo');
    TestBed.resetTestingModule();
    const semEstilo = await renderizar('ibirapuera', 'quintal-dos-prettos');
    expect(semEstilo.textContent).not.toContain('Estilo:');
  });

  it('mostra o público-alvo quando o bloco tem', async () => {
    const tela = await renderizar('ibirapuera', 'agrada-gregos');
    expect(tela.textContent).toContain('Público: LGBTQIA+');
  });

  it('não mostra público-alvo quando o bloco não tem', async () => {
    const tela = await renderizar('ibirapuera', 'quem-pede-pede');
    expect(tela.textContent).not.toContain('Público:');
  });

  it('avisa quando o bloco não existe', async () => {
    const tela = await renderizar('ibirapuera', 'bloco-que-nao-existe');
    expect(tela.textContent).toContain('Não achei esse bloco');
  });

  it('não acha um bloco pelo lugar errado', async () => {
    const tela = await renderizar('consolacao', 'agrada-gregos');
    expect(tela.textContent).toContain('Não achei esse bloco');
  });
});
