"""Baixa do OpenStreetMap (Overpass) as ruas, praças e pontos de cada subprefeitura.

Uso: python -I baixar_ruas.py pasta_de_saida

A área de cada subprefeitura é a caixa que envolve os distritos dela (Lei 13.399/2002), com
uma folga de ~1 km, porque os trajetos às vezes passam um pouco da divisa.
"""

import json
import os
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

SERVIDOR = "https://overpass-api.de/api/interpreter"
QUEM_PEDE = {"User-Agent": "CarnaVou/0.11 (pesquisa de dados abertos)"}
FOLGA = 0.01  # graus, ~1 km

DISTRITOS = {
    "Aricanduva/Vila Formosa": ["Aricanduva", "Carrão", "Vila Formosa"],
    "Butantã": ["Butantã", "Morumbi", "Raposo Tavares", "Rio Pequeno", "Vila Sônia"],
    "Campo Limpo": ["Campo Limpo", "Capão Redondo", "Vila Andrade"],
    "Capela do Socorro": ["Cidade Dutra", "Grajaú", "Socorro"],
    "Casa Verde": ["Casa Verde", "Cachoeirinha", "Limão"],
    "Cidade Ademar": ["Cidade Ademar", "Pedreira"],
    "Cidade Tiradentes": ["Cidade Tiradentes"],
    "Ermelino Matarazzo": ["Ermelino Matarazzo", "Ponte Rasa"],
    "Freguesia/Brasilândia": ["Freguesia do Ó", "Brasilândia"],
    "Guaianases": ["Guaianases", "Lajeado"],
    "Ipiranga": ["Ipiranga", "Cursino", "Sacomã"],
    "Itaim Paulista": ["Itaim Paulista", "Vila Curuçá"],
    "Itaquera": ["Itaquera", "Cidade Líder", "José Bonifácio", "Parque do Carmo"],
    "Jabaquara": ["Jabaquara"],
    "Jaçanã/Tremembé": ["Jaçanã", "Tremembé"],
    "Lapa": ["Lapa", "Barra Funda", "Jaguara", "Jaguaré", "Perdizes", "Vila Leopoldina"],
    "M'Boi Mirim": ["Jardim Ângela", "Jardim São Luís"],
    "Mooca": ["Mooca", "Água Rasa", "Belém", "Brás", "Pari", "Tatuapé"],
    "Parelheiros": ["Parelheiros", "Marsilac"],
    "Penha": ["Penha", "Artur Alvim", "Cangaíba", "Vila Matilde"],
    "Perus": ["Perus", "Anhanguera"],
    "Pinheiros": ["Pinheiros", "Alto de Pinheiros", "Itaim Bibi", "Jardim Paulista"],
    "Pirituba/Jaraguá": ["Pirituba", "Jaraguá", "São Domingos"],
    "Santana/Tucuruvi": ["Santana", "Tucuruvi", "Mandaqui"],
    "Santo Amaro": ["Santo Amaro", "Campo Belo", "Campo Grande"],
    "São Mateus": ["São Mateus", "Iguatemi", "São Rafael"],
    "São Miguel Paulista": ["São Miguel", "Jardim Helena", "Vila Jacuí"],
    "Sapopemba": ["Sapopemba"],
    "Sé": ["Sé", "Bela Vista", "Bom Retiro", "Cambuci", "Consolação", "Liberdade", "República", "Santa Cecília"],
    "Vila Maria/Vila Guilherme": ["Vila Maria", "Vila Guilherme", "Vila Medeiros"],
    "Vila Mariana": ["Vila Mariana", "Moema", "Saúde"],
    "Vila Prudente": ["Vila Prudente", "São Lucas"],
}


def sem_acento(texto):
    return unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()


def perguntar(consulta):
    for tentativa in range(5):
        try:
            dados = urllib.parse.urlencode({"data": consulta}).encode()
            pedido = urllib.request.Request(SERVIDOR, data=dados, headers=QUEM_PEDE)
            with urllib.request.urlopen(pedido, timeout=300) as resposta:
                return json.load(resposta)
        except Exception as erro:  # servidor ocupado: espera e tenta de novo
            print("   tentativa", tentativa + 1, "falhou:", erro, flush=True)
            time.sleep(30 * (tentativa + 1))
    raise RuntimeError("o Overpass não respondeu")


pasta = sys.argv[1]
os.makedirs(pasta, exist_ok=True)

caminho_distritos = os.path.join(pasta, "distritos.json")
if not os.path.exists(caminho_distritos):
    # Os distritos de São Paulo (admin_level 9), com a caixa de cada um.
    distritos = perguntar(
        '[out:json][timeout:120];area["name"="São Paulo"]["admin_level"="8"]->.sp;'
        'rel(area.sp)["boundary"="administrative"]["admin_level"="9"];out tags bb;'
    )
    json.dump(distritos, open(caminho_distritos, "w", encoding="utf-8"), ensure_ascii=False)
distritos = json.load(open(caminho_distritos, encoding="utf-8"))["elements"]
caixas = {sem_acento(d["tags"]["name"]): d["bounds"] for d in distritos}

for numero, (sub, nomes) in enumerate(DISTRITOS.items(), start=1):
    arquivo = os.path.join(pasta, f"{numero:02d}.json")
    if os.path.exists(arquivo):
        continue
    faltando = [n for n in nomes if sem_acento(n) not in caixas]
    if faltando:
        raise SystemExit(f"{sub}: não achei os distritos {faltando}")
    sul = min(caixas[sem_acento(n)]["minlat"] for n in nomes) - FOLGA
    oeste = min(caixas[sem_acento(n)]["minlon"] for n in nomes) - FOLGA
    norte = max(caixas[sem_acento(n)]["maxlat"] for n in nomes) + FOLGA
    leste = max(caixas[sem_acento(n)]["maxlon"] for n in nomes) + FOLGA
    caixa = f"{sul},{oeste},{norte},{leste}"
    print(numero, sub, caixa, flush=True)
    consulta = (
        f"[out:json][timeout:280][bbox:{caixa}];"
        "(way[highway][name];way[place=square][name];way[leisure][name];way[tourism][name];"
        "way[historic][name];way[amenity][name];way[building][name];"
        "node[place=square][name];node[historic][name];node[tourism][name];node[amenity][name];"
        "node[leisure][name];);out body geom qt;"
    )
    resposta = perguntar(consulta)
    resposta["subprefeitura"] = sub
    resposta["caixa"] = [sul, oeste, norte, leste]
    json.dump(resposta, open(arquivo, "w", encoding="utf-8"), ensure_ascii=False)
    print("   ", len(resposta["elements"]), "elementos", flush=True)
    time.sleep(5)
print("pronto")
