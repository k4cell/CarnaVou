# Como trabalhar no CarnaVou

Leia o [`README.md`](README.md) antes de tudo: ali estão a ideia, o que eu já decidi, o
calendário e o que eu ainda não pensei.

## Comigo

- O projeto é meu: eu tenho as ideias, tomo as decisões e acompanho o código como gerente.
  Você me ajuda a executar e assume o comando do código: escolhe como fazer, e eu confiro.
- Fale sempre em **português do Brasil**, de forma simples e direta. Prefira respostas
  curtas.
- **Eu tenho a palavra final.** A gente decide junto, com o tempo. Traga informação que
  ajude (custos, limites, riscos) e dê sua recomendação, mas não fique debatendo
  "concordo / não concordo" depois que eu decidi.
- Às vezes eu dito por voz e saem palavras trocadas. Entenda pelo sentido e, se ficar
  ambíguo, pergunte.
- Use o [`docs/planejamento-do-mapa.md`](docs/planejamento-do-mapa.md) para me dizer, a cada
  passo, **o que foi feito, o que falta e quais são os próximos passos**. Mantenha a seção
  "Andamento" dele em dia.

## Como escrever os documentos

- O `README.md` e os arquivos em `docs/` são escritos **na primeira pessoa, como se eu
  estivesse escrevendo**: "eu tive a ideia", "eu decidi". Nada de "o dono", e não cite o
  Claude nesses arquivos.

## Fase atual: beta

- Já pode programar. A tela principal é a aba **Blocos** (o que está rolando agora e o que vem,
  com o filtro Hoje / Amanhã / Geral). O Descobrir é uma **árvore de opções**: Em alta (os
  lugares), um lugar (os dias de festa e os principais artistas) e um bloco (a lista detalhada de
  atrações). Embaixo fica o menu fixo: Blocos, Descobrir, After e Mapa. As abas Amigos e
  Favoritos saíram até eu decidir o que serão: não crie páginas vazias. Os dados de teste são o carnaval
  de rua de 2026 **de verdade, com nomes reais** (ver `docs/dados-carnaval-2026.md`). Fica de fora, por enquanto, o "Vou", o "Tô aqui" e o "Como tá?".
- O visual tem só a **primeira camada de cor**. A paleta fica em variáveis no topo de
  `app/src/styles.scss`: use sempre essas variáveis, nunca uma cor solta. Fundo claro (pra
  ler no sol); o cabeçalho usa o fundo escuro da logo (`--noite`). Roxo nos títulos e
  amarelo nos botões. As sete cores (rosa, amarelo, verde, laranja, roxo, vermelho e azul) se
  revezam nas faixas dos cartões, do rosa ao azul. Cada zona da cidade tem a sua cor na
  etiqueta: Centro roxo, Sul verde, Leste amarelo, Oeste vermelho e Norte azul. A borda de
  fora da página (`html`) tem a cor escura do cabeçalho: nunca deixe branca. Amarelo, verde e laranja só como fundo, com texto escuro. Rosa nunca
  em texto pequeno. Sem degradê. As letras e o resto do estilo eu decido mais pra frente:
  não capriche antes de eu pedir.
- Os **selos** dos cartões têm cor, pensada para ler no sol (fundo forte, texto escuro):
  verde "Já começou", amarelo "Hoje às…"/"Amanhã às…", cinza "Já acabou". O app mostra só o
  presente e o futuro: o que é de um dia que já passou some das listas.
- Antes de mexer no mapa ou na forma de guardar os dados, leia
  [`docs/planejamento-do-mapa.md`](docs/planejamento-do-mapa.md): ali estão as regras pra não
  travar o futuro (dados atrás da camada de consulta, ids e endereços que não mudam, mapa
  isolado num componente, tudo que depende de data passando pelo relógio).
- Toda decisão nova vai para a tabela "O que já decidi" do `README.md`, na hora em que eu
  decidir.
- O que está em [`docs/ideias-em-aberto.md`](docs/ideias-em-aberto.md) são **sugestões que
  eu ainda não aprovei**. Não trate como decisão e não construa nada dali sem eu aprovar.
  Quando eu aprovar ou descartar uma delas, atualize o arquivo e o README.

## Código

- O site é um Angular na pasta `app/`: instala como app (PWA), páginas geradas prontas
  (SSR com prerender) e sem `zone.js`.
- Comandos, rodando dentro de `app/`:
  - `ng serve`: abre o site em `http://localhost:4200`;
  - `ng test --no-watch`: roda os testes;
  - `ng build`: gera a versão de produção.
- **Tem que ser leve.** O povo vai usar no celular fraco, com internet ruim no meio da
  multidão. Sem fontes da internet nem bibliotecas pesadas, e o que não for da primeira
  tela (como o mapa) só carrega quando for aberto.
- As telas ficam em `destaques/`, `local/`, `bloco/`, `lista-de-blocos/` (a aba Blocos) e
  `mapa/`; o banner que se repete fica em `banner/`, o menu de baixo em `menu/` e a seta de
  voltar do cabeçalho em `voltar/`. O filtro Hoje / Amanhã / Geral é um só para a aba Blocos,
  o Descobrir, o mapa e a página do lugar: o estado fica em `filtro/` e os botões em `abas/`.
  Os endereços são `/` (a aba Blocos), `/descobrir`, `/local/:local`, `/local/:local/:bloco`,
  `/after` e `/mapa` (o antigo `/blocos` leva para `/`), e cada um vira uma página pronta no
  `ng build`. Na aba Blocos, os blocos do mesmo dia no mesmo circuito de megabloco
  (`Local.circuito`) ficam num cartão só, um embaixo do outro, para quem está ali ver que o
  próximo é no mesmo lugar.
- As páginas prontas não sabem o dia de hoje. O que depende da data (as abas Hoje e Amanhã
  e os selos) é calculado no navegador, depois da primeira pintura, pelo serviço em
  `relogio/`. Pra testar, abra o site com `?hoje=2027-02-06T14:00` no endereço: aí "hoje" fica
  parado nessa data e a tela avisa que é uma data de teste.
- **O mapa** (`mapa/`) usa o MapLibre com o mapa da OpenFreeMap. Só o `MapaBase`
  (`mapa-base.ts`) conhece o MapLibre; o resto do app entrega uma lista de pontos e escuta
  qual foi tocado. O MapLibre não faz parte do código do Angular: o
  `angular.json` copia `maplibre-gl.mjs`, `maplibre-gl-worker.mjs` e `maplibre-gl.css` de
  `node_modules` para `mapa/`, e o `maplibre.ts` só baixa esses arquivos quando abro a aba
  Mapa. O service worker (`ngsw-config.json`, grupo `mapa`) só guarda o que eu abri. O estilo do mapa é o `app/public/mapa/estilo-carnavou.json`, gerado por
  `design/mapa/gerar-estilo-do-mapa.py` (rode de novo para mudar as cores). Nos testes o
  MapLibre é trocado por um falso (`maplibre-falso.ts`), sem WebGL nem internet. Os
  créditos "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" têm que continuar à vista.
- **Os dados** (`locais.ts`, `blocos.ts`, `itinerarios.ts` e `pontos-dos-blocos.ts`) são
  gerados pelos scripts de `design/dados/` a partir da lista oficial do Diário Oficial: não
  edite à mão. Cada ano tem a sua pasta (`design/dados/2026/`: o PDF oficial, as notícias e o
  que sai dos scripts), e um comando só refaz tudo: `python -I design/dados/atualizar.py 2027`. Os
  testes usam uma cópia congelada dos dados de 2026 (`dados/teste-2026/`, trocada pela configuração
  `testes` do `angular.json`): não atualize essa cópia ao mudar de ano. Quem confere os dados novos é
  o `gerar_dados.py`, que avisa o que parece errado. O ponto da concentração e a linha de cada bloco vêm do itinerário oficial casado
  com as ruas do OpenStreetMap; quando não dá certeza, o ponto fica marcado como aproximado ou o
  bloco fica sem ponto. `trajetoDoBloco` (`dados/trajetos.ts`) e `itinerarioDoBloco`
  (`dados/itinerario.ts`) ficam separados das outras consultas, para só serem baixados com o
  mapa e a página do bloco.
- **Sem internet:** o service worker (`ngsw-config.json`) entrega a casca vazia
  `index.csr.html` para qualquer endereço (nunca a tela inicial pronta) e guarda o mapa: o grupo
  `mapa` (MapLibre, worker, estilo) e os `dataGroups` da OpenFreeMap (índice, letras, ícones).
  Os pedaços do mapa ficam no cache do navegador. O aviso "Sem internet" vem do serviço
  `Conexao` (`conexao/`). Para testar o build como no ar, use um servidor de arquivos que mande
  `.mjs` como JavaScript (o `http.server` do Python no Windows manda como texto, e o mapa não
  abre).
- **A cor de cada lugar** vem de `faixaDoLocal`, em `dados/consultas.ts`, e é uma só para a
  lista, os banners da página do lugar e as atrações do bloco. Quem tem `data-faixa` passa a
  cor (`--cor-da-faixa`, em `styles.scss`) para tudo o que está dentro dele: numa tela nova de
  lugar ou de bloco, ponha `data-faixa` e use `var(--cor-da-faixa)`, nunca um rosa fixo. A cor
  tem que acompanhar o lugar até o fim.
- **O botão de copiar o link** (`copiar-link/`) copia o endereço limpo da página, sem a data de
  teste (`?hoje=`). Nos testes, o `COPIAR_TEXTO` é trocado por um falso.
- **A localização** (`localizacao/`): o serviço `Localizacao` só procura a posição quando eu
  toco em "onde estou" (uma leitura por toque), e a tela `ExplicacaoDaLocalizacao` vem antes do
  aviso do celular. **Nunca** acompanhe o caminho, use a localização em segundo plano, guarde a
  posição (nem no `localStorage`) ou envie a posição para algum lugar. Quem negar continua
  usando o mapa. O navegador do computador não tem GPS: para ver a tela funcionando, troque
  `navigator.geolocation.getCurrentPosition` e `navigator.permissions.query` pelo console.
  Nos testes, `geolocalizacao-falsa.ts` faz o papel do celular.
- A logo e as imagens de referência ficam em `design/`, cada uma com legenda no
  `design/README.md`. O que o site usa fica em `app/public/logo/` e `app/public/icons/`:
  se a logo mudar, gere de novo a partir de `design/logo/`.
- Os dados ficam em `app/src/app/dados/`: `locais.ts` (os lugares: os grandes pontos, como o
  Parque Ibirapuera, e, para os outros blocos, a subprefeitura) e `blocos.ts` (os blocos
  aprovados do carnaval de rua de 2026). Por decisão minha, entram só os blocos com atração
  divulgada, num circuito de megabloco ou, na Zona Leste e na Norte, os que as notícias chamam
  de destaque da região (`design/dados/2026/destaques-das-noticias.json`). A ordem é
  por fama: a soma dos seguidores no Instagram dos artistas (`design/dados/seguidores.json`). **Não invente
  dado**: só vale o que uma fonte diz e, na dúvida, deixe em branco. A fonte oficial é o
  Diário Oficial (dados abertos da Prefeitura); **não copie dados do site Carnaval SP**, porque os
  termos dele proíbem copiar e comercializar. As fontes e a confiança
  de cada bloco estão em `docs/dados-carnaval-2026.md`; se achar uma divergência nova,
  anote lá. O "hoje" do app é o primeiro sábado com bloco, 07/02/2026 (`DATA_DE_DEMONSTRACAO`,
  em `relogio/`), e a tela
  avisa que é data de teste. O site no ar usa a simulação de 2026, com o aviso de versão de
  teste no alto de toda página (`aviso-de-teste/`): decidi assim. Quando os dados de 2027
  saírem, pergunte se eu quero trocar.
- Antes de publicar o site, siga os **Cuidados para publicar** do
  [`docs/planejamento-do-mapa.md`](docs/planejamento-do-mapa.md). E mantenha a lista **O que
  ficou de fora**, de lá, em dia: o que ficar para depois entra nela, e o que for resolvido sai.

## Repositório

- Trabalhe **direto na `main`** deste repositório (`k4cell/CarnaVou`). Não crie branches,
  forks nem cópias do projeto.
- No meu computador, a pasta do projeto é a **`carnavou`, na minha Área de Trabalho**. O
  código vai ali, e ela fica ligada a este repositório.
- Eu prefiro **poucos commits, mais concretos**, principalmente neste começo. Nada de
  várias mudanças pequenas: junte o trabalho num commit que faça sentido.
- **Commit e push na hora, sem me perguntar** (decidi em 30/10/2026), principalmente nas
  melhorias pequenas: quando o trabalho estiver pronto, com os testes e o build passando, faça o
  commit, o push e a etiqueta da versão, e depois me conte o que foi para o ar. Só o que está no
  GitHub fica.
- **Todo push na `main` publica o site** no GitHub Pages (https://k4cell.github.io/CarnaVou/),
  pelo `.github/workflows/publicar.yml`: ele roda os testes e monta com
  `ng build --configuration production,github-pages`. O site mora em `/CarnaVou/`, então nunca
  use caminho de arquivo do site começando com "/": use caminho relativo ou `enderecoNoSite`.
- **Versões:** **todo push leva um número de versão**, não esqueça. O número fica em `app/package.json` e o histórico no
  `CHANGELOG.md`. Enquanto o app está em beta uso `0.MEIO.FINAL`: o número do meio sobe
  quando entra tela ou funcionalidade nova (0.6.0) e o último, numa correção pequena
  (0.6.1). Antes do push, escolha o número (e me diga depois qual foi e por quê), suba no
  `package.json` (`npm version X.Y.Z --no-git-tag-version`, dentro de `app/`), ponha uma linha
  curta no `CHANGELOG.md` com o número e a data e marque o commit com a etiqueta `vX.Y.Z`
  (git tag), que vai pro GitHub junto com o push. Se eu disser outro número, troque.
- Mensagens de commit em português, com um **título claro**. Quando falar de um commit
  comigo, use o título dele, por extenso. Nunca o código curto (hash): aqueles números só
  uma IA entende.
- Este projeto não tem relação com o CiBase, outro projeto meu. Não mexa em outros
  repositórios.
