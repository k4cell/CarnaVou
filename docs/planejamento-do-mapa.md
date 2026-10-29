# Planejamento do mapa e das próximas fases

> **Pausa tática (28/10/2026), atualizada depois dos prints do Macadam e das minhas
> respostas.** Escrevi isto antes de programar o mapa, para escolher o caminho com calma e não
> criar um problema difícil de arrumar depois. **O que eu aprovar vai para o**
> [`README.md`](../README.md).

## Andamento

| Versão | O que é | Estado |
|---|---|---|
| 0.4.1 | Este planejamento e o cabeçalho sem a frase | feito |
| 0.5.0 | Dados de teste reais: o carnaval de 2026 | feito |
| 0.6.0 | Mapa de leitura: um ponto por lugar, com a cor da zona | feito |
| 0.6.1 | O service worker só guarda o MapLibre depois de eu abrir o mapa | feito, no mesmo commit da 0.7.0 |
| 0.7.0 | "Onde estou" e distância | feito |
| 0.7.1 | Copiar o link, a cor do lugar até o bloco e o menu sem Amigos e Favoritos | feito, no mesmo commit da 0.8.0 |
| 0.8.0 | Blocos no mapa: os trajetos dos megablocos | feito |
| **0.9.0** | **Offline e desempenho** | **feito** |
| depois | Backend, Favoritos, "Em alta" calculado e, **por último**, a parte social | |
| fim do projeto | Decidir o que dá para cortar para o site ficar ainda mais leve | depois |

**O que a 0.6.0 trouxe (feito):**

- A aba Mapa, com o MapLibre e o mapa da OpenFreeMap num estilo lilás nosso, que só carrega
  quando eu abro a aba.
- Um pino por lugar, na cor da zona, e o cartão curto com "Como chegar" (Google Maps e Waze).
- O filtro Hoje / Amanhã / Geral no mapa, o mesmo da tela inicial.
- As coordenadas dos 10 lugares e o "hoje" de teste em 07/02/2026.

**O que falta (limites da 0.6.0):**

- **Conferir à mão** se cada pino cai no ponto de encontro certo (as coordenadas vieram do
  OpenStreetMap).
- No Centro, três pinos ficam um em cima do outro quando o mapa está afastado. Dá para
  separar com o zoom; agrupar os pinos fica para depois.
- Não testei num celular de verdade nem num celular fraco. A localização eu só testei
  simulando a posição no navegador do computador: falta ver o aviso do celular de verdade, no
  iPhone e no Android.
- O Uber ficou fora do "Como chegar" (não confirmei o link dele).

**O que a 0.6.1 trouxe (feito):**

- O MapLibre, o estilo e o worker ficam em `mapa/` e só são baixados quando eu abro a aba
  Mapa. O service worker (o que faz o site funcionar como app) deixou de baixá-los na
  primeira visita: eram uns 246 kB a mais, mesmo para quem nunca abria o mapa. Agora ele só
  guarda o que a pessoa abriu. Isso é o código do mapa: os pedaços do mapa em si (ruas e
  letras) continuam vindo da internet.

**O que a 0.7.0 trouxe (feito):**

- O botão redondo "onde estou" no mapa e a tela que explica a localização antes do aviso do
  celular ("Continuar" e "Agora não").
- A bolinha rosa com o círculo de precisão, e o mapa chega perto da pessoa.
- A distância, em linha reta, no cartão do ponto.
- Avisos para quem negou, para quando o celular não acha a posição, para navegador sem
  localização e para quem está fora da Grande São Paulo.

**O que a 0.7.1 trouxe (feito):**

- O botão "Copiar link" nas páginas do lugar e do bloco, com o endereço limpo.
- A cor de cada lugar acompanha o lugar até o fim: os banners da página dele e as atrações
  dos blocos têm a mesma faixa do cartão da lista.
- Tirei as abas Amigos e Favoritos do menu, que só mostravam "Em breve".

**O que a 0.8.0 trouxe (feito):**

- Os trajetos dos megablocos no mapa, como linhas na cor da zona, nos seis lugares com trajeto
  nas fontes. O do lugar escolhido fica mais grosso, e o mapa enquadra o trajeto inteiro.
- O cartão do ponto com o trajeto em palavras e os blocos do lugar na aba.
- "Ver no mapa" nas páginas do lugar e do bloco, e o endereço da concentração na página do
  bloco, quando a fonte deu.

**O que falta (limites da 0.8.0):**

- O trajeto é do lugar, não de cada bloco: um bloco pode ter feito um caminho um pouco
  diferente.
- Quatro lugares ficam sem trajeto: Santo Amaro, República, Pinheiros e Vila Madalena e Centro
  Histórico.
- O mapa não marca onde cada trajeto começa e termina (concentração e dispersão), só a linha.
- "Onde o bloco deve estar às 16h" continua para depois: precisa do horário em cada trecho.

**O que a 0.9.0 trouxe (feito):**

- O site funciona sem internet com o que já foi aberto: as páginas, os blocos e o mapa das
  áreas já vistas. O mapa fica guardado depois de aberto uma vez com internet.
- O aviso "Sem internet" no cabeçalho, e a mensagem certa no mapa quando ele ainda não foi
  guardado.
- A logo em WebP (de 51 kB para 16,5 kB): a primeira visita caiu de uns 144 kB para uns 110 kB.
- O service worker entrega uma casca vazia para qualquer endereço, sem mostrar a tela inicial
  por um instante antes da página certa.

**O que falta (limites da 0.9.0):**

- **Não testei num celular de verdade, nem com a internet caindo de verdade.** Testei o build
  com o servidor do site desligado. Os pedaços do mapa no cache do navegador eu conferi pelas
  regras da OpenFreeMap (guardar por 10 anos), não desligando a internet.
- Os pedaços do mapa ficam no cache do navegador, que pode apagá-los se o celular ficar sem
  espaço. Sem internet, as áreas que a pessoa não viu ficam em branco.
- **Para publicar:** o servidor tem que mandar os arquivos `.mjs` como JavaScript, senão o mapa
  não abre. E o servidor Node do Angular recusa qualquer endereço que não esteja na lista dele
  (uma proteção contra ataques), então é preciso dizer qual é o endereço do site.

**O que falta decidir:** veja "Ainda aberto", na seção 11.

**Como usar este documento:** a cada passo, o que foi feito, o que falta e os próximos passos
saem daqui e vão para a conversa.

## O que ficou de fora

Tudo o que ficou para depois, num lugar só. Quando eu resolver um item, ele sai daqui.

**Mapa e dados:**

1. **Os pedaços do mapa ficam no cache normal do navegador**, não no service worker, porque
   quem pede os pedaços é o worker do MapLibre, que não passa pelo service worker. A OpenFreeMap
   manda guardar cada pedaço por 10 anos, mas o celular pode apagar esse cache se faltar
   espaço. Sem internet, as áreas que a pessoa não viu ficam em branco.
2. O trajeto é do lugar, não de cada bloco: um bloco pode ter feito um caminho um pouco
   diferente.
3. Quatro lugares ficam sem trajeto, porque as fontes não dão começo e fim: Santo Amaro,
   República, Pinheiros e Vila Madalena e Centro Histórico.
4. O mapa não marca onde cada trajeto começa e termina (concentração e dispersão), só a linha.
5. Conferir à mão se cada pino cai no ponto de encontro certo (as coordenadas vieram do
   OpenStreetMap).
6. No Centro, três pinos ficam um em cima do outro quando o mapa está afastado.
7. O Uber ficou fora do "Como chegar", porque não confirmei como o link dele funciona.
8. "Onde o bloco deve estar às 16h" precisa do horário em cada trecho do trajeto.

**Testes:**

9. Não testei num celular de verdade, nem num celular fraco.
10. A localização só foi testada simulando a posição no computador: falta ver o aviso do
    celular de verdade, no iPhone e no Android.
11. O "sem internet" foi testado com o servidor do site desligado, e não com a internet do
    celular caindo de verdade.

## Cuidados para publicar

1. **O servidor tem que mandar os arquivos `.mjs` como JavaScript** (o tipo `text/javascript`).
   Se mandar como texto, o mapa não abre. Foi o que aconteceu no primeiro teste da 0.9.0, com o
   servidor do Python no Windows. As hospedagens comuns já mandam certo, mas vale conferir
   abrindo o mapa logo depois de publicar.
2. **O servidor Node do Angular só aceita os endereços que estão na lista dele**
   (`allowedHosts`), uma proteção contra um tipo de ataque. Hoje a lista está vazia no
   `angular.json`, então ele recusa as páginas. É preciso pôr ali o endereço do site, ou passar o
   endereço na variável `NG_ALLOWED_HOSTS` ao ligar o servidor. Como todas as páginas do
   CarnaVou são geradas prontas, também dá para publicar só os arquivos de
   `app/dist/app/browser` numa hospedagem de arquivos, sem o servidor Node. Aí este cuidado não
   vale, mas o primeiro continua valendo.

## 1. O que eu quero do mapa

Um mapa **simples, intuitivo, preciso e com vários pontos sinalizados**, parecido com o do
Macadam. Para o CarnaVou isso vira estas regras:

- **Leve.** Celular fraco e internet ruim no meio da multidão. Hoje a primeira tela pesa
  cerca de 87 kB (comprimida); o mapa não pode estragar isso.
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

**Decidi (28/10/2026): MapLibre com OpenFreeMap (opção B)**, com um estilo nosso (fundo
lilás, ruas suaves e os pontos nas cores das zonas), **carregado só quando a pessoa abre a
aba Mapa**. O custo é uns 246 kB a mais (comprimidos), só para quem abre o mapa, e o mapa
precisa de WebGL, que quase todo celular tem. O mapa fica **isolado num componente com
interface própria**, para trocar de biblioteca sem mexer no resto. O teste com o Leaflet, que
eu quis deixar para mais tarde, só vale se o MapLibre pesar demais num celular fraco.

**Como ficou na 0.6.0:** o estilo vem do "positron" da OpenFreeMap, recolorido por um script
(`design/mapa/gerar-estilo-do-mapa.py`). As letras, os ícones e os mapas em si continuam
vindo do servidor da OpenFreeMap, que pede o crédito à vista. Ela não tem chave nem limite
declarado, mas também não promete disponibilidade: se cair, o mapa mostra um aviso e manda
para a lista.

### 4.2 Os pontos

- **Hoje:** um ponto por lugar (os 10 lugares em destaque), com a cor da zona ou do selo.
- **Depois:** um ponto por bloco (onde ele se concentra) e uma linha para o percurso, quando
  houver.
- **Como ficou na 0.8.0:** em vez de um ponto por bloco, uma linha por lugar, o circuito que a
  CET fecha para os megablocos dali. Os blocos do dia aparecem no cartão do ponto.
- Com centenas de pontos, agrupar os que estão perto (cluster).
- Tocar no ponto abre um **cartão curto**: nome, selo, artistas e o botão "Como chegar".

### 4.3 Localização da pessoa

- Só pede a localização **quando a pessoa toca em "onde estou"**, nunca de cara.
- Sem rastreamento contínuo e sem segundo plano (bateria e privacidade).
- Quem negar continua usando o app normalmente.

**Como ficou na 0.7.0:** o botão redondo "onde estou" fica no mapa. Se o celular ainda vai
perguntar, aparece antes uma tela que explica para que serve ("Continuar" e "Agora não"). Se
a pessoa já deixou, vai direto; se já negou, só avisa. É uma leitura por toque, e a posição
fica só na memória, sem guardar nem enviar. Quem está fora da Grande São Paulo recebe um aviso,
porque o mapa não sai de lá.

### 4.4 "Como chegar"

Links que abrem o app de mapa do celular, sem API paga:

- **Google Maps:** `https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE`
  (formato da documentação oficial).
- **Waze e Uber:** o formato eu ainda **não confirmei** na documentação deles; confiro antes
  de usar.

### 4.5 Offline

O site já guarda o que precisa no celular (service worker). Para o mapa:

- os pontos e os dados do dia **sempre** ficam guardados;
- o MapLibre, o estilo e o worker só ficam guardados **depois de eu abrir o mapa** pela
  primeira vez (0.6.1), para a primeira visita ficar leve;
- o fundo do mapa guarda só o que a pessoa já viu, com limite de tamanho e de idade;
- o OpenStreetMap oficial **não permite** baixar a cidade para uso offline; já o OpenFreeMap e
  o PMTiles permitem, com regras.

**Como ficou na 0.9.0:** o service worker guarda o MapLibre, o estilo, o índice do mapa, as
letras e os ícones (até 300 arquivos, por 30 dias). Os pedaços do mapa ficam no cache do
navegador, porque quem pede os pedaços é o worker do MapLibre, que não passa pelo service
worker, e a OpenFreeMap manda guardar cada pedaço por 10 anos. Não baixo a cidade inteira.

### 4.6 Peso e acesso

- O mapa só carrega quando a pessoa abre a aba Mapa (a primeira tela continua leve).
- A lista "Em alta" **continua existindo**: o mapa nunca é a única forma de achar um bloco.

## 5. Os dados: o ponto mais delicado

**Hoje:** 10 lugares e 50 blocos reais do carnaval de 2026, usados como teste, como se hoje
fosse 07/02/2026 (o primeiro dia do pré-carnaval). É uma reconstituição de notícias e guias, com a fonte e a confiança de cada
bloco em [`dados-carnaval-2026.md`](dados-carnaval-2026.md). As coordenadas dos 10 lugares
estão em `locais.ts` e ainda preciso conferi-las à mão.

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
| **Mapa** com um ponto por lugar e filtro Hoje/Amanhã/Geral | **0.6.0, feito** | conferir as coordenadas à mão |
| Botão "Como chegar" | **0.6.0, feito** (Google Maps e Waze) | Uber: confirmar o link |
| Alternar entre lista e mapa | **0.6.0, feito**, pelo menu de baixo (Descobrir e Mapa) | nada |
| Botão de **copiar o link** (decidido) | **0.7.1, feito** | nada |
| Tela que explica a localização, "onde estou" e distância | **0.7.0, feito** | testar num celular de verdade |
| Pontos por bloco e **percurso** | **0.8.0, feito** (uma linha por lugar, onde a CET deu o trajeto) | trajeto de cada bloco e dos lugares que faltam |
| "Onde o bloco deve estar às 16h" | depois dos percursos | percursos com horário |
| **Dados reais de 2027** | quando a programação sair | a mudança sobre os dias; fonte dos dados |
| Agenda "Começando agora / Daqui a pouco / Mais tarde" | depois dos dados de 2027 | dados reais |
| Filtros por bairro, estilo e tamanho; **busca** | depois | dados reais |
| Página do bloco: tamanho estimado, "como está agora" | depois | dados reais e sinais ao vivo |
| "Possíveis próximos blocos" | depois | dados reais |
| **Offline** | **0.9.0, feito** (com o que já foi aberto) | testar num celular de verdade |
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
   fosse 07/02/2026.
2. **0.6.0, mapa de leitura (feito).** A aba Mapa mostra os 10 lugares como pontos (com a cor da
   zona), com o mesmo filtro Hoje/Amanhã/Geral da tela inicial. Tocar abre o cartão curto com
   o botão "Como chegar". Sem localização.
3. **0.6.1, o service worker só guarda o MapLibre depois de eu abrir o mapa (feito).**
4. **0.7.0, "onde estou" e a distância (feito),** com uma tela que explica a localização antes
   do aviso do celular.
5. **0.7.1, copiar o link (feito)** de um lugar e de um bloco.
6. **0.8.0, blocos no mapa (feito):** o trajeto dos megablocos de cada lugar, onde a CET deu o
   trajeto.
7. **0.9.0, offline e desempenho (feito).**
8. **Depois do beta:** backend (Vou, Favoritos com conta), "Em alta" calculado e
   notificações. **A parte social fica por último.**

## 11. O que já decidi e o que ainda preciso decidir

**Já decidi (28 e 29/10/2026):**

1. O Macadam é o app que eu citei (os prints estão em `design/referencias`).
2. **Os dados de teste são o carnaval de 2026 de verdade, com nomes reais,** como se hoje fosse
   07/02/2026 (eu tinha começado com 30/01 e mudei, para as abas Hoje e Amanhã terem blocos).
3. **Um ponto por lugar** no primeiro mapa.
4. **A cor dos pontos é a da zona** (pode mudar mais pra frente).
5. O **teste entre Leaflet e MapLibre fica para mais tarde**.
6. **A parte social (Amigos) fica por último**, porque não é o foco.
7. **Aprovei o MapLibre com OpenFreeMap** para o mapa (seção 4.1).
8. **A "grande mudança sobre os dias" era usar os dias do carnaval de 2026** nos dados de
   teste. Já está feito, na 0.5.0.
9. **O service worker só guarda o MapLibre depois de eu abrir o mapa** (0.6.1).
10. **A localização só liga quando eu toco em "onde estou"**, depois de uma tela que explica.
    É uma leitura por toque: sem acompanhar o caminho, sem segundo plano e sem guardar nem
    enviar a posição (0.7.0).
11. **Tirei as abas Amigos e Favoritos** do menu de baixo, até eu decidir o que serão
    (0.7.1).
12. **Trajeto só com fonte:** só entra no mapa o trajeto que tem começo e fim numa fonte; sem
    isso, o lugar fica só com o pino (0.8.0).
13. **Sem internet, vale o que já foi aberto:** o mapa guarda só as áreas já vistas, sem baixar
    a cidade inteira (0.9.0).
14. **No fim do projeto, decido o que dá para cortar** para o site ficar ainda mais leve.

**Ainda aberto:**

1. **Fonte dos dados reais de 2027** e quem cadastra.
2. **O que serão os Favoritos.** Posso começar só no aparelho?
3. **Quanto eu aceito pagar por mês** (mapas e APIs) no começo?
4. **Onde publicar o site e que endereço usar.** Hoje ele só existe no meu computador.
5. **Como vou ganhar dinheiro.** Isso decide o que preciso medir desde já.
6. **Termos de uso e privacidade**, e a conferência da logo.
7. **A bolinha deve acompanhar a pessoa andando?** Hoje é uma leitura por toque, que gasta
   menos bateria e é mais privado.
8. **Onde mostrar a distância?** Hoje só no cartão do ponto, no mapa. Dá para mostrar também
   na lista Descobrir e em etiquetas ao lado dos pinos, como no Macadam.
9. **Quando a pessoa já deixou, o mapa abre já mostrando onde ela está?** Hoje só depois do
   toque no botão.
10. **A cor da bolinha** (hoje o rosa da logo) e **o texto da tela que explica**.

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
