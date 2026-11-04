# CarnaVou

**A central do "point" do carnaval de rua de São Paulo.** Quero responder a pergunta que
todo grupo faz no carnaval: *"pra onde a gente vai agora?"*

> **Situação (04/11/2026): beta, versão 0.23.0.** O beta está no ar para teste em
> https://k4cell.github.io/CarnaVou/, com um aviso de que é uma versão de teste. Os dados são a lista
> oficial dos blocos aprovados de 2026 (Diário Oficial), como se hoje fosse 13/02/2026: 84 blocos em 13
> lugares, com os que têm atração divulgada, os dos circuitos de megabloco e, na Zona Leste e na Norte,
> os destaques das notícias. Tem quatro abas: Blocos (a tela principal: o que está rolando agora e o que
> vem, com busca, filtro por lugar e favoritos), Descobrir (os principais lugares), After (os blocos da
> noite e os bares) e Mapa (o ponto da concentração e a linha de cada bloco). Depois da primeira visita,
> o app abre sem internet e guarda o mapa das áreas já vistas, e o app instalado no celular se atualiza
> sozinho.

---

## De onde veio a ideia

No carnaval de 2026 eu fui com meus amigos, e descobrir e decidir aonde ir era sempre uma
bagunça: nunca ficava claro onde estavam os bloquinhos, as festas e os lugares com mais
gente.

Daí veio o CarnaVou, uma central que mostra:

- onde vão rolar os principais blocos e shows de cada dia;
- a localização de cada um;
- as "trends" do momento: onde está bombando, aonde mais gente diz que vai;
- um jeito de compartilhar.

## O que já decidi

| Tema | Decisão |
|---|---|
| **Nome** | **CarnaVou**. Combina com a ideia de um botão "Vou". |
| **Cidade** | São Paulo e Grande SP. Só isso por enquanto. Os dados de hoje são só da capital. |
| **Público** | Todo mundo, desde o começo. Eu e meus amigos incluídos. |
| **Objetivo** | Ganhar dinheiro. É um projeto pessoal (pra não ficar parado), mas com esse objetivo. |
| **O principal** | **Descobrir**: o que tem, onde fica, onde está bombando. |
| **Foco** | Carnaval de rua, "de chão": gastar pouco pra beber muito, onde está bombando, onde vai ter artista. Festas pagas e camarotes não são o foco. |
| **Horizonte** | Só o carnaval de 2027. O foco é o agora. |
| **Compartilhar** | Um botão que copia o link, hoje nas páginas do lugar e do bloco (o endereço limpo, sem a data de teste). Sem integração nem API do WhatsApp. |
| **Ideia central** | Uma central: eu abro e já está tudo lá. Clico num dos pontos principais (ex.: Ibirapuera) e vejo quem toca hoje. |
| **Distância** | Não é o ponto principal. Todo mundo vai, perto ou longe. Pode ter a informação, mas sem ênfase. No mapa, ela aparece no cartão do ponto, em linha reta, depois que eu toco em "onde estou". |
| **Formato** | Um site que se instala como app (PWA). Sem app de loja por enquanto: o link abre direto e não tem taxa nem aprovação de loja. |
| **Stack** | Angular, na pasta `app/`. Sem servidor nem banco de dados por enquanto: os dados ficam em arquivos dentro do projeto e as páginas são geradas prontas. |
| **Beta** | Sem "Vou". O "Tô aqui" e o "Como tá?" eu descartei: quem está no bloco quer curtir, e ninguém vai pegar o celular só para atualizar um aplicativo. Só voltam se forem automáticos. A raiz do negócio é **pra onde eu vou**. |
| **Telas do beta** | A tela principal é a aba Blocos. O Descobrir é uma "árvore de opções", em que cada clique fica mais específico. **1.** Principais lugares: a lista dos lugares, com o filtro Hoje / Amanhã / Geral no topo. Cada lugar mostra um selo, a zona numa etiqueta colorida, os artistas (o primeiro em destaque) e uma faixa de cor, num padrão de sete cores. **2.** Um lugar: os dias de festa e os principais artistas dali, em banners. **3.** Um bloco: a lista detalhada de todos os artistas e atrações. |
| **Cores** | Páginas de fundo claro, pra ler no sol, e texto quase preto (`#121214`). O cabeçalho usa o azul bem escuro da logo (`#130A29`). Roxo `#6A0DAD` nos títulos e no dia do banner, amarelo `#FFC200` nos botões. As sete cores (rosa `#E21D89`, amarelo, verde `#00E676`, laranja `#FB6F18`, roxo, vermelho `#D62828` e azul `#2563EB`) se revezam nas faixas dos cartões, do rosa ao azul, e cada lugar fica sempre com a mesma cor: na lista, nos banners da página dele e nas atrações dos blocos dele. A borda de fora da página tem a cor escura do cabeçalho, nunca branca. Amarelo, laranja e verde só como fundo, com texto escuro. Sem degradê. As letras eu decido mais pra frente. |
| **Zonas** | Cada zona da cidade tem a sua cor, numa etiqueta no lugar: Centro roxo, Zona Sul verde, Zona Leste amarelo, Zona Oeste vermelho e Zona Norte azul. |
| **Logo** | A logo oficial é um pin de mapa com uma máscara de carnaval, e o "o" do "Vou" também é um pin. Ela e as imagens de referência ficam na pasta `design/`. O ícone do app é o pin com a máscara. |
| **Menu de baixo** | Blocos, Descobrir, After e Mapa. A aba Amigos saiu até eu decidir o que ela será. |
| **Filtro por dia** | Hoje mostra só o que tem hoje, Amanhã só o que tem amanhã e Geral mostra tudo o que ainda vem. A tela abre em Hoje quando tem bloco hoje e, quando não tem, abre em Geral. O mesmo filtro vale na aba Blocos, no Descobrir, no mapa e na página do lugar: a aba que eu escolho numa tela vale nas outras. |
| **Selos** | Cada lugar tem um selo no canto do cartão, com cor, para ler no sol: verde "Já começou", amarelo "Hoje às 16h" ou "Amanhã às 11h", e cinza "Já acabou". Quem não tem bloco nem hoje nem amanhã mostra a conta, como "5 blocos". Nos blocos, é o horário que tem a cor. |
| **Data de teste** | O app começa em 13/02/2026, sexta, meio-dia, e avisa que é data de teste. Pra testar outra, eu abro o site com uma data no endereço, como `?hoje=2027-02-06T14:00`. Aí "hoje" fica parado nesse dia e hora. |
| **Principais lugares** | É a lista do Descobrir. O nome "Em alta" saiu, porque prometia tendência e a lista mostra fama. |
| **Dados de teste** | O carnaval de rua de 2026 de São Paulo, com nomes reais de blocos e artistas (84 blocos em 13 lugares), da lista oficial. Detalhes em `docs/dados-carnaval-2026.md`. |
| **Mapa** | **MapLibre com o mapa livre da OpenFreeMap**, num estilo nosso, lilás, simples e com vários pontos. Cada ponto é a concentração de um bloco. Tocar nele abre um cartão com o nome de cada bloco, os artistas e os botões Ir a pé, Uber e Metrô. Só leitura, com o botão "onde estou" (veja Localização). O MapLibre só é baixado quando eu abro a aba Mapa e fica isolado num componente, para eu poder trocar de biblioteca sem mexer no resto. O plano está em `docs/planejamento-do-mapa.md`. |
| **Localização** | Só liga quando eu toco no botão redondo "onde estou", no mapa. Antes de o celular fazer a pergunta dele, o app mostra uma tela que explica para que serve. Uma leitura por toque: não sigo o meu caminho, não uso a localização em segundo plano e não guardo nem mando a posição pra lugar nenhum. Aparece uma bolinha rosa com um círculo de precisão e, no cartão do ponto, a distância em linha reta. Quem diz não continua usando o mapa do mesmo jeito. |
| **Trajetos** | No mapa, cada bloco tem o ponto da concentração e a linha do trajeto, a partir do itinerário oficial casado com as ruas do OpenStreetMap. Quando não dá certeza, o cartão avisa que o ponto é aproximado. |
| **Sem internet** | Depois da primeira visita com internet, o app inteiro abre sem internet, e um aviso diz quando ele está pronto. O mapa guarda as áreas que eu já vi (até 300 pedaços), e eu não baixo a cidade inteira. Sem sinal, o cabeçalho mostra "Sem internet"; com sinal, mas sem os dados passarem, "Internet fraca". |
| **Onde publicar (beta)** | No GitHub Pages, de graça, com a minha conta do GitHub: https://k4cell.github.io/CarnaVou/. O site é publicado sozinho a cada push na main, depois dos testes. O endereço definitivo eu ainda decido. |
| **Versão de teste no ar** | Com os dados do carnaval de 2026, um aviso no alto de toda página ("Versão de teste: os blocos e os horários são do carnaval de rua de 2026") e o ano na data de teste. O site pode aparecer no Google. |
| **Blocos do mesmo dia** | Na aba Blocos, os blocos do mesmo dia que saem do mesmo ponto (a até 300 m) ficam num cartão só, um embaixo do outro, com o nome do lugar no alto: quem está ali já vê que o próximo é no mesmo lugar. Na página do lugar, os blocos do mesmo dia também ficam juntos. A data aparece só no primeiro bloco do cartão. |
| **Fonte dos dados** | O Diário Oficial da Prefeitura, que publica a lista oficial dos blocos e é de uso livre (a lei de direito autoral não protege os atos oficiais). Os pontos e as linhas eu marco a partir dela. O site Carnaval SP tem a lista completa, mas os termos dele proíbem copiar e comercializar, então não uso. No futuro, quero pedir autorização ao máximo de sites e à Prefeitura. |
| **Lista oficial dos blocos** | Os dados vêm da lista oficial dos blocos aprovados de 2026 (Portaria Conjunta SPTuris/SMC nº 1, de 22/01/2026), com os artistas que as notícias citam. Os scripts ficam em `design/dados/`. |
| **Zonas, por enquanto** | Todas as zonas. A Leste e a Norte não têm atração nas notícias, então entram só com os blocos que as notícias chamam de destaque da região. |
| **Quem entra e em que ordem** | Ficam os blocos com atração divulgada, os dos circuitos dos megablocos e, na Leste e na Norte, os destaques das notícias; os outros saem. A ordem é pela soma dos seguidores no Instagram dos artistas (contadores públicos, com fonte e data). |
| **Lugares** | Os grandes pontos têm nome próprio (Parque Ibirapuera, Rua da Consolação e Baixo Augusta, Avenida Faria Lima, Av. Ipiranga, São João e República, Rua Henrique Schaumann, Avenida Paulo VI); os outros blocos ficam na subprefeitura. Na página do lugar, os 4 mais famosos ficam em destaque. |
| **Só o presente e o futuro** | O que é de um dia que já passou some das listas. A página do lugar mostra só os blocos da aba escolhida (Hoje, Amanhã ou Geral). A busca é a exceção: quem procura um artista que já tocou vê o bloco numa parte separada, "Já aconteceu". |
| **Aba Blocos** | É a tela principal, com os blocos (não os lugares): "Rolando agora" primeiro em Hoje. Quando hoje tem até 3 blocos, ela mostra também o próximo dia. Tem busca, filtro por lugar e o botão de favoritos. |
| **Telas** | Cabeçalho baixo, com a seta ← de voltar no canto, que leva para a tela de onde eu vim; atrações lado a lado, juntas por horário; no mapa, o cartão abre pequeno e cresce puxando a setinha. As cores dos pinos continuam sendo as da zona. |
| **After** | Uma aba com os blocos da noite e os bares e pontos de encontro, com "Onde estou" para ordenar pelo mais perto. Vale sempre o hoje. |
| **Busca** | Na aba Blocos, por bloco, artista, lugar, zona ou estilo, sem ligar para acento e aceitando pequenos erros de digitação. |
| **Favoritos** | A estrela de cada bloco, com um botão na aba Blocos para ver só os marcados. Ficam só no aparelho, sem conta. |
| **Histórico dos megablocos** | Levantei onde os megablocos desfilaram de 2018 a 2026 (`design/dados/historico-dos-megablocos.json`). É só para uso interno: em janeiro, serve para saber quais blocos e lugares olhar primeiro. O app não mostra previsão. |
| **Divulgação** | Prévia do link, botão de compartilhar e endereço definitivo ficam para quando o app estiver mais consolidado. |
| **Social** | A parte social (Amigos) fica por último, porque não é o foco. |

### Sobre compartilhar

Compartilhar não custa nada, nem no WhatsApp nem no Instagram. A API cara é a do WhatsApp
para empresas, que serve pra um negócio mandar mensagem automática pros clientes. Não é o
meu caso.

O que dá pra ter de graça:

- **Copiar link**, que é o que eu decidi.
- **O menu de compartilhar do próprio celular**, que já mostra WhatsApp, Instagram,
  Telegram etc. Funciona direto do site, sem API. Dá pra mandar até uma imagem do bloco
  pros Stories.
- **Prévia do link**: quando alguém cola o link numa conversa, aparece uma imagem com o
  nome do bloco, o horário e o local.

Ainda não decidi se o menu do celular e a prévia entram junto com o "copiar link". Ter os
três não muda o custo.

## Calendário

| Carnaval | Sábado | Terça | Quarta de Cinzas |
|---|---|---|---|
| 2026 (o que eu vivi) | 14/02/2026 | 17/02/2026 | 18/02/2026 |
| **2027 (o alvo)** | **06/02/2027** | **09/02/2027** | **10/02/2027** |

Em São Paulo costuma ter blocos também nos fins de semana antes do carnaval
(pré-carnaval) e depois dele (pós-carnaval).

## Como foi o meu carnaval de 2026

**Como a gente descobria os blocos.** Eu e meus amigos, no boca a boca, no Instagram e no
TikTok: "onde vai ter?", "fulano postou tal coisa". Pra saber o artista era igual: "quem vai
tocar?", "o artista postou". Sempre ficava meio bagunçado, e ninguém sabia se estava bom:
"será que tá bom? será que não tá? alguém já chegou lá?"

**O que eu quero resolver.** Uma central: eu abro e já está tudo lá. Clico num dos pontos
principais, por exemplo o Ibirapuera, e vejo quem toca hoje (Pablo Vittar, Anitta…).

**Por que a gente escolhia um bloco e não outro.** Quase ninguém quer saber de detalhe: o
povo quer a farra. Beijar, beber muito, esquecer de tudo, porque no carnaval pode tudo.
Então eu quero ir no bloco que vai estar lotado. O bloco é quase um grande filtro. Só quem
está mais receoso de ir olha depois o artista, o estilo e o clima (calor, chuva).

Perto ou longe eu não quero dar ênfase, porque no fim todo mundo vai. É bom ter a
informação, mas não é o ponto principal.

**O que deu errado.** Sim, deu errado várias vezes: chegar e estar lotado demais, chegar e
estar desanimado ou diferente do que eu esperava, chegar e ter quase ninguém, ou chegar e
já estar acabando, meio morto. O aplicativo seria muito bom se até me avisasse.

**O que eu queria ter no celular naquela hora.** Outra opção de lugar pra ir.

## Próximo passo

Tudo o que falta para a versão 1.0.0 está em [`docs/tarefas-para-a-1.0.md`](docs/tarefas-para-a-1.0.md),
com o que já está pronto marcado. A 1.0.0 não sai antes da lista oficial de 2027, que deve sair em
janeiro.

### Ainda não pensei

- Como o CarnaVou vai ganhar dinheiro.
- Quem cadastra os dados de 2027. A fonte já decidi (a lista oficial do Diário Oficial); por
  enquanto uso a de 2026.
- Como mostrar onde está bombando agora de forma automática, sem pedir nada para quem está no bloco.
- Se a ordem dos lugares deve usar mais do que a fama. Pensei em usar as APIs do Google Maps, do Instagram e do
  X, mas já pesquisei e nenhuma entrega pronto o que está em alta na cidade: o Instagram
  limita a 30 hashtags por semana e o X cobra por uso (detalhes no planejamento do mapa).

## Arquivos do projeto

- [`app/`](app): o site, feito em Angular.
- [`docs/planejamento-do-mapa.md`](docs/planejamento-do-mapa.md): o planejamento do mapa e das
  próximas fases, com o andamento.
- [`docs/dados-carnaval-2026.md`](docs/dados-carnaval-2026.md): de onde vieram os dados de teste
  e o quanto confiar em cada um.
- [`design/`](design): a logo, as imagens de referência do visual e, em `design/dados/`, os
  scripts que geram os dados do app a partir da lista oficial.
- [`CHANGELOG.md`](CHANGELOG.md): o que mudou em cada versão.
- [`CLAUDE.md`](CLAUDE.md): minhas regras de trabalho para o Claude Code neste projeto.
- [`docs/tarefas-para-a-1.0.md`](docs/tarefas-para-a-1.0.md): a lista de tudo o que falta para a
  versão 1.0.0, com o que já está pronto marcado.
- [`docs/ideias-em-aberto.md`](docs/ideias-em-aberto.md): ideias que surgiram e que eu
  **ainda não aprovei**.
