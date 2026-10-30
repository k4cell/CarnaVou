"""Gera o estilo do mapa do CarnaVou a partir do estilo "positron" do OpenFreeMap.

Pinta o mapa de lilás (as cores da marca), tira o que uma cidade não precisa (fronteiras,
países, aeroportos, geleiras), põe as estações de metrô e de trem e grava o resultado em
app/public/mapa/estilo-carnavou.json.

Para pesar menos (decisão de 30/10/2026), o mapa não usa o sprite (a imagem com os ícones, uns
120 kB) e usa uma letra só, a normal: a itálica (uns 46 kB) e o negrito não são baixados.

Como usar, a partir da raiz do projeto:

    python design/mapa/gerar-estilo-do-mapa.py

As cores estão no dicionário COR, logo abaixo. Para mudar o visual do mapa, mude lá e rode de
novo. O OpenFreeMap pede que o crédito do mapa apareça na tela (o MapLibre já faz isso).
"""

import json
import os
import urllib.request

ORIGEM = "https://tiles.openfreemap.org/styles/positron"
DESTINO = os.path.join("app", "public", "mapa", "estilo-carnavou.json")

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
LETRA = ["Noto Sans Regular"]

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

    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    with open(DESTINO, "w", encoding="utf-8") as arquivo:
        json.dump(estilo, arquivo, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(camadas)} camadas gravadas em {DESTINO}")


if __name__ == "__main__":
    main()
