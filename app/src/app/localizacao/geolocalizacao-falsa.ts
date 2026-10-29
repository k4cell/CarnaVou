/*
 * Um celular de mentirinha, só para os testes: responde o que o teste mandar e anota quantas
 * vezes foi chamado. Assim os testes não dependem do GPS nem do aviso do celular. Não entra no site.
 */

export type Resposta = { ok: { lat: number; lng: number; precisao: number } } | { erro: number };

export function criarGeolocalizacaoFalsa(primeiraResposta: Resposta) {
  const chamadas: PositionOptions[] = [];
  let resposta = primeiraResposta;
  return {
    chamadas,
    /** Muda o que o celular vai responder da próxima vez. */
    responder: (nova: Resposta) => {
      resposta = nova;
    },
    api: {
      getCurrentPosition(
        sucesso: PositionCallback,
        erro?: PositionErrorCallback | null,
        opcoes?: PositionOptions,
      ) {
        chamadas.push(opcoes ?? {});
        if ('ok' in resposta) {
          const { lat, lng, precisao } = resposta.ok;
          sucesso({ coords: { latitude: lat, longitude: lng, accuracy: precisao } } as GeolocationPosition);
        } else {
          erro?.({ code: resposta.erro } as GeolocationPositionError);
        }
      },
    },
  };
}
