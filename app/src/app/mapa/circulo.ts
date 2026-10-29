const METROS_POR_GRAU_DE_LATITUDE = 111_320;

/**
 * Os pontos de um círculo no mapa, em volta de um centro, para desenhar a precisão da posição.
 * Em volta de São Paulo o erro dessa conta é de centímetros, que não importam aqui.
 * Devolve o contorno fechado: o último ponto é igual ao primeiro.
 */
export function contornoDoCirculo(lat: number, lng: number, raioEmMetros: number, passos = 48): [number, number][] {
  const grausDeLatitude = raioEmMetros / METROS_POR_GRAU_DE_LATITUDE;
  const grausDeLongitude = grausDeLatitude / Math.cos((lat * Math.PI) / 180);
  const contorno: [number, number][] = [];
  for (let passo = 0; passo < passos; passo++) {
    const angulo = (2 * Math.PI * passo) / passos;
    contorno.push([lng + grausDeLongitude * Math.cos(angulo), lat + grausDeLatitude * Math.sin(angulo)]);
  }
  contorno.push(contorno[0]);
  return contorno;
}
