import { baixarPedaco } from './pedacos-do-mapa';

describe('os arquivos do mapa', () => {
  afterEach(() => vi.unstubAllGlobals());

  const baixarCom = (resposta: Response) => {
    const baixar = vi.fn(() => Promise.resolve(resposta));
    vi.stubGlobal('fetch', baixar);
    return baixar;
  };

  it('a página baixa o pedaço do próprio site, a partir da base dela', async () => {
    const baixar = baixarCom(new Response(new ArrayBuffer(4)));
    const controle = new AbortController();
    const resposta = await baixarPedaco({ url: 'guardado://mapa/pedacos/14/6068/9286.pbf' }, controle);
    expect(baixar).toHaveBeenCalledWith(new URL('mapa/pedacos/14/6068/9286.pbf', document.baseURI).href, {
      signal: controle.signal,
    });
    expect((resposta.data as ArrayBuffer).byteLength).toBe(4);
  });

  it('as letras também vêm do site', async () => {
    const baixar = baixarCom(new Response(new ArrayBuffer(2)));
    await baixarPedaco({ url: 'guardado://mapa/letras/noto-sans/0-255.pbf' }, new AbortController());
    expect(baixar.mock.calls[0]).toEqual([new URL('mapa/letras/noto-sans/0-255.pbf', document.baseURI).href, expect.anything()]);
  });

  it('um pedaço que não existe é um pedaço vazio', async () => {
    baixarCom(new Response('', { status: 404 }));
    const resposta = await baixarPedaco({ url: 'guardado://mapa/pedacos/14/1/2.pbf' }, new AbortController());
    expect((resposta.data as ArrayBuffer).byteLength).toBe(0);
  });

  it('avisa o mapa quando o arquivo não vem', async () => {
    baixarCom(new Response('', { status: 500 }));
    await expect(baixarPedaco({ url: 'guardado://mapa/pedacos/1/1/1.pbf' }, new AbortController())).rejects.toThrow('500');
    baixarCom(new Response('', { status: 404 }));
    await expect(baixarPedaco({ url: 'guardado://mapa/letras/noto-sans/0-255.pbf' }, new AbortController())).rejects.toThrow(
      '404',
    );
  });
});
