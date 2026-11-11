import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';

import { ProntoSemInternet } from '../atualizacao/aviso-de-pronto';
import { AvisoDeInstalar } from './aviso-de-instalar';
import { APARELHO, Aparelho, Instalacao } from './instalacao';

describe('O convite para instalar o app', () => {
  const CHAVE = 'carnavou.instalar-depois';
  const UM_DIA = 24 * 60 * 60 * 1000;

  /** Faz o papel do Chrome do Android: o pedido de instalar, com a resposta que a pessoa vai dar. */
  function pedidoDoNavegador(resposta: 'accepted' | 'dismissed' = 'accepted') {
    const evento = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: ReturnType<typeof vi.fn>;
      userChoice: Promise<{ outcome: string }>;
    };
    evento.prompt = vi.fn(() => Promise.resolve());
    evento.userChoice = Promise.resolve({ outcome: resposta });
    return evento;
  }

  async function montar(aparelho: Partial<Aparelho> = {}) {
    await TestBed.configureTestingModule({
      imports: [AvisoDeInstalar],
      providers: [
        { provide: APARELHO, useValue: { instalado: false, ehIphone: false, ...aparelho } },
        { provide: SwUpdate, useValue: { isEnabled: false } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AvisoDeInstalar);
    const instalacao = TestBed.inject(Instalacao);
    const tela = fixture.nativeElement as HTMLElement;
    const atualizar = async () => {
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
    };
    const botao = (texto: string) =>
      Array.from(tela.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === texto);
    return { fixture, instalacao, tela, atualizar, botao };
  }

  beforeEach(() => {
    localStorage.removeItem(CHAVE);
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.removeItem(CHAVE);
    vi.useRealTimers();
  });

  it('no Android, espera um pouco e mostra o botão "Instalar", que abre a pergunta do navegador', async () => {
    const { instalacao, tela, atualizar, botao } = await montar();
    instalacao.iniciar();
    const pedido = pedidoDoNavegador();
    window.dispatchEvent(pedido);
    // O app segura a barra do próprio Chrome, para mostrar o aviso dele.
    expect(pedido.defaultPrevented).toBe(true);
    await atualizar();
    expect(tela.querySelector('.convite')).toBeNull();
    await vi.advanceTimersByTimeAsync(15_000);
    await atualizar();
    expect(tela.querySelector('.convite')?.textContent).toContain('Instale o CarnaVou');
    botao('Instalar')!.click();
    await atualizar();
    expect(pedido.prompt).toHaveBeenCalledTimes(1);
    expect(tela.querySelector('.convite')).toBeNull();
    // Quem instalou não precisa esperar uma semana: o app instalado não mostra o aviso.
    expect(localStorage.getItem(CHAVE)).toBeNull();
  });

  it('usa o pedido que chegou antes de o app carregar (guardado pelo index.html)', async () => {
    const { instalacao, tela, atualizar, botao } = await montar();
    const pedido = pedidoDoNavegador();
    const janela = window as Window & { pedidoDeInstalar?: Event };
    janela.pedidoDeInstalar = pedido;
    instalacao.iniciar();
    expect(janela.pedidoDeInstalar).toBeUndefined();
    await vi.advanceTimersByTimeAsync(15_000);
    await atualizar();
    expect(tela.querySelector('.convite')?.textContent).toContain('Instale o CarnaVou');
    botao('Instalar')!.click();
    await atualizar();
    expect(pedido.prompt).toHaveBeenCalledTimes(1);
  });

  it('se a pessoa diz não na pergunta do navegador, espera uma semana para convidar de novo', async () => {
    const { instalacao, atualizar, botao } = await montar();
    instalacao.iniciar();
    window.dispatchEvent(pedidoDoNavegador('dismissed'));
    await vi.advanceTimersByTimeAsync(15_000);
    await atualizar();
    botao('Instalar')!.click();
    await atualizar();
    expect(Number(localStorage.getItem(CHAVE))).toBeGreaterThan(0);
  });

  it('"Agora não" some com o aviso e ele não volta por uma semana', async () => {
    const primeira = await montar();
    primeira.instalacao.iniciar();
    window.dispatchEvent(pedidoDoNavegador());
    await vi.advanceTimersByTimeAsync(15_000);
    await primeira.atualizar();
    primeira.botao('Agora não')!.click();
    await primeira.atualizar();
    expect(primeira.tela.querySelector('.convite')).toBeNull();
    expect(Number(localStorage.getItem(CHAVE))).toBeGreaterThan(0);

    // Seis dias depois, ainda não; com oito, o convite volta.
    localStorage.setItem(CHAVE, String(Date.now() - 6 * UM_DIA));
    TestBed.resetTestingModule();
    const seisDias = await montar();
    seisDias.instalacao.iniciar();
    window.dispatchEvent(pedidoDoNavegador());
    await vi.advanceTimersByTimeAsync(15_000);
    await seisDias.atualizar();
    expect(seisDias.tela.querySelector('.convite')).toBeNull();

    localStorage.setItem(CHAVE, String(Date.now() - 8 * UM_DIA));
    TestBed.resetTestingModule();
    const oitoDias = await montar();
    oitoDias.instalacao.iniciar();
    window.dispatchEvent(pedidoDoNavegador());
    await vi.advanceTimersByTimeAsync(15_000);
    await oitoDias.atualizar();
    expect(oitoDias.tela.querySelector('.convite')).not.toBeNull();
  });

  it('no iPhone, que não tem o botão, explica o caminho pelo Compartilhar', async () => {
    const { instalacao, tela, atualizar, botao } = await montar({ ehIphone: true });
    instalacao.iniciar();
    await vi.advanceTimersByTimeAsync(15_000);
    await atualizar();
    expect(tela.querySelector('.convite')?.textContent).toContain('Adicionar à Tela de Início');
    botao('Entendi')!.click();
    await atualizar();
    expect(tela.querySelector('.convite')).toBeNull();
    expect(Number(localStorage.getItem(CHAVE))).toBeGreaterThan(0);
  });

  it('não aparece para quem já instalou, nem num navegador que não sabe instalar', async () => {
    const instalado = await montar({ instalado: true, ehIphone: true });
    instalado.instalacao.iniciar();
    window.dispatchEvent(pedidoDoNavegador());
    await vi.advanceTimersByTimeAsync(15_000);
    await instalado.atualizar();
    expect(instalado.tela.querySelector('.convite')).toBeNull();

    TestBed.resetTestingModule();
    const semPedido = await montar();
    semPedido.instalacao.iniciar();
    await vi.advanceTimersByTimeAsync(15_000);
    await semPedido.atualizar();
    expect(semPedido.tela.querySelector('.convite')).toBeNull();
  });

  it('some quando o app é instalado por fora (pelo menu do navegador)', async () => {
    const { instalacao, tela, atualizar } = await montar();
    instalacao.iniciar();
    window.dispatchEvent(pedidoDoNavegador());
    await vi.advanceTimersByTimeAsync(15_000);
    await atualizar();
    window.dispatchEvent(new Event('appinstalled'));
    await atualizar();
    expect(tela.querySelector('.convite')).toBeNull();
  });

  it('espera a vez quando outro aviso está na tela', async () => {
    const { instalacao, tela, atualizar } = await montar({ ehIphone: true });
    const pronto = TestBed.inject(ProntoSemInternet);
    pronto.avisar.set(true);
    instalacao.iniciar();
    await vi.advanceTimersByTimeAsync(15_000);
    await atualizar();
    expect(tela.querySelector('.convite')).toBeNull();
    pronto.avisar.set(false);
    await atualizar();
    expect(tela.querySelector('.convite')).not.toBeNull();
  });
});
