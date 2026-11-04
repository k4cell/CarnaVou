import { Location } from '@angular/common';
import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { Trilha } from './trilha';

@Component({ template: '' })
class TelaVazia {}

describe('Trilha', () => {
  function montar() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: TelaVazia },
          { path: 'descobrir', component: TelaVazia },
          { path: 'local/:local', component: TelaVazia },
          { path: 'local/:local/:bloco', component: TelaVazia },
          { path: 'blocos', redirectTo: '' },
        ]),
      ],
    });
    return { trilha: TestBed.inject(Trilha), router: TestBed.inject(Router), location: TestBed.inject(Location) };
  }

  /** O histórico do navegador avisa o roteador com uma pequena demora. */
  const voltarNoHistorico = async (location: Location) => {
    location.back();
    await new Promise((pronto) => setTimeout(pronto));
    await TestBed.inject(ApplicationRef).whenStable();
  };

  it('quem chegou direto por um link não tem de onde veio', async () => {
    const { trilha, router } = montar();
    await router.navigateByUrl('/local/ibirapuera');
    expect(trilha.anterior()).toBeUndefined();
    expect(trilha.ultimaAba()).toBeUndefined();
  });

  it('guarda a tela de onde a pessoa veio e a última aba por onde ela passou', async () => {
    const { trilha, router } = montar();
    await router.navigateByUrl('/descobrir');
    await router.navigateByUrl('/local/ibirapuera');
    await router.navigateByUrl('/local/ibirapuera/agrada-gregos');
    expect(trilha.anterior()).toBe('/local/ibirapuera');
    expect(trilha.ultimaAba()).toBe('/descobrir');
  });

  it('a última aba vem sem a data de teste', async () => {
    const { trilha, router } = montar();
    await router.navigateByUrl('/?hoje=2026-02-07T12:00');
    await router.navigateByUrl('/local/ibirapuera');
    expect(trilha.ultimaAba()).toBe('/');
    expect(trilha.anterior()).toBe('/?hoje=2026-02-07T12:00');
  });

  it('volta junto com o histórico do navegador', async () => {
    const { trilha, router, location } = montar();
    // É aqui que o roteador passa a ouvir o histórico do navegador.
    router.initialNavigation();
    await router.navigateByUrl('/');
    await router.navigateByUrl('/local/ibirapuera');
    await router.navigateByUrl('/local/ibirapuera/agrada-gregos');
    await voltarNoHistorico(location);
    expect(router.url).toBe('/local/ibirapuera');
    expect(trilha.anterior()).toBe('/');
  });

  it('subir pela árvore troca a tela atual, em vez de criar um passo novo', async () => {
    const { trilha, router } = montar();
    await router.navigateByUrl('/local/ibirapuera/agrada-gregos');
    await router.navigateByUrl('/local/ibirapuera', { replaceUrl: true });
    expect(trilha.anterior()).toBeUndefined();
  });

  it('registra o endereço depois do redirecionamento', async () => {
    const { trilha, router } = montar();
    await router.navigateByUrl('/blocos');
    await router.navigateByUrl('/local/ibirapuera');
    expect(trilha.anterior()).toBe('/');
  });
});
