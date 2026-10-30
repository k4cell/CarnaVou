"""Atualiza os dados do app para um ano: da lista oficial (o PDF) até os arquivos de app/src/app/dados.

Uso, na pasta do projeto: python -I design/dados/atualizar.py 2027

Antes, ponha na pasta design/dados/2027 (copie a de 2026 como modelo):
- lista-oficial.pdf: a lista dos blocos aprovados que a Prefeitura publica no Diário Oficial;
- sobre.json: o ano e o nome da publicação oficial;
- atracoes-das-noticias.json: os artistas que as notícias dão para os blocos (pode começar com []);
- destaques-das-noticias.json (se tiver): blocos sem artista que as notícias destacam.

O que ele faz, em ordem:
1. Lê o PDF (pdftotext -raw) e grava blocos-oficiais.json (ler_tabela.py).
2. Baixa as ruas do OpenStreetMap, só se ainda não tiver (baixar_ruas.py). Elas ficam fora do
   projeto, em ~/.cache/carnavou/ruas (uns 300 MB, que o OneDrive não precisa guardar), e valem
   para todos os anos. Baixar tudo leva perto de uma hora.
3. Acha o pino de cada bloco no mapa (a concentração) e a linha do trajeto (tracar.py), e grava
   tracados.json e relatorio.txt (os itinerários que não deram certo). É a etapa mais lenta:
   passou de 8 minutos no meu computador. Os endereços e as rotas já procurados ficam em
   design/dados/cache e não são pedidos de novo; cada um novo leva um segundo.
4. Grava os arquivos do app (gerar_dados.py).
5. Troca o ano na descrição do site (app/src/index.html).

O "hoje" de demonstração do app acompanha os dados sozinho (o primeiro sábado com bloco) e o aviso
de teste mostra o ano dos blocos. Depois, rode os testes: os que conferem um bloco de 2026 pelo
nome vão precisar de ajuste com os dados de outro ano.
"""

import json
import os
import re
import shutil
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
PROJETO = os.path.dirname(os.path.dirname(AQUI))
DADOS_DO_APP = os.path.join(PROJETO, "app", "src", "app", "dados")
RUAS = os.path.join(os.path.expanduser("~"), ".cache", "carnavou", "ruas")
PRECISA = ["lista-oficial.pdf", "sobre.json", "atracoes-das-noticias.json"]


def rodar(script, *argumentos, saida=None):
    print(f"\n== {script}", flush=True)
    comando = [sys.executable, "-I", os.path.join(AQUI, script), *argumentos]
    if saida is None:
        subprocess.run(comando, check=True)
        return
    resultado = subprocess.run(comando, check=True, capture_output=True, text=True, encoding="utf-8")
    open(saida, "w", encoding="utf-8", newline="\n").write(resultado.stdout)
    print(resultado.stdout.splitlines()[0] if resultado.stdout else "")


if len(sys.argv) != 2 or not re.fullmatch(r"20\d\d", sys.argv[1]):
    sys.exit("Uso: python -I design/dados/atualizar.py 2027")
ano = sys.argv[1]
pasta_do_ano = os.path.join(AQUI, ano)
faltam = [arquivo for arquivo in PRECISA if not os.path.exists(os.path.join(pasta_do_ano, arquivo))]
if faltam:
    sys.exit(f"Faltam na pasta design/dados/{ano}: {', '.join(faltam)}")
if json.load(open(os.path.join(pasta_do_ano, "sobre.json"), encoding="utf-8"))["ano"] != int(ano):
    sys.exit(f"O sobre.json de design/dados/{ano} é de outro ano.")
pdftotext = shutil.which("pdftotext")
if not pdftotext:
    sys.exit("Não achei o pdftotext (vem com o Git para Windows, em mingw64/bin, ou com o Poppler).")

# 1. A lista oficial.
cru = os.path.join(pasta_do_ano, "lista-oficial.txt")
print("== pdftotext", flush=True)
subprocess.run([pdftotext, "-raw", "-enc", "UTF-8", os.path.join(pasta_do_ano, "lista-oficial.pdf"), cru], check=True)
oficiais = os.path.join(pasta_do_ano, "blocos-oficiais.json")
rodar("ler_tabela.py", cru, oficiais)
os.remove(cru)
datas = {bloco["data"][:4] for bloco in json.load(open(oficiais, encoding="utf-8"))}
if datas != {ano}:
    sys.exit(f"A lista oficial tem blocos de {sorted(datas)}, e não só de {ano}.")

# 2. As ruas (uma vez só, para todos os anos: o script pula o que já baixou).
rodar("baixar_ruas.py", RUAS)

# 3. O ponto e a linha de cada bloco.
rodar(
    "tracar.py",
    oficiais,
    RUAS,
    os.path.join(AQUI, "cache", "enderecos.json"),
    os.path.join(pasta_do_ano, "tracados.json"),
    saida=os.path.join(pasta_do_ano, "relatorio.txt"),
)

# 4. Os arquivos do app.
rodar("gerar_dados.py", pasta_do_ano, DADOS_DO_APP)

# 5. O ano na descrição do site.
index = os.path.join(PROJETO, "app", "src", "index.html")
texto = open(index, encoding="utf-8").read()
novo = re.sub(r"(blocos do carnaval de )20\d\d", rf"\g<1>{ano}", texto)
if novo != texto:
    open(index, "w", encoding="utf-8", newline="\n").write(novo)

print(f"\nPronto: os dados de {ano} estão em app/src/app/dados. Rode os testes e o build (dentro de app/).")
