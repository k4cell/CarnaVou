import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
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
