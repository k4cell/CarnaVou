import { TestBed } from '@angular/core/testing';

import { Relogio } from '../relogio/relogio';
import { CartaoDaFase } from './cartao-da-fase';

describe('CartaoDaFase', () => {
  async function renderizar(agora: Date | null) {
    await TestBed.configureTestingModule({ imports: [CartaoDaFase] }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora, true);
    }
    const fixture = TestBed.createComponent(CartaoDaFase);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('antes do primeiro bloco, diz quantos dias faltam e de quando a quando vão os blocos', async () => {
    // Quarta, 28/01/2026: o primeiro bloco é no sábado, 07/02, e o último, no domingo, 22/02.
    const tela = await renderizar(new Date(2026, 0, 28, 12, 0));
    expect(tela.querySelector('.destaque')?.textContent).toBe('Faltam 10 dias para o carnaval de rua');
    expect(tela.textContent).toContain('O primeiro bloco sai no sábado, 7 de fevereiro, e o último, no domingo, 22 de fevereiro.');
  });

  it('na véspera, diz que começa amanhã', async () => {
    const tela = await renderizar(new Date(2026, 1, 6, 20, 0));
    expect(tela.querySelector('.destaque')?.textContent).toBe('O carnaval de rua começa amanhã!');
  });

  it('depois do último bloco, diz que o carnaval do ano acabou e quando volta', async () => {
    const tela = await renderizar(new Date(2026, 1, 25, 12, 0));
    expect(tela.querySelector('.destaque')?.textContent).toBe('O carnaval de rua de 2026 acabou');
    expect(tela.textContent).toContain('quando a Prefeitura publicar a lista oficial');
  });

  it('não aparece durante a festa nem na página pronta', async () => {
    expect((await renderizar(new Date(2026, 1, 14, 14, 0))).querySelector('.cartao-da-fase')).toBeNull();
    TestBed.resetTestingModule();
    expect((await renderizar(null)).querySelector('.cartao-da-fase')).toBeNull();
  });
});
