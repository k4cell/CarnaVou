# CarnaVou

**A central do "point" do carnaval de rua de São Paulo.** Quero responder a pergunta que
todo grupo faz no carnaval: *"pra onde a gente vai agora?"*

> **Situação (28/10/2026): começando o beta, versão 0.3.1.** Já tem o projeto criado e as três telas do
> esqueleto (lugares em destaque, um lugar e um bloco), mas com blocos fictícios e só a
> primeira camada de cor. Ainda não tem nenhum bloco de verdade.

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
| **Telas do beta** | Uma "árvore de opções": a cada clique fica mais específico. **1.** Em destaque: a lista dos lugares, cada um com a zona numa etiqueta colorida, os artistas (o primeiro em destaque) e uma faixa de cor, num padrão de sete cores. **2.** Um lugar: os dias de festa e os principais artistas dali, em banners (o dia, as atrações e a hora que começa; a hora que termina só aparece se tiver). **3.** Um bloco: a lista detalhada de todos os artistas e atrações e, quando for claro, o público-alvo (como LGBTQIA+, mulheres ou eletrônica). "Começando agora / Daqui a pouco / Mais tarde" fica pra depois. |
| **Lugares em destaque** | Os 10 lugares que mais tiveram megablocos no carnaval de 2026 em SP: Parque Ibirapuera, Rua da Consolação, Av. Faria Lima, Av. Luís Carlos Berrini, Av. Henrique Schaumann, República, Minhocão, Av. Ipiranga com São João, Av. Paulo VI e Largo da Batata. Não achei um ranking oficial de público por lugar, então a lista veio dos megablocos citados na imprensa. |
| **Cores** | Páginas de fundo claro, pra ler no sol, e texto quase preto (`#121214`). O cabeçalho usa o azul bem escuro da logo (`#130A29`). Roxo `#6A0DAD` nos títulos e no dia do banner, amarelo `#FFC200` nos botões. As sete cores (rosa `#E21D89`, amarelo, verde `#00E676`, laranja `#FB6F18`, roxo, vermelho `#D62828` e azul `#2563EB`) se revezam nas faixas dos cartões, do rosa ao azul. A borda de fora da página tem a cor escura do cabeçalho, nunca branca. Amarelo, laranja e verde só como fundo, com texto escuro. Sem degradê. As letras eu decido mais pra frente. |
| **Zonas** | Cada zona da cidade tem a sua cor, numa etiqueta no lugar: Centro roxo, Zona Sul verde, Zona Leste amarelo, Zona Oeste vermelho e Zona Norte azul. |
| **Logo** | A logo oficial é um pin de mapa com uma máscara de carnaval, e o "o" do "Vou" também é um pin. Ela e as imagens de referência ficam na pasta `design/`. O ícone do app é o pin com a máscara. |
| **Menu de baixo** | Descobrir, Mapa, Amigos e Favoritos. Mapa, Amigos e Favoritos mostram só "Em breve" por enquanto. Ainda vou pensar no que serão os Amigos e os Favoritos. |

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
desenho (a árvore de opções) e o beta já tem as três telas, com blocos fictícios. O mapa
vem depois. Vou continuar desenhando o projeto pra definir o visual.

### Ainda não pensei

- Como o CarnaVou vai ganhar dinheiro.
- De onde vêm os dados dos blocos (lista da prefeitura, cadastro manual, organizadores…).
  Por enquanto os blocos e os artistas são fictícios. Só os lugares são de verdade.
- Como definir a "tendência de hoje" sem os votos dos usuários.

## Arquivos do projeto

- [`app/`](app): o site, feito em Angular.
- [`design/`](design): a logo e as imagens de referência do visual, cada uma com a sua legenda.
- [`CHANGELOG.md`](CHANGELOG.md): o que mudou em cada versão.
- [`CLAUDE.md`](CLAUDE.md): minhas regras de trabalho para o Claude Code neste projeto.
- [`docs/ideias-em-aberto.md`](docs/ideias-em-aberto.md): ideias que surgiram e que eu
  **ainda não aprovei**.
