"""Gera os dados do app (locais.ts, blocos.ts, itinerarios.ts e pontos-dos-blocos.ts).

Uso: python -I gerar_dados.py pasta_do_ano pasta_dos_dados_do_app
(o atualizar.py roda este script junto com os outros; normalmente é só ele que se usa)

Da pasta do ano (design/dados/2026, por exemplo) vêm:
- sobre.json: o ano e o nome da publicação oficial.
- blocos-oficiais.json: a lista oficial lida do Diário Oficial (ler_tabela.py).
- tracados.json: o ponto e a linha de cada itinerário (tracar.py).
- atracoes-das-noticias.json: os artistas e o estilo que as notícias dão para alguns blocos;
  valem quando o bloco é o mesmo (mesmo nome e mesmo dia).
- destaques-das-noticias.json (se tiver): blocos sem artista que as notícias chamam de destaque
  da região; valem em todos os dias do bloco (mesmo nome e mesma subprefeitura).
E de design/dados vem seguidores.json: os seguidores no Instagram de cada artista, para ordenar
por fama. Ele vale para todos os anos.

Entram os blocos que têm atração divulgada, que desfilam num circuito de megabloco (os trajetos
que a CET fecha) ou que as notícias chamam de destaque da região. Os outros ficam de fora.
"""

import json
import os
import re
import sys
import unicodedata

ZONAS = {
    "Sé": "centro",
    "Butantã": "oeste", "Lapa": "oeste", "Pinheiros": "oeste",
    "Casa Verde": "norte", "Freguesia/Brasilândia": "norte", "Jaçanã/Tremembé": "norte",
    "Perus": "norte", "Pirituba/Jaraguá": "norte", "Santana/Tucuruvi": "norte",
    "Vila Maria/Vila Guilherme": "norte",
    "Campo Limpo": "sul", "Capela do Socorro": "sul", "Cidade Ademar": "sul", "Ipiranga": "sul",
    "Jabaquara": "sul", "M'Boi Mirim": "sul", "Parelheiros": "sul", "Santo Amaro": "sul",
    "Vila Mariana": "sul",
    "Aricanduva/Vila Formosa": "leste", "Cidade Tiradentes": "leste", "Ermelino Matarazzo": "leste",
    "Guaianases": "leste", "Itaim Paulista": "leste", "Itaquera": "leste", "Mooca": "leste",
    "Penha": "leste", "São Mateus": "leste", "São Miguel Paulista": "leste", "Sapopemba": "leste",
    "Vila Prudente": "leste",
}
# Os grandes pontos: os circuitos dos megablocos (os trajetos que a CET fecha). Quem desfila
# neles entra mesmo sem atração divulgada, e cada um vira um lugar com o nome que o povo conhece
# (decisão de 30/10/2026). Os ids são os mesmos de antes, para os links antigos continuarem valendo.
GRANDES_PONTOS = [
    ("ibirapuera", "Parque Ibirapuera", "sul", r"Pedro [ÁA]lvares Cabral"),
    ("consolacao", "Rua da Consolação e Baixo Augusta", "centro", r"Consola[çc][ãa]o, 2101"),
    ("faria-lima", "Avenida Faria Lima", "oeste", r"Faria Lima, 4100"),
    ("ipiranga-sao-joao", "Av. Ipiranga, São João e República", "centro",
     r"^Av\.? Ipiranga|Pça\.? ?da Rep[úu]blica|Av\. S[ãa]o Jo[ãa]o"),
    ("paulo-vi", "Avenida Paulo VI", "oeste", r"Paulo VI"),
    ("henrique-schaumann", "Rua Henrique Schaumann", "oeste", r"Henrique Schaumann"),
]


def grande_ponto_do(bloco):
    for ponto in GRANDES_PONTOS:
        if re.search(ponto[3], bloco["itinerario"], re.I):
            return ponto
    return None


def lugar_do(bloco):
    """(id, nome, zona) do lugar do bloco: o grande ponto onde ele desfila ou a subprefeitura."""
    ponto = grande_ponto_do(bloco)
    if ponto:
        return ponto[:3]
    sub = bloco["subprefeitura"]
    return slug(sub), sub, ZONAS[sub]
# Nomes que as notícias escrevem diferente da lista oficial (mesmo bloco, mesmo dia).
OUTROS_NOMES = {"Quintal dos Prettos": "Quintal dos Pretos"}


def sem_acento(texto):
    return unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()


def slug(texto):
    return re.sub(r"[^a-z0-9]+", "-", sem_acento(texto)).strip("-")


def chave_do_nome(nome):
    nome = re.sub(r"\b(bloco|carnafacul|megabloco|o|a|do|da|de|dos|das|com)\b", " ", sem_acento(nome))
    return re.sub(r"[^a-z0-9]+", "", nome)


def ts(texto):
    """Uma string do TypeScript entre aspas simples."""
    return "'" + texto.replace("\\", "\\\\").replace("'", "\\'") + "'"


def codificar(linha):
    """A linha no formato "encoded polyline" do Google (precisão de 5 casas)."""
    saida, anterior = [], (0, 0)
    for lng, lat in linha:
        atual = (round(lat * 1e5), round(lng * 1e5))
        for valor, antes in zip(atual, anterior):
            v = valor - antes
            v = ~(v << 1) if v < 0 else v << 1
            while v >= 0x20:
                saida.append(chr((0x20 | (v & 0x1F)) + 63))
                v >>= 5
            saida.append(chr(v + 63))
        anterior = atual
    return "".join(saida)


def ler(caminho, sem_o_arquivo=None):
    if sem_o_arquivo is not None and not os.path.exists(caminho):
        return sem_o_arquivo
    return json.load(open(caminho, encoding="utf-8"))


pasta_do_ano, pasta = sys.argv[1], sys.argv[2]
design = os.path.dirname(os.path.abspath(__file__))
sobre = ler(f"{pasta_do_ano}/sobre.json")
todos_os_oficiais = ler(f"{pasta_do_ano}/blocos-oficiais.json")
tracados = ler(f"{pasta_do_ano}/tracados.json")
antigos = ler(f"{pasta_do_ano}/atracoes-das-noticias.json")
for antigo in antigos:
    antigo["nome"] = OUTROS_NOMES.get(antigo["nome"], antigo["nome"])
destaques = {(d["nome"], d["subprefeitura"]) for d in ler(f"{pasta_do_ano}/destaques-das-noticias.json", {"blocos": []})["blocos"]}
seguidores = {nome: dados["seguidores"] for nome, dados in ler(f"{design}/seguidores.json").items() if not nome.startswith("_")}


def antigo_do(bloco):
    k = chave_do_nome(bloco["nome"])
    mesmo_dia = [a for a in antigos if a["data"] == bloco["data"]]
    iguais = [a for a in mesmo_dia if chave_do_nome(a["nome"]) == k]
    if iguais:
        return iguais[0]
    # Nome parecido (um dentro do outro) só vale para quem não achou o nome igual na lista
    # oficial: senão o "Quintal dos Pretos" emprestaria os artistas para o "Bloco do Preto".
    parecidos = [
        a for a in mesmo_dia
        if id(a) not in casados_pelo_nome
        and min(len(k), len(chave_do_nome(a["nome"]))) >= 4
        and (chave_do_nome(a["nome"]) in k or k in chave_do_nome(a["nome"]))
    ]
    return parecidos[0] if len(parecidos) == 1 else None


casados_pelo_nome = {
    id(a) for a in antigos
    if any(o["data"] == a["data"] and chave_do_nome(o["nome"]) == chave_do_nome(a["nome"]) for o in todos_os_oficiais)
}


def atracoes_do(bloco):
    antigo = antigo_do(bloco)
    return antigo["atracoes"] if antigo else []


def fama(bloco):
    return sum(seguidores.get(a["nome"], 0) for a in atracoes_do(bloco))


def destaque(bloco):
    return (bloco["nome"], bloco["subprefeitura"]) in destaques


def entra(bloco):
    return bool(atracoes_do(bloco)) or grande_ponto_do(bloco) is not None or destaque(bloco)


oficiais = [b for b in todos_os_oficiais if entra(b)]
faltou = destaques - {(b["nome"], b["subprefeitura"]) for b in todos_os_oficiais}
if faltou:
    sys.exit(f"destaques-das-noticias.json tem blocos que não estão na lista oficial: {sorted(faltou)}")

# ------------------------------------------------------------------ os lugares
contagem, fama_do_lugar, dados_do_lugar = {}, {}, {}
for bloco in oficiais:
    lugar = lugar_do(bloco)
    dados_do_lugar[lugar[0]] = lugar
    contagem[lugar[0]] = contagem.get(lugar[0], 0) + 1
    fama_do_lugar[lugar[0]] = fama_do_lugar.get(lugar[0], 0) + fama(bloco)
# Os lugares com os artistas mais famosos vêm primeiro; depois, os que têm mais blocos.
lugares = sorted(contagem, key=lambda l: (-fama_do_lugar[l], -contagem[l], l))

linhas = [
    "import { Local } from './tipos';",
    "",
    "/**",
    " * Os lugares: os grandes pontos do carnaval (os circuitos dos megablocos, como o Parque",
    " * Ibirapuera) e, para os outros blocos, a subprefeitura. Os que têm os artistas mais famosos",
    " * vêm primeiro.",
    " * Arquivo gerado por design/dados/gerar_dados.py: não mude à mão.",
    " */",
    "export const LOCAIS: Local[] = [",
]
for l in lugares:
    identificador, nome, zona = dados_do_lugar[l]
    linhas.append(f"  {{ id: {ts(identificador)}, nome: {ts(nome)}, zona: {ts(zona)} }},")
linhas += ["];", ""]
open(f"{pasta}/locais.ts", "w", encoding="utf-8", newline="\n").write("\n".join(linhas))

# ------------------------------------------------------------------ os blocos


def atracoes_em_ts(atracoes):
    """As atrações, da mais famosa para a menos, com os seguidores quando a gente sabe."""
    itens = []
    for a in sorted(atracoes, key=lambda a: -seguidores.get(a["nome"], 0)):
        partes = [f"nome: {ts(a['nome'])}"]
        if a.get("inicio"):
            partes.append(f"inicio: {ts(a['inicio'])}")
        if a["nome"] in seguidores:
            partes.append(f"seguidores: {seguidores[a['nome']]}")
        itens.append("{ " + ", ".join(partes) + " }")
    return "[" + ", ".join(itens) + "]"


ordem = sorted(oficiais, key=lambda b: (lugares.index(lugar_do(b)[0]), b["data"], b["concentracao"], sem_acento(b["nome"])))
repetidos = {}
for bloco in ordem:
    repetidos[slug(bloco["nome"])] = repetidos.get(slug(bloco["nome"]), 0) + 1

trajetos, indice_do_trajeto, trajeto_do_bloco = [], {}, {}
itinerarios, indice_do_itinerario, itinerario_do_bloco = [], {}, {}
linhas = [
    "import { Bloco } from './tipos';",
    "",
    "/**",
    f" * Os blocos do carnaval de rua de São Paulo em {sobre['ano']}.",
    " *",
    " * Vêm da lista oficial dos blocos aprovados, publicada pela SPTuris e pela Secretaria de",
    f" * Cultura no Diário Oficial ({sobre['lista_oficial']}): nome, dia, subprefeitura,",
    " * itinerário e os horários de concentração (inicio), desfile e término (fim). Os artistas e o",
    " * estilo vêm de notícias, só nos blocos que elas citam, e os seguidores de cada",
    " * artista, de contadores públicos do Instagram. Entram os blocos que têm atração divulgada,",
    " * que desfilam num circuito de megabloco ou que as notícias chamam de destaque da região.",
    " * Arquivo gerado por design/dados/gerar_dados.py: não mude à mão.",
    " */",
    "export const BLOCOS: Bloco[] = [",
]
lugar_atual = None
usados = set()
for bloco in ordem:
    if lugar_do(bloco)[1] != lugar_atual:
        lugar_atual = lugar_do(bloco)[1]
        linhas.append(f"  // {lugar_atual}")
    base = slug(bloco["nome"])
    dia, mes = bloco["data"][8:], bloco["data"][5:7]
    identificador = base if repetidos[base] == 1 else f"{base}-{dia}-{mes}"
    n = 2
    while identificador in usados:
        identificador = f"{base}-{dia}-{mes}-{n}"
        n += 1
    usados.add(identificador)
    nome = bloco["nome"].strip(" .")
    antigo = antigo_do(bloco)
    partes = [
        f"id: {ts(identificador)}",
        f"nome: {ts(nome)}",
        f"data: {ts(bloco['data'])}",
        f"inicio: {ts(bloco['concentracao'])}",
        f"desfile: {ts(bloco['desfile'])}",
        f"fim: {ts(bloco['termino'])}",
        f"localId: {ts(lugar_do(bloco)[0])}",
        f"atracoes: {atracoes_em_ts(atracoes_do(bloco))}",
    ]
    if antigo and antigo.get("estilo"):
        partes.append(f"estilo: {ts(antigo['estilo'])}")
    linhas.append("  { " + ", ".join(re.sub(r"\s*\n\s*", " ", p) for p in partes) + " },")
    if bloco["itinerario"] not in indice_do_itinerario:
        indice_do_itinerario[bloco["itinerario"]] = len(itinerarios)
        itinerarios.append(bloco["itinerario"])
    itinerario_do_bloco[identificador] = indice_do_itinerario[bloco["itinerario"]]

    tracado = tracados.get(f"{bloco['subprefeitura']}|{bloco['itinerario']}")
    if not tracado or not tracado.get("linha"):
        # A lista às vezes põe o bloco numa subprefeitura vizinha (a Faria Lima 4100 aparece em
        # Santo Amaro): vale o traçado do mesmo itinerário em outra subprefeitura.
        tracado = next((v for k, v in tracados.items() if k.split("|", 1)[1] == bloco["itinerario"] and v.get("linha")), tracado)
    if tracado and tracado.get("linha"):
        codigo = codificar(tracado["linha"])
        aproximado = 1 if "aproximado" in tracado["jeito"] or tracado["jeito"] in ("na rua", "lugar", "cruzamento") else 0
        if (codigo, aproximado) not in indice_do_trajeto:
            indice_do_trajeto[(codigo, aproximado)] = len(trajetos)
            trajetos.append((codigo, aproximado))
        trajeto_do_bloco[identificador] = indice_do_trajeto[(codigo, aproximado)]
linhas += ["];", ""]
open(f"{pasta}/blocos.ts", "w", encoding="utf-8", newline="\n").write("\n".join(linhas))

# ------------------------------------------------------------------ os itinerários em texto
linhas = [
    "/**",
    " * O itinerário de cada bloco, como a lista oficial escreve. Fica fora de blocos.ts para só ser",
    " * baixado na página do bloco e no mapa, sem pesar a primeira tela. Vários blocos dividem o mesmo",
    " * itinerário (os do Ibirapuera, por exemplo), então cada texto aparece uma vez só.",
    " * Arquivo gerado por design/dados/gerar_dados.py: não mude à mão.",
    " */",
    "export const ITINERARIOS: readonly string[] = [",
]
for texto in itinerarios:
    linhas.append(f"  {ts(texto)},")
linhas += ["];", "", "/** O itinerário de cada bloco (pelo id do bloco). */",
           "export const ITINERARIO_DO_BLOCO: Readonly<Record<string, number>> = {"]
for identificador, indice in itinerario_do_bloco.items():
    linhas.append(f"  {ts(identificador)}: {indice},")
linhas += ["};", ""]
open(f"{pasta}/itinerarios.ts", "w", encoding="utf-8", newline="\n").write("\n".join(linhas))

# ------------------------------------------------------------------ os pontos e as linhas (só o mapa usa)
linhas = [
    "/**",
    " * Onde cada bloco se concentra e por onde ele passa, para o mapa. Fica fora de blocos.ts para só",
    " * ser baixado junto com o mapa.",
    " *",
    " * Vem do itinerário oficial de cada bloco, casado com as ruas do OpenStreetMap: a linha começa",
    " * na concentração (o primeiro número, o primeiro \"entre\" ou o primeiro cruzamento) e segue as",
    " * ruas na ordem do itinerário. Um ponto sozinho é um bloco parado (numa praça, numa rua). Cada",
    " * trajeto é [linha, aproximado]: a linha no formato \"encoded polyline\" do Google, e 1 quando o",
    " * ponto ou a linha não são exatos (uma rua que o mapa não tem, uma rua sem os números, um",
    " * itinerário de duas ruas só).",
    " * Arquivo gerado por design/dados/gerar_dados.py: não mude à mão.",
    " */",
    "export const TRAJETOS: readonly (readonly [string, 0 | 1])[] = [",
]
for codigo, aproximado in trajetos:
    linhas.append(f"  [{json.dumps(codigo)}, {aproximado}],")
linhas += ["];", "", "/** O trajeto de cada bloco (pelo id do bloco). Blocos sem ponto conhecido ficam de fora. */",
           "export const TRAJETO_DO_BLOCO: Readonly<Record<string, number>> = {"]
for identificador, indice in trajeto_do_bloco.items():
    linhas.append(f"  {ts(identificador)}: {indice},")
linhas += ["};", ""]
open(f"{pasta}/pontos-dos-blocos.ts", "w", encoding="utf-8", newline="\n").write("\n".join(linhas))

print(len(lugares), "lugares;", len(ordem), "blocos;", len(trajeto_do_bloco), "com ponto;", len(trajetos), "trajetos diferentes")
print("com artistas:", sum(1 for b in ordem if atracoes_do(b)), "· destaques sem artista:", sum(1 for b in ordem if destaque(b) and not atracoes_do(b)))
por_zona = {}
for bloco in ordem:
    por_zona[lugar_do(bloco)[2]] = por_zona.get(lugar_do(bloco)[2], 0) + 1
print("por zona:", ", ".join(f"{zona} {n}" for zona, n in sorted(por_zona.items())))

# ------------------------------------------------------------------ conferências
# Os testes do app usam uma cópia congelada dos dados de 2026 (app/src/app/dados/teste-2026), então
# quem confere os dados novos é este script. Avisa o que parece errado, sem parar.
avisos = []
for bloco in ordem:
    if not bloco["concentracao"] <= bloco["desfile"] or not (bloco["termino"] > bloco["desfile"] or bloco["termino"] == "00:00"):
        avisos.append(f"horários fora de ordem: {bloco['nome']} ({bloco['data']}, {bloco['concentracao']}, {bloco['desfile']}, {bloco['termino']})")
for (codigo, _), indice in indice_do_trajeto.items():
    tracado = next(t for t in tracados.values() if t.get("linha") and codificar(t["linha"]) == codigo)
    # O retângulo da Grande São Paulo, o mesmo de app/src/app/mapa/limites.ts.
    if not all(-47.2 <= lng <= -46.2 and -23.95 <= lat <= -23.2 for lng, lat in tracado["linha"]):
        avisos.append(f"trajeto fora da Grande São Paulo: {tracado['linha'][0]}")
if len(trajeto_do_bloco) < 0.8 * len(ordem):
    avisos.append(f"só {len(trajeto_do_bloco)} de {len(ordem)} blocos têm ponto no mapa (veja relatorio.txt)")
for aviso in avisos:
    print("AVISO:", aviso)
