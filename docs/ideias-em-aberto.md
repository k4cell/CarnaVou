# Ideias em aberto

Ideias que surgiram nas primeiras conversas sobre o projeto (27/10/2026). Muita coisa aqui
não é como eu pensei e algumas são boas, mas ainda não separei quais.

**Nada aqui é decisão.** O que eu decidir vai para o [`README.md`](../README.md).
O planejamento do mapa e das próximas fases, que junta todas estas ideias num roteiro, está em
[`planejamento-do-mapa.md`](planejamento-do-mapa.md).

---

## Já respondidas pelas decisões

| Sugestão | O que foi decidido |
|---|---|
| Começar por uma cidade só | São Paulo e Grande SP |
| Compartilhar com um cartão bonito no WhatsApp | Botão que copia o link, sem integração com o WhatsApp |
| Festas pagas e camarotes na primeira versão? | Foco no carnaval de rua, de chão |
| O principal: descobrir ou decidir em grupo? | Descobrir |
| Só carnaval ou o ano todo? | Só o carnaval de 2027 |
| Distância como filtro importante | Não é o ponto principal; pode existir, sem ênfase |
| Site que instala como app (PWA) | Aprovado: o formato é um site que se instala como app |
| "Começando agora / Daqui a pouco / Mais tarde" na agenda | Fica pra depois. A primeira tela é um catálogo de banners |
| "Vou", "Tô aqui" e "Como tá?" no beta | Ficam de fora do beta. A raiz é pra onde eu vou e a tendência de hoje |
| Como organizar as telas | Árvore de opções: Em destaque, depois um lugar, depois um bloco |
| Quais lugares destacar | Os 10 lugares com mais megablocos no carnaval de 2026 em SP |
| Paleta de cores | Aprovada: fundo claro, cabeçalho escuro da logo, roxo e amarelo. As cinco cores se revezam nas faixas |
| Artistas da semana em cada lugar | Aprovado: aparecem no cartão de cada lugar em "Em destaque" |
| Uma cor de faixa para cada lugar | Aprovado: num padrão de sete cores, do rosa ao azul |
| Uma cor para cada zona | Aprovado: Centro roxo, Sul verde, Leste amarelo, Oeste vermelho e Norte azul |
| Artistas mais evidentes nos cartões | Aprovado: o primeiro nome em negrito e maior, e sem o "da semana" |
| Público-alvo do bloco | Aprovado: aparece na página do bloco, só quando for claro |
| Menu de baixo | Aprovado: Descobrir e Mapa. Amigos e Favoritos saíram em 29/10/2026, até eu decidir o que serão |
| Filtro Hoje / Amanhã / Geral | Aprovado: no topo da tela inicial |
| Selos nos cartões ("Já começou", "Hoje às 14h", "Amanhã às 11h", "5 blocos") | Aprovados, sem cor por enquanto |
| Data de teste no endereço | Aprovada: `?hoje=2026-02-14T14:00` |
| Dados de teste | Aprovado: o carnaval de rua de 2026, com nomes reais, como se hoje fosse 07/02/2026 (primeiro dia do pré-carnaval) |
| Primeiro mapa | Aprovado: um ponto por lugar, com a cor da zona (pode mudar) |
| MapLibre com OpenFreeMap | Aprovado em 28/10/2026. O teste com o Leaflet só vale se o MapLibre pesar demais num celular fraco |
| Botão "Como chegar" no cartão do ponto | Aprovado: Google Maps e Waze. O Uber ficou de fora, porque ainda não confirmei como o link dele funciona |
| "Onde estou" e distância | Aprovado: só liga quando eu toco no botão, depois de uma tela que explica; uma leitura por toque, sem acompanhar o caminho |
| Blocos no mapa | Aprovado (0.8.0): o trajeto dos megablocos de cada lugar, quando a fonte deu começo e fim |
| Offline e desempenho | Aprovado (0.9.0): funciona sem internet com o que já foi aberto, sem baixar a cidade inteira; logo mais leve |
| Publicar o beta para teste | Aprovado (0.10.0): no GitHub Pages, com os dados de 2026, o aviso de versão de teste e podendo aparecer no Google |
| Blocos do mesmo dia num cartão só | Aprovado (0.10.1) |
| Fonte dos dados | Aprovado: o Diário Oficial; no futuro, pedir autorização ao máximo de sites e à Prefeitura |
| Parte social (Amigos) | Fica por último, porque não é o foco |

## Funcionalidades sugeridas

**Agenda do dia**
- Separada em "Começando agora", "Daqui a pouco" e "Mais tarde".
- Filtros por bairro, distância, estilo (marchinha, samba, axé, funk, pop, eletrônico,
  frevo…) e tamanho (de bloquinho a megabloco).

**Mapa**
- Pins dos blocos do dia, com cor por situação: vai começar, rolando ou acabou.
- A maioria dos blocos anda: tem concentração, percurso e dispersão. Mostrar o percurso e
  onde o bloco deve estar em cada horário ("às 16h ele passa aqui").
- Botão "como chegar", que abre no Maps, Waze ou Uber.

**Página do bloco**
- Horário, local, percurso, estilo, tamanho estimado, quantas pessoas vão, como está
  agora e o botão de compartilhar.
- Mais pra frente: "possíveis próximos blocos" ou "blocos próximos a esse".

**Termômetro (as "trends")**

| Sinal | Quando | O que gera |
|---|---|---|
| "Vou" | antes | ranking "Mais esperados de hoje" |
| "Tô aqui" | durante | "Bombando agora" |
| "Como tá?" (vale a pena / lotado demais / fraco / já dispersou) | durante | informação ao vivo de quem está no lugar |

O "Em alta" juntaria os três, com mais peso para o que é recente.

**Em grupo (sugerido para depois)**
- Um "bonde" dentro do app: roteiro do dia, votação rápida entre opções, quem do grupo
  marcou "vou".
- Localização dos amigos em tempo real: a sugestão foi **não fazer**, porque o WhatsApp já
  tem e isso traz problemas de privacidade e bateria.

**Para depois da primeira versão**
- Notificações ("seu bloco começa em 30 min", "tem um bombando perto de você").
- Cadastro de blocos feito pelos próprios organizadores, com aprovação.
- Dinheiro: destaque pago, parcerias com venda de ingresso. Ainda não pensei no modelo de
  receita.

## Sugestões que vieram do desenho de referência

Um desenho de como o app poderia ficar trouxe estas ideias. Nenhuma está aprovada.

- Busca por bloco, bairro ou estilo.
- Filtros de um toque: "Agora", "Gratuito", "Perto de mim", infantil, pet friendly e estilo
  musical.
- Abas "Hoje", "Amanhã" e "Esta semana".
- Favoritos (um coração no banner). Tirei as abas Amigos e Favoritos do menu, e ainda não
  decidi o que eles serão.
- Um mapa da folia com pins, o botão "Como chegar" e um jeito de alternar entre lista e mapa.
- Etiquetas "Bombando agora", "Ao vivo" e "Muito lotado". Dependem de sinal de quem está no
  lugar, então ficam fora do beta.
- Modo noite, com fundo roxo escuro. O de dia continua claro, pra ler no sol.
- Atalhos de utilidade: postos médicos, pontos de táxi e de carro de aplicativo, e compartilhar
  a localização atual.
- Fonte própria (como Syne, Outfit ou Inter). Pesa na internet fraca, então hoje usamos só as
  fontes que já vêm no celular.

## De onde vêm as tendências do "Em alta"

Ideia, ainda não aprovada: usar as APIs do Google Maps, do Instagram e do X (o antigo
Twitter) para saber o que está em alta e ordenar a lista. Já pesquisei: o resumo está na
seção 7 de [`planejamento-do-mapa.md`](planejamento-do-mapa.md). Nenhuma delas entrega pronto
o que está em alta na cidade.

## Pontos difíceis levantados

1. **De onde vêm os dados.** Opções: a lista oficial da prefeitura, que costuma sair perto
   do carnaval; cadastro manual (eu e meus amigos); formulário para organizadores; sugestões
   dos usuários.
2. **O ovo e a galinha.** "Onde tem mais gente" depende de ter usuários, e no primeiro dia
   ninguém usa. O app precisa ser útil com zero usuários: agenda, mapa e tamanho estimado
   já resolvem metade do problema.
3. **Internet ruim na multidão.** A rede congestiona no bloco. O app precisa ser leve,
   guardar a agenda do dia pra funcionar offline e enviar o "tô aqui" quando o sinal voltar.
4. **Celular na rua.** Risco de roubo e bateria acabando: uso de "olhar em 5 segundos e
   guardar", poucos toques, tela legível no sol.
5. **Informação falsa.** O "tô aqui" só valeria perto do lugar, os relatos expirariam
   rápido e cada pessoa teria um limite.

## Primeira versão sugerida

1. Uma cidade só
2. Agenda do dia com filtros
3. Mapa com local e percurso
4. Página do bloco e botão de compartilhar
5. "Vou" e o ranking dos mais esperados (fora do beta)
6. "Tô aqui" e "Como tá?" simples (fora do beta)
7. Agenda do dia funcionando offline
8. Ver tudo sem cadastro; login rápido só pra interagir
