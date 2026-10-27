# CarnaVou

**A central do "point" do carnaval de rua de São Paulo.** Responde a pergunta que todo
grupo faz no carnaval: *"pra onde a gente vai agora?"*

> **Situação (27/10/2026): fase de ideia.** Ainda não tem código e a stack (as
> tecnologias) não foi escolhida. Agora estamos fechando o conceito.

---

## De onde veio a ideia

No Carnaval de 2026 o dono do projeto foi com os amigos, e descobrir e decidir aonde ir
era sempre uma bagunça: não ficava claro onde estavam os bloquinhos, as festas e os
lugares com muita gente.

O CarnaVou é uma central que mostra:

- onde vão acontecer os principais blocos e shows de cada dia;
- a localização de cada um;
- as "trends" do momento: onde está bombando, aonde mais gente diz que vai;
- um jeito de compartilhar.

## Decisões já tomadas

| Tema | Decisão |
|---|---|
| **Nome** | **CarnaVou**. Combina com a ideia de um botão "Vou". |
| **Cidade** | São Paulo e Grande SP. Só isso por enquanto. |
| **Público** | Todo mundo, desde o começo. O dono e os amigos estão incluídos. |
| **Objetivo** | Ganhar dinheiro. É um projeto pessoal (pra não ficar parado), mas com esse objetivo. |
| **O principal** | **Descobrir**: o que tem, onde fica, onde está bombando. |
| **Foco** | Carnaval de rua, "de chão": gastar pouco pra beber muito, onde está bombando, onde vai ter artista. Festas pagas e camarotes não são o foco. |
| **Horizonte** | Só carnaval: o de 2027 e o de 2028. Depois disso, ver como fica. |
| **Compartilhar** | Um botão que copia o link. Sem integração nem API do WhatsApp. |

### Sobre compartilhar

Compartilhar não custa nada, nem no WhatsApp nem no Instagram. A API que ficou cara é a do
WhatsApp para empresas, que serve pra um negócio mandar mensagem automática pros clientes.
Não é o caso aqui.

O que dá pra ter de graça:

- **Copiar link**, que é o que está decidido.
- **O menu de compartilhar do próprio celular**, que já mostra WhatsApp, Instagram,
  Telegram etc. Funciona direto do site, sem API. Dá pra mandar até uma imagem do bloco
  pros Stories.
- **Prévia do link**: quando alguém cola o link numa conversa, aparece uma imagem com o
  nome do bloco, o horário e o local.

Ainda não foi decidido se o menu do celular e a prévia entram junto com o "copiar link".
Ter os três não muda o custo.

## Calendário

| Carnaval | Sábado | Terça | Quarta de Cinzas |
|---|---|---|---|
| 2026 (a vivência do dono) | 14/02/2026 | 17/02/2026 | 18/02/2026 |
| **2027 (o alvo)** | **06/02/2027** | **09/02/2027** | **10/02/2027** |
| 2028 | 26/02/2028 | 29/02/2028 | 01/03/2028 |

Em São Paulo costuma ter blocos também nos fins de semana antes do carnaval
(pré-carnaval) e depois dele (pós-carnaval).

## Próximo passo

O dono vai contar como foi o carnaval de 2026 dele. **Estas perguntas ainda não foram
respondidas:**

1. Como vocês descobriam os blocos (Instagram, TikTok, amigos, lista da prefeitura…)?
2. Por que escolhiam um bloco e não outro (artista, perto, barato, estilo)?
3. Teve algum momento em que deu errado, tipo chegar e já ter acabado, estar lotado demais
   ou ninguém saber pra onde ir?
4. O que você queria ter no celular naquela hora?

Com as respostas, a gente fecha o conceito. Só depois escolhe a stack e começa a programar.

### Ainda não discutido

- Como o CarnaVou vai ganhar dinheiro.
- De onde vêm os dados dos blocos (lista da prefeitura, cadastro manual, organizadores…).
- Stack e formato (site, app, site que instala como app).

## Arquivos do projeto

- [`CLAUDE.md`](CLAUDE.md): como trabalhar neste projeto. O Claude Code lê esse arquivo
  sozinho ao abrir o repositório.
- [`docs/ideias-em-aberto.md`](docs/ideias-em-aberto.md): ideias levantadas na primeira
  conversa que **ainda não foram aprovadas**.
