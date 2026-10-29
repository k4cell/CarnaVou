"""Gera os trajetos dos circuitos de megablocos do carnaval de 2026 de São Paulo.

Para cada circuito que a CET publicou com começo e fim, o script:

1. acha os pontos no OpenStreetMap (um lugar pelo nome no Nominatim, ou o cruzamento de duas
   ruas no Overpass);
2. traça o caminho pelas ruas entre esses pontos (OSRM, no servidor da FOSSGIS);
3. simplifica a linha e grava tudo em app/src/app/dados/circuitos.ts.

Como usar, a partir da raiz do projeto:

    python design/mapa/gerar-circuitos.py

Os trajetos e as fontes estão na lista CIRCUITOS, logo abaixo. Não invente trajeto: só entra o
que uma fonte diz, com começo e fim. Os dados de rua são do OpenStreetMap (o crédito já aparece
no mapa).
"""

import json
import math
import os
import time
import urllib.parse
import urllib.request

DESTINO = os.path.join("app", "src", "app", "dados", "circuitos.ts")
QUEM_PEDE = {"User-Agent": "CarnaVou/0.8 (gerador de trajetos; uso pontual)"}

NOMINATIM = "https://nominatim.openstreetmap.org/search"
OSRM = "https://routing.openstreetmap.de/routed-{perfil}/route/v1/driving/{pontos}"

# Cada ponto é ("lugar", nome), ("endereco", "Rua, número") ou ("cruzamento", rua, outra rua).
CIRCUITOS = [
    {
        "localId": "ibirapuera",
        "descricao": "Av. Pedro Álvares Cabral, do Obelisco ao Monumento às Bandeiras",
        "fonte": "CET (14/02/2026) e DCI (22/02/2026)",
        "pontos": [
            ("lugar", "Obelisco Mausoléu aos Heróis de 32"),
            ("lugar", "Monumento às Bandeiras"),
        ],
    },
    {
        "localId": "consolacao",
        "descricao": "Rua da Consolação, da Av. Paulista até a Praça Roosevelt",
        "fonte": "CET, citada pelo InfoMoney (08/02/2026)",
        # Termina na Amaral Gurgel, na beira da Praça Roosevelt (ela está nos bloqueios da CET).
        "pontos": [
            ("cruzamento", "Rua da Consolação", "Avenida Paulista"),
            ("cruzamento", "Rua da Consolação", "Rua Amaral Gurgel"),
        ],
    },
    {
        "localId": "faria-lima",
        "descricao": "Av. Brigadeiro Faria Lima, do número 4100 ao 4500",
        "fonte": "CET (14/02/2026)",
        "pontos": [
            ("endereco", "Avenida Brigadeiro Faria Lima, 4100"),
            ("endereco", "Avenida Brigadeiro Faria Lima, 4500"),
        ],
    },
    {
        "localId": "ipiranga-sao-joao",
        "descricao": "Av. Ipiranga, Av. São Luís e Rua Xavier de Toledo, até o Theatro Municipal",
        "fonte": "CET (14/02/2026), trajeto do Tarado Ni Você",
        "pontos": [
            ("cruzamento", "Avenida Ipiranga", "Avenida São João"),
            ("cruzamento", "Avenida Ipiranga", "Avenida São Luís"),
            ("lugar", "Praça Dom José Gaspar"),
            ("lugar", "Theatro Municipal de São Paulo"),
        ],
    },
    {
        "localId": "paulo-vi",
        "descricao": "Av. Paulo VI, da Praça Márcia Aliberti Mammana até a Av. Sumaré",
        "fonte": "CET (14/02/2026)",
        "pontos": [
            ("lugar", "Praça Márcia Aliberti Mammana"),
            # A CET diz "até a Av. Sumaré, nº 1529"; o número não está no mapa, então vale o cruzamento.
            ("cruzamento", "Avenida Paulo VI", "Avenida Sumaré"),
        ],
    },
    {
        "localId": "henrique-schaumann",
        "descricao": "Av. Henrique Schaumann, entre a Av. Rebouças e a Rua Teodoro Sampaio",
        "fonte": "CET, citada pelo InfoMoney (08/02/2026)",
        # No OpenStreetMap ela se chama "Rua Henrique Schaumann".
        "pontos": [
            ("cruzamento", "Rua Henrique Schaumann", "Avenida Rebouças"),
            ("cruzamento", "Rua Henrique Schaumann", "Rua Teodoro Sampaio"),
        ],
    },
]


def pedir_json(endereco, dados=None):
    corpo = urllib.parse.urlencode(dados).encode() if dados else None
    pedido = urllib.request.Request(endereco, data=corpo, headers=QUEM_PEDE)
    with urllib.request.urlopen(pedido, timeout=60) as resposta:
        return json.load(resposta)


CIDADE = "-46.83,-23.45,-46.36,-23.75"


def buscar(texto, caixa=CIDADE, **extras):
    parametros = urllib.parse.urlencode(
        {
            "q": f"{texto}, São Paulo",
            "format": "json",
            "countrycodes": "br",
            "viewbox": caixa,
            "bounded": 1,
            **extras,
        }
    )
    resultado = pedir_json(f"{NOMINATIM}?{parametros}")
    time.sleep(1.1)  # o Nominatim pede no máximo um pedido por segundo
    return resultado


def achar_lugar(nome):
    resultado = buscar(nome, limit=1)
    assert resultado, f"Não achei: {nome}"
    return float(resultado[0]["lon"]), float(resultado[0]["lat"])


def achar_endereco(endereco):
    """Um endereço com número. Se o mapa não tiver o número, para: o Nominatim cairia no meio da rua."""
    resultado = buscar(endereco, limit=1, addressdetails=1)
    assert resultado and resultado[0].get("address", {}).get("house_number"), f"Sem o número no mapa: {endereco}"
    return float(resultado[0]["lon"]), float(resultado[0]["lat"])


def pontos_da_rua(nome, caixa=CIDADE):
    """Todos os pontos dos trechos de uma rua, com a geometria que o Nominatim devolve."""
    resultado = buscar(nome, caixa, limit=40, dedupe=0, polygon_geojson=1)
    pontos = []
    for item in resultado:
        if item.get("class") != "highway":
            continue
        forma = item["geojson"]
        if forma["type"] == "LineString":
            pontos += forma["coordinates"]
        elif forma["type"] == "MultiLineString":
            for trecho in forma["coordinates"]:
                pontos += trecho
    assert pontos, f"Não achei a rua: {nome}"
    return pontos


def metros_entre(a, b):
    """Distância aproximada em metros (boa o bastante para pontos perto um do outro)."""
    dx = (a[0] - b[0]) * 111_320 * math.cos(math.radians(a[1]))
    dy = (a[1] - b[1]) * 111_320
    return math.hypot(dx, dy)


def achar_cruzamento(rua, outra):
    """O cruzamento é o par de pontos mais próximo entre as duas ruas (tem que dar menos de 40 m)."""
    a = pontos_da_rua(rua)
    # A outra rua pode ser longa: procura só os trechos perto da primeira.
    folga = 0.004
    caixa = ",".join(
        str(valor)
        for valor in (
            min(p[0] for p in a) - folga,
            max(p[1] for p in a) + folga,
            max(p[0] for p in a) + folga,
            min(p[1] for p in a) - folga,
        )
    )
    b = pontos_da_rua(outra, caixa)
    pa, pb = min(((p, q) for p in a for q in b), key=lambda par: metros_entre(*par))
    distancia = metros_entre(pa, pb)
    assert distancia < 40, f"{rua} e {outra} não se cruzam (ficaram a {distancia:.0f} m)"
    return (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2


def achar(ponto):
    tipo = ponto[0]
    if tipo == "lugar":
        return achar_lugar(ponto[1])
    if tipo == "endereco":
        return achar_endereco(ponto[1])
    return achar_cruzamento(ponto[1], ponto[2])


def tracar(perfil, pontos):
    caminho = ";".join(f"{lng:.6f},{lat:.6f}" for lng, lat in pontos)
    endereco = OSRM.format(perfil=perfil, pontos=caminho) + "?overview=full&geometries=geojson"
    resultado = pedir_json(endereco)
    time.sleep(1.1)
    assert resultado.get("code") == "Ok", resultado
    rota = resultado["routes"][0]
    return rota["geometry"]["coordinates"], rota["distance"]


def tracar_o_mais_curto(pontos):
    """
    O bloco anda a pé e ocupa a rua inteira, então a mão de direção não importa. O roteador não
    sabe disso: de carro ele respeita a mão única e, a pé, às vezes desvia. Por isso testa carro e
    a pé, nos dois sentidos, e fica com o mais curto (a linha sempre começa no primeiro ponto).
    """
    melhor = None
    for perfil in ("car", "foot"):
        for ao_contrario in (False, True):
            ordem = list(reversed(pontos)) if ao_contrario else pontos
            linha, metros = tracar(perfil, ordem)
            if melhor is None or metros < melhor[1]:
                melhor = (list(reversed(linha)) if ao_contrario else linha, metros)
    return melhor


def distancia_ao_segmento(p, a, b):
    """Distância (em graus, só para comparar) do ponto p ao segmento a-b."""
    (x, y), (x1, y1), (x2, y2) = p, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x - x1, y - y1)
    t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))


def simplificar(linha, tolerancia=0.00003):
    """Douglas-Peucker: tira os pontos que quase não mudam o desenho (tolerância de uns 3 m)."""
    if len(linha) < 3:
        return linha
    maior, indice = 0, 0
    for i in range(1, len(linha) - 1):
        d = distancia_ao_segmento(linha[i], linha[0], linha[-1])
        if d > maior:
            maior, indice = d, i
    if maior <= tolerancia:
        return [linha[0], linha[-1]]
    return simplificar(linha[: indice + 1], tolerancia)[:-1] + simplificar(linha[indice:], tolerancia)


def escrever(circuitos):
    linhas = [
        "import { Circuito } from './tipos';",
        "",
        "/**",
        " * Os circuitos dos megablocos de 2026: por onde os grandes blocos de cada lugar desfilaram,",
        " * segundo a CET. Só entram os que têm começo e fim nas fontes (os outros lugares ficam sem",
        " * linha). As linhas seguem as ruas do OpenStreetMap.",
        " *",
        " * Gerado por design/mapa/gerar-circuitos.py: não edite à mão, mude o script e rode de novo.",
        " */",
        "export const CIRCUITOS: Circuito[] = [",
    ]
    for circuito in circuitos:
        pontos = ", ".join(f"[{lng:.5f}, {lat:.5f}]" for lng, lat in circuito["trajeto"])
        linhas += [
            "  {",
            f"    localId: '{circuito['localId']}',",
            f"    descricao: '{circuito['descricao']}',",
            f"    fonte: '{circuito['fonte']}',",
            f"    trajeto: [{pontos}],",
            "  },",
        ]
    linhas += ["];", ""]
    with open(DESTINO, "w", encoding="utf-8", newline="\n") as arquivo:
        arquivo.write("\n".join(linhas))


def main():
    prontos = []
    for circuito in CIRCUITOS:
        pontos = [achar(ponto) for ponto in circuito["pontos"]]
        linha, metros = tracar_o_mais_curto(pontos)
        linha = simplificar([(lng, lat) for lng, lat in linha])
        retas = sum(metros_entre(a, b) for a, b in zip(pontos, pontos[1:]))
        print(f"{circuito['localId']}: {metros:.0f} m pelas ruas, {retas:.0f} m em retas, {len(linha)} pontos")
        # Um caminho muito maior que as retas é sinal de volta errada (mão única, por exemplo).
        assert metros <= 1.5 * retas, f"{circuito['localId']}: o caminho dá volta demais"
        prontos.append({**circuito, "trajeto": linha})
    escrever(prontos)
    print(f"{len(prontos)} circuitos gravados em {DESTINO}")


if __name__ == "__main__":
    main()
