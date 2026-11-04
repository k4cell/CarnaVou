import { baixarPedaco, pedirPelaPagina } from './pedacos-do-mapa';

describe('os pedaços do mapa', () => {
  const PEDACO = 'https://tiles.openfreemap.org/planet/20261101_001001_pt/14/6068/9286.pbf';

  afterEach(() => vi.unstubAllGlobals());

  it('troca só o endereço dos pedaços, para o pedido passar pela página', () => {
    expect(pedirPelaPagina(PEDACO, 'Tile' as never)).toEqual({
      url: 'guardado://tiles.openfreemap.org/planet/20261101_001001_pt/14/6068/9286.pbf',
    });
    expect(pedirPelaPagina('https://tiles.openfreemap.org/fonts/a/0-255.pbf', 'Glyphs' as never)).toBeUndefined();
    expect(pedirPelaPagina('https://tiles.openfreemap.org/planet', 'Source' as never)).toBeUndefined();
  });

  it('a página baixa o pedaço do endereço de verdade', async () => {
    const dados = new ArrayBuffer(4);
    const baixar = vi.fn(() => Promise.resolve(new Response(dados)));
    vi.stubGlobal('fetch', baixar);
    const controle = new AbortController();
    const resposta = await baixarPedaco({ url: 'guardado://tiles.openfreemap.org/planet/14/1/2.pbf' }, controle);
    expect(baixar).toHaveBeenCalledWith('https://tiles.openfreemap.org/planet/14/1/2.pbf', { signal: controle.signal });
    expect((resposta.data as ArrayBuffer).byteLength).toBe(4);
  });

  it('avisa o mapa quando o pedaço não vem', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('', { status: 500 }))),
    );
    await expect(baixarPedaco({ url: 'guardado://tiles.openfreemap.org/planet/1/1/1.pbf' }, new AbortController())).rejects.toThrow(
      '500',
    );
  });
});
