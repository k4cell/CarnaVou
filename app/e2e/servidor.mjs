// Serve o site montado (dist/app/browser) para o teste no navegador, do jeito do GitHub Pages: na
// pasta /CarnaVou/, com a página pronta de cada endereço (pasta/index.html), o 404.html para o
// endereço que não existe e o .mjs como JavaScript (sem isso, o mapa não abre).
//
// Uso, dentro de app/: node e2e/servidor.mjs [porta]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const PASTA = resolve(import.meta.dirname, '..', 'dist', 'app', 'browser');
const BASE = '/CarnaVou/';
const PORTA = Number(process.argv[2] ?? 4300);
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.pbf': 'application/x-protobuf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(PASTA, 'index.html'))) {
  console.error('Falta o site montado: rode antes "npx ng build --configuration production,github-pages".');
  process.exit(1);
}

function entregar(resposta, caminho, status = 200) {
  resposta.writeHead(status, {
    'Content-Type': TIPOS[extname(caminho)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  createReadStream(caminho).pipe(resposta);
}

createServer((pedido, resposta) => {
  const endereco = decodeURIComponent(new URL(pedido.url, 'http://localhost').pathname);
  if (endereco === '/' || endereco === '/CarnaVou') {
    resposta.writeHead(301, { Location: BASE });
    resposta.end();
    return;
  }
  if (!endereco.startsWith(BASE)) {
    resposta.writeHead(404);
    resposta.end();
    return;
  }
  const caminho = normalize(join(PASTA, endereco.slice(BASE.length)));
  if (!caminho.startsWith(PASTA)) {
    resposta.writeHead(403);
    resposta.end();
    return;
  }
  if (existsSync(caminho) && statSync(caminho).isFile()) {
    entregar(resposta, caminho);
  } else if (existsSync(join(caminho, 'index.html'))) {
    entregar(resposta, join(caminho, 'index.html'));
  } else {
    // Como o GitHub Pages: o 404.html (a casca do app) com o status 404. A publicação cria o 404.html
    // copiando a casca; montado aqui, sem a cópia, vale a casca direto.
    const naoExiste = [join(PASTA, '404.html'), join(PASTA, 'index.csr.html')].find((arquivo) => existsSync(arquivo));
    if (naoExiste) {
      entregar(resposta, naoExiste, 404);
    } else {
      resposta.writeHead(404);
      resposta.end();
    }
  }
}).listen(PORTA, '127.0.0.1', () => console.log(`Site em http://127.0.0.1:${PORTA}${BASE}`));
