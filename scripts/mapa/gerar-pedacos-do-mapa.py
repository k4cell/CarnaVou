"""Gera a nossa cópia do mapa da Grande São Paulo: os pedaços e as letras que o app usa.

O mapa não depende de servidor de fora: os pedaços (app/public/mapa/pedacos/{z}/{x}/{y}.pbf, do zoom
0 ao 14; mais perto, o MapLibre amplia os do 14) e as letras (app/public/mapa/letras) vão junto com o
site. O estilo (as cores) vem de scripts/mapa/gerar-estilo-do-mapa.py.

Os pedaços saem dos dados do OpenStreetMap, no formato do OpenMapTiles, pelo Planetiler
(https://github.com/onthegomap/planetiler), que precisa do Java 25 (Eclipse Temurin:
`winget install EclipseAdoptium.Temurin.25.JDK`). O script baixa para fora do OneDrive
(~/.cache/carnavou/mapa) o Planetiler e a matéria-prima, uns 2,1 GB: o Sudeste do OpenStreetMap
(Geofabrik), o contorno do mar, o Natural Earth e as linhas dos lagos. No fim, apaga tudo isso
(para guardar, use --guardar). Rode de novo todo ano, antes do carnaval, para o mapa ficar em dia.

Para pesar menos, os pedaços só têm os nomes em português e ficam sem as camadas que o estilo não
usa (aeroportos, fronteiras, números das casas e montanhas) e sem os prédios, que eram quase 40% do
mapa. Se o estilo passar a usar uma delas, tire-a de SEM_AS_CAMADAS e gere de novo.

As letras são a Noto Sans (licença SIL Open Font License, que vai junto, em OFL.txt), só as faixas
das letras latinas, no formato que o MapLibre usa, do projeto Protomaps.

Como usar, a partir da raiz do projeto:

    python -I scripts/mapa/gerar-pedacos-do-mapa.py

Depois de gerar de novo, suba o "version" do grupo mapa-pedacos em app/ngsw-config.json, para os
celulares trocarem os pedaços que já guardaram.
"""

import glob
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

PASTA = os.path.join(os.path.expanduser("~"), ".cache", "carnavou", "mapa")
FONTES = os.path.join(PASTA, "data", "sources")
PEDACOS = os.path.join("app", "public", "mapa", "pedacos")
LETRAS = os.path.join("app", "public", "mapa", "letras", "noto-sans")
LIMITES_DO_APP = os.path.join("app", "src", "app", "mapa", "limites.ts")
QUEM_PEDE = {"User-Agent": "CarnaVou (https://github.com/k4cell/CarnaVou)"}

PLANETILER = "https://github.com/onthegomap/planetiler/releases/download/v0.10.2/planetiler.jar"
MATERIA_PRIMA = {
    "sudeste-latest.osm.pbf": "https://download.geofabrik.de/south-america/brazil/sudeste-latest.osm.pbf",
    "lake_centerline.shp.zip": "https://github.com/acalcutt/osm-lakelines/releases/download/v12/lake_centerline.shp.zip",
    "natural_earth_vector.sqlite.zip": "https://naciscdn.org/naturalearth/packages/natural_earth_vector.sqlite.zip",
}
MAR = "https://osmdata.openstreetmap.de/download/water-polygons-split-3857.zip"
# Se o servidor do contorno do mar estiver fora do ar: o arquivo de exemplo do Planetiler, que não tem
# o mar de SP. Só o estuário de Santos, na beira de baixo do mapa, fica parecendo terra.
MAR_RESERVA = "https://github.com/onthegomap/planetiler/raw/v0.10.2/planetiler-core/src/test/resources/water-polygons-split-3857.zip"

SEM_AS_CAMADAS = "aerodrome_label,aeroway,boundary,building,housenumber,mountain_peak"

ORIGEM_DAS_LETRAS = "https://raw.githubusercontent.com/protomaps/basemaps-assets/main/fonts/Noto%20Sans%20Regular"
FAIXAS_DAS_LETRAS = ["0-255", "256-511", "512-767", "768-1023", "7680-7935", "8192-8447", "8448-8703"]
LICENCA_DAS_LETRAS = "https://raw.githubusercontent.com/notofonts/latin-greek-cyrillic/main/OFL.txt"


def baixar(endereco: str, destino: str) -> None:
    print(f"Baixando {os.path.basename(destino)}…")
    pedido = urllib.request.Request(endereco, headers=QUEM_PEDE)
    with urllib.request.urlopen(pedido, timeout=60) as resposta, open(destino + ".parcial", "wb") as arquivo:
        shutil.copyfileobj(resposta, arquivo, 1024 * 1024)
    os.replace(destino + ".parcial", destino)


def achar_o_java() -> str:
    candidatos = [shutil.which("java")]
    if os.environ.get("JAVA_HOME"):
        candidatos.append(os.path.join(os.environ["JAVA_HOME"], "bin", "java.exe"))
    candidatos += sorted(glob.glob(r"C:\Program Files\Eclipse Adoptium\jdk-2*\bin\java.exe"), reverse=True)
    for java in candidatos:
        if java and os.path.exists(java):
            return java
    raise SystemExit("Não achei o Java. Instale com: winget install EclipseAdoptium.Temurin.25.JDK")


def limites_do_mapa() -> str:
    """O retângulo da Grande SP, "oeste,sul,leste,norte", o mesmo do app (limites.ts)."""
    with open(LIMITES_DO_APP, encoding="utf-8") as arquivo:
        achado = re.search(r"\[\s*\[(-?[\d.]+),\s*(-?[\d.]+)\],\s*\[(-?[\d.]+),\s*(-?[\d.]+)\]", arquivo.read())
    if not achado:
        raise SystemExit(f"Não achei o retângulo do mapa em {LIMITES_DO_APP}.")
    return ",".join(achado.groups())


def preparar_a_materia_prima() -> None:
    os.makedirs(FONTES, exist_ok=True)
    if not os.path.exists(os.path.join(PASTA, "planetiler.jar")):
        baixar(PLANETILER, os.path.join(PASTA, "planetiler.jar"))
    for nome, endereco in MATERIA_PRIMA.items():
        if not os.path.exists(os.path.join(FONTES, nome)):
            baixar(endereco, os.path.join(FONTES, nome))
    mar = os.path.join(FONTES, "water-polygons-split-3857.zip")
    if not os.path.exists(mar):
        try:
            baixar(MAR, mar)
        except (urllib.error.URLError, TimeoutError) as erro:
            print(f"AVISO: o contorno do mar não veio ({erro}). O estuário de Santos vai parecer terra.")
            baixar(MAR_RESERVA, mar)


def gerar_os_pedacos() -> None:
    saida = os.path.join(PASTA, "pedacos")
    shutil.rmtree(saida, ignore_errors=True)
    subprocess.run(
        [
            achar_o_java(),
            "-jar",
            "planetiler.jar",
            "--osm-path=data/sources/sudeste-latest.osm.pbf",
            f"--bounds={limites_do_mapa()}",
            "--output=pedacos?format=files",
            # Sem compactar: o MapLibre lê o pedaço como ele chega.
            "--tile_compression=none",
            "--languages=pt",
            f"--exclude_layers={SEM_AS_CAMADAS}",
            "--force",
        ],
        cwd=PASTA,
        check=True,
    )
    shutil.rmtree(PEDACOS, ignore_errors=True)
    shutil.copytree(saida, PEDACOS, ignore=shutil.ignore_patterns("*.json"))


def baixar_as_letras() -> None:
    shutil.rmtree(LETRAS, ignore_errors=True)
    os.makedirs(LETRAS)
    for faixa in FAIXAS_DAS_LETRAS:
        baixar(f"{ORIGEM_DAS_LETRAS}/{faixa}.pbf", os.path.join(LETRAS, f"{faixa}.pbf"))
    baixar(LICENCA_DAS_LETRAS, os.path.join(LETRAS, "OFL.txt"))


def tamanho(pasta: str) -> str:
    arquivos = [os.path.join(raiz, nome) for raiz, _, nomes in os.walk(pasta) for nome in nomes]
    return f"{len(arquivos)} arquivos, {sum(map(os.path.getsize, arquivos)) / 1024 / 1024:.1f} MB"


def main() -> None:
    preparar_a_materia_prima()
    gerar_os_pedacos()
    baixar_as_letras()
    print(f"Pedaços: {tamanho(PEDACOS)}. Letras: {tamanho(LETRAS)}.")
    if "--guardar" not in sys.argv:
        shutil.rmtree(PASTA)
        print(f"Apaguei a matéria-prima ({PASTA}).")


if __name__ == "__main__":
    main()
