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

  it('mostra o dia, o lugar e o horário do bloco', async () => {
    const tela = await renderizar('ibirapuera', 'megabloco-do-ibira');
    const texto = tela.textContent ?? '';
    expect(tela.querySelector('h2')?.textContent).toContain('Megabloco do Ibira');
    expect(texto).toContain('Sábado, 6 de fevereiro');
    expect(texto).toContain('Parque Ibirapuera');
    expect(texto).toContain('Começa às 13h · vai até 20h');
  });

  it('lista todas as atrações, cada uma com a sua hora', async () => {
    const tela = await renderizar('ibirapuera', 'megabloco-do-ibira');
    const atracoes = Array.from(tela.querySelectorAll('.atracao')).map((a) => ({
      hora: a.querySelector('.hora')?.textContent,
      nome: a.querySelector('.hora + span')?.textContent,
    }));
    expect(atracoes).toEqual([
      { hora: '13h', nome: 'Banda Serpentina' },
      { hora: '15h30', nome: 'Mariana Tamborim' },
      { hora: '18h', nome: 'DJ Purpurina' },
    ]);
  });

  it('volta para a página do lugar', async () => {
    const tela = await renderizar('ibirapuera', 'megabloco-do-ibira');
    expect(tela.querySelector('.voltar')?.getAttribute('href')).toBe('/local/ibirapuera');
  });

  it('avisa quando o bloco não existe', async () => {
    const tela = await renderizar('ibirapuera', 'bloco-que-nao-existe');
    expect(tela.textContent).toContain('Não achei esse bloco');
  });

  it('não acha um bloco pelo lugar errado', async () => {
    const tela = await renderizar('consolacao', 'megabloco-do-ibira');
    expect(tela.textContent).toContain('Não achei esse bloco');
  });

  it('mostra o público-alvo quando o bloco tem', async () => {
    const tela = await renderizar('republica', 'cordao-da-fantasia');
    expect(tela.textContent).toContain('Público: LGBTQIA+');
  });

  it('não mostra público-alvo quando o bloco não tem', async () => {
    const tela = await renderizar('ibirapuera', 'megabloco-do-ibira');
    expect(tela.textContent).not.toContain('Público:');
  });
});
