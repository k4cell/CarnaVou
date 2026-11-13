"""Gera os dados do app (locais.ts, blocos.ts, itinerarios.ts e pontos-dos-blocos.ts).

Uso: python -I gerar_dados.py pasta_do_ano pasta_dos_dados_do_app
(o atualizar.py roda este script junto com os outros; normalmente é só ele que se usa)

Da pasta do ano (scripts/dados/2026, por exemplo) vêm:
- sobre.json: o ano e o nome da publicação oficial.
- blocos-oficiais.json: a lista oficial lida do Diário Oficial (ler_tabela.py).
- tracados.json: o ponto e a linha de cada itinerário (tracar.py).
- atracoes-das-noticias.json: os artistas e o estilo que as notícias dão para alguns blocos;
  valem quando o bloco é o mesmo (mesmo nome e mesmo dia).
- destaques-das-noticias.json (se tiver): blocos sem artista que as notícias chamam de destaque
  da região; valem em todos os dias do bloco (mesmo nome e mesma subprefeitura).
- lgbt-das-noticias.json (se tiver): blocos que as notícias chamam de LGBT+ ou LGBTQIA+; valem pelo
  nome e pelo dia.
- megablocos-das-noticias.json (se tiver): blocos que as notícias chamam de megabloco; valem pelo
  nome da lista oficial, em todos os dias do bloco.
- nomes-das-noticias.json (se tiver): o nome que o povo usa, no lugar do nome cru da lista oficial,
  só quando uma fonte escreve assim. O id do bloco continua vindo do nome oficial.
E de scripts/dados vem seguidores.json: os seguidores no Instagram de cada artista, para ordenar
por fama. Ele vale para todos os anos.

Entram os blocos que têm atração divulgada, que desfilam num circuito de megabloco (os trajetos
que a CET fecha), que as notícias chamam de megabloco ou de destaque da região. Os outros ficam de
fora. O megabloco sem artista famoso conta como se tivesse FAMA_DO_MEGABLOCO seguidores, para não
ficar lá embaixo na ordem.

No fim, o script avisa o que parece errado e o que sumiu desde o ano anterior: os circuitos e os
blocos grandes do histórico (privado/historico-dos-megablocos.json, se tiver) e os megablocos da
pasta do ano anterior.
"""

import json
import math
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
# Os ids não mudam, para os links antigos continuarem valendo. Cada um é reconhecido pelo nome da rua
# (sem acento e em minúsculas), e não pelos números, que mudam de um ano para o outro.
GRANDES_PONTOS = [
    ("ibirapuera", "Parque Ibirapuera", "sul", "pedro alvares cabral"),
    ("consolacao", "Rua da Consolação e Baixo Augusta", "centro", "consolacao"),
    ("faria-lima", "Avenida Faria Lima", "oeste", "faria lima"),
    ("paulo-vi", "Avenida Paulo VI", "oeste", "paulo vi"),
    ("henrique-schaumann", "Rua Henrique Schaumann", "oeste", "henrique schaumann"),
]
# O circuito do centro é o único de várias ruas: vale quem passa por qualquer uma delas.
CIRCUITO_DO_CENTRO = ("ipiranga-sao-joao", "Av. Ipiranga, São João e República", "centro")
RUAS_DO_CENTRO = r"\bav[.,]? ?ipiranga|\b(?:pca|praca)\.? ?da republica|\bav[.,]? ?sao joao"
TIPO_DE_RUA = r"\b(?:r\.|rua|av\.?|avenida|al\.|alameda|pca\.?|praca|lgo\.?|largo|tv\.|travessa|viaduto|ponte)\s"
# O que vem depois destas palavras só diz o trecho da rua; não é outra rua do trajeto.
TRECHO_DA_RUA = r"\b(?:entre|altura|ate|esquina|proximo|frente|sentido)\b.*"


def comeca_na_rua(itinerario, rua):
    return re.search(rf"\b{rua}\b", sem_acento(itinerario).split(",")[0])


def desfila_so_na_rua(itinerario, rua):
    """Vale "R. da Consolação, 2101 ao 585", mas não "R. da Consolação, Al. Itu, R. Bela Cintra"."""
    achou = comeca_na_rua(itinerario, rua)
    if not achou:
        return False
    resto = re.sub(TRECHO_DA_RUA, "", sem_acento(itinerario)[achou.end():])
    return not re.search(TIPO_DE_RUA, resto)


def grande_ponto_do(bloco):
    for ponto in GRANDES_PONTOS:
        if desfila_so_na_rua(bloco["itinerario"], ponto[3]):
            return ponto
    if re.search(RUAS_DO_CENTRO, sem_acento(bloco["itinerario"])):
        return CIRCUITO_DO_CENTRO
    return None


def lugar_do(bloco):
    """(id, nome, zona) do lugar do bloco: o grande ponto onde ele desfila ou a subprefeitura."""
    ponto = grande_ponto_do(bloco)
    if ponto:
        return ponto[:3]
    sub = bloco["subprefeitura"]
    return slug(sub), sub, ZONAS[sub]
# Nomes que as notícias escrevem diferente da lista oficial (mesmo bloco, mesmo dia), só para achar
# os artistas. O nome que aparece no app vem de nomes-das-noticias.json.
OUTROS_NOMES = {"Quintal dos Prettos": "Quintal dos Pretos", "Navio Pirata": "BaianaSystem"}
# O megabloco conta, na ordem por fama, como se tivesse pelo menos estes seguidores. É o mesmo número
# de FAMA_DO_MEGABLOCO, em app/src/app/dados/consultas.ts.
FAMA_DO_MEGABLOCO = 1_000_000


def sem_acento(texto):
    return unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()


def slug(texto):
    return re.sub(r"[^a-z0-9]+", "-", sem_acento(texto)).strip("-")


def chave_do_nome(nome):
    nome = re.sub(r"\b(bloco|carnafacul|megabloco|o|a|do|da|de|dos|das|com)\b", " ", sem_acento(nome))
    return re.sub(r"[^a-z0-9]+", "", nome)


# Palavras que ficam em minúsculas no meio de um nome.
PALAVRAS_PEQUENAS = {
    "a", "as", "o", "os", "e", "de", "da", "do", "das", "dos", "com", "em", "na", "no", "nas", "nos",
    "pra", "para", "por",
}
LETRAS = r"[^\W\d_]+"


def nome_do_bloco(nome):
    """O nome como a lista oficial escreve. Só o que vem inteiro em maiúsculas ("BLOCO DA PAZ") passa
    para "Bloco da Paz". Um nome de uma palavra só (uma marca, uma sigla) e os que misturam maiúsculas
    e minúsculas ("BATEKOO - Bloco de Carnaval") ficam como estão."""
    nome = nome.strip(" .")
    if len(re.findall(LETRAS, nome)) < 2 or any(letra.islower() for letra in nome):
        return nome
    comeco = re.search(LETRAS, nome).start()

    def arrumar(achado):
        palavra = achado.group().lower()
        if palavra in PALAVRAS_PEQUENAS and achado.start() != comeco:
            return palavra
        return palavra.capitalize()

    return re.sub(LETRAS, arrumar, nome)


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
projeto = os.path.dirname(os.path.dirname(design))
sobre = ler(f"{pasta_do_ano}/sobre.json")
todos_os_oficiais = ler(f"{pasta_do_ano}/blocos-oficiais.json")
tracados = ler(f"{pasta_do_ano}/tracados.json")
antigos = ler(f"{pasta_do_ano}/atracoes-das-noticias.json")
for antigo in antigos:
    antigo["nome_nas_noticias"] = antigo["nome"]
    antigo["nome"] = OUTROS_NOMES.get(antigo["nome"], antigo["nome"])
destaques = {(d["nome"], d["subprefeitura"]) for d in ler(f"{pasta_do_ano}/destaques-das-noticias.json", {"blocos": []})["blocos"]}
lgbt = {(chave_do_nome(d["nome"]), d["data"]) for d in ler(f"{pasta_do_ano}/lgbt-das-noticias.json", {"blocos": []})["blocos"]}
megablocos = {d["nome"] for d in ler(f"{pasta_do_ano}/megablocos-das-noticias.json", {"blocos": []})["blocos"]}
nomes_do_povo = {d["oficial"]: d["nome"] for d in ler(f"{pasta_do_ano}/nomes-das-noticias.json", {"blocos": []})["blocos"]}
artistas = {nome: dados for nome, dados in ler(f"{design}/seguidores.json").items() if not nome.startswith("_")}
seguidores = {nome: dados["seguidores"] for nome, dados in artistas.items()}
# O perfil de cada artista no Instagram (sem o @), para a página do bloco levar até ele.
perfis = {nome: dados["perfil"] for nome, dados in artistas.items() if dados.get("perfil")}


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


def e_megabloco(bloco):
    return bloco["nome"] in megablocos


def fama(bloco):
    soma = sum(seguidores.get(a["nome"], 0) for a in atracoes_do(bloco))
    return max(soma, FAMA_DO_MEGABLOCO) if e_megabloco(bloco) else soma


def destaque(bloco):
    return (bloco["nome"], bloco["subprefeitura"]) in destaques


def e_lgbt(bloco):
    return (chave_do_nome(bloco["nome"]), bloco["data"]) in lgbt


def entra(bloco):
    return bool(atracoes_do(bloco)) or grande_ponto_do(bloco) is not None or destaque(bloco) or e_megabloco(bloco)


oficiais = [b for b in todos_os_oficiais if entra(b)]
faltou = destaques - {(b["nome"], b["subprefeitura"]) for b in todos_os_oficiais}
if faltou:
    sys.exit(f"destaques-das-noticias.json tem blocos que não estão na lista oficial: {sorted(faltou)}")
nomes_oficiais = {b["nome"] for b in todos_os_oficiais}
for arquivo, lista in (("megablocos-das-noticias.json", megablocos), ("nomes-das-noticias.json", nomes_do_povo)):
    if set(lista) - nomes_oficiais:
        sys.exit(f"{arquivo} tem nomes que não estão na lista oficial: {sorted(set(lista) - nomes_oficiais)}")

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
    " * Arquivo gerado por scripts/dados/gerar_dados.py: não mude à mão.",
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
    """As atrações, da mais famosa para a menos, com os seguidores e o perfil quando a gente sabe."""
    itens = []
    for a in sorted(atracoes, key=lambda a: -seguidores.get(a["nome"], 0)):
        partes = [f"nome: {ts(a['nome'])}"]
        if a.get("inicio"):
            partes.append(f"inicio: {ts(a['inicio'])}")
        if a["nome"] in seguidores:
            partes.append(f"seguidores: {seguidores[a['nome']]}")
        if a["nome"] in perfis:
            partes.append(f"perfil: {ts(perfis[a['nome']])}")
        itens.append("{ " + ", ".join(partes) + " }")
    return "[" + ", ".join(itens) + "]"


ordem = sorted(oficiais, key=lambda b: (lugares.index(lugar_do(b)[0]), b["data"], b["concentracao"], sem_acento(b["nome"])))


def tracado_do(bloco):
    tracado = tracados.get(f"{bloco['subprefeitura']}|{bloco['itinerario']}")
    if not tracado or not tracado.get("linha"):
        # A lista às vezes põe o bloco numa subprefeitura vizinha (a Faria Lima 4100 aparece em
        # Santo Amaro): vale o traçado do mesmo itinerário em outra subprefeitura.
        tracado = next((v for k, v in tracados.items() if k.split("|", 1)[1] == bloco["itinerario"] and v.get("linha")), tracado)
    return tracado if tracado and tracado.get("linha") else None


def distancia_em_metros(a, b):
    x = (a[0] - b[0]) * math.cos(math.radians(a[1])) * 111320
    y = (a[1] - b[1]) * 110540
    return math.hypot(x, y)


# Os pontos de saída de cada lugar: quem sai a menos de PONTO_DE_SAIDA metros do primeiro bloco de um
# ponto sai do mesmo ponto. É o que junta os blocos do mesmo dia num cartão só, na aba Blocos: o
# circuito da República, por exemplo, tem saídas diferentes (Paissandu, República e Arouche).
PONTO_DE_SAIDA = 300
saidas_do_lugar, ponto_do_bloco = {}, {}
for bloco in ordem:
    tracado = tracado_do(bloco)
    if not tracado:
        continue
    saidas = saidas_do_lugar.setdefault(lugar_do(bloco)[0], [])
    inicio = tracado["linha"][0]
    numero = next((i for i, saida in enumerate(saidas) if distancia_em_metros(inicio, saida) <= PONTO_DE_SAIDA), None)
    if numero is None:
        saidas.append(inicio)
        numero = len(saidas) - 1
    ponto_do_bloco[id(bloco)] = numero
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
    " * estilo vêm de notícias, só nos blocos que elas citam, e os seguidores e o perfil de cada",
    " * artista, de contadores públicos do Instagram. Entram os blocos que têm atração divulgada,",
    " * que desfilam num circuito de megabloco ou que as notícias chamam de destaque da região.",
    " * Arquivo gerado por scripts/dados/gerar_dados.py: não mude à mão.",
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
    # O id sempre tem a data: assim ele não muda quando uma correção da lista dá outra data ao bloco.
    identificador = f"{base}-{dia}-{mes}"
    n = 2
    while identificador in usados:
        identificador = f"{base}-{dia}-{mes}-{n}"
        n += 1
    usados.add(identificador)
    nome = nomes_do_povo.get(bloco["nome"]) or nome_do_bloco(bloco["nome"])
    antigo = antigo_do(bloco)
    partes = [
        f"id: {ts(identificador)}",
        f"nome: {ts(nome)}",
        f"data: {ts(bloco['data'])}",
        f"inicio: {ts(bloco['concentracao'])}",
        f"desfile: {ts(bloco['desfile'])}",
        f"fim: {ts(bloco['termino'])}",
        f"localId: {ts(lugar_do(bloco)[0])}",
        *([f"ponto: {ponto_do_bloco[id(bloco)]}"] if id(bloco) in ponto_do_bloco else []),
        f"atracoes: {atracoes_em_ts(atracoes_do(bloco))}",
    ]
    if antigo and antigo.get("estilo"):
        partes.append(f"estilo: {ts(antigo['estilo'])}")
    if e_lgbt(bloco):
        partes.append("lgbt: true")
    if e_megabloco(bloco):
        partes.append("megabloco: true")
    linhas.append("  { " + ", ".join(re.sub(r"\s*\n\s*", " ", p) for p in partes) + " },")
    if bloco["itinerario"] not in indice_do_itinerario:
        indice_do_itinerario[bloco["itinerario"]] = len(itinerarios)
        itinerarios.append(bloco["itinerario"])
    itinerario_do_bloco[identificador] = indice_do_itinerario[bloco["itinerario"]]

    tracado = tracado_do(bloco)
    if tracado:
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
    " * Arquivo gerado por scripts/dados/gerar_dados.py: não mude à mão.",
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
    " * Arquivo gerado por scripts/dados/gerar_dados.py: não mude à mão.",
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
print("com artistas:", sum(1 for b in ordem if atracoes_do(b)), "· destaques sem artista:", sum(1 for b in ordem if destaque(b) and not atracoes_do(b)),
      "· megablocos:", sum(1 for b in ordem if e_megabloco(b)))
por_zona = {}
for bloco in ordem:
    por_zona[lugar_do(bloco)[2]] = por_zona.get(lugar_do(bloco)[2], 0) + 1
print("por zona:", ", ".join(f"{zona} {n}" for zona, n in sorted(por_zona.items())))

# ------------------------------------------------------------------ conferências
# Os testes do app usam uma cópia congelada dos dados de 2026 (app/src/app/dados/teste-2026), então
# quem confere os dados novos é este script. Avisa o que parece errado, sem parar.
avisos = []
# Quem começa na rua de um circuito, mas segue por outras, fica fora dele: vale conferir à mão.
for bloco in todos_os_oficiais:
    if grande_ponto_do(bloco) is None and any(comeca_na_rua(bloco["itinerario"], ponto[3]) for ponto in GRANDES_PONTOS):
        avisos.append(f"começa na rua de um circuito e segue por outras: {bloco['nome']} ({bloco['itinerario']})")
for bloco in ordem:
    if not bloco["concentracao"] <= bloco["desfile"] or not (bloco["termino"] > bloco["desfile"] or bloco["termino"] == "00:00"):
        avisos.append(f"horários fora de ordem: {bloco['nome']} ({bloco['data']}, {bloco['concentracao']}, {bloco['desfile']}, {bloco['termino']})")
for (codigo, _), indice in indice_do_trajeto.items():
    tracado = next(t for t in tracados.values() if t.get("linha") and codificar(t["linha"]) == codigo)
    # O retângulo da Grande São Paulo, o mesmo de app/src/app/mapa/limites.ts.
    if not all(-47.2 <= lng <= -46.2 and -23.95 <= lat <= -23.2 for lng, lat in tracado["linha"]):
        avisos.append(f"trajeto fora da Grande São Paulo: {tracado['linha'][0]}")
# Uma sigla dentro de um nome em maiúsculas perde as maiúsculas: vale conferir à mão.
for oficial in sorted({bloco["nome"].strip(" .") for bloco in ordem}):
    if nome_do_bloco(oficial) != oficial:
        avisos.append(f"nome em maiúsculas arrumado: {oficial} virou {nome_do_bloco(oficial)}")
# Um bloco LGBTQIA+ das notícias que não entrou no app (nome escrito diferente, ou bloco de fora).
for chave, data in sorted(lgbt - {(chave_do_nome(b["nome"]), b["data"]) for b in ordem}):
    avisos.append(f"bloco LGBTQIA+ das notícias que não está no app: {chave} ({data})")


# O nome que o povo usa: o que as notícias escrevem diferente da lista oficial vira sugestão, e um
# nome com o ano no fim ("Fico fei nunca 2025") parece cru. Só muda com uma fonte, em
# nomes-das-noticias.json.
def nome_comparavel(nome):
    return re.sub(r"[^a-z0-9]+", "", re.sub(r"^bloco\b", "", sem_acento(nome).strip()))


sugeridos = set()
for bloco in ordem:
    antigo = antigo_do(bloco)
    if bloco["nome"] in nomes_do_povo or not antigo:
        continue
    na_noticia = antigo["nome_nas_noticias"]
    if nome_comparavel(na_noticia) != nome_comparavel(bloco["nome"]) and (bloco["nome"], na_noticia) not in sugeridos:
        sugeridos.add((bloco["nome"], na_noticia))
        avisos.append(f"as notícias chamam de outro jeito: {bloco['nome']} é \"{na_noticia}\" (se for o nome que o povo usa, ponha em nomes-das-noticias.json)")
for oficial in sorted({bloco["nome"] for bloco in ordem if bloco["nome"] not in nomes_do_povo}):
    if re.search(r"\b(19|20)\d\d\s*$", oficial):
        avisos.append(f"nome com o ano no fim, talvez cru: {oficial} (troque só se uma fonte der o nome)")
# Um nome que diz "megabloco" sem notícia que confirme fica de fora, se não tiver outro motivo para entrar.
for oficial in sorted({b["nome"] for b in todos_os_oficiais if "megabloco" in sem_acento(b["nome"]) and b["nome"] not in megablocos}):
    avisos.append(f"o nome diz megabloco, mas nenhuma notícia confirma: {oficial} (se alguma disser, ponha em megablocos-das-noticias.json)")

# O que sumiu desde o ano anterior: os circuitos e os blocos grandes do histórico e os megablocos do
# ano anterior. Vale conferir: o bloco pode estar com outro nome, e o circuito, em outra rua.
ano_anterior = str(sobre["ano"] - 1)
historico = ler(os.path.join(projeto, "privado", "historico-dos-megablocos.json"), {})
pasta_anterior = os.path.join(os.path.dirname(os.path.abspath(pasta_do_ano)), ano_anterior)
conhecidos = {ponto[0] for ponto in GRANDES_PONTOS} | {CIRCUITO_DO_CENTRO[0]}
circuitos_do_ano = {grande_ponto_do(b)[0] for b in todos_os_oficiais if grande_ponto_do(b)}
for identificador, circuito in historico.get("circuitos", {}).items():
    if ano_anterior not in circuito["anos"]:
        continue
    if identificador not in conhecidos:
        avisos.append(f"circuito de {ano_anterior} que o script não reconhece: {circuito['nome']} (confira se ainda tem megabloco)")
    elif identificador not in circuitos_do_ano:
        avisos.append(f"circuito de {ano_anterior} sem nenhum bloco em {sobre['ano']}: {circuito['nome']}")


def esta_na_lista(nome):
    """Algum bloco da lista oficial tem este nome (ou o que vem entre parênteses, como o artista)."""
    partes = [re.sub(r"\(.*?\)", "", nome), *re.findall(r"\((.*?)\)", nome)]
    chaves = [chave_do_nome(parte) for parte in partes if len(chave_do_nome(parte)) >= 4]
    da_lista = [chave_do_nome(b["nome"]) for b in todos_os_oficiais]
    # Um nome dentro do outro vale ("Casa Comigo" e "Bloco Casa Comigo"), mas um pedaço pequeno não:
    # o "Bloco do Galo" não é o "Galo da Madrugada".
    return any(k in outra or (outra in k and len(outra) >= 0.6 * len(k)) for k in chaves for outra in da_lista)


grandes_do_ano_anterior = [b["nome"] for b in historico.get("blocos_que_voltam", []) if ano_anterior in b["anos"]]
grandes_do_ano_anterior += [d["nome"] for d in ler(os.path.join(pasta_anterior, "megablocos-das-noticias.json"), {"blocos": []})["blocos"]]
for nome in sorted(set(grandes_do_ano_anterior)):
    if not esta_na_lista(nome):
        avisos.append(f"bloco grande de {ano_anterior} que não está na lista de {sobre['ano']}: {nome}")
if not historico:
    avisos.append("sem privado/historico-dos-megablocos.json: não deu para conferir os circuitos e os blocos que sumiram")
if len(trajeto_do_bloco) < 0.8 * len(ordem):
    avisos.append(f"só {len(trajeto_do_bloco)} de {len(ordem)} blocos têm ponto no mapa (veja relatorio.txt)")
for aviso in avisos:
    print("AVISO:", aviso)
