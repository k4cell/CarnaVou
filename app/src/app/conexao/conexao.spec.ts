import { TestBed } from '@angular/core/testing';

import { Conexao } from './conexao';

describe('Conexao', () => {
  const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');

  function fingirQueEsta(online: boolean) {
    Object.defineProperty(navigator, 'onLine', { value: online, configurable: true });
  }

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'onLine');
    if (original) {
      Object.defineProperty(Navigator.prototype, 'onLine', original);
    }
  });

  it('começa como "com internet", antes de olhar o celular', () => {
    fingirQueEsta(false);
    const conexao = TestBed.inject(Conexao);
    expect(conexao.online()).toBe(true);
  });

  it('ao iniciar, fica como o celular está', () => {
    fingirQueEsta(false);
    const conexao = TestBed.inject(Conexao);
    conexao.iniciar();
    expect(conexao.online()).toBe(false);
  });

  it('acompanha quando a internet cai e quando volta', () => {
    fingirQueEsta(true);
    const conexao = TestBed.inject(Conexao);
    conexao.iniciar();
    window.dispatchEvent(new Event('offline'));
    expect(conexao.online()).toBe(false);
    window.dispatchEvent(new Event('online'));
    expect(conexao.online()).toBe(true);
  });
});
