"""Abre, no navegador, a ferramenta de conferir os pinos dos blocos no mapa.

Uso, na pasta do projeto: python -I scripts/dados/conferir_pinos.py 2027

Antes, rode o atualizar.py (ou só o gerar_dados.py): ele grava scripts/dados/<ano>/pinos-para-conferir.json,
com os pinos do app, dos blocos mais famosos para os menos.

Na ferramenta, para cada itinerário: "Está certo" (o pino e a linha passam a valer como exatos),
"Mover o pino" (tocar no mapa onde o bloco se concentra) ou "Sem ponto" (o bloco sai do mapa). Cada
escolha é gravada na hora em scripts/dados/<ano>/pinos-conferidos.json, que o gerar_dados.py usa e
que nenhum script apaga: rodar o atualizar.py de novo não perde o que foi conferido. Um itinerário
que já foi conferido no ano anterior, com o mesmo texto, aparece com a sugestão de usar o mesmo pino.

Quando acabar, rode de novo o gerar_dados.py (o comando aparece aqui embaixo, ao fechar).

O mapa é o do app (app/public/mapa) e o MapLibre vem de app/node_modules: funciona sem internet. O
servidor só atende este computador (127.0.0.1).
"""

import json
import mimetypes
import os
import re
import sys
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

AQUI = os.path.dirname(os.path.abspath(__file__))
PROJETO = os.path.dirname(os.path.dirname(AQUI))
PAGINA = os.path.join(AQUI, "conferir-pinos.html")
MAPA = os.path.join(PROJETO, "app", "public", "mapa")
MAPLIBRE = os.path.join(PROJETO, "app", "node_modules", "maplibre-gl", "dist")
ARQUIVOS_DO_MAPLIBRE = {"maplibre-gl.mjs", "maplibre-gl-worker.mjs", "maplibre-gl.css"}
PORTA = 8765
# O retângulo da Grande São Paulo, o mesmo de app/src/app/mapa/limites.ts.
LIMITES = (-47.2, -23.95, -46.2, -23.2)
SOBRE = (
    "Os pinos que eu conferi à mão na ferramenta (scripts/dados/conferir_pinos.py). A chave é a "
    "subprefeitura e o itinerário da lista oficial. tipo 'certo': o pino e a linha automáticos valem "
    "como exatos; 'ponto': o pino vai para [longitude, latitude] (com a linha automática só se "
    "'linha' for true); 'sem-ponto': o bloco fica fora do mapa. O gerar_dados.py usa este arquivo."
)
# O Windows às vezes diz que .mjs é texto, e aí o navegador não roda o MapLibre.
TIPOS = {".mjs": "text/javascript", ".js": "text/javascript", ".pbf": "application/x-protobuf",
         ".json": "application/json", ".css": "text/css", ".html": "text/html; charset=utf-8"}


def ler(caminho, sem_o_arquivo):
    if not os.path.exists(caminho):
        return sem_o_arquivo
    return json.load(open(caminho, encoding="utf-8"))


def gravar(caminho, dados):
    temporario = caminho + ".tmp"
    with open(temporario, "w", encoding="utf-8", newline="\n") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)
        arquivo.write("\n")
    os.replace(temporario, caminho)


def decisao_valida(decisao):
    """Confere o que a página mandou, para não gravar nada estranho no arquivo."""
    if not isinstance(decisao, dict) or decisao.get("tipo") not in ("certo", "ponto", "sem-ponto"):
        return None
    if decisao["tipo"] != "ponto":
        return {"tipo": decisao["tipo"]}
    ponto = decisao.get("ponto")
    if not (isinstance(ponto, list) and len(ponto) == 2 and all(isinstance(n, (int, float)) for n in ponto)):
        return None
    lng, lat = ponto
    if not (LIMITES[0] <= lng <= LIMITES[2] and LIMITES[1] <= lat <= LIMITES[3]):
        return None
    return {"tipo": "ponto", "ponto": [round(lng, 5), round(lat, 5)], "linha": decisao.get("linha") is True}


argumentos = [argumento for argumento in sys.argv[1:] if argumento != "--sem-navegador"]
if len(argumentos) != 1 or not re.fullmatch(r"20\d\d", argumentos[0]):
    sys.exit("Uso: python -I scripts/dados/conferir_pinos.py 2027")
ano = argumentos[0]
pasta_do_ano = os.path.join(AQUI, ano)
para_conferir_arquivo = os.path.join(pasta_do_ano, "pinos-para-conferir.json")
conferidos_arquivo = os.path.join(pasta_do_ano, "pinos-conferidos.json")
anterior_arquivo = os.path.join(AQUI, str(int(ano) - 1), "pinos-conferidos.json")
if not os.path.exists(para_conferir_arquivo):
    sys.exit(f"Falta scripts/dados/{ano}/pinos-para-conferir.json: rode antes o atualizar.py (ou o gerar_dados.py).")
para_conferir = ler(para_conferir_arquivo, [])
chaves = {item["chave"] for item in para_conferir}
trava = threading.Lock()


class Ferramenta(BaseHTTPRequestHandler):
    def responder(self, status, corpo, tipo="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corpo)

    def responder_json(self, status, dados):
        self.responder(status, json.dumps(dados, ensure_ascii=False).encode("utf-8"))

    def arquivo(self, base, relativo):
        caminho = os.path.realpath(os.path.join(base, relativo))
        if not caminho.startswith(os.path.realpath(base) + os.sep) or not os.path.isfile(caminho):
            self.responder(404, b"", "text/plain")
            return
        extensao = os.path.splitext(caminho)[1]
        tipo = TIPOS.get(extensao) or mimetypes.guess_type(caminho)[0] or "application/octet-stream"
        self.responder(200, open(caminho, "rb").read(), tipo)

    def do_GET(self):
        endereco = self.path.split("?", 1)[0]
        if endereco == "/":
            self.arquivo(AQUI, "conferir-pinos.html")
        elif endereco == "/dados":
            with trava:
                conferidos = ler(conferidos_arquivo, {"pinos": {}})["pinos"]
            anteriores = ler(anterior_arquivo, {"pinos": {}})["pinos"]
            self.responder_json(200, {
                "ano": int(ano),
                "para_conferir": para_conferir,
                "conferidos": conferidos,
                "do_ano_anterior": {chave: valor for chave, valor in anteriores.items() if chave in chaves},
            })
        elif endereco.startswith("/maplibre/") and endereco[len("/maplibre/"):] in ARQUIVOS_DO_MAPLIBRE:
            self.arquivo(MAPLIBRE, endereco[len("/maplibre/"):])
        elif endereco.startswith("/mapa/"):
            self.arquivo(MAPA, endereco[len("/mapa/"):])
        else:
            self.responder(404, b"", "text/plain")

    def do_POST(self):
        if self.path != "/conferidos":
            self.responder(404, b"", "text/plain")
            return
        try:
            pedido = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        except ValueError:
            self.responder_json(400, {"erro": "pedido sem JSON"})
            return
        chave = pedido.get("chave")
        if chave not in chaves:
            self.responder_json(400, {"erro": "itinerário que não está na lista"})
            return
        decisao = None if pedido.get("decisao") is None else decisao_valida(pedido.get("decisao"))
        if pedido.get("decisao") is not None and decisao is None:
            self.responder_json(400, {"erro": "decisão inválida"})
            return
        with trava:
            dados = ler(conferidos_arquivo, {"pinos": {}})
            dados["_sobre"] = SOBRE
            if decisao is None:
                dados["pinos"].pop(chave, None)
            else:
                dados["pinos"][chave] = decisao
            dados["pinos"] = dict(sorted(dados["pinos"].items()))
            gravar(conferidos_arquivo, {"_sobre": SOBRE, "pinos": dados["pinos"]})
        self.responder_json(200, {"decisao": decisao, "conferidos": len(dados["pinos"])})

    def log_message(self, formato, *argumentos):
        pass


servidor = ThreadingHTTPServer(("127.0.0.1", PORTA), Ferramenta)
endereco = f"http://127.0.0.1:{PORTA}/"
print(f"A ferramenta está em {endereco} (Ctrl+C para fechar).", flush=True)
if "--sem-navegador" not in sys.argv:
    webbrowser.open(endereco)
try:
    servidor.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    servidor.server_close()
    print(f"\nPara os pinos valerem no app: python -I scripts/dados/gerar_dados.py scripts/dados/{ano} app/src/app/dados")
