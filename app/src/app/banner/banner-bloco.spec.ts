import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BLOCOS } from '../dados/blocos';
import { Bloco } from '../dados/tipos';
import { Relogio } from '../relogio/relogio';
import { BannerBloco } from './banner-bloco';

describe('BannerBloco', () => {
  async function renderizar(id: string, agora: Date | null, entradas: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({
      imports: [BannerBloco],
      providers: [provideRouter([])],
    }).compileComponents();
    if (agora) {
      TestBed.inject(Relogio).definir(agora, true);
    }
    const fixture = TestBed.createComponent(BannerBloco);
    fixture.componentRef.setInput(
      'bloco',
      BLOCOS.find((bloco) => bloco.id === id),
    );
    for (const [nome, valor] of Object.entries(entradas)) {
      fixture.componentRef.setInput(nome, valor);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const horario = (tela: HTMLElement) => tela.querySelector('.horario');

  describe('o horário mostra em que pé o bloco está', () => {
    // Forrozin: sábado, 07/02, das 12h às 15h.
    it('fica verde quando já começou', async () => {
      const tela = await renderizar('forrozin', new Date(2026, 1, 7, 13, 0));
      expect(horario(tela)?.getAttribute('data-selo')).toBe('agora');
      expect(horario(tela)?.textContent).toContain('Começou às 12h');
    });

    it('fica amarelo quando ainda vai começar hoje', async () => {
      const tela = await renderizar('forrozin', new Date(2026, 1, 7, 10, 0));
      expect(horario(tela)?.getAttribute('data-selo')).toBe('em-breve');
      expect(horario(tela)?.textContent).toContain('Começa às 12h');
    });

    it('fica cinza quando já acabou hoje', async () => {
      const tela = await renderizar('forrozin', new Date(2026, 1, 7, 16, 0));
      expect(horario(tela)?.getAttribute('data-selo')).toBe('acabou');
    });

    it('fica sem cor em outro dia e antes de saber a hora', async () => {
      const outroDia = await renderizar('forrozin', new Date(2026, 1, 6, 12, 0));
      expect(horario(outroDia)?.hasAttribute('data-selo')).toBe(false);
      TestBed.resetTestingModule();
      const semHora = await renderizar('forrozin', null);
      expect(horario(semHora)?.hasAttribute('data-selo')).toBe(false);
    });
  });

  describe('os artistas', () => {
    it('não repete o artista que já está no nome do bloco', async () => {
      expect((await renderizar('bicho-maluco-beleza-com-alceu-valenca', null)).querySelector('.atracoes')).toBeNull();
    });

    it('mostra os outros artistas', async () => {
      expect((await renderizar('forrozin', null)).querySelector('.atracoes')?.textContent).toContain('Mariana Aydar');
    });
  });

  describe('a data', () => {
    it('aparece por padrão', async () => {
      expect((await renderizar('forrozin', null)).querySelector('time')).not.toBeNull();
    });

    it('some quando o cartão do dia já mostra a data', async () => {
      const tela = await renderizar('forrozin', null, { mostrarData: false });
      expect(tela.querySelector('time')).toBeNull();
    });
  });

  describe('um bloco corrigido', () => {
    async function comEntradas(correcao: Partial<Bloco>, agora: Date | null = null) {
      const bloco = { ...BLOCOS.find(({ id }) => id === 'forrozin')!, ...correcao };
      return renderizar('forrozin', agora, { bloco });
    }

    it('cancelado: diz isso no lugar do horário, em vermelho, e risca o nome', async () => {
      const tela = await comEntradas({ cancelado: true }, new Date(2026, 1, 7, 13, 0));
      expect(horario(tela)?.textContent).toBe('Cancelado');
      expect(horario(tela)?.getAttribute('data-selo')).toBe('cancelado');
      expect(tela.querySelector('a.cancelado')).not.toBeNull();
    });

    it('com horário mudado: diz que o horário é novo', async () => {
      const tela = await comEntradas({ horarioMudou: true, inicio: '18:00', fim: '20:00' });
      expect(horario(tela)?.textContent).toBe('Novo horário: começa às 18h · vai até 20h');
    });
  });

  it('tem a estrela de favorito fora do link, para o toque não abrir o bloco', async () => {
    const tela = await renderizar('forrozin', null);
    expect(tela.querySelector('app-botao-favorito')).not.toBeNull();
    expect(tela.querySelector('a app-botao-favorito')).toBeNull();
  });
});
