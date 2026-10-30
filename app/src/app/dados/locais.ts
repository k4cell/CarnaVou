import { Local } from './tipos';

/**
 * Os lugares: as subprefeituras de São Paulo do Centro, da Zona Sul e da Zona Oeste que têm
 * bloco. Os que têm os artistas mais famosos vêm primeiro.
 * Arquivo gerado por design/dados/gerar_dados.py: não mude à mão.
 */
export const LOCAIS: Local[] = [
  { id: 'vila-mariana', nome: 'Vila Mariana', zona: 'sul' },
  { id: 'se', nome: 'Sé', zona: 'centro' },
  { id: 'santo-amaro', nome: 'Santo Amaro', zona: 'sul' },
  { id: 'pinheiros', nome: 'Pinheiros', zona: 'oeste' },
  { id: 'lapa', nome: 'Lapa', zona: 'oeste' },
];
