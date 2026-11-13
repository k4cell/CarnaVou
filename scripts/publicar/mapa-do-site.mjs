// Grava o mapa do site (sitemap.xml) e o robots.txt na pasta do site montado, depois do `ng build`.
// Roda dentro de app/: node ../scripts/publicar/mapa-do-site.mjs dist/app/browser
// - sitemap.xml: todas as páginas prontas (cada index.html), menos as que só redirecionam (/blocos).
// - robots.txt: deixa os buscadores entrarem e diz onde está o mapa do site.
// O endereço do site vem de src/app/divulgacao/endereco-do-site.ts, o mesmo da prévia dos links.
// Os buscadores só leem o robots.txt na raiz do domínio: no github.io (o site mora em /CarnaVou/), ele
// só vale quando o domínio próprio entrar. Até lá, o mapa do site pode ser enviado ao Google na mão.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const pasta = process.argv[2];
if (!pasta) {
  throw new Error('Uso: node ../scripts/publicar/mapa-do-site.mjs dist/app/browser');
}

const codigo = readFileSync('src/app/divulgacao/endereco-do-site.ts', 'utf8');
const endereco = codigo.match(/ENDERECO_DO_SITE = '([^']+)'/)?.[1];
if (!endereco?.endsWith('/')) {
  throw new Error('Não achei o ENDERECO_DO_SITE (com a barra no fim) em endereco-do-site.ts.');
}

/** As pastas com uma página pronta, do jeito que o endereço termina ("", "local/ibirapuera/"…). */
function paginas(dentro) {
  const achadas = [];
  for (const item of readdirSync(dentro, { withFileTypes: true })) {
    const caminho = join(dentro, item.name);
    if (item.isDirectory()) {
      achadas.push(...paginas(caminho));
    } else if (item.name === 'index.html' && !readFileSync(caminho, 'utf8').includes('http-equiv="refresh"')) {
      const pastaDaPagina = relative(pasta, dentro).split(sep).join('/');
      achadas.push(pastaDaPagina ? `${pastaDaPagina}/` : '');
    }
  }
  return achadas;
}

const escapar = (texto) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const enderecos = paginas(pasta)
  .sort((a, b) => a.length - b.length || a.localeCompare(b))
  .map((caminho) => `  <url><loc>${escapar(endereco + caminho)}</loc></url>`);

writeFileSync(
  join(pasta, 'sitemap.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...enderecos,
    '</urlset>',
    '',
  ].join('\n'),
);
writeFileSync(join(pasta, 'robots.txt'), ['User-agent: *', 'Allow: /', '', `Sitemap: ${endereco}sitemap.xml`, ''].join('\n'));
console.log(`Mapa do site com ${enderecos.length} páginas.`);
