# CarnaVou

**A central do "point" do carnaval de rua de São Paulo.** Quero responder a pergunta que
todo grupo faz no carnaval: *"pra onde a gente vai agora?"*

> **Situação (28/10/2026): começando o beta, versão 0.6.0.** Já tem o projeto criado, as três telas do
> esqueleto (lugares em destaque, um lugar e um bloco) e o mapa de leitura, com dados de teste: o
> carnaval de rua de 2026, com nomes reais, como se hoje fosse 07/02/2026. O mapa ainda não sabe
> onde a pessoa está.

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
| **Cidade** | São Paulo e Grande SP. Só isso por enquanto. |
| **Público** | Todo mundo, desde o começo. Eu e meus amigos incluídos. |
| **Objetivo** | Ganhar dinheiro. É um projeto pessoal (pra não ficar parado), mas com esse objetivo. |
| **O principal** | **Descobrir**: o que tem, onde fica, onde está bombando. |
| **Foco** | Carnaval de rua, "de chão": gastar pouco pra beber muito, onde está bombando, onde vai ter artista. Festas pagas e camarotes não são o foco. |
| **Horizonte** | Só o carnaval de 2027. O foco é o agora. |
| **Compartilhar** | Um botão que copia o link. Sem integração nem API do WhatsApp. |
| **Ideia central** | Uma central: eu abro e já está tudo lá. Clico num dos pontos principais (ex.: Ibirapuera) e vejo quem toca hoje. |
| **Distância** | Não é o ponto principal. Todo mundo vai, perto ou longe. Pode ter a informação, mas sem ênfase. |
| **Formato** | Um site que se instala como app (PWA). Sem app de loja por enquanto: o link abre direto e não tem taxa nem aprovação de loja. |
| **Stack** | Angular, na pasta `app/`. Sem servidor nem banco de dados por enquanto: os dados ficam em arquivos dentro do projeto e as páginas são geradas prontas. |
| **Beta** | Sem "Vou", "Tô aqui" e "Como tá?". A raiz do negócio é **pra onde eu vou** e qual é a tendência de hoje, não importa se está cheio ou não. |
| **Telas do beta** | Uma "árvore de opções": a cada clique fica mais específico. **1.** Em alta: a lista dos lugares, com o filtro Hoje / Amanhã / Geral no topo. Cada lugar mostra um selo, a zona numa etiqueta colorida, os artistas (o primeiro em destaque) e uma faixa de cor, num padrão de sete cores. **2.** Um lugar: os dias de festa e os principais artistas dali, em banners (o dia, as atrações e a hora que começa; a hora que termina só aparece se tiver). **3.** Um bloco: a lista detalhada de todos os artistas e atrações e, quando for claro, o público-alvo (como LGBTQIA+, mulheres ou eletrônica). "Começando agora / Daqui a pouco / Mais tarde" fica pra depois. |
| **Lugares em destaque** | Os 10 lugares com os maiores blocos do carnaval de 2026 em SP: Parque Ibirapuera, Rua da Consolação e Baixo Augusta, Av. Faria Lima, República, Av. Ipiranga com São João, Santo Amaro, Pinheiros e Vila Madalena, Av. Henrique Schaumann, Av. Paulo VI e Centro Histórico (Sé e Liberdade). Não existe ranking oficial de público por lugar, então a lista veio dos blocos confirmados nas notícias. Berrini, Minhocão e Largo da Batata saíram porque não achei blocos confirmados lá em 2026. |
| **Cores** | Páginas de fundo claro, pra ler no sol, e texto quase preto (`#121214`). O cabeçalho usa o azul bem escuro da logo (`#130A29`). Roxo `#6A0DAD` nos títulos e no dia do banner, amarelo `#FFC200` nos botões. As sete cores (rosa `#E21D89`, amarelo, verde `#00E676`, laranja `#FB6F18`, roxo, vermelho `#D62828` e azul `#2563EB`) se revezam nas faixas dos cartões, do rosa ao azul. A borda de fora da página tem a cor escura do cabeçalho, nunca branca. Amarelo, laranja e verde só como fundo, com texto escuro. Sem degradê. As letras eu decido mais pra frente. |
| **Zonas** | Cada zona da cidade tem a sua cor, numa etiqueta no lugar: Centro roxo, Zona Sul verde, Zona Leste amarelo, Zona Oeste vermelho e Zona Norte azul. |
| **Logo** | A logo oficial é um pin de mapa com uma máscara de carnaval, e o "o" do "Vou" também é um pin. Ela e as imagens de referência ficam na pasta `design/`. O ícone do app é o pin com a máscara. |
| **Menu de baixo** | Descobrir, Mapa, Amigos e Favoritos. O Mapa já funciona. Amigos e Favoritos mostram só "Em breve" por enquanto. Ainda vou pensar no que serão os Amigos e os Favoritos. |
| **Filtro por dia** | No topo da tela inicial. Hoje mostra só os lugares com bloco hoje, Amanhã só os com bloco amanhã e Geral mostra todos. A tela abre em Hoje quando tem bloco hoje e, quando não tem, abre em Geral. O mesmo filtro vale no mapa, e a aba que eu escolho numa tela vale na outra. |
| **Selos** | Cada lugar tem um selo no canto do cartão: "Já começou" (ou "Hoje às 16h", se ainda não começou) para hoje, "Amanhã às 11h" (a hora do primeiro bloco) para amanhã e "5 blocos" (quantos ainda vão passar ali) para quem não tem bloco nem hoje nem amanhã. Sem cor por enquanto. |
| **Data de teste** | Pra testar, eu abro o site com uma data no endereço, como `?hoje=2027-02-06T14:00`. Aí "hoje" fica parado nesse dia e hora, e a tela avisa que é uma data de teste. |
| **Em alta** | A ordem não vai ser a que eu escolho: vai vir das tendências (top trends). Por enquanto a ordem é a da lista de lugares. |
| **Dados de teste** | O carnaval de rua de 2026 de São Paulo, com nomes reais de blocos e artistas (50 blocos nos 10 lugares), como se hoje fosse 07/02/2026, sábado, o primeiro dia do pré-carnaval (assim as abas Hoje e Amanhã já têm blocos). O app começa nessa data e avisa que é data de teste. É uma reconstituição de notícias e guias, não a lista oficial. Detalhes em `docs/dados-carnaval-2026.md`. |
| **Mapa** | **MapLibre com o mapa livre da OpenFreeMap** (aprovado), num estilo nosso, lilás, no jeito do Macadam: simples, intuitivo, preciso e com vários pontos. Um ponto (pino) por lugar, com a cor da zona (pode mudar). Tocar no pino abre um cartão curto com o selo, os artistas e os botões "Como chegar" (Google Maps e Waze) e "Ver o lugar". Só leitura, sem "onde estou" por enquanto. O mapa só carrega quando eu abro a aba Mapa e fica isolado num componente, para eu poder trocar de biblioteca sem mexer no resto. O plano está em `docs/planejamento-do-mapa.md`. |
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

Já respondi as perguntas sobre o carnaval de 2026 e já escolhi a stack. Mandei o primeiro
desenho (a árvore de opções) e o beta já tem as três telas, com dados de teste do carnaval de 2026. Mandei também o segundo
desenho (o filtro Hoje / Amanhã / Geral) e ele já está na tela inicial e no mapa. O mapa de
leitura já está na aba Mapa. O próximo passo é copiar o link (0.6.1) e depois o "onde estou"
e a distância (0.7.0), seguindo o planejamento em
[`docs/planejamento-do-mapa.md`](docs/planejamento-do-mapa.md), com o Macadam como referência.
A parte social fica por último. Vou continuar desenhando o
projeto pra definir o visual.

### Ainda não pensei

- Como o CarnaVou vai ganhar dinheiro.
- De onde vêm os dados dos blocos de 2027 (lista da prefeitura, cadastro manual,
  organizadores…). Por enquanto uso o carnaval de 2026, reconstituído de notícias e guias.
- Como definir a "tendência de hoje" sem os votos dos usuários.
- Como montar o "Em alta" no começo. Pensei em usar as APIs do Google Maps, do Instagram e do
  X, mas já pesquisei e nenhuma entrega pronto o que está em alta na cidade: o Instagram
  limita a 30 hashtags por semana e o X cobra por uso (detalhes no planejamento do mapa).

## Arquivos do projeto

- [`app/`](app): o site, feito em Angular.
- [`docs/planejamento-do-mapa.md`](docs/planejamento-do-mapa.md): o planejamento do mapa e das
  próximas fases, com o andamento.
- [`docs/dados-carnaval-2026.md`](docs/dados-carnaval-2026.md): de onde vieram os dados de teste
  e o quanto confiar em cada um.
- [`design/`](design): a logo e as imagens de referência do visual, cada uma com a sua legenda.
- [`CHANGELOG.md`](CHANGELOG.md): o que mudou em cada versão.
- [`CLAUDE.md`](CLAUDE.md): minhas regras de trabalho para o Claude Code neste projeto.
- [`docs/ideias-em-aberto.md`](docs/ideias-em-aberto.md): ideias que surgiram e que eu
  **ainda não aprovei**.
