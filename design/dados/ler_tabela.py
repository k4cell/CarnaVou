"""Lê a lista oficial dos blocos aprovados (texto do pdftotext -raw) e grava um JSON.

Uso: python -I ler_tabela.py cru.txt saida.json
(o atualizar.py roda este script junto com os outros)

No modo -raw o texto sai na ordem em que o PDF foi escrito: célula por célula, linha por linha
da tabela. Cada bloco é: o nome, a data ("08/02/2026 - Pré Carnaval"), a subprefeitura, o
itinerário e os três horários (concentração, desfile e término), que fecham o bloco.
"""

import json
import re
import sys

# As 32 subprefeituras da cidade, e como a tabela escreve algumas.
SUBPREFEITURAS = {
    "Aricanduva/Vila Formosa", "Butantã", "Campo Limpo", "Capela do Socorro", "Casa Verde",
    "Cidade Ademar", "Cidade Tiradentes", "Ermelino Matarazzo", "Freguesia/Brasilândia",
    "Guaianases", "Ipiranga", "Itaim Paulista", "Itaquera", "Jabaquara", "Jaçanã/Tremembé",
    "Lapa", "M'Boi Mirim", "Mooca", "Parelheiros", "Penha", "Perus", "Pinheiros",
    "Pirituba/Jaraguá", "Santana/Tucuruvi", "Santo Amaro", "São Mateus", "São Miguel Paulista",
    "Sapopemba", "Sé", "Vila Maria/Vila Guilherme", "Vila Mariana", "Vila Prudente",
}
VARIANTES = {"Moóca": "Mooca"}
CANONICO = {n.lower(): n for n in SUBPREFEITURAS} | {v.lower(): n for v, n in VARIANTES.items()}
SUB = re.compile(
    r"^("
    + "|".join(
        r"\s*/?\s*".join(r"\s+".join(map(re.escape, parte.split(" "))) for parte in nome.split("/"))
        for nome in sorted(CANONICO, key=len, reverse=True)
    )
    + r")(?:\s+|$)",
    re.IGNORECASE,
)
DATA = re.compile(r"(\d\d)/(\d\d)/(20\d\d)\s*-\s*")
PERIODO = re.compile(r"^(Pré|Período|Pós)\s+Carnaval\s*", re.IGNORECASE)
HORA = r"(\d{1,2}[:h]\d{2})"
HORARIOS = re.compile(r"\s*" + HORA + r"\s+" + HORA + r"\s+" + HORA + r"\s*$")
CABECALHO = {"BLOCO DATA DO DESFILE SUBPREFEITURA ITINERÁRIO", "INÍCIO DA", "CONCENTRAÇÃO",
             "INÍCIO DO DESFILE", "TÉRMINO DO", "DESFILE"}


def hora(texto):
    h, m = re.split(r"[:h]", texto)
    return f"{int(h):02d}:{m}"


def espacos(texto):
    return re.sub(r"\s+", " ", texto).strip()


texto = open(sys.argv[1], encoding="utf-8").read()
linhas = []
for numero, pagina in enumerate(texto.split("\f"), start=1):
    linhas += [(numero, l.strip()) for l in pagina.split("\n") if l.strip() and l.strip() not in CABECALHO]

blocos, problemas = [], []
nome, resto, pagina = [], [], None
for numero, linha in linhas:
    if pagina is None:
        pagina = numero
    data = DATA.search(linha) if not resto else None
    if data:
        nome.append(linha[: data.start()])
        resto.append(linha[data.start():])
        continue
    (resto if resto else nome).append(linha)
    if not resto or not HORARIOS.search(linha):
        continue
    # Fechou um bloco.
    tudo = espacos(" ".join(resto))
    horarios = HORARIOS.search(tudo)
    tudo = tudo[: horarios.start()]
    data = DATA.match(tudo)
    tudo = tudo[data.end():]
    periodo = PERIODO.match(tudo)
    if periodo:
        tudo = tudo[periodo.end():]
    sub = SUB.match(tudo)
    bloco = {
        "nome": espacos(" ".join(nome)),
        "data": f"{data.group(3)}-{data.group(2)}-{data.group(1)}",
        "periodo": periodo.group(1) if periodo else None,
        "subprefeitura": CANONICO[re.sub(r"\s*/\s*", "/", espacos(sub.group(1))).lower()] if sub else None,
        "itinerario": tudo[sub.end():].strip() if sub else tudo,
        "concentracao": hora(horarios.group(1)),
        "desfile": hora(horarios.group(2)),
        "termino": hora(horarios.group(3)),
        "pagina": pagina,
    }
    if not (bloco["nome"] and bloco["periodo"] and bloco["subprefeitura"] and bloco["itinerario"]):
        problemas.append(bloco)
    blocos.append(bloco)
    nome, resto, pagina = [], [], None

for p in problemas:
    print("problema:", p)
if nome or resto:
    print("sobrou:", nome, resto)
json.dump(blocos, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(blocos), "blocos;", len(problemas), "com problema")
