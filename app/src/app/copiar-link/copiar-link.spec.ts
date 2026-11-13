import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { COMPARTILHAR, COPIAR_TEXTO, CopiarLink } from './copiar-link';

describe('CopiarLink', () => {
  async function renderizar(
    opcoes: { conseguiu?: boolean; endereco?: string; compartilhar?: (dados: ShareData) => Promise<void> } = {},
  ) {
    const copiados: string[] = [];
    await TestBed.configureTestingModule({
      imports: [CopiarLink],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        // O navegador dos testes não tem o menu de compartilhar, como o do computador.
        { provide: COMPARTILHAR, useValue: opcoes.compartilhar ?? null },
        {
          provide: COPIAR_TEXTO,
          useValue: async (texto: string) => {
            copiados.push(texto);
            return opcoes.conseguiu ?? true;
          },
        },
      ],
    }).compileComponents();
    await TestBed.inject(Router).navigateByUrl(opcoes.endereco ?? '/local/consolacao');
    const fixture = TestBed.createComponent(CopiarLink);
    await fixture.whenStable();
    const tela = fixture.nativeElement as HTMLElement;
    const botao = () => tela.querySelector<HTMLButtonElement>('button')!;
    const aviso = () => tela.querySelector('[role="status"]')?.textContent?.trim();
    const tocar = async () => {
      botao().click();
      await fixture.whenStable();
      await Promise.resolve();
      await fixture.whenStable();
    };
    return { fixture, copiados, botao, aviso, tocar };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tem um botão "Copiar link" e um aviso que ainda está vazio', async () => {
    const { botao, aviso } = await renderizar();
    expect(botao().textContent).toContain('Copiar link');
    expect(aviso()).toBe('');
  });

  it('copia o endereço completo da página', async () => {
    const { copiados, tocar } = await renderizar({ endereco: '/local/consolacao/pipoca-da-rainha' });
    await tocar();
    expect(copiados).toEqual([new URL('/local/consolacao/pipoca-da-rainha', document.location.origin).href]);
  });

  it('copia o endereço limpo, sem a data de teste que está depois do "?"', async () => {
    const { copiados, tocar } = await renderizar({ endereco: '/local/consolacao?hoje=2026-02-07T12:00' });
    await tocar();
    expect(copiados).toEqual([new URL('/local/consolacao', document.location.origin).href]);
    expect(copiados[0]).not.toContain('hoje');
  });

  it('avisa "Link copiado!" quando consegue', async () => {
    const { aviso, tocar } = await renderizar();
    await tocar();
    expect(aviso()).toBe('Link copiado!');
  });

  it('tira o aviso depois de uns segundos', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { fixture, aviso, tocar } = await renderizar();
    await tocar();
    expect(aviso()).toBe('Link copiado!');
    vi.advanceTimersByTime(3000);
    await fixture.whenStable();
    expect(aviso()).toBe('');
  });

  it('manda copiar o endereço na mão quando não consegue', async () => {
    const { aviso, tocar } = await renderizar({ conseguiu: false });
    await tocar();
    expect(aviso()).toContain('Não consegui copiar');
    expect(aviso()).toContain('Copie o endereço');
  });

  describe('no celular, com o menu de compartilhar', () => {
    it('vira "Compartilhar" e abre o menu com o título e o endereço limpo da página', async () => {
      const compartilhados: ShareData[] = [];
      const { botao, copiados, tocar } = await renderizar({
        endereco: '/local/consolacao?hoje=2026-02-07T12:00',
        compartilhar: async (dados) => {
          compartilhados.push(dados);
        },
      });
      expect(botao().textContent).toContain('Compartilhar');
      await tocar();
      expect(compartilhados.length).toBe(1);
      expect(compartilhados[0].url).toBe(new URL('/local/consolacao', document.location.origin).href);
      expect(compartilhados[0].title).toBeDefined();
      expect(copiados).toEqual([]);
    });

    it('não faz nada quando a pessoa fecha o menu sem escolher', async () => {
      const { copiados, aviso, tocar } = await renderizar({
        compartilhar: () => Promise.reject(new DOMException('fechou', 'AbortError')),
      });
      await tocar();
      expect(copiados).toEqual([]);
      expect(aviso()).toBe('');
    });

    it('copia o link quando o menu falha', async () => {
      const { copiados, aviso, tocar } = await renderizar({
        compartilhar: () => Promise.reject(new DOMException('bloqueado', 'NotAllowedError')),
      });
      await tocar();
      expect(copiados.length).toBe(1);
      expect(aviso()).toBe('Link copiado!');
    });
  });
});

describe('COPIAR_TEXTO de verdade', () => {
  const clipboardOriginal = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  afterEach(() => {
    if (clipboardOriginal) {
      Object.defineProperty(navigator, 'clipboard', clipboardOriginal);
    } else {
      Reflect.deleteProperty(navigator, 'clipboard');
    }
    Reflect.deleteProperty(document, 'execCommand');
  });

  function definirAreaDeTransferencia(writeText: (texto: string) => Promise<void>) {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  }

  it('usa a área de transferência do navegador', async () => {
    const escritos: string[] = [];
    definirAreaDeTransferencia(async (texto) => {
      escritos.push(texto);
    });
    const copiar = TestBed.inject(COPIAR_TEXTO);
    expect(await copiar('https://exemplo.com/a')).toBe(true);
    expect(escritos).toEqual(['https://exemplo.com/a']);
  });

  it('cai no jeito antigo quando a área de transferência recusa', async () => {
    definirAreaDeTransferencia(async () => {
      throw new Error('sem permissão');
    });
    let copiouNaMao = false;
    Object.defineProperty(document, 'execCommand', {
      value: (comando: string) => {
        copiouNaMao = comando === 'copy';
        return true;
      },
      configurable: true,
    });
    const copiar = TestBed.inject(COPIAR_TEXTO);
    expect(await copiar('https://exemplo.com/a')).toBe(true);
    expect(copiouNaMao).toBe(true);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('devolve "não consegui" quando nada funciona', async () => {
    definirAreaDeTransferencia(async () => {
      throw new Error('sem permissão');
    });
    Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true });
    const copiar = TestBed.inject(COPIAR_TEXTO);
    expect(await copiar('https://exemplo.com/a')).toBe(false);
  });
});
