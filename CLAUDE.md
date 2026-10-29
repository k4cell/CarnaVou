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

- Já pode programar. O beta é uma **árvore de opções** com três telas: Em alta (os lugares,
  com o filtro Hoje / Amanhã / Geral), um lugar (os dias de festa e os principais artistas) e um bloco (a lista
  detalhada de atrações). Embaixo fica o menu fixo: Descobrir, Mapa, Amigos e Favoritos, e
  as três últimas abas mostram só "Em breve" por enquanto. Os dados de teste são o carnaval
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
- Os **selos** dos cartões ("Já começou", "Hoje às 16h", "Amanhã às 11h", "5 blocos") ficam **sem cor** por
  enquanto: não coloque cor neles até eu pedir.
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
- As telas ficam em `destaques/`, `local/` e `bloco/`; o banner que se repete fica em
  `banner/`, o menu de baixo em `menu/` e a tela "Em breve" em `em-breve/`. Os endereços
  são `/`, `/local/:local`, `/local/:local/:bloco`, `/mapa`, `/amigos` e `/favoritos`, e
  cada um vira uma página pronta no `ng build`.
- As páginas prontas não sabem o dia de hoje. O que depende da data (as abas Hoje e Amanhã
  e os selos) é calculado no navegador, depois da primeira pintura, pelo serviço em
  `relogio/`. Pra testar, abra o site com `?hoje=2027-02-06T14:00` no endereço: aí "hoje" fica
  parado nessa data e a tela avisa que é uma data de teste.
- A logo e as imagens de referência ficam em `design/`, cada uma com legenda no
  `design/README.md`. O que o site usa fica em `app/public/logo/` e `app/public/icons/`:
  se a logo mudar, gere de novo a partir de `design/logo/`.
- Os dados ficam em `app/src/app/dados/`: `locais.ts` (os 10 lugares) e `blocos.ts` (o
  carnaval de rua de 2026, reconstituído de notícias, com nomes reais). **Não invente
  dado**: só vale o que uma fonte diz e, na dúvida, deixe em branco. As fontes e a confiança
  de cada bloco estão em `docs/dados-carnaval-2026.md`; se achar uma divergência nova,
  anote lá. O "hoje" do app é 30/01/2026 (`DATA_DE_DEMONSTRACAO`, em `relogio/`) e a tela
  avisa que é data de teste. Antes de mostrar o site pra outras pessoas, pergunte se eu
  quero trocar pelos dados de 2027 ou avisar que é a simulação de 2026.

## Repositório

- Trabalhe **direto na `main`** deste repositório (`k4cell/CarnaVou`). Não crie branches,
  forks nem cópias do projeto.
- No meu computador, a pasta do projeto é a **`carnavou`, na minha Área de Trabalho**. O
  código vai ali, e ela fica ligada a este repositório.
- Eu prefiro **poucos commits, mais concretos**, principalmente neste começo. Nada de
  várias mudanças pequenas: junte o trabalho num commit que faça sentido.
- Faça o **commit** do que for feito, mas **não dê push sem eu autorizar**. Depois do
  commit, pergunte: "Fiz o commit, posso dar o push?". Eu confiro tudo e respondo, por
  exemplo, "pode dar" ou "pode publicar o commit". Só publique depois desse aval, e só o
  que eu autorizei. Só o que está no GitHub fica.
- **Versões:** **todo push leva um número de versão**, não esqueça. O número fica em `app/package.json` e o histórico no
  `CHANGELOG.md`. Enquanto o app está em beta uso `0.MEIO.FINAL`: o número do meio sobe
  quando entra tela ou funcionalidade nova (0.5.0) e o último, numa correção pequena
  (0.4.1). Antes de pedir o aval do push, escolha o número, diga qual é e por quê, e suba
  no `package.json` (`npm version X.Y.Z --no-git-tag-version`, dentro de `app/`), troque o título "Próxima versão" do
  `CHANGELOG.md` pelo número e a data, ponha o número na linha da Situação do README e
  marque o commit com a etiqueta `vX.Y.Z` (git tag). A etiqueta vai pro GitHub junto com o
  push, com o meu aval. Se eu disser outro número, troque.
- Mensagens de commit em português, com um **título claro**. Quando falar de um commit
  comigo, use o título dele, por extenso. Nunca o código curto (hash): aqueles números só
  uma IA entende.
- Este projeto não tem relação com o CiBase, outro projeto meu. Não mexa em outros
  repositórios.
