# Design do CarnaVou

Aqui ficam a logo e as imagens que eu uso de referência para o visual. Cada imagem tem a
sua legenda.

## Logo

A logo oficial é um pin de mapa com uma máscara de carnaval, e o "o" do "Vou" também é um
pin. Cores da logo: fundo `#130A29`, amarelo `#FFC200`, rosa `#E21D89` e laranja `#FB6F18`.

| Imagem | Legenda |
|---|---|
| [`logo/logo-oficial.jpg`](logo/logo-oficial.jpg) | A logo oficial do CarnaVou, do jeito que chegou (2752 × 1536 pixels): com o fundo escuro e o confete. Por isso ela não vai direto para o site. |
| [`logo/logo-emblema.png`](logo/logo-emblema.png) | Só o pin com a máscara, com o fundo transparente. Serve para o cabeçalho e para o ícone do app. |
| [`logo/logo-palavra.png`](logo/logo-palavra.png) | Só a palavra "CarnaVou", com o fundo transparente. Serve para o cabeçalho. |

As versões leves que o site usa ficam em `app/public/logo/` e os ícones do app em
`app/public/icons/`. Se a logo mudar, eu gero tudo de novo a partir desta pasta.

## Referências

| Imagem | Legenda |
|---|---|
| [`referencias/desenho-arvore-de-opcoes.webp`](referencias/desenho-arvore-de-opcoes.webp) | Meu primeiro desenho do app, feito à mão: uma árvore de opções. Em destaque (os lugares), depois um lugar (os dias de festa e os principais artistas) e depois um bloco (a lista detalhada de atrações). |
| [`referencias/referencia-visual-do-app.webp`](referencias/referencia-visual-do-app.webp) | Uma imagem de referência de como o visual poderia ficar: fundo roxo escuro, cartões brancos e botões amarelos. Serviu de inspiração para a paleta. O nome "FoliaON" que aparece nela não é o nosso. |
| [`referencias/anotacoes-tela-em-destaque.png`](referencias/anotacoes-tela-em-destaque.png) | A tela Em destaque, com as minhas anotações em vermelho: mostrar os artistas da semana em cada lugar e dar uma cor de faixa para cada um, num padrão de cinco cores. (É da versão antiga, com o cabeçalho roxo.) |
| [`referencias/anotacoes-tela-do-bloco.png`](referencias/anotacoes-tela-do-bloco.png) | A tela do bloco, com as minhas anotações em vermelho: mostrar o público-alvo quando for claro (como LGBTQIA+, mulheres ou eletrônica) e, mais pra frente, "possíveis próximos blocos" ou "blocos próximos a esse". (É da versão antiga, com o cabeçalho roxo.) |
| [`referencias/anotacoes-artistas-em-destaque.png`](referencias/anotacoes-artistas-em-destaque.png) | A tela Em destaque da versão 0.3.1, com as minhas anotações em vermelho: tirar o "da semana" e deixar os artistas em maior destaque, talvez com o primeiro nome em negrito e um pouco maior. |
| [`referencias/desenho-hoje-amanha-geral.webp`](referencias/desenho-hoje-amanha-geral.webp) | Meu segundo desenho: a tela inicial com um filtro "Hoje / Amanhã / Geral" no topo, a seção "Em alta" e um selo em cada lugar ("Já começou", "Em breve" ou o número de blocos que vão passar por ali). |
| [`referencias/macadam-mapa.jpg`](referencias/macadam-mapa.jpg) | O mapa do Macadam, de que eu gosto: o mapa tem as cores da marca do app (um lilás suave com ruas mais claras), os pontos são pinos do mesmo formato, a pessoa aparece com a própria foto, e os botões redondos ficam à direita. Embaixo, um cartão com destaque e a barra do menu. |
| [`referencias/macadam-mapa-aproximado.jpg`](referencias/macadam-mapa-aproximado.jpg) | O mesmo mapa, mais de perto: mostra a posição da pessoa com um círculo de precisão, os nomes dos lugares (como praças e ruas) e etiquetas de distância ("140m", "420m") nos pontos que estão perto. |
| [`referencias/macadam-inicio.jpg`](referencias/macadam-inicio.jpg) | A tela inicial do Macadam: números e botão grande bem à mostra, cartões com cantos redondos, uma fonte de título bem pesada e uma barra de progresso com recompensas. |
| [`referencias/macadam-social.jpg`](referencias/macadam-social.jpg) | A tela social do Macadam: filtros de período em botões (Dia, Semana, Mês, Ano) e cartões com foto, nome e número. Eu pensei em deixar a parte social por último, porque não é o foco. |
| [`referencias/macadam-pedido-de-localizacao.jpg`](referencias/macadam-pedido-de-localizacao.jpg) | Como o Macadam pede a localização: uma tela explica para que serve antes de aparecer o aviso do celular, e o botão "Próximo" leva ao aviso. Eu quero fazer parecido. |

## Mapa

| Arquivo | Legenda |
|---|---|
| [`mapa/gerar-estilo-do-mapa.py`](mapa/gerar-estilo-do-mapa.py) | O script que gera o estilo do mapa, nas cores lilás do CarnaVou. Ele pega o estilo "positron" da OpenFreeMap, pinta com as nossas cores e grava em `app/public/mapa/estilo-carnavou.json`. Para mudar o visual do mapa, eu mudo as cores nele e rodo de novo. |
| [`mapa/gerar-circuitos.py`](mapa/gerar-circuitos.py) | O script que gera os trajetos dos megablocos (os circuitos que a CET publicou). Ele acha os pontos no OpenStreetMap, traça o caminho pelas ruas e grava em `app/src/app/dados/circuitos.ts`. Para mudar um trajeto, eu mudo a lista no começo dele e rodo de novo. |
