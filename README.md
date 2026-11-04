<p align="center">
  <img src="design/logo/logo-emblema.png" alt="" width="96">
</p>

<h1 align="center">CarnaVou</h1>

<p align="center">
  O aplicativo para encontrar os blocos do carnaval de rua de São Paulo.
  <br>
  <a href="https://k4cell.github.io/CarnaVou/"><strong>Abrir o CarnaVou</strong></a>
</p>

O CarnaVou responde à pergunta que todo grupo faz no carnaval: **pra onde a gente vai agora?** Ele mostra o
que está rolando, o que vem depois, onde fica e como chegar, sem cadastro e direto no celular.

> Versão beta, com os dados do carnaval de 2026.

## O que ele faz

- **Blocos:** o que está rolando agora e o que vem depois, com os blocos do mesmo ponto juntos.
- **Busca e filtros:** por bloco, artista, lugar ou dia, mesmo com pequenos erros de digitação.
- **Favoritos:** os blocos marcados ficam guardados no próprio aparelho.
- **Mapa:** a concentração e o trajeto de cada bloco, com rotas a pé, de Uber e de metrô.
- **After:** os blocos da noite e os bares para depois.
- **Sem internet:** instala como app e continua abrindo quando a rede cai na multidão.

## Tecnologia

Feito com [Angular](https://angular.dev) e [MapLibre GL JS](https://maplibre.org), como um site estático
que se instala como app (PWA).

```bash
cd app
npm ci
npx ng serve
```

## Dados e créditos

- **Blocos:** lista oficial publicada no Diário Oficial da Cidade de São Paulo. O CarnaVou é independente e
  não tem vínculo com a Prefeitura. Horários e atrações podem mudar.
- **Mapa:** [OpenFreeMap](https://openfreemap.org), [OpenMapTiles](https://openmaptiles.org) e dados do
  [OpenStreetMap](https://www.openstreetmap.org/copyright), sob a licença ODbL.
