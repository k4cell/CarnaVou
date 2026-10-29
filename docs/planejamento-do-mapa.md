# Planejamento do mapa e das próximas fases

> **Pausa tática (28/10/2026), atualizada depois dos prints do Macadam e das minhas
> respostas.** Escrevi isto antes de programar o mapa, para escolher o caminho com calma e não
> criar um problema difícil de arrumar depois. **O que eu aprovar vai para o**
> [`README.md`](../README.md).

## Andamento

| Versão | O que é | Estado |
|---|---|---|
| 0.4.1 | Este planejamento e o cabeçalho sem a frase | feito |
| **0.5.0** | **Dados de teste reais: o carnaval de 2026, como se hoje fosse 30/01/2026** | **feito** |
| **0.6.0** | **Mapa de leitura: um ponto por lugar, com a cor da zona** | **próximo** |
| 0.6.1 | Copiar o link | depois |
| 0.7.0 | "Onde estou" e distância | depois |
| 0.8.0 | Blocos no mapa e percursos | depois |
| 0.9.0 | Offline e desempenho | depois |
| depois | Backend, Favoritos, "Em alta" calculado e, **por último**, a parte social | |

**O que falta decidir para o mapa começar:**

1. Aprovar a nova sugestão de mapa (MapLibre com OpenFreeMap, seção 4.1).
2. Contar a **grande mudança sobre os dias**, que mexe no modelo de dados.

**Como usar este documento:** a cada passo, o que foi feito, o que falta e os próximos passos
saem daqui e vão para a conversa.

## 1. O que eu quero do mapa

Um mapa **simples, intuitivo, preciso e com vários pontos sinalizados**, parecido com o do
Macadam. Para o CarnaVou isso vira estas regras:

- **Leve.** Celular fraco e internet ruim no meio da multidão. Hoje a primeira tela pesa
  cerca de 82 kB (comprimida); o mapa não pode estragar isso.
- **Legível no sol**, com poucos toques e botões grandes.
- **Útil sem cadastro** e sem a pessoa precisar entender nada.
- **Barato de manter.** O objetivo é ganhar dinheiro, então nada de custo fixo alto no começo.
- **O mapa ajuda a decidir "pra onde eu vou", não só a achar.** Achar bloco já existe (ver
  a seção 3).

## 2. O que eu levantei sobre o Macadam

**O que é.** Um app de caminhada que paga pelos passos, lançado em 2022, para iPhone e
Android. A loja lista a empresa como MACADAM TECHNOLOGIES, S.L. Nota 4,8 com 16 mil
avaliações na App Store. É grátis, com compras dentro do app.

**Como é o mapa dele.** Mostra a posição da pessoa em tempo real e pontos espalhados ao redor
(moedas, "Spots", máquinas de jackpot e eventos com itens para coletar). Para ganhar, a
pessoa vai até o ponto e confirma que está lá. Os usuários elogiam o design e a simplicidade.

**O que as avaliações criticam.** Anúncios que não podem ser pulados, valor mínimo alto para
sacar, moedas do mapa que não são coletadas sozinhas e um "limite de velocidade" que
impede coletar andando de carro. Nada disso é do mapa em si.

**O que os prints mostram** (os cinco estão em [`design/referencias/`](../design/referencias),
com legenda):

- O mapa é um **mapa vetorial do Mapbox, pintado nas cores da marca**: um lilás suave com as
  ruas mais claras. É isso que dá identidade a ele. A marca "mapbox" e o botão de créditos
  aparecem no canto de baixo.
- Os pontos são **pinos em gota, todos do mesmo formato**, com um desenho dentro. Quando o mapa
  está longe, os pontos próximos ficam **agrupados**; de perto, se separam.
- A pessoa aparece com a **própria foto** num balão, com um círculo de precisão em volta. Os
  botões são **redondos e brancos**, à direita: configurações, uma ação extra e "onde estou".
- Os pontos próximos ganham **etiquetas de distância** ("140m", "420m"), e o mapa mostra os
  **nomes dos lugares** (praças, escolas) com um ícone, o que ajuda a se localizar.
- A tela não fica poluída: um **cartão branco** em cima, um cartão de destaque embaixo e a
  barra do menu, com cantos redondos e texto grande.
- O **pedido de localização** tem uma tela cheia que explica para que serve ("ativa tua
  localização para descobrir…") **antes** do aviso do celular, com um dedo apontando a opção
  "Enquanto usa o aplicativo".
- A **tela social** usa botões de período (Dia, Semana, Mês, Ano), parecidos com o nosso Hoje /
  Amanhã / Geral. Eu deixei a parte social por último, porque não é o foco.

**A lição técnica:** esse visual, com o mapa na cor da marca, **só dá para fazer com mapa
vetorial**. Com imagens prontas de mapa (como no Leaflet) não dá para trocar as cores.

**O que aproveitar:**

- o mapa como uma tela de exploração, com a posição da pessoa e muitos pontos bem visíveis;
- um cartão curto ao tocar no ponto, com poucos toques até a informação;
- a sensação de "mapa vivo", que faz a pessoa abrir o app toda hora;
- pinos do mesmo formato, com a cor da zona, e etiqueta de distância nos pontos próximos;
- explicar para que serve a localização antes de pedir;
- botões redondos à direita (incluindo "onde estou") e um cartão em destaque embaixo.

**O que não copiar:**

- moedas, jogos e coleta por proximidade;
- localização em segundo plano. A própria loja avisa que o Macadam "pode usar a localização
  mesmo com o app fechado", o que gasta bateria e é ruim para privacidade;
- peso. A versão de iPhone tem 280 MB; a nossa meta é o contrário disso.

## 3. O que já existe (e o que isso muda)

O site oficial da Prefeitura, [carnavalsp.com](https://www.carnavalsp.com), já tem:

- busca por bairro, por data e horário, e por período (pré-carnaval, carnaval e pós);
- geolocalização para achar os blocos mais próximos;
- mais de 600 blocos, com percursos aprovados pela CET;
- avisos de mudança de itinerário e cancelamento, e totens com QR Code nas ruas.

Existem também sites privados de listas e guias de jornais.

**O que isso muda:** "listar blocos e mostrar o que fica perto" **não é o nosso diferencial**,
porque o poder público já faz. O CarnaVou precisa ser o app do **"pra onde eu vou agora"**:
poucos lugares escolhidos, o que está em alta, os artistas, uma decisão rápida e um link
fácil de mandar para o grupo.

**O que serve para nós:** a lista oficial é a melhor fonte de dados reais. Não achei que ela
seja publicada como dado aberto (por exemplo, GeoJSON): ela sai no Diário Oficial e no site.
Antes de usar, preciso conferir os termos.

## 4. O mapa: decisões técnicas

### 4.1 A biblioteca e a fonte do mapa

| | Tamanho | Visual | Offline | Observação |
|---|---|---|---|---|
| **A. Leaflet + imagens (raster)** | ~42 kB | Simples, igual em todo celular | Difícil | Leaflet 1.9.4 é a versão estável (a 2.0 ainda está em teste) |
| **B. MapLibre + OpenFreeMap** | ~200 a 250 kB | Bonito, dá para usar as nossas cores | Limitado | Precisa de WebGL; versão 6.16.0 |
| **C. MapLibre + Protomaps (PMTiles)** | ~200 a 250 kB | Igual ao B | Possível | Um arquivo da Grande SP em hospedagem barata; mais trabalho |

Os tamanhos vêm de fontes secundárias; falta conferir na página de cada projeto.

**Fontes do mapa (de onde vêm as imagens):**

- **OpenStreetMap oficial** (`tile.openstreetmap.org`): grátis, mas a política **proíbe uso
  pesado, pré-carregamento e uso offline**, pode bloquear sem aviso e não tem garantia.
  Serve só para testar aqui.
- **OpenFreeMap:** grátis, sem chave, sem limite declarado e com uso comercial permitido. **Não tem garantia de
  funcionamento** (sem SLA). A atribuição é obrigatória. O download offline é limitado a
  3.000 tiles (50 MB) por vez.
- **Protomaps/PMTiles:** um arquivo único em qualquer hospedagem estática. Dá controle total,
  mas as fontes das letras do mapa são um passo à parte.
- **Google Maps:** o mapa dinâmico tem 10.000 usos grátis por mês e depois cerca de US$ 7 por
  1.000 (segundo guias, a conferir). Numa conta de exemplo, 100 mil aberturas no mês dariam
  uns US$ 630. **Um app que viraliza no carnaval pode gerar custo alto.** Fica fora do mapa
  principal.

**Minha sugestão mudou depois dos prints:** **MapLibre com OpenFreeMap (opção B)**, com um
estilo nosso (fundo claro ou escuro da marca, ruas suaves e os pontos nas cores das zonas),
**carregado só quando a pessoa abre a aba Mapa**. O custo é uns 200 kB a mais, só para quem
abre o mapa, e o mapa precisa de WebGL, que quase todo celular tem. O mapa fica **isolado num
componente com interface própria**, para trocar de biblioteca sem mexer no resto. O teste com
o Leaflet, que eu quis deixar para mais tarde, só vale se o MapLibre pesar demais num celular
fraco.

### 4.2 Os pontos

- **Hoje:** um ponto por lugar (os 10 lugares em destaque), com a cor da zona ou do selo.
- **Depois:** um ponto por bloco (onde ele se concentra) e uma linha para o percurso, quando
  houver.
- Com centenas de pontos, agrupar os que estão perto (cluster).
- Tocar no ponto abre um **cartão curto**: nome, selo, artistas e o botão "Como chegar".

### 4.3 Localização da pessoa

- Só pede a localização **quando a pessoa toca em "onde estou"**, nunca de cara.
- Sem rastreamento contínuo e sem segundo plano (bateria e privacidade).
- Quem negar continua usando o app normalmente.

### 4.4 "Como chegar"

Links que abrem o app de mapa do celular, sem API paga:

- **Google Maps:** `https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE`
  (formato da documentação oficial).
- **Waze e Uber:** o formato eu ainda **não confirmei** na documentação deles; confiro antes
  de usar.

### 4.5 Offline

O site já guarda o que precisa no celular (service worker). Para o mapa:

- os pontos e os dados do dia **sempre** ficam guardados;
- o fundo do mapa guarda só o que a pessoa já viu, com limite de tamanho e de idade;
- o OpenStreetMap oficial **não permite** baixar a cidade para uso offline; já o OpenFreeMap e
  o PMTiles permitem, com regras.

### 4.6 Peso e acesso

- O mapa só carrega quando a pessoa abre a aba Mapa (a primeira tela continua leve).
- A lista "Em alta" **continua existindo**: o mapa nunca é a única forma de achar um bloco.

## 5. Os dados: o ponto mais delicado

**Hoje:** 10 lugares e 50 blocos reais do carnaval de 2026, usados como teste, como se hoje
fosse 30/01/2026. É uma reconstituição de notícias e guias, com a fonte e a confiança de cada
bloco em [`dados-carnaval-2026.md`](dados-carnaval-2026.md). Dá para montar o mapa já, com as
coordenadas dos 10 lugares.

**Para os dados reais de 2027:**

- A programação oficial de 2027 ainda **não saiu**. Em outubro de 2026 a Prefeitura abriu um
  edital de fomento para até 100 blocos.
- Existem mais de 600 blocos, mas o foco do CarnaVou são os **principais**. Faz sentido
  começar com uma **curadoria à mão** de uns 50 a 100 blocos e atualizar toda semana.
- **Percursos** exigem desenhar a linha no mapa a partir do texto do trajeto. Dá muito
  trabalho: começar só com o ponto de concentração.
- Coordenadas dos lugares: tirar de um mapa e conferir à mão, uma vez.

**Em etapas, sem refazer:**

1. Dados em arquivos de código (como hoje).
2. Dados em arquivos fáceis de editar (JSON), com uma ferramenta de conferência.
3. Dados num banco, quando houver cadastro por organizadores ou atualização sem publicar de novo.

**A grande mudança sobre os dias:** ainda vou contar. Ela mexe em como o app entende
"hoje" e "amanhã", então **precisa vir antes de eu fechar o modelo de dados**.

## 6. Como não travar o futuro

Regras para o código, para cada fase caber sem refazer a anterior:

1. **Os dados ficam atrás de uma camada de consulta** (como já é o `consultas.ts` e o
   `agenda.ts`). Trocar de arquivo para banco não pode mexer nas telas.
2. **Os endereços das páginas e os números de identificação (id) dos lugares e blocos não
   mudam.** Quem já recebeu um link continua abrindo.
3. **O mapa fica isolado** num componente com interface própria.
4. **Tudo que depende de data passa pelo relógio** (`relogio/`). Foi o que permitiu a data de
   teste.
5. **Cada fase termina com o site funcionando** e com um número de versão.
6. **Leve o peso a sério:** carregar só o que a tela precisa.

## 7. O "Em alta" e as tendências

O que eu achei sobre as APIs que pensei em usar (a conferir nas páginas oficiais):

| Fonte | O que dá para fazer | Limites e custo |
|---|---|---|
| **Instagram** (API Graph) | Buscar por hashtag as fotos mais populares e as recentes | Só com conta Business ou Creator; **30 hashtags diferentes por semana** por conta; **não existe um "em alta" por cidade** |
| **X (Twitter)** | Ler posts | **Sem plano grátis para novos desenvolvedores** desde fev/2026; pagamento por uso, cerca de US$ 0,005 por post lido segundo blogs |
| **Google Maps / Places** | Mostrar lugares e mapas | Pago por uso; **não vi um dado oficial de "lotação ao vivo"** na API |

**Conclusão:** nenhuma dessas APIs entrega pronto o "o que está em alta no carnaval de SP".
Usar raspagem (copiar telas de redes sociais) **viola os termos** e arrisca bloquear o app.

**Minha sugestão para o "Em alta":**

1. **Primeira versão:** ordem escolhida por mim (como hoje). É honesto e já funciona.
2. **Depois:** uma nota simples e explicável, somando a curadoria, o interesse no app (cliques,
   sem identificar a pessoa) e a hora (começa logo).
3. **Só então**, se compensar, ligar 1 ou 2 APIs pagas para dar mais um sinal.

## 8. Privacidade e cuidados

- **Localização é dado pessoal.** Pedir só quando a pessoa toca, e explicar para quê.
- **Favoritos, "Vou" e Amigos ligados a uma pessoa podem revelar dado sensível.** Um bloco de
  público LGBTQIA+, por exemplo, pode indicar a vida sexual de quem favoritou, e a LGPD trata
  isso com mais rigor. Sugestão: **favoritos só no aparelho**, sem conta, e **nenhuma lista
  pública de quem vai**, até eu decidir com calma.
- Antes de publicar para valer: **termos de uso e política de privacidade**.
- A logo foi gerada por IA: conferir os termos da ferramenta e se existe marca parecida
  registrada (INPI).
- "Como tá?" precisa de regras contra informação falsa, como já levantei (valer só perto do
  lugar e expirar rápido).

## 9. Tudo que está em "ideias em aberto" e onde entra

| Ideia | Quando entra | Depende de |
|---|---|---|
| **Dados de teste reais** (carnaval de 2026) | **0.5.0, feito** | nada |
| **Mapa** com um ponto por lugar e filtro Hoje/Amanhã/Geral | **0.6.0** | coordenadas dos lugares; aprovar o MapLibre |
| Botão "Como chegar" | 0.6.0 | confirmar Waze e Uber |
| Alternar entre lista e mapa | 0.6.0 | desenho da tela |
| Botão de **copiar o link** (decidido) | 0.6.1 | nada |
| Tela que explica a localização, "onde estou" e distância | 0.7.0 | permissão do celular |
| Pontos por bloco e **percurso** | 0.8.0 | coordenadas e percursos dos blocos |
| "Onde o bloco deve estar às 16h" | depois dos percursos | percursos com horário |
| **Dados reais de 2027** | quando a programação sair | a mudança sobre os dias; fonte dos dados |
| Agenda "Começando agora / Daqui a pouco / Mais tarde" | depois dos dados de 2027 | dados reais |
| Filtros por bairro, estilo e tamanho; **busca** | depois | dados reais |
| Página do bloco: tamanho estimado, "como está agora" | depois | dados reais e sinais ao vivo |
| "Possíveis próximos blocos" | depois | dados reais |
| **Offline** completo | 0.9.0 | escolha dos mapas |
| **Favoritos** | depois que eu decidir o que são | decisão (só no aparelho?) |
| "Vou", "Tô aqui" e "Como tá?" | depois do beta | **backend**, regras contra informação falsa |
| "Em alta" calculado | depois do beta | sinais e, talvez, APIs pagas |
| Notificações | depois do beta | backend; no iPhone só funcionam com o site instalado na tela inicial |
| Cadastro de blocos por organizadores | depois do beta | backend e aprovação |
| Dinheiro (destaque pago, ingressos) | **ainda não pensei** | modelo de receita |
| Modo noite | depois | decisão visual |
| Atalhos (postos médicos, táxi e carro de aplicativo) | depois | dados desses lugares |
| Fonte própria | depois | peso (uma só, embutida) |
| Etiquetas "Bombando agora" e "Muito lotado" | depois do beta | sinais ao vivo |
| **Amigos**, "bonde" e o resto da parte social | **por último** (não é o foco) | backend e privacidade |

As versões são **sugestões**. Cada uma é pequena e termina com o site funcionando.

## 10. Roteiro proposto

1. **0.5.0, dados de teste reais (feito).** O carnaval de 2026 com nomes reais, como se hoje
   fosse 30/01/2026.
2. **0.6.0, mapa de leitura.** A aba Mapa mostra os 10 lugares como pontos (com a cor da
   zona), com o mesmo filtro Hoje/Amanhã/Geral da tela inicial. Tocar abre o cartão curto com
   o botão "Como chegar". Sem localização.
3. **0.6.1, copiar o link** de um lugar e de um bloco.
4. **0.7.0, "onde estou"** e a distância, com uma tela que explica a localização antes do
   aviso do celular.
5. **0.8.0, blocos no mapa**, com o ponto de concentração e, onde houver, o percurso.
6. **0.9.0, offline e desempenho** de verdade.
7. **Depois do beta:** backend (Vou, Favoritos com conta), "Em alta" calculado e
   notificações. **A parte social fica por último.**

## 11. O que já decidi e o que ainda preciso decidir

**Já decidi (28/10/2026):**

1. O Macadam é o app que eu citei (os prints estão em `design/referencias`).
2. **Os dados de teste são o carnaval de 2026 de verdade, com nomes reais,** como se hoje fosse
   30/01/2026.
3. **Um ponto por lugar** no primeiro mapa.
4. **A cor dos pontos é a da zona** (pode mudar mais pra frente).
5. O **teste entre Leaflet e MapLibre fica para mais tarde**.
6. **A parte social (Amigos) fica por último**, porque não é o foco.

**Ainda aberto:**

1. **Aprovar o MapLibre com OpenFreeMap** para o mapa (seção 4.1), já que o visual que eu
   gosto exige mapa vetorial.
2. **A grande mudança sobre os dias.** Preciso contar antes de fechar o modelo de dados.
3. **Fonte dos dados reais de 2027** e quem cadastra.
4. **O que serão os Favoritos.** Posso começar só no aparelho?
5. **Quanto eu aceito pagar por mês** (mapas e APIs) no começo?
6. **Onde publicar o site e que endereço usar.** Hoje ele só existe no meu computador.
7. **Como vou ganhar dinheiro.** Isso decide o que preciso medir desde já.
8. **Termos de uso e privacidade**, e a conferência da logo.

## Fontes que li

- Macadam: [App Store](https://apps.apple.com/us/app/macadam-the-step-counter/id1633296501) e
  [termos de uso](https://www.macadam.app/fr/terms)
- [Política dos tiles do OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- [OpenFreeMap](https://openfreemap.org)
- [Instagram, busca por hashtag](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/hashtag-search)
- [Google Maps, preços](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Google Maps, links](https://developers.google.com/maps/documentation/urls/guide)
- [Prefeitura, programação dos blocos 2026](https://prefeitura.sp.gov.br/w/site-da-prefeitura-traz-programa%C3%A7%C3%A3o-dos-blocos-do-carnaval-de-rua-2026)

Valores e tamanhos que vieram de blogs e guias estão marcados como "a conferir".
