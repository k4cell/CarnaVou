import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { DATA_DE_DEMONSTRACAO } from './relogio/relogio';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes, withComponentInputBinding())],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    // O emblema é só enfeite (alt vazio); o nome do app fica na imagem da palavra.
    expect(compiled.querySelector('h1 img[alt="CarnaVou"]')).not.toBeNull();
  });

  it('avisa no cabeçalho de toda página, numa linha só, que é uma versão de teste, com o ano dos dados', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const aviso = compiled.querySelector('header app-aviso-de-teste');
    expect(aviso?.textContent?.replace(/\s+/g, ' ').trim()).toMatch(/^Teste Blocos de 2026/);
  });

  it('põe a data de teste no mesmo aviso, quando "hoje" não vem do relógio do celular', async () => {
    // Sem nada no endereço, vale a data de demonstração do app: sábado, 7/2/2026, meio-dia.
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const aviso = (fixture.nativeElement as HTMLElement).querySelector('header app-aviso-de-teste');
    expect(aviso?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Teste Blocos de 2026 · hoje é sáb, 7/2/2026, 12h');
  });

  it('não põe a data de teste quando é o relógio de verdade', async () => {
    TestBed.overrideProvider(DATA_DE_DEMONSTRACAO, { useValue: null });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const aviso = (fixture.nativeElement as HTMLElement).querySelector('header app-aviso-de-teste');
    expect(aviso?.textContent).not.toContain('hoje é');
  });

  describe('a seta de voltar, no canto do cabeçalho', () => {
    async function abrir(endereco: string) {
      const fixture = TestBed.createComponent(App);
      await TestBed.inject(Router).navigateByUrl(endereco);
      await fixture.whenStable();
      return (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('header a.voltar');
    }

    it('no bloco, volta para o lugar, com o nome dele para o leitor de tela', async () => {
      const seta = await abrir('/local/consolacao/bloco-skol');
      expect(seta?.getAttribute('href')).toBe('/local/consolacao');
      expect(seta?.getAttribute('aria-label')).toBe('Voltar para Rua da Consolação e Baixo Augusta');
    });

    it('no lugar, volta para a Em alta', async () => {
      const seta = await abrir('/local/ibirapuera');
      expect(seta?.getAttribute('href')).toBe('/');
    });

    it('não aparece nas abas do menu', async () => {
      expect(await abrir('/')).toBeNull();
      expect(await abrir('/blocos')).toBeNull();
    });
  });

  it('oferece a logo em WebP, que é mais leve, com o PNG de reserva', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const fontes = Array.from(compiled.querySelectorAll('h1 picture source')).map((s) => s.getAttribute('srcset'));
    expect(fontes).toEqual(['logo/emblema.webp', 'logo/palavra.webp']);
    expect(compiled.querySelector('h1 picture img[src="logo/palavra.png"]')).not.toBeNull();
  });

  describe('o aviso de "Sem internet"', () => {
    afterEach(() => {
      Reflect.deleteProperty(navigator, 'onLine');
    });

    const aviso = (compiled: HTMLElement) => compiled.querySelector('.sem-internet');

    it('fica vazio e escondido com internet', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(aviso(compiled)?.textContent?.trim()).toBe('');
      expect(aviso(compiled)?.classList.contains('visivel')).toBe(false);
    });

    it('aparece quando a internet cai e some quando ela volta', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const compiled = fixture.nativeElement as HTMLElement;
      window.dispatchEvent(new Event('offline'));
      await fixture.whenStable();
      expect(aviso(compiled)?.textContent?.trim()).toBe('Sem internet');
      expect(aviso(compiled)?.classList.contains('visivel')).toBe(true);
      expect(aviso(compiled)?.getAttribute('role')).toBe('status');
      window.dispatchEvent(new Event('online'));
      await fixture.whenStable();
      expect(aviso(compiled)?.textContent?.trim()).toBe('');
    });

    it('aparece já ao abrir, se o celular está sem internet', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      expect(aviso(fixture.nativeElement)?.textContent?.trim()).toBe('Sem internet');
    });
  });
});
