// Prepara os arquivos do site antes do `ng build` da publicação. Roda dentro de app/.
// - correcoes.json: grava a data do último commit que mexeu nos dados e tira as instruções, que só
//   servem para quem edita o arquivo.
// - ngsw-config.json: grava o número da versão, para o app só avisar de versão nova quando ele mudar.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const ARQUIVOS_DOS_DADOS = [
  'public/correcoes.json',
  'src/app/dados/blocos.ts',
  'src/app/dados/locais.ts',
  'src/app/dados/lugares-do-after.ts',
];

const ler = (arquivo) => JSON.parse(readFileSync(arquivo, 'utf8'));

const data = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...ARQUIVOS_DOS_DADOS], { encoding: 'utf8' }).trim();
if (!data) {
  throw new Error('Não achei o commit que mexeu nos dados. O checkout precisa do histórico (fetch-depth: 0).');
}
const { blocos } = ler('public/correcoes.json');
writeFileSync('public/correcoes.json', JSON.stringify({ atualizadoEm: data, blocos }));

const servicoDeOffline = ler('ngsw-config.json');
servicoDeOffline.appData = { versao: ler('package.json').version };
writeFileSync('ngsw-config.json', JSON.stringify(servicoDeOffline, null, 2));

console.log(`Dados de ${data}; versão ${servicoDeOffline.appData.versao}.`);
