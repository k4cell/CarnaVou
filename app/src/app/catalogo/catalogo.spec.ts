import { TestBed } from '@angular/core/testing';
import { BLOCOS } from '../dados/blocos';
import { Catalogo } from './catalogo';

describe('Catalogo', () => {
  async function renderizar(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [Catalogo] }).compileComponents();
    const fixture = TestBed.createComponent(Catalogo);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra um banner para cada bloco', async () => {
    const tela = await renderizar();
    expect(tela.querySelectorAll('.banner').length).toBe(BLOCOS.length);
  });

  it('põe os banners em ordem de data e hora', async () => {
    const tela = await renderizar();
    const datas = Array.from(tela.querySelectorAll('time')).map((t) => t.getAttribute('datetime') ?? '');
    expect(datas).toEqual([...datas].sort());
  });

  it('mostra a hora que começa e só mostra o fim quando existe', async () => {
    const tela = await renderizar();
    const horarios = Array.from(tela.querySelectorAll('.horario')).map((h) => h.textContent ?? '');
    expect(horarios.every((h) => h.startsWith('Começa às '))).toBe(true);
    expect(horarios.some((h) => h.includes('vai até'))).toBe(true);
    expect(horarios.some((h) => !h.includes('vai até'))).toBe(true);
  });
});
