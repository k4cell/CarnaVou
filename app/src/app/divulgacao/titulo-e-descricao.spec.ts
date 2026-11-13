import { TestBed } from '@angular/core/testing';
import { Router, TitleStrategy, provideRouter } from '@angular/router';

import { routes } from '../app.routes';
import { BLOCOS } from '../dados/blocos';
import { acharLocal } from '../dados/consultas';
import { DESCRICAO_DO_SITE, DESCRICOES, descricaoDoBloco, descricaoDoLocal } from './descricoes';
import { ENDERECO_DO_SITE, IMAGEM_DA_PREVIA, enderecoCompleto } from './endereco-do-site';
import { TituloEDescricao } from './titulo-e-descricao';

describe('o título, a descrição e a prévia do link', () => {
  const meta = (seletor: string) =>
    document.head.querySelector(`meta[${seletor}]`)?.getAttribute('content');
  const previa = (propriedade: string) => meta(`property="${propriedade}"`);
  const canonico = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

  async function abrir(endereco: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: TitleStrategy, useClass: TituloEDescricao }],
    });
    await TestBed.inject(Router).navigateByUrl(endereco);
  }

  it('na página do lugar: o nome, quantos blocos e os artistas, com o endereço limpo', async () => {
    await abrir('/local/ibirapuera?hoje=2026-02-07T12:00');
    const local = acharLocal('ibirapuera')!;
    expect(document.title).toBe('Parque Ibirapuera · CarnaVou');
    expect(meta('name="description"')).toBe(descricaoDoLocal(local));
    expect(previa('og:title')).toBe('Parque Ibirapuera · CarnaVou');
    expect(previa('og:description')).toBe(descricaoDoLocal(local));
    expect(previa('og:url')).toBe(`${ENDERECO_DO_SITE}local/ibirapuera/`);
    expect(canonico()).toBe(`${ENDERECO_DO_SITE}local/ibirapuera/`);
    expect(previa('og:image')).toBe(IMAGEM_DA_PREVIA);
    expect(meta('name="twitter:card"')).toBe('summary_large_image');
  });

  it('na página do bloco: o nome no título e o dia, o horário e o lugar na descrição', async () => {
    const bloco = BLOCOS.find((cada) => cada.atracoes.length > 0 && cada.fim)!;
    await abrir(`/local/${bloco.localId}/${bloco.id}`);
    expect(previa('og:title')).toBe(`${bloco.nome} · CarnaVou`);
    expect(previa('og:description')).toBe(descricaoDoBloco(bloco, acharLocal(bloco.localId)));
    expect(previa('og:url')).toBe(`${ENDERECO_DO_SITE}local/${bloco.localId}/${bloco.id}/`);
  });

  it('nas outras páginas: a descrição de cada uma, e a do site na aba Blocos', async () => {
    await abrir('/mapa');
    expect(meta('name="description"')).toBe(DESCRICOES.mapa);
    TestBed.resetTestingModule();
    await abrir('/');
    expect(meta('name="description"')).toBe(DESCRICAO_DO_SITE);
    expect(previa('og:url')).toBe(ENDERECO_DO_SITE);
  });

  it('não repete as tags ao trocar de página', async () => {
    await abrir('/sobre');
    await TestBed.inject(Router).navigateByUrl('/termos');
    expect(document.head.querySelectorAll('meta[property="og:url"]').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(previa('og:url')).toBe(`${ENDERECO_DO_SITE}termos/`);
  });
});

describe('enderecoCompleto', () => {
  it('põe o endereço do site na frente, tira o que vem depois do "?" e termina com a barra', () => {
    expect(enderecoCompleto('/')).toBe(ENDERECO_DO_SITE);
    expect(enderecoCompleto('/?hoje=2026-02-07')).toBe(ENDERECO_DO_SITE);
    expect(enderecoCompleto('/local/consolacao?hoje=2026-02-07T12:00#x')).toBe(
      `${ENDERECO_DO_SITE}local/consolacao/`,
    );
  });
});

describe('descricaoDoBloco', () => {
  const bloco = BLOCOS.find((cada) => cada.atracoes.length > 0 && cada.fim)!;

  it('diz o dia com o ano, o horário, o lugar e até três artistas', () => {
    const texto = descricaoDoBloco(bloco, { id: 'x', nome: 'Lugar X', zona: 'sul' });
    expect(texto).toContain(`de ${bloco.data.slice(0, 4)}, das `);
    expect(texto).toContain(' · Lugar X');
    expect(texto).toContain(`com ${bloco.atracoes[0].nome}`);
    expect(texto).toMatch(/Bloco do carnaval de rua de São Paulo\.$/);
  });

  it('sem o término, diz "a partir das"; sem artista, não fala de artista', () => {
    const texto = descricaoDoBloco({ ...bloco, fim: undefined, atracoes: [] });
    expect(texto).toContain('a partir das');
    expect(texto).not.toContain(' com ');
  });

  it('não repete o artista que já está no nome do bloco', () => {
    const artista = bloco.atracoes[0].nome;
    expect(descricaoDoBloco({ ...bloco, nome: `Bloco de ${artista}` })).not.toContain(
      `com ${artista}`,
    );
  });
});
