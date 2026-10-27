# Ideias em aberto

Ideias que surgiram nas primeiras conversas sobre o projeto (27/10/2026). Muita coisa aqui
não é como eu pensei e algumas são boas, mas ainda não separei quais.

**Nada aqui é decisão.** O que eu decidir vai para o [`README.md`](../README.md).

---

## Já respondidas pelas decisões

| Sugestão | O que foi decidido |
|---|---|
| Começar por uma cidade só | São Paulo e Grande SP |
| Compartilhar com um cartão bonito no WhatsApp | Botão que copia o link, sem integração com o WhatsApp |
| Festas pagas e camarotes na primeira versão? | Foco no carnaval de rua, de chão |
| O principal: descobrir ou decidir em grupo? | Descobrir |
| Só carnaval ou o ano todo? | Só o carnaval de 2027 |

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

## Formato sugerido

Um **site que se instala como app (PWA)**. O link abre direto, sem precisar instalar nada,
e não depende de aprovação na App Store. Se pegar, faz um app nativo depois.

## Primeira versão sugerida

1. Uma cidade só
2. Agenda do dia com filtros
3. Mapa com local e percurso
4. Página do bloco e botão de compartilhar
5. "Vou" e o ranking dos mais esperados
6. "Tô aqui" e "Como tá?" simples
7. Agenda do dia funcionando offline
8. Ver tudo sem cadastro; login rápido só pra interagir
