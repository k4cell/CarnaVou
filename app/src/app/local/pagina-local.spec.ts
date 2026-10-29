import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BLOCOS } from '../dados/blocos';
import { PaginaLocal } from './pagina-local';

describe('PaginaLocal', () => {
  async function renderizar(local: string): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [PaginaLocal],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PaginaLocal);
    fixture.componentRef.setInput('local', local);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra só os blocos do lugar escolhido', async () => {
    const tela = await renderizar('consolacao');
    const esperados = BLOCOS.filter((bloco) => bloco.localId === 'consolacao');
    expect(tela.querySelector('h2')?.textContent).toContain('Rua da Consolação e Baixo Augusta');
    expect(tela.querySelectorAll('app-banner-bloco').length).toBe(esperados.length);
  });

  it('põe os blocos em ordem de data', async () => {
    const tela = await renderizar('ibirapuera');
    const datas = Array.from(tela.querySelectorAll('time')).map((t) => t.getAttribute('datetime') ?? '');
    expect(datas.length).toBeGreaterThan(1);
    expect(datas).toEqual([...datas].sort());
  });

  it('leva cada banner para a página do bloco', async () => {
    const tela = await renderizar('consolacao');
    const hrefs = Array.from(tela.querySelectorAll('app-banner-bloco a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/local/consolacao/bloco-skol-calvin-harris');
  });

  it('mostra a hora que começa e só mostra o fim quando existe', async () => {
    const tela = await renderizar('ibirapuera');
    const horarios = Array.from(tela.querySelectorAll('.horario')).map((h) => h.textContent ?? '');
    expect(horarios.every((h) => h.startsWith('Começa às '))).toBe(true);
    expect(horarios.some((h) => h.includes('vai até'))).toBe(true);
    expect(horarios.some((h) => !h.includes('vai até'))).toBe(true);
  });

  it('só mostra a linha de artistas nos blocos que têm artista', async () => {
    const tela = await renderizar('consolacao');
    const comArtista = tela.querySelector('a[href="/local/consolacao/pipoca-da-rainha"] .atracoes');
    const semArtista = tela.querySelector('a[href="/local/consolacao/eu-sou-do-axe"] .atracoes');
    expect(comArtista?.textContent).toBe('Daniela Mercury');
    expect(semArtista).toBeNull();
  });

  it('mostra a zona do lugar na etiqueta de cor', async () => {
    const tela = await renderizar('ibirapuera');
    const etiqueta = tela.querySelector('.zona');
    expect(etiqueta?.textContent).toBe('Zona Sul');
    expect(etiqueta?.classList.contains('sul')).toBe(true);
  });

  it('avisa quando o lugar não existe', async () => {
    const tela = await renderizar('lugar-que-nao-existe');
    expect(tela.textContent).toContain('Não achei esse lugar');
    expect(tela.querySelectorAll('app-banner-bloco').length).toBe(0);
  });
});
