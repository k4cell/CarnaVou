"""Acha o ponto de concentração e a linha de cada bloco, a partir do itinerário oficial.

Uso: python -I tracar.py blocos.json pasta_das_ruas enderecos.json saida.json

Para cada itinerário:
- "R. A, 2101 ao 585": a linha vai do número 2101 ao 585 da rua A (os números vêm do
  OpenStreetMap, pelo Nominatim, e ficam guardados em enderecos.json).
- "R. A, entre R. B e R. C" (ou entre dois lugares): a linha segue a rua A do cruzamento com B
  até o cruzamento com C (ou até o ponto da rua A mais perto de cada lugar).
- "R. A, R. B, R. C, R. D": a linha vai do cruzamento A x B ao cruzamento C x D, seguindo cada
  rua. O trecho da primeira e da última rua não tem ponta conhecida, então fica de fora. Se a
  última rua é a primeira (uma volta), a linha fecha a volta.
- Um lugar só (uma praça, uma rua): só o ponto, sem linha.
O ponto de concentração é o começo da linha (ou o ponto do lugar). Quando não dá para ter
certeza, o bloco fica sem ponto, e o motivo vai para o relatório.
"""

import heapq
import json
import math
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from difflib import SequenceMatcher

NOMINATIM = "https://nominatim.openstreetmap.org/search"
OSRM = "https://routing.openstreetmap.de/routed-{perfil}/route/v1/driving/{pontos}"
QUEM_PEDE = {"User-Agent": "CarnaVou/0.11 (pesquisa de dados abertos)"}

TIPOS = {
    "r": "rua", "rua": "rua", "av": "avenida", "avenida": "avenida", "al": "alameda",
    "alameda": "alameda", "pca": "praca", "praca": "praca", "pc": "praca", "lgo": "largo",
    "largo": "largo", "lg": "largo", "tv": "travessa", "travessa": "travessa", "trav": "travessa",
    "est": "estrada", "estr": "estrada", "estrada": "estrada", "vd": "viaduto", "vdto": "viaduto",
    "viaduto": "viaduto", "pq": "parque", "parque": "parque", "ponte": "ponte", "viela": "viela",
    "passagem": "passagem", "rod": "rodovia", "rodovia": "rodovia", "ladeira": "ladeira",
    "escadaria": "escadaria", "complexo": "complexo", "boulevard": "boulevard", "via": "via",
}
TITULOS = {
    "cel": "coronel", "dr": "doutor", "dra": "doutora", "eng": "engenheiro", "prof": "professor",
    "profa": "professora", "gal": "general", "gen": "general", "sgt": "sargento", "ten": "tenente",
    "cap": "capitao", "pe": "padre", "mal": "marechal", "brig": "brigadeiro",
    "des": "desembargador", "min": "ministro", "pres": "presidente", "dep": "deputado",
    "sen": "senador", "comend": "comendador", "cons": "conselheiro", "maj": "major",
    "alm": "almirante", "jd": "jardim", "sto": "santo", "sta": "santa", "vl": "vila",
    "n": "nossa", "s": "senhora", "dom": "dom", "frei": "frei", "monsenhor": "monsenhor",
    "cde": "conde", "bar": "barao", "visc": "visconde", "duq": "duque", "arq": "arquiteto",
    "ver": "vereador", "gov": "governador", "emb": "embaixador", "bsa": "baronesa", "br": "barao",
}
SO_TITULOS = set(TITULOS.values()) | {"doutor", "coronel", "professor", "general", "engenheiro"}
PALAVRAS_SOLTAS = {"de", "da", "do", "dos", "das", "e", "a", "o", "as", "os", "d"}
# Um nome de rua começa com um destes (abreviados ou não): serve para separar uma rua da outra.
COMECO_DE_RUA = r"(?:R\.|Rua|Av\.|Av|Avenida|Al\.|Alameda|Pça\.?|Praça|Lgo\.?|Largo|Tv\.|Travessa|Estr?\.|Estrada|Vd\.?|Viaduto)"


def sem_acento(texto):
    return unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()


def chave(nome):
    """('rua', ('consolacao',)) para "R. da Consolação"."""
    palavras = re.findall(r"[a-z0-9]+", sem_acento(nome.replace("º", "").replace("ª", "")))
    tipo = None
    if palavras and palavras[0] in TIPOS:
        tipo = TIPOS[palavras[0]]
        palavras = palavras[1:]
    resto = []
    for palavra in palavras:
        palavra = TITULOS.get(palavra, palavra)
        if palavra not in PALAVRAS_SOLTAS:
            resto.append(palavra)
    return tipo, tuple(resto)


def metros(a, b):
    """Distância aproximada, em metros, entre dois pontos (lng, lat)."""
    lat = math.radians((a[1] + b[1]) / 2)
    return math.hypot((a[0] - b[0]) * 111320 * math.cos(lat), (a[1] - b[1]) * 110540)


def projetar(p, a, b):
    """O ponto do segmento a-b mais perto de p, e a fração (0 a 1) onde ele fica."""
    lat = math.radians(p[1])
    kx, ky = 111320 * math.cos(lat), 110540
    ax, ay = (a[0] - p[0]) * kx, (a[1] - p[1]) * ky
    bx, by = (b[0] - p[0]) * kx, (b[1] - p[1]) * ky
    dx, dy = bx - ax, by - ay
    comprimento = dx * dx + dy * dy
    t = 0 if comprimento == 0 else max(0, min(1, -(ax * dx + ay * dy) / comprimento))
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), t


# ------------------------------------------------------------------ o mapa de uma subprefeitura


class Mapa:
    def __init__(self, arquivo):
        dados = json.load(open(arquivo, encoding="utf-8"))
        self.caixa = dados["caixa"]  # sul, oeste, norte, leste
        self.coisas = {}  # chave -> lista de elementos
        self.ruas = {}  # chave -> lista de (ids dos nós, coordenadas)
        for elemento in dados["elements"]:
            nome = elemento.get("tags", {}).get("name")
            if not nome:
                continue
            k = chave(nome)
            if elemento["type"] == "node":
                pontos = [(elemento["lon"], elemento["lat"])]
            else:
                pontos = [(g["lon"], g["lat"]) for g in elemento.get("geometry", []) if g]
            if not pontos:
                continue
            item = {"nome": nome, "pontos": pontos, "rua": "highway" in elemento.get("tags", {}),
                    "nos": elemento.get("nodes")}
            self.coisas.setdefault(k, []).append(item)
            if item["rua"] and item["nos"] and len(item["nos"]) == len(pontos):
                self.ruas.setdefault(k, []).append((item["nos"], pontos))

    def dentro(self, p, folga=0.0):
        sul, oeste, norte, leste = self.caixa
        return sul - folga <= p[1] <= norte + folga and oeste - folga <= p[0] <= leste + folga

    def achar(self, texto, so_ruas=False):
        """As chaves do mapa que combinam com o nome, da melhor para a pior."""
        tipo, palavras = chave(texto)
        if not palavras:
            return []
        resultado = []
        juntas = " ".join(palavras)
        for k, itens in self.coisas.items():
            if so_ruas and not any(i["rua"] for i in itens):
                continue
            outro_tipo, outras = k
            if not outras:
                continue
            if outras == palavras:
                nota = 1.0 if tipo in (None, outro_tipo) else 0.9
            elif set(palavras) <= set(outras) and set(outras) - set(palavras) <= SO_TITULOS:
                nota = 0.88
            elif set(outras) <= set(palavras) and set(palavras) - set(outras) <= SO_TITULOS:
                nota = 0.87
            else:
                razao = SequenceMatcher(None, juntas, " ".join(outras)).ratio()
                if razao < 0.88:
                    # Lugares (Obelisco, Monumento às Bandeiras): todas as palavras dentro do nome.
                    if not so_ruas and len(palavras) >= 1 and set(palavras) <= set(outras) and tipo is None:
                        nota = 0.8
                    else:
                        continue
                else:
                    nota = razao * 0.9
                    if tipo not in (None, outro_tipo):
                        nota -= 0.05
            resultado.append((nota, k))
        resultado.sort(key=lambda par: par[0], reverse=True)
        if not resultado:
            return []
        melhor = resultado[0][0]
        return [k for nota, k in resultado if nota >= melhor - 0.02]

    def pontos_de(self, chaves, so_ruas=False):
        pontos = []
        for k in chaves:
            for item in self.coisas[k]:
                if so_ruas and not item["rua"]:
                    continue
                pontos.append(item["pontos"])
        return pontos


# ------------------------------------------------------------------ geometria


def cruzamentos(mapa, chaves_a, chaves_b, limite=35):
    """Pontos onde a rua A encontra B: nós em comum, ou os pontos mais perto (até `limite` m)."""
    nos_a = {}
    for k in chaves_a:
        for nos, pontos in mapa.ruas.get(k, []):
            nos_a.update(zip(nos, pontos))
    achados = []
    for k in chaves_b:
        for nos, pontos in mapa.ruas.get(k, []):
            for no, p in zip(nos, pontos):
                if no in nos_a:
                    achados.append(p)
    if achados:
        return agrupar(achados)
    # Sem nó em comum (pista dupla, praça, lugar): o par de pontos mais perto.
    linhas_a = mapa.pontos_de(chaves_a)
    linhas_b = mapa.pontos_de(chaves_b)
    for linha_a in linhas_a:
        for linha_b in linhas_b:
            for p in linha_b:
                q, d = mais_perto_na_linha(p, linha_a)
                if d <= limite:
                    achados.append(q)
            for p in linha_a:
                q, d = mais_perto_na_linha(p, linha_b)
                if d <= limite:
                    achados.append(p)
    return agrupar(achados)


def mais_perto_na_linha(p, linha):
    if len(linha) == 1:
        return linha[0], metros(p, linha[0])
    melhor, distancia = None, float("inf")
    for a, b in zip(linha, linha[1:]):
        q, _ = projetar(p, a, b)
        d = metros(p, q)
        if d < distancia:
            melhor, distancia = q, d
    return melhor, distancia


def agrupar(pontos, raio=60):
    """Junta pontos a menos de `raio` m (um cruzamento de pista dupla vira um só)."""
    grupos = []
    for p in pontos:
        for g in grupos:
            if metros(p, g[0]) < raio:
                g.append(p)
                break
        else:
            grupos.append([p])
    return [(sum(x for x, _ in g) / len(g), sum(y for _, y in g) / len(g)) for g in grupos]


def ponto_mais_perto_do_lugar(mapa, chaves_rua, chaves_lugar, limite=400):
    candidatos = []
    for lugar in mapa.pontos_de(chaves_lugar):
        centro = (sum(x for x, _ in lugar) / len(lugar), sum(y for _, y in lugar) / len(lugar))
        melhor, distancia = None, float("inf")
        for linha in mapa.pontos_de(chaves_rua, so_ruas=True):
            q, d = mais_perto_na_linha(centro, linha)
            if d < distancia:
                melhor, distancia = q, d
        if melhor and distancia <= limite:
            candidatos.append(melhor)
    return agrupar(candidatos)


def caminho_pela_rua(mapa, chaves, p, q):
    """A linha de p até q seguindo só a rua (as vias com esse nome). None se não der."""
    vizinhos = {}
    coord = {}
    segmentos = []
    for k in chaves:
        for nos, pontos in mapa.ruas.get(k, []):
            for (n1, c1), (n2, c2) in zip(zip(nos, pontos), zip(nos[1:], pontos[1:])):
                coord[n1], coord[n2] = c1, c2
                d = metros(c1, c2)
                vizinhos.setdefault(n1, []).append((n2, d))
                vizinhos.setdefault(n2, []).append((n1, d))
                segmentos.append((n1, n2))
    if not segmentos:
        return None

    def encaixar(ponto, nome):
        melhor = None
        for n1, n2 in segmentos:
            r, t = projetar(ponto, coord[n1], coord[n2])
            d = metros(ponto, r)
            if melhor is None or d < melhor[0]:
                melhor = (d, n1, n2, r)
        d, n1, n2, r = melhor
        if d > 60:
            return None
        coord[nome] = r
        vizinhos[nome] = [(n1, metros(r, coord[n1])), (n2, metros(r, coord[n2]))]
        vizinhos[n1].append((nome, metros(r, coord[n1])))
        vizinhos[n2].append((nome, metros(r, coord[n2])))
        return nome

    # Os nós do OpenStreetMap têm números positivos; o começo e o fim ganham -1 e -2.
    inicio, fim = encaixar(p, -1), encaixar(q, -2)
    if inicio is None or fim is None:
        return None
    distancias, anterior = {inicio: 0}, {}
    fila = [(0, inicio)]
    while fila:
        d, no = heapq.heappop(fila)
        if no == fim:
            break
        if d > distancias.get(no, float("inf")):
            continue
        for outro, peso in vizinhos.get(no, []):
            nova = d + peso
            if nova < distancias.get(outro, float("inf")):
                distancias[outro] = nova
                anterior[outro] = no
                heapq.heappush(fila, (nova, outro))
    if fim not in distancias:
        return None
    linha, no = [], fim
    while no != inicio:
        linha.append(coord[no])
        no = anterior[no]
    linha.append(coord[inicio])
    return list(reversed(linha))


def simplificar(linha, tolerancia=3):
    """Douglas-Peucker: tira pontos que não mudam o desenho (até `tolerancia` m)."""
    if len(linha) < 3:
        return linha
    a, b = linha[0], linha[-1]
    pior, indice = 0, 0
    for i in range(1, len(linha) - 1):
        q, _ = projetar(linha[i], a, b)
        d = metros(linha[i], q)
        if d > pior:
            pior, indice = d, i
    if pior <= tolerancia:
        return [a, b]
    return simplificar(linha[: indice + 1], tolerancia)[:-1] + simplificar(linha[indice:], tolerancia)


def comprimento(linha):
    return sum(metros(a, b) for a, b in zip(linha, linha[1:]))


# ------------------------------------------------------------------ endereços (Nominatim)


class Enderecos:
    def __init__(self, arquivo):
        self.arquivo = arquivo
        self.guardados = json.load(open(arquivo, encoding="utf-8")) if os.path.exists(arquivo) else {}

    def achar(self, rua, numero):
        pergunta = f"{numero} {rua}"
        if pergunta not in self.guardados:
            parametros = urllib.parse.urlencode(
                {"street": pergunta, "city": "São Paulo", "state": "São Paulo", "country": "Brasil",
                 "format": "jsonv2", "addressdetails": 1, "limit": 3}
            )
            time.sleep(1.1)  # regra do Nominatim: no máximo um pedido por segundo
            with urllib.request.urlopen(urllib.request.Request(f"{NOMINATIM}?{parametros}", headers=QUEM_PEDE), timeout=60) as r:
                self.guardados[pergunta] = json.load(r)
            json.dump(self.guardados, open(self.arquivo, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
        for resultado in self.guardados[pergunta]:
            if resultado.get("address", {}).get("house_number") == str(int(numero)):
                return (float(resultado["lon"]), float(resultado["lat"]))
        return None


# ------------------------------------------------------------------ itinerários


def limpar(texto):
    texto = re.sub(r"\b(R|Av|Al|Pça|Lgo|Tv)\.(?=\S)", r"\1. ", texto)
    texto = re.sub(r"\((?:ida e volta|trecho[^)]*|[^)]*feira[^)]*)\)", "", texto, flags=re.I)
    texto = re.sub(r"\(\s*(entre [^)]*)\)", r", \1", texto, flags=re.I)
    texto = re.sub(r"\([^)]*\)", "", texto)
    # "Ibirapuera - Av. Pedro Álvares Cabral": o que vem antes do traço é só o bairro.
    texto = re.sub(r"^[^,]*?\s-\s(?=" + COMECO_DE_RUA + r")", "", texto)
    return re.sub(r"\s+", " ", texto).strip(" .,;")


def separar(texto):
    """Os itens de uma lista de ruas, na ordem."""
    partes = re.split(r"\s*(?:,|;|\s-\s|\sx\s|\saté\s|\.\s(?=" + COMECO_DE_RUA + r")|\se\s(?=" + COMECO_DE_RUA + r")|\s(?=" + COMECO_DE_RUA + r"\s))\s*", texto)
    itens = []
    for parte in partes:
        parte = parte.strip(" .")
        if not parte or re.fullmatch(r"[\d\s]+", parte):
            continue
        itens.append(re.sub(r"\s*\d+$", "", parte))
    return itens


class Falhou(Exception):
    pass


def tracar(itinerario, mapa, enderecos):
    texto = limpar(itinerario)

    numeros = re.fullmatch(r"(.+?),?\s*(?:n[º°]?\s*)?(\d+)\s*(?:a|ao|à|até|-)\s*(\d+)", texto, flags=re.I)
    if numeros:
        rua, de, ate = numeros.groups()
        chaves = mapa.achar(rua, so_ruas=True)
        if not chaves:
            raise Falhou(f"não achei a rua {rua!r}")
        nome = mapa.coisas[chaves[0]][0]["nome"]
        p, q = enderecos.achar(nome, de), enderecos.achar(nome, ate)
        linha = caminho_pela_rua(mapa, chaves, p, q) if p and q else None
        if not linha:
            # O mapa não tem esses números: fica só o ponto, no meio da rua.
            return [meio_do_lugar(mapa, chaves)], "na rua"
        return linha, "numeros"

    entre = re.fullmatch(r"(.+?),?\s+entre\s+(.+?)\s+e\s+(.+)", texto, flags=re.I)
    if entre:
        rua, a, b = entre.groups()
        chaves = mapa.achar(rua, so_ruas=True)
        if not chaves:
            raise Falhou(f"não achei a rua {rua!r}")
        pontas = []
        for lado in (a, b):
            lado = re.sub(r",?\s*\d+\s*$", "", lado)
            outras = mapa.achar(lado)
            if not outras:
                raise Falhou(f"não achei {lado!r}")
            achados = cruzamentos(mapa, chaves, outras) or ponto_mais_perto_do_lugar(mapa, chaves, outras)
            if not achados:
                raise Falhou(f"{rua} não cruza {lado}")
            pontas.append(achados)
        p, q = melhor_par(pontas[0], pontas[1])
        # Avenida de pista dupla às vezes não fecha no mapa: aí vale o caminho a pé entre as pontas.
        linha = caminho_pela_rua(mapa, chaves, p, q) or a_pe(p, q)
        return linha, "entre"

    itens = separar(texto)
    if not itens:
        raise Falhou("itinerário vazio")
    chaves, faltaram = [], []
    for item in itens:
        achadas = [k for k in mapa.achar(item) if any(mapa.dentro(p, 0.005) for l in mapa.pontos_de([k]) for p in l)]
        if achadas:
            chaves.append(achadas)
        else:
            faltaram.append(item)
    if not chaves or len(faltaram) > len(itens) / 3:
        raise Falhou(f"não achei {', '.join(map(repr, faltaram))}")
    # Tira repetições seguidas ("R. A, R. A").
    sequencia = [c for i, c in enumerate(chaves) if i == 0 or c != chaves[i - 1]]
    aproximado = bool(faltaram)
    if len(sequencia) == 1:
        return [meio_do_lugar(mapa, sequencia[0])], "lugar"
    volta = len(sequencia) > 2 and sequencia[-1] == sequencia[0]
    # Onde cada rua encontra a seguinte. Se não se cruzam no mapa (o itinerário pulou uma rua
    # pequena), vale o ponto da primeira mais perto da segunda, até 600 m.
    opcoes = []
    for a, b in zip(sequencia, sequencia[1:]):
        achados = [p for p in cruzamentos(mapa, a, b) if mapa.dentro(p, 0.005)]
        if not achados:
            achados = [p for p in pontos_mais_perto(mapa, a, b, 600) if mapa.dentro(p, 0.005)]
            aproximado = True
        if not achados:
            raise Falhou(f"{mapa.coisas[a[0]][0]['nome']} fica longe de {mapa.coisas[b[0]][0]['nome']}")
        opcoes.append(achados)
    pontos = escolher_sequencia(opcoes)
    if len(pontos) == 1:
        return pontos, "cruzamento"
    linha = [pontos[0]]
    ruas_do_meio = sequencia[1:-1] + ([sequencia[0]] if volta else [])
    pares = list(zip(pontos, pontos[1:])) + ([(pontos[-1], pontos[0])] if volta else [])
    for (p, q), rua in zip(pares, ruas_do_meio):
        trecho = caminho_pela_rua(mapa, rua, p, q)
        if not trecho:
            trecho = a_pe(p, q)
            aproximado = True
        linha += trecho[1:]
    jeito = "volta" if volta else "ruas"
    return linha, jeito + (" aproximado" if aproximado else "")


def meio_do_lugar(mapa, chaves):
    """O ponto da via (ou da praça) mais perto do meio dela, dentro da subprefeitura."""
    dentro = [p for linha in mapa.pontos_de(chaves) for p in linha if mapa.dentro(p)]
    if not dentro:
        raise Falhou("o lugar fica fora da subprefeitura")
    centro = (sum(x for x, _ in dentro) / len(dentro), sum(y for _, y in dentro) / len(dentro))
    return min(dentro, key=lambda p: metros(p, centro))


def pontos_mais_perto(mapa, chaves_a, chaves_b, limite):
    achados = []
    for linha_a in mapa.pontos_de(chaves_a):
        for linha_b in mapa.pontos_de(chaves_b):
            melhor = min(((mais_perto_na_linha(p, linha_a)[0], p) for p in linha_b), key=lambda par: metros(*par))
            if metros(*melhor) <= limite:
                achados.append(melhor[0])
    return agrupar(achados)


_rotas = {}


def a_pe(p, q):
    """O caminho a pé de p até q pelas ruas (OSRM), para ligar trechos que o mapa não liga."""
    if metros(p, q) < 40:
        return [p, q]
    pedido = f"{p[0]:.6f},{p[1]:.6f};{q[0]:.6f},{q[1]:.6f}"
    if pedido not in _rotas:
        endereco = OSRM.format(perfil="foot", pontos=pedido) + "?overview=full&geometries=geojson"
        time.sleep(1)
        with urllib.request.urlopen(urllib.request.Request(endereco, headers=QUEM_PEDE), timeout=60) as r:
            _rotas[pedido] = json.load(r)
    resposta = _rotas[pedido]
    if resposta.get("code") != "Ok":
        raise Falhou("o roteador não achou caminho")
    linha = [tuple(c) for c in resposta["routes"][0]["geometry"]["coordinates"]]
    if comprimento(linha) > 2.5 * metros(p, q) + 100:
        raise Falhou(f"o caminho entre dois pontos dá uma volta grande ({comprimento(linha):.0f} m)")
    return [p] + linha + [q]


def melhor_par(opcoes_a, opcoes_b):
    return min(((p, q) for p in opcoes_a for q in opcoes_b if p != q), key=lambda par: metros(*par))


def escolher_sequencia(opcoes):
    """Um cruzamento de cada lista, de modo que o caminho todo fique o mais curto possível."""
    custo = {p: 0 for p in opcoes[0]}
    volta = [{} for _ in opcoes]
    for i in range(1, len(opcoes)):
        novo = {}
        for q in opcoes[i]:
            p = min(custo, key=lambda p: custo[p] + metros(p, q))
            novo[q] = custo[p] + metros(p, q)
            volta[i][q] = p
        custo = novo
    fim = min(custo, key=custo.get)
    pontos = [fim]
    for i in range(len(opcoes) - 1, 0, -1):
        pontos.append(volta[i][pontos[-1]])
    return list(reversed(pontos))


# ------------------------------------------------------------------ tudo junto

blocos = json.load(open(sys.argv[1], encoding="utf-8"))
pasta = sys.argv[2]
enderecos = Enderecos(sys.argv[3])
mapas = {}
for arquivo in sorted(os.listdir(pasta)):
    if re.fullmatch(r"\d\d\.json", arquivo):
        mapa = Mapa(os.path.join(pasta, arquivo))
        mapas[json.load(open(os.path.join(pasta, arquivo), encoding="utf-8"))["subprefeitura"]] = mapa

ARQUIVO_DAS_ROTAS = os.path.join(os.path.dirname(sys.argv[3]), "rotas.json")
if os.path.exists(ARQUIVO_DAS_ROTAS):
    _rotas.update(json.load(open(ARQUIVO_DAS_ROTAS, encoding="utf-8")))
resultado, contagem, falhas = {}, {}, []
for bloco in blocos:
    chave_do_itinerario = f"{bloco['subprefeitura']}|{bloco['itinerario']}"
    if chave_do_itinerario in resultado:
        continue
    mapa = mapas.get(bloco["subprefeitura"])
    if not mapa:
        continue
    try:
        linha, jeito = tracar(bloco["itinerario"], mapa, enderecos)
        linha = simplificar(linha)
        if len(linha) > 1 and comprimento(linha) > 8000:
            raise Falhou(f"linha comprida demais ({comprimento(linha):.0f} m)")
        resultado[chave_do_itinerario] = {"jeito": jeito, "linha": [[round(x, 5), round(y, 5)] for x, y in linha]}
        contagem[jeito] = contagem.get(jeito, 0) + 1
    except Falhou as erro:
        resultado[chave_do_itinerario] = {"jeito": "falhou", "motivo": str(erro)}
        falhas.append((bloco["subprefeitura"], bloco["itinerario"], str(erro)))
        contagem["falhou"] = contagem.get("falhou", 0) + 1

json.dump(_rotas, open(ARQUIVO_DAS_ROTAS, "w", encoding="utf-8"))
json.dump(resultado, open(sys.argv[4], "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(contagem)
for sub, itinerario, motivo in falhas:
    print(f"  {sub} | {itinerario[:90]} | {motivo}")
