"""Gera o estilo do mapa do CarnaVou a partir do estilo "positron" do OpenFreeMap.

O estilo é só o desenho: os pedaços do mapa e as letras são nossos e ficam no próprio site
(scripts/mapa/gerar-pedacos-do-mapa.py gera os dois). Se a OpenFreeMap sair do ar, o mesmo estilo
"positron" está em https://github.com/openmaptiles/positron-gl-style.

Pinta o mapa de lilás (as cores da marca), tira o que uma cidade não precisa (fronteiras,
países, aeroportos, geleiras), põe as estações de metrô e de trem e grava o resultado em
app/public/mapa/estilo-carnavou.json.

Para pesar menos, o mapa não usa o sprite (a imagem com os ícones, uns
120 kB) e usa uma letra só, a normal: a itálica (uns 46 kB) e o negrito não são baixados.

Como usar, a partir da raiz do projeto:

    python scripts/mapa/gerar-estilo-do-mapa.py

As cores estão no dicionário COR, logo abaixo. Para mudar o visual do mapa, mude lá e rode de
novo. O crédito do mapa (OpenMapTiles e OpenStreetMap) aparece na tela: o MapLibre o tira da
fonte dos pedaços.
"""

import json
import os
import re
import urllib.request

ORIGEM = "https://tiles.openfreemap.org/styles/positron"
DESTINO = os.path.join("app", "public", "mapa", "estilo-carnavou.json")
LIMITES_DO_APP = os.path.join("app", "src", "app", "mapa", "limites.ts")

COR = {
    "fundo": "#ebe4f6",
    "parque": "#dcd2ef",
    "mato": "#d6cbec",
    "residencial": "#e7dff3",
    "agua": "#bdaee6",
    "predio": "#dfd4f0",
    "predio_borda": "#cfc1e6",
    "via": "#ffffff",
    "via_borda": "#d3c6ea",
    "caminho": "#dacded",
    "ferrovia": "#d6cbec",
    "ferrovia_tracejado": "#f4effa",
    "tunel": "#f1ebfa",
    "texto": "#4a3a6b",
    "texto_suave": "#6c5c8e",
    "texto_agua": "#5b48a0",
    "halo": "rgba(255,255,255,0.9)",
}

# O que cada camada pinta: id da camada -> {propriedade: cor}.
PINTURA = {
    "background": {"background-color": "fundo"},
    "park": {"fill-color": "parque"},
    "water": {"fill-color": "agua"},
    "landuse_residential": {"fill-color": "residencial"},
    "landcover_wood": {"fill-color": "mato"},
    "waterway": {"line-color": "agua"},
    "building": {"fill-color": "predio", "fill-outline-color": "predio_borda"},
    "tunnel_motorway_casing": {"line-color": "via_borda"},
    "tunnel_motorway_inner": {"line-color": "tunel"},
    "road_area_pier": {"fill-color": "fundo"},
    "road_pier": {"line-color": "fundo"},
    "highway_path": {"line-color": "caminho"},
    "highway_minor": {"line-color": "via"},
    "highway_major_casing": {"line-color": "via_borda"},
    "highway_major_inner": {"line-color": "via"},
    "highway_major_subtle": {"line-color": "via_borda"},
    "highway_motorway_casing": {"line-color": "via_borda"},
    "highway_motorway_inner": {"line-color": "via"},
    "highway_motorway_subtle": {"line-color": "via_borda"},
    "highway_motorway_bridge_casing": {"line-color": "via_borda"},
    "highway_motorway_bridge_inner": {"line-color": "via"},
    "railway_transit": {"line-color": "ferrovia"},
    "railway_transit_dashline": {"line-color": "ferrovia_tracejado"},
    "railway_service": {"line-color": "ferrovia"},
    "railway_service_dashline": {"line-color": "ferrovia_tracejado"},
    "railway": {"line-color": "ferrovia"},
    "railway_dashline": {"line-color": "ferrovia_tracejado"},
    "waterway_line_label": {"text-color": "texto_agua", "text-halo-color": "halo"},
    "water_name_point_label": {"text-color": "texto_agua", "text-halo-color": "halo"},
    "water_name_line_label": {"text-color": "texto_agua", "text-halo-color": "halo"},
    "highway-name-path": {"text-color": "texto_suave", "text-halo-color": "halo"},
    "highway-name-minor": {"text-color": "texto_suave", "text-halo-color": "halo"},
    "highway-name-major": {"text-color": "texto_suave", "text-halo-color": "halo"},
    "label_other": {"text-color": "texto", "text-halo-color": "halo"},
    "label_village": {"text-color": "texto", "text-halo-color": "halo"},
    "label_town": {"text-color": "texto", "text-halo-color": "halo"},
    "label_city": {"text-color": "texto", "text-halo-color": "halo"},
    "label_city_capital": {"text-color": "texto", "text-halo-color": "halo"},
}

# Camadas que uma cidade não usa.
TIRAR = {
    # Os prédios eram quase 40% do peso do mapa: os pedaços nem os têm (gerar-pedacos-do-mapa.py).
    "building",
    "landcover_ice_shelf",
    "landcover_glacier",
    "aeroway-taxiway",
    "aeroway-runway-casing",
    "aeroway-area",
    "aeroway-runway",
    "boundary_3",
    "boundary_2",
    "boundary_disputed",
    "highway-shield-non-us",
    "highway-shield-us-interstate",
    "road_shield_us",
    "airport",
    "label_state",
    "label_country_3",
    "label_country_2",
    "label_country_1",
}

# A única letra do mapa: só ela é baixada.
LETRA = ["noto-sans"]

# O "guardado://" é um endereço de mentira: o app o troca pelo arquivo do próprio site
# (app/src/app/mapa/pedacos-do-mapa.ts), que fica em app/public/mapa/pedacos e app/public/mapa/letras.
PEDACOS = "guardado://mapa/pedacos/{z}/{x}/{y}.pbf"
LETRAS = "guardado://mapa/letras/{fontstack}/{range}.pbf"
CREDITO = (
    '<a href="https://openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> '
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
)


def limites_do_mapa() -> list[float]:
    """O retângulo da Grande SP, [oeste, sul, leste, norte], o mesmo do app (limites.ts)."""
    with open(LIMITES_DO_APP, encoding="utf-8") as arquivo:
        achado = re.search(r"\[\s*\[(-?[\d.]+),\s*(-?[\d.]+)\],\s*\[(-?[\d.]+),\s*(-?[\d.]+)\]", arquivo.read())
    if not achado:
        raise SystemExit(f"Não achei o retângulo do mapa em {LIMITES_DO_APP}.")
    return [float(numero) for numero in achado.groups()]


def nome_em_letras_latinas(campo):
    """Os nomes só em letras latinas: as letras do mapa não têm as de outras escritas (japonês etc.)."""
    if isinstance(campo, list) and campo[:1] == ["case"] and "name:nonlatin" in json.dumps(campo[1]):
        return campo[-1]
    return campo


def usar_o_nosso_mapa(estilo: dict) -> None:
    """Troca os pedaços e as letras da OpenFreeMap pelos do nosso site."""
    estilo["sources"]["openmaptiles"] = {
        "type": "vector",
        "tiles": [PEDACOS],
        "minzoom": 0,
        "maxzoom": 14,
        "bounds": limites_do_mapa(),
        "attribution": CREDITO,
    }
    estilo["glyphs"] = LETRAS
    for camada in estilo["layers"]:
        layout = camada.get("layout", {})
        if "text-font" in layout:
            layout["text-font"] = LETRA
        if "text-field" in layout:
            layout["text-field"] = nome_em_letras_latinas(layout["text-field"])

# As estações de metrô e de trem (CPTM), de perto (zoom 13 em diante): uma bolinha escura com "M"
# (metrô) ou "T" (trem) e o nome embaixo. Vêm do próprio mapa da OpenFreeMap (camada "poi"), sem
# nada a mais para baixar. Ficam por último, para o nome ganhar dos nomes das ruas quando não cabe
# tudo.
_ESTACAO = {
    "source": "openmaptiles",
    "source-layer": "poi",
    "minzoom": 13,
    "filter": ["all", ["==", ["get", "class"], "railway"], ["match", ["get", "subclass"], ["subway", "station"], True, False]],
}
ESTACOES = [
    {
        **_ESTACAO,
        "id": "estacoes-ponto",
        "type": "circle",
        "paint": {"circle-radius": 8, "circle-color": COR["texto"], "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.5},
    },
    {
        **_ESTACAO,
        "id": "estacoes-letra",
        "type": "symbol",
        "layout": {
            "text-field": ["match", ["get", "subclass"], "subway", "M", "T"],
            "text-font": LETRA,
            "text-size": 11,
            "text-allow-overlap": True,
            "text-ignore-placement": True,
        },
        "paint": {"text-color": "#ffffff"},
    },
    {
        **_ESTACAO,
        "id": "estacoes-nome",
        "type": "symbol",
        "layout": {
            "text-field": ["coalesce", ["get", "name"], ""],
            "text-font": LETRA,
            "text-size": 12,
            "text-anchor": "top",
            "text-offset": [0, 0.9],
            "text-max-width": 8,
        },
        "paint": {"text-color": COR["texto"], "text-halo-color": COR["halo"], "text-halo-width": 1.5},
    },
]


def main() -> None:
    # O OpenFreeMap recusa pedidos sem um nome de aplicativo (User-Agent).
    pedido = urllib.request.Request(ORIGEM, headers={"User-Agent": "CarnaVou-dev (projeto pessoal)"})
    with urllib.request.urlopen(pedido, timeout=30) as resposta:
        estilo = json.load(resposta)

    camadas = []
    for camada in estilo["layers"]:
        if camada["id"] in TIRAR:
            continue
        for propriedade, nome_da_cor in PINTURA.get(camada["id"], {}).items():
            camada.setdefault("paint", {})[propriedade] = COR[nome_da_cor]
        # Sem o sprite, nenhum ícone (só as bolinhas ao lado dos nomes das cidades usavam); e a
        # letra é sempre a normal.
        layout = camada.get("layout", {})
        for propriedade in [p for p in layout if p.startswith("icon-")]:
            del layout[propriedade]
        if "text-font" in layout:
            layout["text-font"] = LETRA
        camadas.append(camada)

    camadas.extend(ESTACOES)

    estilo["layers"] = camadas
    estilo["name"] = "CarnaVou"
    # Só os mapas de relevo antigos usavam esta fonte de imagem; nenhuma camada daqui a usa.
    estilo["sources"].pop("ne2_shaded", None)
    estilo.pop("sprite", None)
    usar_o_nosso_mapa(estilo)

    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    with open(DESTINO, "w", encoding="utf-8") as arquivo:
        json.dump(estilo, arquivo, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(camadas)} camadas gravadas em {DESTINO}")


if __name__ == "__main__":
    main()
