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

## Como escrever os documentos

- O `README.md` e os arquivos em `docs/` são escritos **na primeira pessoa, como se eu
  estivesse escrevendo**: "eu tive a ideia", "eu decidi". Nada de "o dono", e não cite o
  Claude nesses arquivos.

## Fase atual: beta

- Já pode programar. O beta é uma **árvore de opções** com três telas: Em destaque (os
  lugares), um lugar (os dias de festa e os principais artistas) e um bloco (a lista
  detalhada de atrações). Os blocos e os artistas são **fictícios**. Fica de fora, por
  enquanto, o "Vou", o "Tô aqui" e o "Como tá?".
- O visual tem só a **primeira camada de cor**. A paleta fica em variáveis no topo de
  `app/src/styles.scss`: use sempre essas variáveis, nunca uma cor solta. Fundo claro (pra
  ler no sol), roxo na marca, amarelo nos botões e rosa só como detalhe. Amarelo, verde e
  laranja só como fundo, com texto escuro. Rosa nunca em texto pequeno. Sem degradê. As
  letras e o resto do estilo eu decido mais pra frente: não capriche antes de eu pedir.
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
- As telas ficam em `destaques/`, `local/` e `bloco/`, e o banner que se repete fica em
  `banner/`. Os endereços são `/`, `/local/:local` e `/local/:local/:bloco`, e cada um vira
  uma página pronta no `ng build`.
- Os dados ficam em `app/src/app/dados/`: `locais.ts` (os lugares, de verdade) e
  `blocos.ts` (blocos e artistas **fictícios**). A tela avisa que são de exemplo. Nada
  fictício pode parecer um evento de verdade, então não use nomes de artistas reais.

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
- Mensagens de commit em português, com um **título claro**. Quando falar de um commit
  comigo, use o título dele, por extenso. Nunca o código curto (hash): aqueles números só
  uma IA entende.
- Este projeto não tem relação com o CiBase, outro projeto meu. Não mexa em outros
  repositórios.
