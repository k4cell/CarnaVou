# Histórico de versões

Aqui está o que mudou em cada versão do CarnaVou. O número da versão atual fica em
[`app/package.json`](app/package.json).

Enquanto o app está em beta, o número é `0.MEIO.FINAL`. O número do meio sobe quando entra
uma tela ou funcionalidade nova (0.3.0, 0.4.0…) e o último, quando é só uma correção pequena
(0.3.1). Cada versão tem uma etiqueta no GitHub, como `v0.3.0`.

## 0.11.2 (30/10/2026)

- Arrumação do código, sem mudar nada na tela: a regra que junta os blocos por ponto do mapa foi
  para os dados (com testes próprios), os desenhos do mapa saíram do componente do mapa e os
  nomes que ficaram errados foram corrigidos.

## 0.11.1 (30/10/2026)

- Os grandes pontos do carnaval voltam a ser lugares com nome próprio (Parque Ibirapuera, Rua da
  Consolação e Baixo Augusta, Avenida Faria Lima, Av. Ipiranga, São João e República, Rua Henrique
  Schaumann e Avenida Paulo VI); os outros blocos ficam na subprefeitura. São 7 lugares, e todos os
  blocos têm ponto no mapa.

## 0.11.0 (30/10/2026)

- Os dados passam a vir da lista oficial do Diário Oficial: só Centro, Zona Sul e Zona Oeste, e
  só os blocos com atração ou num circuito de megabloco, em ordem de fama (seguidores dos
  artistas). Cada lugar é uma subprefeitura e tem os 4 blocos mais famosos em destaque. No mapa,
  cada bloco tem o ponto da concentração e a linha do trajeto, com começo e fim.

## 0.10.1 (29/10/2026)

### Mudou

- **Os blocos do mesmo dia num cartão só**, na página do lugar: um embaixo do outro, sem o
  espaço branco entre eles, cada um com o dia, o nome, o artista e o horário.

### Anotei

- A fonte dos dados passa a ser o Diário Oficial. O que achei testando no celular (o pino fora
  da concentração, poucos blocos e nenhum na Zona Leste ou Norte) fica para a 0.11.0.

## 0.10.0 (29/10/2026)

### Entrou

- **O beta no ar para teste**, no GitHub Pages: https://k4cell.github.io/CarnaVou/. A cada push na main, o GitHub
  roda os testes e publica o site sozinho. Se um teste falhar, fica no ar a versão anterior.
- **O aviso de versão de teste** no alto de todas as páginas: "os blocos e os horários são do
  carnaval de rua de 2026". Quem chega por um link cai direto na página do lugar ou do bloco,
  e já vê o aviso.
- **A configuração de build `github-pages`**, com o endereço `/CarnaVou/`.

### Mudou

- A data de teste das abas mostra o ano, em números, numa linha só: "Data de teste: Sábado,
  7/2/2026, 12h".
- A descrição do site, a que aparece no Google, diz que é a versão de teste com os blocos de
  2026.

## 0.9.0 (29/10/2026)

### Entrou

- **O aviso "Sem internet"**, no canto do cabeçalho, quando a internet cai. Ele some quando ela
  volta, e o cabeçalho não muda de altura.
- **O mapa sem internet:** depois de aberto uma vez com internet, o mapa abre sem ela. O
  service worker guarda o MapLibre, o estilo, o índice do mapa, as letras e os ícones (até 300
  arquivos, por 30 dias). Os pedaços do mapa já vistos ficam no cache do navegador, que a
  OpenFreeMap manda guardar por 10 anos.
- **A mensagem certa no mapa sem internet:** quando o mapa ainda não foi guardado, ele explica
  que precisa ser aberto uma vez com internet, em vez de dizer que não abre neste celular.

### Mudou

- **A logo em WebP:** caiu de 51 kB para 16,5 kB, sem diferença a olho nu, com o PNG de
  reserva para navegador antigo. Ela também fica guardada, para o cabeçalho funcionar sem
  internet.
- **O service worker entrega uma casca vazia** (`index.csr.html`) para qualquer endereço, em
  vez da tela inicial pronta. Antes, quem voltava ao site por um link de lugar ou de bloco
  podia ver a tela inicial por um instante antes da página certa.

### Peso

- A primeira visita ficou com cerca de 110 kB (código, logo, HTML e CSS, comprimidos). Antes
  eram uns 144 kB: quase um quarto a menos, quase tudo por causa da logo.

## 0.8.0 (29/10/2026)

### Entrou

- **Os trajetos dos megablocos no mapa:** uma linha na cor da zona, pelas ruas, nos seis
  lugares que a CET publicou com começo e fim: Ibirapuera (Av. Pedro Álvares Cabral),
  Consolação, Faria Lima, Ipiranga com São João, Paulo VI e Henrique Schaumann. O trajeto do
  lugar escolhido fica mais grosso, e o mapa chega perto para mostrar o trajeto inteiro.
- **No cartão do ponto:** o trajeto em palavras e os blocos do lugar na aba (até três), cada
  um levando para a página do bloco. Na Geral, com o dia na frente.
- **"Ver no mapa"** nas páginas do lugar e do bloco: abre o mapa já com o lugar escolhido, e
  passa para a aba Geral quando o lugar não tem bloco hoje.
- **O endereço da concentração** na página do bloco, quando a fonte deu (cinco blocos, por
  enquanto).
- **O script dos trajetos** (`design/mapa/gerar-circuitos.py`): acha os pontos no
  OpenStreetMap e traça o caminho pelas ruas.
- **O botão "Copiar link"** nas páginas do lugar e do bloco. Ele copia o endereço limpo da
  página (sem a data de teste `?hoje=`) e avisa "Link copiado!". Quando o navegador não deixa
  copiar, pede para eu copiar o endereço na mão.

### Mudou

- O cartão do ponto não passa de uns 45% da tela (o resto rola dentro dele), e os botões vêm
  antes da lista de blocos, para "Como chegar" ficar à vista.

### Arrumei

- **A cor do lugar acompanha o lugar até o fim.** Os banners da página do lugar e as atrações
  da página do bloco tinham sempre a faixa rosa. Agora têm a mesma cor do cartão do lugar na
  lista (a Consolação é amarela, o Ibirapuera é rosa…). A cor sai de um lugar só e passa para
  tudo o que está dentro da página.

### Saiu

- **As abas Amigos e Favoritos** do menu de baixo. Elas só mostravam "Em breve" e pesavam o
  site (eram duas páginas prontas a mais). Os endereços antigos voltam para o início. Elas
  voltam quando eu decidir o que serão.

### Peso

- A primeira tela está com cerca de 87,6 kB (comprimida). Os trajetos só são baixados com o
  mapa, e a tela do mapa ficou com uns 8,6 kB.

## 0.7.0 (29/10/2026)

### Entrou

- **O botão "onde estou"** no mapa: um botão redondo e branco, no canto de baixo, à direita.
- **A tela que explica a localização**, antes do aviso do celular: para que serve, que o app
  não segue o caminho, que a posição não é guardada nem enviada e que dá para não usar. Tem
  "Continuar" e "Agora não".
- **A bolinha rosa com o círculo de precisão** no mapa, e o mapa chega perto da pessoa.
- **A distância no cartão do ponto**, em linha reta: "A 2,6 km de você, em linha reta."
- **Os avisos:** o celular não deixou, não achou a posição agora, o navegador não tem
  localização, ou a pessoa está fora da Grande São Paulo. O mapa continua funcionando.

### Como a localização funciona

- Só liga quando eu toco no botão. Uma leitura por toque: não acompanha o caminho e não usa a
  localização em segundo plano.
- A posição fica só na memória, enquanto o site está aberto. Não é guardada nem enviada.
- Quando a pessoa já deixou, o toque procura direto. Quando já negou, só avisa, sem pedir de
  novo.

### Mudou

- **O MapLibre saiu do código do Angular.** O build copia os arquivos dele para a pasta
  `mapa/` do site, e eles só são baixados quando eu abro a aba Mapa. Antes, o service
  worker (o que faz o site funcionar como app) baixava o MapLibre, uns 246 kB, logo na
  primeira visita, mesmo para quem nunca abria o mapa. Agora ele só guarda o que a pessoa
  abriu.
- O limite de tamanho do CSS de um componente voltou para 4 kB (aviso) e 8 kB (erro), porque o
  CSS do MapLibre não fica mais dentro de um componente.

### Peso

- A primeira tela está com cerca de 87 kB (comprimida). O MapLibre (uns 246 kB) e a tela do
  mapa (uns 7 kB) só são baixados quando eu abro a aba Mapa.

## 0.6.0 (28/10/2026)

### Entrou

- **O mapa**, na aba Mapa: um mapa de São Paulo nas cores do app (lilás), com um pino para
  cada lugar na cor da zona. É feito com o MapLibre e o mapa livre da OpenFreeMap, e só
  carrega quando eu abro a aba.
- **O cartão do ponto:** tocar num pino mostra o nome, a zona, o selo e os artistas, com os
  botões "Como chegar" (Google Maps), "Waze" e "Ver o lugar". Tocar no × ou no mapa vazio
  fecha o cartão.
- **O filtro Hoje / Amanhã / Geral no mapa:** é o mesmo da tela inicial, e a aba que eu
  escolho numa tela vale na outra. Aba sem bloco mostra o aviso e fica sem pinos.
- **As coordenadas dos 10 lugares**, tiradas do OpenStreetMap.
- **O estilo do mapa**, gerado por um script em `design/mapa/` a partir do estilo "positron"
  da OpenFreeMap, recolorido com a paleta do app.

### Mudou

- **O "hoje" de teste agora é 07/02/2026** (sábado, primeiro dia do pré-carnaval), e não mais
  30/01. Assim as abas Hoje e Amanhã já abrem com blocos.
- O filtro e as abas viraram peças que a tela inicial e o mapa dividem. A tela inicial
  continua igual.
- O limite de tamanho do estilo de um componente subiu para 80 kB (aviso) e 100 kB (erro),
  só por causa do CSS do MapLibre, que vem junto com o mapa.

### Peso

- A primeira tela está com cerca de 87 kB (comprimida). O MapLibre (cerca de 246 kB
  comprimido) e a tela do mapa só são baixados na aba Mapa.

## 0.5.0 (28/10/2026)

### Entrou

- **Dados de teste reais:** o carnaval de rua de 2026 de São Paulo, com nomes reais de blocos
  e artistas (50 blocos nos 10 lugares). É uma reconstituição de notícias e guias, não a lista
  oficial; as fontes e a confiança de cada bloco estão em `docs/dados-carnaval-2026.md`.
- **O "hoje" de demonstração:** o app começa em 30/01/2026 e avisa que é data de teste. A
  data no endereço (`?hoje=2026-02-14T14:00`) continua valendo.
- **Os prints do Macadam**, com legenda, na pasta `design/`, e a análise deles no
  planejamento do mapa.
- **O andamento** no planejamento do mapa: o que foi feito, o que falta e o que ainda
  preciso decidir.

### Mudou

- **Os 10 lugares:** saíram Berrini, Minhocão e Largo da Batata (sem blocos confirmados em
  2026) e entraram Santo Amaro, Pinheiros e Vila Madalena e Centro Histórico (Sé e Liberdade).
- O estilo e as atrações de um bloco agora são opcionais, porque as fontes nem sempre dizem.
  Quem não tem atração divulgada mostra um aviso.
- Na aba Geral, os artistas de cada lugar são os dos blocos de hoje em diante.
- A lista de atrações de um bloco vem em ordem de hora, quando as horas existem.
- No planejamento, a sugestão de mapa passou a ser MapLibre com OpenFreeMap, porque o visual
  do Macadam exige mapa vetorial.

### Saiu

- Os blocos e artistas inventados.

## 0.4.1 (28/10/2026)

### Entrou

- **O planejamento do mapa e das próximas fases**, em `docs/planejamento-do-mapa.md`: o que
  levantei sobre o Macadam, as opções de mapa, os dados, as APIs de tendências, a privacidade,
  um roteiro de versões e as perguntas que ainda preciso responder.

### Mudou

- Tirei a frase "Pra onde a gente vai?" do cabeçalho.

## 0.4.0 (28/10/2026)

### Entrou

- **Uma etiqueta colorida com a zona** em cada lugar, na tela Em destaque e na página do
  lugar: Centro roxo, Zona Sul verde, Zona Leste amarelo, Zona Oeste vermelho e Zona Norte azul.
- **Duas cores novas**, vermelho e azul, nas faixas dos cartões. O padrão agora tem sete
  cores, do rosa ao azul.
- **O filtro Hoje / Amanhã / Geral** no topo da tela inicial. Hoje e Amanhã mostram só os
  lugares com bloco naquele dia; Geral mostra todos.
- **Um selo em cada lugar** (sem cor): "Já começou", "Hoje às 16h", "Amanhã às 11h" ou o número
  de blocos que ainda vão passar ali.
- **A data de teste**: abrindo o site com `?hoje=2027-02-06T14:00`, "hoje" fica parado nesse
  dia e hora, e a tela avisa.

### Mudou

- Os artistas ficaram mais evidentes: o primeiro nome vem em negrito e maior, e o "da
  semana" saiu.
- A borda de fora da página agora tem a cor escura do cabeçalho, em vez de ficar branca.
- A lista da tela inicial passou a se chamar "Em alta" (era "Em destaque"). Os artistas de
  cada cartão agora são os do dia, nas abas Hoje e Amanhã.

## 0.3.1 (28/10/2026)

### Mudou

- A logo, o ícone do app e o favicon foram refeitos a partir da imagem maior da logo
  (2752 × 1536 pixels), e ficaram mais nítidos. É a mesma logo.

## 0.3.0 (28/10/2026)

### Entrou

- **A logo oficial** no cabeçalho, no ícone do app e no favicon. A pasta `design/` guarda a
  logo e as imagens de referência, cada uma com a sua legenda.
- **O menu de baixo**, sempre à mostra: Descobrir, Mapa, Amigos e Favoritos. Mapa, Amigos e
  Favoritos abrem uma tela que só diz "Em breve".
- **Os artistas da semana** em cada lugar da tela Em destaque.
- **Uma faixa de cor em cada lugar**, num padrão de cinco cores que se repete.
- **O público-alvo** na página do bloco (como LGBTQIA+, mulheres ou eletrônica), só quando é
  claro.
- **O controle de versões**: este histórico e a etiqueta `v0.3.0`.

### Mudou

- O cabeçalho ficou escuro, com o azul da logo.
- As cores de amarelo, rosa e laranja agora são as da logo.

### Saiu

- O aviso de "dados de exemplo" que aparecia em todas as telas.

## Antes da 0.3.0

As versões ainda não tinham número. O que já existia:

- O site em Angular, que instala como app e funciona com as páginas prontas.
- As três telas: Em destaque, um lugar e um bloco, com blocos e artistas fictícios.
- A primeira camada de cor: fundo claro, cabeçalho roxo, botão amarelo e faixa rosa.
