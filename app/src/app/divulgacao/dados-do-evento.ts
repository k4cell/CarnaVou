import { Bloco, Local, Trajeto } from '../dados/tipos';
import { descricaoDoBloco } from './descricoes';
import { IMAGEM_DA_PREVIA, enderecoCompleto } from './endereco-do-site';

/** São Paulo não tem horário de verão desde 2019: o fuso é sempre três horas antes de Greenwich. */
const FUSO_DE_SAO_PAULO = '-03:00';

/** O dia seguinte, no formato AAAA-MM-DD, sem depender do fuso de quem gera a página. */
function diaSeguinte(data: string): string {
  const dia = new Date(`${data}T12:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() + 1);
  return dia.toISOString().slice(0, 10);
}

/**
 * Os dados do bloco como evento (schema.org/Event), que o Google lê para mostrar o bloco na busca de
 * eventos, com o dia, a hora e o lugar. Vão na página do bloco num `<script type="application/ld+json">`.
 * Só entra o que a fonte diz: o ponto no mapa só quando é exato, e o endereço é o itinerário oficial.
 */
export function dadosDoEvento(
  bloco: Bloco,
  local: Local | undefined,
  itinerario: string | undefined,
  trajeto: Trajeto | undefined,
): Record<string, unknown> {
  // Um fim antes do começo ("00:00") é depois da meia-noite: o bloco acaba no dia seguinte.
  const diaDoFim = bloco.fim && bloco.fim <= bloco.inicio ? diaSeguinte(bloco.data) : bloco.data;
  const lugar: Record<string, unknown> = {
    '@type': 'Place',
    name: local?.nome ?? itinerario ?? 'São Paulo',
    address: {
      '@type': 'PostalAddress',
      ...(itinerario ? { streetAddress: itinerario } : {}),
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
  };
  if (trajeto && !trajeto.aproximado) {
    const [lng, lat] = trajeto.inicio;
    lugar['geo'] = { '@type': 'GeoCoordinates', latitude: lat, longitude: lng };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: bloco.nome,
    description: descricaoDoBloco(bloco, local),
    startDate: `${bloco.data}T${bloco.inicio}:00${FUSO_DE_SAO_PAULO}`,
    ...(bloco.fim ? { endDate: `${diaDoFim}T${bloco.fim}:00${FUSO_DE_SAO_PAULO}` } : {}),
    eventStatus: bloco.cancelado ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    // Bloco de rua: é só chegar.
    isAccessibleForFree: true,
    location: lugar,
    image: [IMAGEM_DA_PREVIA],
    url: enderecoCompleto(`/local/${bloco.localId}/${bloco.id}`),
    // Os dados não dizem se quem toca é uma pessoa ou uma banda; no bloco, sobe sempre com a banda.
    ...(bloco.atracoes.length > 0
      ? {
          performer: bloco.atracoes.map((atracao) => ({
            '@type': 'PerformingGroup',
            name: atracao.nome,
            ...(atracao.perfil ? { sameAs: `https://www.instagram.com/${atracao.perfil}/` } : {}),
          })),
        }
      : {}),
  };
}

/** O texto do `<script>`, sem nada que feche a tag antes da hora. */
export function textoDoScript(dados: Record<string, unknown>): string {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}
