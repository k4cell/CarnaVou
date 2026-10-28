import { TestBed } from '@angular/core/testing';

import { Zona } from '../dados/tipos';
import { ZonaTag } from './zona-tag';

describe('ZonaTag', () => {
  const zonas: [Zona, string][] = [
    ['centro', 'Centro'],
    ['sul', 'Zona Sul'],
    ['leste', 'Zona Leste'],
    ['oeste', 'Zona Oeste'],
    ['norte', 'Zona Norte'],
  ];

  for (const [zona, nome] of zonas) {
    it(`mostra "${nome}" com a classe de cor "${zona}"`, async () => {
      const fixture = TestBed.createComponent(ZonaTag);
      fixture.componentRef.setInput('zona', zona);
      await fixture.whenStable();
      const etiqueta = (fixture.nativeElement as HTMLElement).querySelector('.zona');
      expect(etiqueta?.textContent).toBe(nome);
      expect(etiqueta?.classList.contains(zona)).toBe(true);
    });
  }
});
