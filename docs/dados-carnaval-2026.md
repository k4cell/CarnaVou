# Os dados de teste: o carnaval de rua de São Paulo em 2026

Para testar o app, eu uso o **carnaval de rua de 2026 de verdade**, como se hoje fosse
**07/02/2026** (sábado, primeiro dia do pré-carnaval). Os nomes são reais. Este documento diz de onde vieram os dados, como escolhi
quando as fontes discordam e o que ainda precisa de conferência.

> **Aviso importante.** Isto é uma **reconstituição** feita de notícias e guias, **não é a
> lista oficial**. Eu não consegui abrir o site da Prefeitura ([carnavalsp.com](https://www.carnavalsp.com)),
> que só carrega com JavaScript. As fontes **discordam** em muitos horários, e às vezes até no
> dia e no local. Serve para testar o app, **não para ninguém sair de casa**. Antes de
> mostrar para outras pessoas, trocar pelos dados de 2027.

## Como o carnaval de 2026 aconteceu em São Paulo

- **Pré-carnaval:** sábado 7 e domingo 8 de fevereiro.
- **Carnaval:** de sábado 14 a terça 17 de fevereiro.
- **Pós-carnaval:** sábado 21 e domingo 22 de fevereiro.
- Foram cerca de 630 blocos. A programação oficial saiu no Diário Oficial em 23/01/2026.
- **O app começa em 07/02/2026**, o primeiro dia do pré-carnaval, para as abas Hoje e Amanhã
  já terem blocos. Em 30/01, que foi a primeira data que usei, ainda não tinha nenhum
  megabloco e as duas abas ficavam vazias. Para ver outro dia, abra o site com a data no
  endereço, por exemplo `?hoje=2026-02-14T14:00`.

## Como eu escolhi os dados

1. **Hora de início = hora da concentração**, que é como os guias e a Prefeitura publicam.
2. **Hora de fim = a dispersão**, e **só quando pelo menos duas fontes concordam**. Na dúvida,
   deixo em branco (o app mostra só a hora que começa).
3. **Quando as fontes divergem em horário:** vale a que mais fontes repetem. Se empata, a
   mais detalhada ou a mais recente antes do evento.
4. **Quando divergem no dia ou no local**, e eu não consegui decidir, **o bloco ficou de fora**
   (lista no fim).
5. **Estilo e público-alvo** só aparecem quando alguma fonte diz (por exemplo, "megabloco
   LGBTQIAPN+" ou "bloco feminista"). Não inventei.
6. **Artistas** só os que as fontes citam. Quando o bloco não tem artista divulgado, fica sem.
7. **A hora de cada atração** (como "Calvin Harris às 14h") só quando a fonte dá.

## Os 10 lugares

A lista anterior tinha Berrini, Minhocão e Largo da Batata. **Não achei blocos confirmados de
2026 nesses três**, então troquei por lugares que têm blocos confirmados. **Continua não
sendo um ranking oficial de público**: a ordem vem do tamanho dos blocos que as fontes citam
(por exemplo, 1,2 milhão no bloco da Ivete, segundo a Polícia Militar, e cerca de 500 mil
esperados no MinhoQueens).

| Lugar | Zona | Observação |
|---|---|---|
| Parque Ibirapuera (Av. Pedro Álvares Cabral, do Obelisco ao Monumento às Bandeiras) | Sul | Os megablocos de artista |
| Rua da Consolação e Baixo Augusta | Centro | Calvin Harris e Baixo Augusta; houve superlotação em 8/02 |
| Avenida Faria Lima (4100 a 4500) | Oeste | Abrava, Banda Eva e Supla |
| República (Praça da República, Largo do Arouche) | Centro | |
| Avenida Ipiranga com São João | Centro | MinhoQueens e Tarado Ni Você |
| Santo Amaro | Sul | Bloco da Luísa Sonza |
| Pinheiros e Vila Madalena | Oeste | Muitos blocos pequenos |
| Avenida Henrique Schaumann | Oeste | Casa Comigo |
| Avenida Paulo VI | Oeste | Megabloco Emo |
| Centro Histórico (Sé e Liberdade) | Centro | Pátio do Colégio e Praça da Liberdade |

**Nenhum dos 10 fica na Zona Leste ou na Zona Norte.** As cores dessas duas zonas existem, mas
ainda não aparecem.

## Os blocos

**Confiança:** **alta** = três ou mais fontes concordam; **média** = duas fontes
concordam; **baixa** = uma fonte só ou fontes que discordam.

### Parque Ibirapuera

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Quem Pede, Pede (Ivete Sangalo) | 07/02 | 8h, até 14h | média | 8h na véspera (Band, Correio da Manhã, DCI) ou 9h (Band em 29/01, Viva); o cortejo saiu às 9h |
| Bloco Forrozin (Mariana Aydar) | 07/02 | 13h às 15h | média | |
| Bicho Maluco Beleza (Alceu Valença) | 07/02 | 15h às 18h | média | Uma fonte (SBT) diz Vila Mariana às 14h |
| Quintal dos Prettos (com Emicida e Maria Rita) | 08/02 | 11h às 15h | média | |
| Monobloco | 08/02 | 14h às 18h | média | CNN diz 16h às 18h na Vila Mariana |
| Agrada Gregos (Gloria Groove e Gretchen) | 14/02 | 13h às 18h | alta | 14h em duas fontes |
| Sertanejinho do Teló (Michel Teló) | 15/02 | 11h às 16h | alta | Band: 12h; o bloco atrasou |
| Bloco da Pocah | 15/02 | 13h às 18h | média | Billboard: 14h |
| Bloco da Pabllo (Pabllo Vittar e NMIXX) | 16/02 | 13h às 18h | alta | 14h em uma fonte; teve uma segunda data em 17/02 (só uma fonte) |
| Galo da Madrugada (SP) | 17/02 | 9h às 14h | alta | 10h em duas fontes; uma fonte diz 14/02 |
| Bloco Solteiro Não Trai (Gustavo Mioto) | 17/02 | 11h | média | 12h às 16h em uma fonte |
| Bloco da Latinha Mix | 17/02 | 13h | média | |
| Navio Pirata (BaianaSystem) | 21/02 | 15h às 18h | alta | 13h e 14h em duas fontes |
| Vem com o Gigante (Léo Santana) | 22/02 | 9h às 14h | alta | Uma fonte (SBT) diz 21/02 na Faria Lima; outra, 10h |
| Bloco Beats (Pedro Sampaio) | 22/02 | 14h às 18h | média | |

### Rua da Consolação e Baixo Augusta

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Bloco Skol (Calvin Harris) | 08/02 | 11h às 16h | alta | Calvin Harris subiu no trio às 14h; aquecimento a partir das 11h30 (Nattan, Xand Avião, Zé Vaqueiro e Felipe Amorim) |
| Acadêmicos do Baixo Augusta | 08/02 | 13h às 19h | média | 14h em outras fontes. Atrações: Wilson Simoninha, Péricles, KL Jay, Rael, Tassia Reis, Tulipa Ruiz, André Frateschi, Rom Santana |
| Eu Sou do Axé | 16/02 | 14h às 18h | baixa | 13h em uma fonte |
| Bloco da Salete Campari (LGBTQIAPN+) | 17/02 | 14h às 18h | baixa | 13h em uma fonte; outras datas (08/02, 21/02) em outras |
| Pipoca da Rainha (Daniela Mercury) | 22/02 | 13h às 18h | alta | |

### Avenida Faria Lima

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Bloco do Abrava (Tiago Abravanel) | 07/02 | 11h às 16h | média | |
| Beleza Rara e Boca (Banda Eva) | 08/02 | 14h às 18h | média | 12h em uma fonte; o SBT diz Berrini |
| Bloco 89 (Supla) | 15/02 | 13h às 18h | alta | |
| Se Fui Triste Não Me Lembro (Di Ferrero) | 17/02 | 13h | média | |

### República

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Ilú Obá de Min | 13/02 | 19h às 23h | baixa | Uma fonte diz 15/02 |
| Samby & Júnior | 14/02 | 11h | média | 12h às 16h em duas fontes |
| Bloco Domingo Ela Não Vai | 15/02 | 12h às 16h | média | 11h em uma fonte |
| Bloco Explode Coração | 15/02 | 15h às 18h | média | |
| Bloco Meu Santo é Pop | 21/02 | 14h às 17h | média | |

### Avenida Ipiranga com São João

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Tarado Ni Você | 14/02 | 11h às 15h | alta | 13h em uma fonte; teve outra data em 22/02 |
| MinhoQueens (Lia Clark e MC Xuxu) | 14/02 | 12h às 17h | média | 13h em duas fontes |
| Bloco Pagu | 17/02 | 11h | média | |

### Santo Amaro

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Modo Surto (Luísa Sonza) | 08/02 | 13h às 18h | baixa | Uma fonte diz 14/02 no Ibirapuera |

### Pinheiros e Vila Madalena

Vêm de um guia só (o resumo diário do Rio Times), por isso a confiança é **baixa**. Vários
blocos desfilam em mais de um dia.

| Bloco | Dia | Concentração |
|---|---|---|
| Bloco do Escocês | 14/02 | 10h |
| Bloco MPBebados | 14/02 | 13h |
| Gringolôco | 14/02 e 17/02 | 16h |
| Bloco Bastardo | 15/02 e 17/02 | 13h |
| Bloco Jegue Elétrico | 15/02 | 13h |
| Forró da Taylor | 15/02 | 10h |

### Avenida Henrique Schaumann

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Casa Comigo | 07/02 | 11h | média | |
| Bloco Me Lembra Que Eu Vou | 16/02 | 10h às 14h | baixa | 9h em outras fontes; uma diz 15/02 |

### Avenida Paulo VI

| Bloco | Dia | Concentração | Confiança | O que divergiu |
|---|---|---|---|---|
| Megabloco Emo | 14/02 | 13h | alta | Cerca de 100 mil pessoas esperadas |

### Centro Histórico (Sé e Liberdade)

Também de um guia só, com confiança **baixa**.

| Bloco | Dia | Concentração |
|---|---|---|
| Cordão da Madonna | 08/02 | 14h |
| Bloco dos Bancários | 14/02 | 10h |
| Bloco Otaku | 14/02 (13h às 18h) e 17/02 (11h) | |
| Tecnomacumba | 14/02 (14h às 18h) e 15/02 (14h) | |

## O que deixei de fora, e por quê

- **Bloco do Sargento Pimenta.** A Veja São Paulo (28/01/2026) noticiou que ele **não
  desfilaria em São Paulo em 2026**. Algumas listas ainda o traziam.
- **Beleza Rara na Berrini, Vou de Táxi na Berrini e Bangalafumenga na Paulo VI.** Só um guia
  (SBT), que erra em outros pontos. Os outros dizem Faria Lima (Beleza Rara) e não confirmam os demais.
- **Largadinho (Claudia Leitte).** Uma fonte diz Faria Lima em 08/02; outras não confirmam.
- **Filhos de Gil, Banda do Trem Elétrico, Bloco da Lisa, MistoQuente, Bota pra Ferver,
  Bateria de Rua, Besame Mucho, Siga Bem Caminhoneira e Carnablack.** O dia ou o horário muda
  de uma fonte para outra e eu não consegui decidir.
- **Bloco CarnaLau (Lauana Prado).** Só uma fonte.
- Os outros cerca de 580 blocos. **Só ficaram os dos 10 lugares.**

## O que preciso conferir

1. Os horários marcados com confiança **baixa**, de preferência na lista oficial
   ([carnavalsp.com](https://www.carnavalsp.com)).
2. Se vale trocar algum dos 10 lugares quando a programação de 2027 sair.
3. Se eu quero uma lista de blocos mais completa para os testes (hoje são cerca de 50).

## Principais fontes

[CNN Brasil](https://www.cnnbrasil.com.br/entretenimento/carnaval/confira-a-programacao-completa-do-carnaval-de-rua-2026-de-sao-paulo/),
[SBT News](https://sbtnews.sbt.com.br/noticia/cultura/guia-dos-megablocos-2026-confira-a-agenda-dos-gigantes-em-sp-rj-e-bh-de-07-a-28-de-fevereiro),
[BNews](https://www.bnewssaopaulo.com.br/noticias/entretenimento/leo-santana-pabllo-e-mais-veja-os-blocos-de-famosos-no-carnaval-de-sp.html),
[Brasil Turis](https://brasilturis.com.br/2026/02/13/blocos-carnaval-sao-paulo/),
[Encontrar Rua Augusta](https://www.encontraruaaugusta.com.br/2026/01/29/carnaval-sp-2026-todos-os-blocos-de-rua-datas-horarios-e-onde-curtir-em-sao-paulo/),
[Tô Pensando em Viajar](https://www.topensandoemviajar.com/blocos-carnaval-rua-sp/),
resumos diários do Rio Times (por exemplo, [14/02](https://www.riotimesonline.com/sao-paulo-daily-brief-for-saturday-february-14-2026/)),
Band, Billboard Brasil, Metrópoles, Catraca Livre, DCI, Correio da Manhã, IstoÉ e a página
da [Subprefeitura de Pinheiros](https://prefeitura.sp.gov.br/web/pinheiros/w/programa%C3%A7%C3%A3o-blocos-carnaval).
