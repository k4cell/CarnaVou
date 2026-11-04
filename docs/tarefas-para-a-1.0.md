# Tarefas para a versão 1.0.0

Tudo o que falta para eu lançar a 1.0.0, com a menor chance de imprevisto. Uso esta lista para
ver o que já foi feito: `[x]` está pronto e `[ ]` ainda falta.

**O que eu chamo de 1.0.0:** dados reais de 2027, relógio real, nenhum aviso de teste, endereço
definitivo e páginas legais. Por isso, ela não sai antes da lista oficial de 2027 (a de 2026 saiu
16 dias antes do pré-carnaval).

## 1. Bugs e falhas do código

- [x] Abrir a página nova no topo, e voltar para o mesmo ponto da lista
- [x] Mostrar "carregando" e avisar quando uma tela não abre
- [x] Seta de voltar e menu seguindo de onde eu vim
- [x] Juntar os blocos pelo ponto de saída real, sem cartão gigante na República
- [x] Testar os dados reais antes de publicar
- [x] Avisar também quando tem sinal, mas a internet não passa
- [x] Travar o tema claro e fazer o ícone certo para o Android
- [x] Descobrir do tamanho certo no celular, sem nada empurrando a página para fora

## 2. Nome e marca

- [ ] Pesquisar "CarnaVou" no INPI (`carnavou.com.br`, `carnavou.com` e `carnavou.app.br` já têm dono, e o `.com` mostra uma loja com a marca)
- [ ] Decidir se fico com o nome
- [ ] Conferir os direitos da logo
- [ ] Registrar o domínio (`carnavou.app` e `carnavou.net.br` pareciam livres em 04/11/2026; confirmar no registrador)
- [ ] Registrar a marca, se eu for ganhar dinheiro com ela

## 3. Dados de 2027

- [ ] Rodar o comando de atualização até o fim, com a parte dos trajetos
- [ ] Reconhecer os circuitos pelo nome da rua, e não por um texto exato como "Faria Lima, 4100"
- [ ] Avisar quando um circuito ou um bloco grande sumir
- [ ] Rodar o comando com a lista oficial de 2027
- [ ] Conferir à mão os pinos dos maiores blocos (45 dos 84 de hoje são aproximados)
- [ ] Buscar os artistas, começando pelos blocos que voltam todo ano (`design/dados/historico-dos-megablocos.json`)
- [ ] Marcar os megablocos, para os gigantes sem artista não ficarem lá embaixo (Galo da Madrugada, Tarado Ni Você)
- [ ] Atualizar os seguidores dos artistas
- [ ] Ajustar os nomes crus para o nome que o povo usa ("BLOCO AFRIKALIENTE", "Fico fei nunca 2025")
- [ ] Reconfirmar os bares do After e os horários deles

## 4. Sair do modo de teste

- [ ] Trocar a data fixa pelo relógio real
- [ ] Tirar o aviso "Teste" e o texto "Versão de teste"
- [ ] Testar com o relógio real: bloco começando e acabando, virada da meia-noite e app voltando do segundo plano
- [ ] Usar sempre o fuso de São Paulo, e não o do celular
- [ ] Criar a tela de antes do pré-carnaval
- [ ] Criar a tela de depois do fim do carnaval
- [ ] Tirar a data de teste `?hoje=` do site publicado, depois dos últimos testes

## 5. Correção de última hora

- [ ] Poder marcar um bloco como cancelado ou com horário mudado
- [ ] Criar um arquivo de correções que continue valendo quando os dados forem gerados de novo
- [ ] Conseguir publicar uma correção pelo celular
- [ ] Mostrar a data da última atualização dos dados
- [ ] Fazer a correção chegar sem depender do toque em "Atualizar"

## 6. Hospedagem e mapa

- [ ] Escolher a hospedagem definitiva (o GitHub Pages não permite tocar um negócio online e tem limite de 100 GB por mês)
- [ ] Migrar o site para o endereço definitivo
- [ ] Redirecionar o endereço antigo, sem deixar quem já instalou preso na versão velha
- [ ] Ter um plano B para o mapa, porque a OpenFreeMap não garante que continue no ar
- [ ] Guardar uma cópia do mapa de São Paulo na nossa hospedagem

## 7. Legal

- [ ] Página de Termos de uso
- [ ] Página de Privacidade (LGPD)
- [ ] Página Sobre, com contato
- [ ] Deixar claro que o app não é oficial e que os horários podem mudar
- [ ] Créditos das fontes (Diário Oficial, OpenStreetMap, OpenFreeMap, MapLibre), dizendo que os dados do OpenStreetMap estão sob a licença ODbL e com o link para corrigir o mapa
- [ ] Perguntar à FOSSGIS (fossgis-routing-server@openstreetmap.de) se posso usar o serviço de rotas num projeto comercial, antes de gerar os dados de 2027
- [ ] Se o repositório ficar privado, publicar à parte os pontos e as linhas dos blocos, porque a licença ODbL pede que dados derivados continuem abertos

## 8. Testes

- [ ] iPhone: Safari e instalado
- [ ] Android: Chrome, Samsung Internet e um celular fraco
- [ ] Navegador interno do Instagram, do WhatsApp e do TikTok
- [ ] Modo avião de verdade e rede lenta
- [ ] Primeira visita, e iPhone depois de 7 dias sem abrir
- [ ] Leitor de tela: TalkBack e VoiceOver
- [ ] Teste automático em navegador real antes de publicar

## 9. O que melhorar

- [x] Busca por artista, bloco, lugar, zona ou estilo, aceitando erros de digitação e mostrando o que já aconteceu
- [x] Favoritos no aparelho
- [x] Filtro por lugar, junto por zona (os dados têm o lugar, e não o bairro de cada bloco)
- [x] Tirar a data repetida em cada linha do mesmo cartão
- [x] Tirar o artista repetido no nome do bloco
- [x] Mostrar em cada linha do cartão se o bloco já começou
- [x] Mostrar o próximo dia quando "Hoje" tiver pouco bloco
- [x] Avisar "pronto para usar sem internet"
- [x] Tela de abertura no lugar da tela vazia

## 10. Divulgação

- [ ] Prévia do link no WhatsApp, com imagem e o nome do bloco
- [ ] Botão de compartilhar do celular
- [ ] Descrição própria em cada página
- [ ] Mapa do site e `robots.txt`
- [ ] Dados de evento para o Google
- [ ] Pedir para instalar na tela de início

## 11. O que retirar

- [x] O servidor Express, que o site publicado não usa
- [x] As fotos do Macadam do repositório público (ficaram só no meu computador, em `design/privado/`)
- [ ] Esconder o que continua público: as fotos nos commits antigos e os documentos com a minha estratégia (depende de o repositório ficar privado)
- [x] O nome "Em alta", que promete tendência e mostra fama (agora é "Principais lugares")
- [x] As menções a "Tô aqui" e "Como tá?", que eu descartei
- [x] A pasta `.claude/` do Git

## 12. Arrumar no código

- [x] Publicar como site estático, sem a parte de servidor
- [x] Apertar o limite de peso do build
- [x] Fazer o service worker guardar os pedaços do mapa de verdade
- [x] Endereço dos blocos que não muda quando a lista oficial é corrigida, e link antigo continua abrindo
- [x] Corrigir o identificador nos scripts de dados e conferir as regras de uso do OpenStreetMap
- [x] Atualizar o `vite` (falha só no ambiente de desenvolvimento)
- [x] Colocar o README em dia

## 13. Operação no carnaval

- [ ] Congelar o código antes do pré-carnaval e, depois disso, mexer só em dados
- [ ] Testar como voltar para a versão anterior
- [ ] Monitor de queda do site
- [ ] Contagem de visitas sem identificar ninguém
- [ ] Registro de erros dos celulares
- [ ] Verificação em duas etapas no GitHub
- [ ] Definir quem corrige os dados enquanto eu estiver no bloco

## 14. Decisões minhas

- [ ] Fico com o nome depois da pesquisa no INPI?
- [x] Busca e favoritos entram na 1.0? Sim
- [x] Qual nome fica no lugar de "Em alta"? "Principais lugares" (posso trocar)
- [ ] Qual é o critério de blocos em 2027, inclusive na Leste e na Norte?
- [ ] O app cobre só a capital? O README ainda diz "Grande SP"
- [ ] Como vou ganhar dinheiro e o que preciso medir desde o primeiro dia?
- [ ] O repositório fica privado?
- [ ] O modo Maratona e o pedido de instalar entram?

## Calendário

| Quando | O quê |
|---|---|
| Novembro | Nome e domínio, bugs, limpeza, migração e páginas legais |
| Dezembro | Busca e favoritos, mapa próprio, correções rápidas, testes em navegador real e ensaio completo |
| Quando a lista sair | Dados, pinos e artistas, modo real e testes em celulares |
| Antes de 30/01 (data estimada do pré) | Congelar o código e lançar a 1.0.0 |
| Carnaval | Só correção de dados |
