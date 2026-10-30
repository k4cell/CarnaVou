# CarnaVou

**A central do "point" do carnaval de rua de São Paulo.** Quero responder a pergunta que
todo grupo faz no carnaval: *"pra onde a gente vai agora?"*

> **Situação (30/10/2026): beta, versão 0.12.3.** O beta está no ar para teste em
> https://k4cell.github.io/CarnaVou/, com um aviso de que é uma versão de teste. Os dados são a lista
> oficial dos blocos aprovados de 2026 (Diário Oficial), como se hoje fosse 07/02/2026: só Centro,
> Zona Sul e Zona Oeste, e só os blocos com atração divulgada ou num circuito de megabloco (74 blocos
> em 7 lugares). Tem três abas: Descobrir (os lugares em alta), Blocos (o que está rolando agora e o
> que vem) e Mapa (o ponto da concentração e a linha de cada bloco). Sem internet, o site continua
> funcionando com o que já foi aberto, e o app instalado no celular se atualiza sozinho.

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
| **Compartilhar** | Um botão que copia o link, hoje nas páginas do lugar e do bloco (o endereço limpo, sem a data de teste). Sem integração nem API do WhatsApp. |
| **Ideia central** | Uma central: eu abro e já está tudo lá. Clico num dos pontos principais (ex.: Ibirapuera) e vejo quem toca hoje. |
| **Distância** | Não é o ponto principal. Todo mundo vai, perto ou longe. Pode ter a informação, mas sem ênfase. No mapa, ela aparece no cartão do ponto, em linha reta, depois que eu toco em "onde estou". |
| **Formato** | Um site que se instala como app (PWA). Sem app de loja por enquanto: o link abre direto e não tem taxa nem aprovação de loja. |
| **Stack** | Angular, na pasta `app/`. Sem servidor nem banco de dados por enquanto: os dados ficam em arquivos dentro do projeto e as páginas são geradas prontas. |
| **Beta** | Sem "Vou", "Tô aqui" e "Como tá?". A raiz do negócio é **pra onde eu vou** e qual é a tendência de hoje, não importa se está cheio ou não. |
| **Telas do beta** | Uma "árvore de opções": a cada clique fica mais específico. **1.** Em alta: a lista dos lugares, com o filtro Hoje / Amanhã / Geral no topo. Cada lugar mostra um selo, a zona numa etiqueta colorida, os artistas (o primeiro em destaque) e uma faixa de cor, num padrão de sete cores. **2.** Um lugar: os dias de festa e os principais artistas dali, em banners (o dia, as atrações e a hora que começa; a hora que termina só aparece se tiver). **3.** Um bloco: a lista detalhada de todos os artistas e atrações e, quando for claro, o público-alvo (como LGBTQIA+, mulheres ou eletrônica). "Começando agora / Daqui a pouco / Mais tarde" fica pra depois. |
| **Lugares em destaque** | Os 10 lugares com os maiores blocos do carnaval de 2026 em SP: Parque Ibirapuera, Rua da Consolação e Baixo Augusta, Av. Faria Lima, República, Av. Ipiranga com São João, Santo Amaro, Pinheiros e Vila Madalena, Av. Henrique Schaumann, Av. Paulo VI e Centro Histórico (Sé e Liberdade). Não existe ranking oficial de público por lugar, então a lista veio dos blocos confirmados nas notícias. Berrini, Minhocão e Largo da Batata saíram porque não achei blocos confirmados lá em 2026. |
| **Cores** | Páginas de fundo claro, pra ler no sol, e texto quase preto (`#121214`). O cabeçalho usa o azul bem escuro da logo (`#130A29`). Roxo `#6A0DAD` nos títulos e no dia do banner, amarelo `#FFC200` nos botões. As sete cores (rosa `#E21D89`, amarelo, verde `#00E676`, laranja `#FB6F18`, roxo, vermelho `#D62828` e azul `#2563EB`) se revezam nas faixas dos cartões, do rosa ao azul, e cada lugar fica sempre com a mesma cor: na lista, nos banners da página dele e nas atrações dos blocos dele. A borda de fora da página tem a cor escura do cabeçalho, nunca branca. Amarelo, laranja e verde só como fundo, com texto escuro. Sem degradê. As letras eu decido mais pra frente. |
| **Zonas** | Cada zona da cidade tem a sua cor, numa etiqueta no lugar: Centro roxo, Zona Sul verde, Zona Leste amarelo, Zona Oeste vermelho e Zona Norte azul. |
| **Logo** | A logo oficial é um pin de mapa com uma máscara de carnaval, e o "o" do "Vou" também é um pin. Ela e as imagens de referência ficam na pasta `design/`. O ícone do app é o pin com a máscara. |
| **Menu de baixo** | Descobrir e Mapa. Tirei as abas Amigos e Favoritos, que só mostravam "Em breve" e pesavam o site. Elas voltam quando eu decidir o que serão. |
| **Filtro por dia** | No topo da tela inicial. Hoje mostra só os lugares com bloco hoje, Amanhã só os com bloco amanhã e Geral mostra todos. A tela abre em Hoje quando tem bloco hoje e, quando não tem, abre em Geral. O mesmo filtro vale no mapa, e a aba que eu escolho numa tela vale na outra. |
| **Selos** | Cada lugar tem um selo no canto do cartão: "Já começou" (ou "Hoje às 16h", se ainda não começou) para hoje, "Amanhã às 11h" (a hora do primeiro bloco) para amanhã e "5 blocos" (quantos ainda vão passar ali) para quem não tem bloco nem hoje nem amanhã. Sem cor por enquanto. |
| **Data de teste** | Pra testar, eu abro o site com uma data no endereço, como `?hoje=2027-02-06T14:00`. Aí "hoje" fica parado nesse dia e hora, e a tela avisa que é uma data de teste. |
| **Em alta** | A ordem não vai ser a que eu escolho: vai vir das tendências (top trends). Por enquanto a ordem é a da lista de lugares. |
| **Dados de teste** | O carnaval de rua de 2026 de São Paulo, com nomes reais de blocos e artistas (50 blocos nos 10 lugares), como se hoje fosse 07/02/2026, sábado, o primeiro dia do pré-carnaval (assim as abas Hoje e Amanhã já têm blocos). O app começa nessa data e avisa que é data de teste. É uma reconstituição de notícias e guias, não a lista oficial. Detalhes em `docs/dados-carnaval-2026.md`. |
| **Mapa** | **MapLibre com o mapa livre da OpenFreeMap** (aprovado), num estilo nosso, lilás, no jeito do Macadam: simples, intuitivo, preciso e com vários pontos. Um ponto (pino) por lugar, com a cor da zona (pode mudar). Tocar no pino abre um cartão curto com o selo, os artistas e os botões "Como chegar" (Google Maps e Waze) e "Ver o lugar". Só leitura, com o botão "onde estou" (veja Localização). O mapa só é baixado quando eu abro a aba Mapa (nem o service worker o guarda antes) e fica isolado num componente, para eu poder trocar de biblioteca sem mexer no resto. O plano está em `docs/planejamento-do-mapa.md`. |
| **Localização** | Só liga quando eu toco no botão redondo "onde estou", no mapa. Antes de o celular fazer a pergunta dele, o app mostra uma tela que explica para que serve. Uma leitura por toque: não sigo o meu caminho, não uso a localização em segundo plano e não guardo nem mando a posição pra lugar nenhum. Aparece uma bolinha rosa com um círculo de precisão e, no cartão do ponto, a distância em linha reta. Quem diz não continua usando o mapa do mesmo jeito. |
| **Trajetos** | No mapa, o trajeto dos megablocos de cada lugar aparece como uma linha na cor da zona, e o do lugar escolhido fica mais grosso. Só desenho trajeto com começo e fim numa fonte: a CET publicou seis (Ibirapuera, Consolação, Faria Lima, Ipiranga com São João, Paulo VI e Henrique Schaumann). Os outros lugares ficam só com o pino. O cartão do ponto mostra o trajeto em palavras e os blocos do dia, e as páginas do lugar e do bloco têm o botão "Ver no mapa". |
| **Sem internet** | O site continua funcionando com o que já foi aberto: as páginas, os blocos e o mapa das áreas já vistas. O mapa só fica guardado depois de aberto uma vez com internet, e não baixo a cidade inteira. Quando a internet cai, o cabeçalho mostra "Sem internet". |
| **Onde publicar (beta)** | No GitHub Pages, de graça, com a minha conta do GitHub: https://k4cell.github.io/CarnaVou/. O site é publicado sozinho a cada push na main, depois dos testes. O endereço definitivo eu ainda decido. |
| **Versão de teste no ar** | Com os dados do carnaval de 2026, um aviso no alto de toda página ("Versão de teste: os blocos e os horários são do carnaval de rua de 2026") e o ano na data de teste. O site pode aparecer no Google. |
| **Blocos do mesmo dia** | Na página do lugar, os blocos do mesmo dia ficam juntos num cartão só, um embaixo do outro, cada um com o dia, o nome, o artista e o horário. |
| **Fonte dos dados** | O Diário Oficial da Prefeitura, que publica a lista oficial dos blocos e é de uso livre (a lei de direito autoral não protege os atos oficiais). Os pontos e as linhas eu marco a partir dela. O site Carnaval SP tem a lista completa, mas os termos dele proíbem copiar e comercializar, então não uso. No futuro, quero pedir autorização ao máximo de sites e à Prefeitura. |
| **Lista oficial dos blocos** | Os dados vêm da lista oficial dos blocos aprovados de 2026 (Portaria Conjunta SPTuris/SMC nº 1, de 22/01/2026), com os artistas que as notícias citam. Os scripts ficam em `design/dados/`. |
| **Zonas, por enquanto** | Só o Centro, a Zona Sul e a Zona Oeste. A Leste e a Norte saíram até terem blocos com atrações conhecidas. |
| **Em alta é fama** | Ficam os blocos com atração divulgada e os dos circuitos dos megablocos; os outros saem. A ordem é pela soma dos seguidores no Instagram dos artistas (contadores públicos, com fonte e data). |
| **Lugares** | Os grandes pontos têm nome próprio (Parque Ibirapuera, Rua da Consolação e Baixo Augusta, Avenida Faria Lima, Av. Ipiranga, São João e República, Rua Henrique Schaumann, Avenida Paulo VI); os outros blocos ficam na subprefeitura. Na página do lugar, os 4 mais famosos ficam em destaque. |
| **Só o presente e o futuro** | O que é de um dia que já passou some do app. A página do lugar mostra só os blocos da aba escolhida (Hoje, Amanhã ou Geral). |
| **Aba Blocos** | Uma aba no menu de baixo com os blocos (não os lugares): "Rolando agora" primeiro em Hoje. |
| **Telas** | Cabeçalho baixo, com a seta ← de voltar no canto; atrações lado a lado, juntas por horário; selos com cor para ler no sol; no mapa, o cartão abre pequeno e cresce puxando a setinha. As cores dos pinos continuam sendo as da zona. |
| **Como trabalho com o Claude** | Ele faz o commit e o push direto, com o número da versão, e me diz o que subiu. Testa pelo terminal, sem abrir o navegador nem tirar foto da tela (gastava muito), e não precisa me mostrar os testes. |
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

O beta está no ar e eu testo no celular junto com um usuário. Na 0.12 entraram as melhorias que
combinamos (aba Blocos, página do lugar pela aba, cabeçalho baixo, selos com cor, cartão do mapa
que cresce). Falta confirmar no celular se o aviso de versão nova aparece sozinho. As próximas
ideias, que eu ainda decido, estão em [`docs/ideias-em-aberto.md`](docs/ideias-em-aberto.md), na
parte "Para depois da 0.12.0": as abas também na página do lugar (talvez na 0.13), a cor dos pinos
pelo dia e buscar mais atrações nas notícias. Depois vêm o endereço definitivo, os dados de 2027 e
o visual.

### Ainda não pensei

- Como o CarnaVou vai ganhar dinheiro.
- Quem cadastra os dados de 2027. A fonte já decidi (a lista oficial do Diário Oficial); por
  enquanto uso a de 2026.
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
- [`design/`](design): a logo, as imagens de referência do visual e, em `design/dados/`, os
  scripts que geram os dados do app a partir da lista oficial.
- [`CHANGELOG.md`](CHANGELOG.md): o que mudou em cada versão.
- [`CLAUDE.md`](CLAUDE.md): minhas regras de trabalho para o Claude Code neste projeto.
- [`docs/ideias-em-aberto.md`](docs/ideias-em-aberto.md): ideias que surgiram e que eu
  **ainda não aprovei**.
