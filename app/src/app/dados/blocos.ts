import { Bloco } from './tipos';

/**
 * Os blocos do carnaval de rua de São Paulo em 2026, usados como dados de teste.
 *
 * Vêm da lista oficial dos blocos aprovados, publicada pela SPTuris e pela Secretaria de
 * Cultura no Diário Oficial (Portaria Conjunta nº 1, de 22/01/2026): nome, dia, subprefeitura,
 * itinerário e os horários de concentração (inicio), desfile e término (fim). Os artistas, o
 * estilo e o público vêm de notícias, só nos blocos que elas citam, e os seguidores de cada
 * artista, de contadores públicos do Instagram. Entram só os blocos do Centro, da Zona Sul e da
 * Zona Oeste que têm atração divulgada ou desfilam num circuito de megabloco.
 * Arquivo gerado por design/dados/gerar_dados.py: não mude à mão.
 */
export const BLOCOS: Bloco[] = [
  // Vila Mariana
  { id: 'carnafacul-quem-pede-pede', nome: 'Carnafacul - Quem Pede, Pede', data: '2026-02-07', inicio: '09:00', desfile: '10:00', fim: '14:00', localId: 'vila-mariana', atracoes: [{ nome: 'Ivete Sangalo', inicio: '09:00', seguidores: 36318157 }], estilo: 'axe' },
  { id: 'forrozin', nome: 'Forrozin', data: '2026-02-07', inicio: '12:00', desfile: '13:00', fim: '15:00', localId: 'vila-mariana', atracoes: [{ nome: 'Mariana Aydar', seguidores: 226711 }], estilo: 'forro' },
  { id: 'bicho-maluco-beleza-com-alceu-valenca', nome: 'Bicho Maluco Beleza, com Alceu Valença', data: '2026-02-07', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'vila-mariana', atracoes: [{ nome: 'Alceu Valença', seguidores: 1504108 }] },
  { id: 'quintal-dos-pretos', nome: 'Quintal dos Pretos', data: '2026-02-08', inicio: '12:00', desfile: '13:00', fim: '15:00', localId: 'vila-mariana', atracoes: [{ nome: 'Emicida', seguidores: 2921767 }, { nome: 'Maria Rita', seguidores: 904499 }] },
  { id: 'monobloco', nome: 'Monobloco', data: '2026-02-08', inicio: '15:00', desfile: '16:00', fim: '18:00', localId: 'vila-mariana', atracoes: [{ nome: 'Monobloco' }] },
  { id: 'carna-lau', nome: 'Carna Lau', data: '2026-02-14', inicio: '12:00', desfile: '13:00', fim: '16:00', localId: 'vila-mariana', atracoes: [] },
  { id: 'agrada-gregos', nome: 'Agrada Gregos', data: '2026-02-14', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'vila-mariana', atracoes: [{ nome: 'Gloria Groove', seguidores: 5268515 }, { nome: 'Gretchen' }], publico: 'LGBTQIA+' },
  { id: 'sertanejinho-do-telo', nome: 'Sertanejinho do Teló', data: '2026-02-15', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'vila-mariana', atracoes: [{ nome: 'Michel Teló', seguidores: 11911609 }], estilo: 'sertanejo' },
  { id: 'bloco-da-pocah', nome: 'Bloco da Pocah', data: '2026-02-15', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'vila-mariana', atracoes: [{ nome: 'Pocah', seguidores: 13194686 }], estilo: 'funk' },
  { id: 'bloco-vou-de-taxi', nome: 'Bloco Vou de Táxi', data: '2026-02-16', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'vila-mariana', atracoes: [] },
  { id: 'bloco-da-pabllo', nome: 'Bloco da Pabllo', data: '2026-02-16', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'vila-mariana', atracoes: [{ nome: 'Pabllo Vittar', seguidores: 12300000 }, { nome: 'NMIXX', seguidores: 6141925 }], estilo: 'pop', publico: 'LGBTQIA+' },
  { id: 'galo-da-madrugada', nome: 'Galo da Madrugada', data: '2026-02-17', inicio: '09:00', desfile: '10:00', fim: '14:00', localId: 'vila-mariana', atracoes: [], estilo: 'frevo' },
  { id: 'bloco-solteiro-nao-trai', nome: 'Bloco Solteiro não Trai', data: '2026-02-17', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'vila-mariana', atracoes: [{ nome: 'Gustavo Mioto', seguidores: 9386129 }], estilo: 'sertanejo' },
  { id: 'bloco-da-latinha-mix', nome: 'Bloco da Latinha Mix', data: '2026-02-17', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'vila-mariana', atracoes: [] },
  { id: 'investe-ni-mim', nome: 'Investe Ni Mim', data: '2026-02-21', inicio: '11:00', desfile: '12:00', fim: '15:00', localId: 'vila-mariana', atracoes: [] },
  { id: 'baianasystem', nome: 'BaianaSystem', data: '2026-02-21', inicio: '15:00', desfile: '16:00', fim: '18:00', localId: 'vila-mariana', atracoes: [] },
  { id: 'carnafacul-vem-com-o-gigante', nome: 'Carnafacul - Vem com o Gigante', data: '2026-02-22', inicio: '09:00', desfile: '10:00', fim: '14:00', localId: 'vila-mariana', atracoes: [{ nome: 'Léo Santana', seguidores: 22072857 }], estilo: 'axe' },
  { id: 'bloco-beats', nome: 'Bloco Beats', data: '2026-02-22', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'vila-mariana', atracoes: [{ nome: 'Pedro Sampaio', seguidores: 7665314 }] },
  // Sé
  { id: 'bloco-bahia-sampa', nome: 'Bloco Bahia Sampa', data: '2026-02-07', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'se', atracoes: [] },
  { id: 'batekoo-bloco-de-carnaval', nome: 'BATEKOO - Bloco de Carnaval', data: '2026-02-07', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'bloco-afro-pioneiros-do-samba-reggae', nome: 'Bloco Afro Pioneiros do Samba Reggae', data: '2026-02-07', inicio: '13:00', desfile: '14:00', fim: '17:00', localId: 'se', atracoes: [] },
  { id: 'bloco-xique-xique-do-cairo', nome: 'Bloco Xique Xique do Cairo', data: '2026-02-07', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'bloco-das-putas-vampiras', nome: 'Bloco das Putas Vampiras', data: '2026-02-07', inicio: '15:00', desfile: '16:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'blocos-dos-sem-tetos', nome: 'Blocos dos Sem Tetos', data: '2026-02-07', inicio: '16:00', desfile: '17:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'bloco-skol', nome: 'Bloco Skol', data: '2026-02-08', inicio: '11:00', desfile: '12:00', fim: '17:00', localId: 'se', atracoes: [{ nome: 'Zé Vaqueiro', inicio: '11:30', seguidores: 12351068 }, { nome: 'Calvin Harris', inicio: '14:00', seguidores: 11646547 }, { nome: 'Nattan', inicio: '11:30', seguidores: 11149593 }, { nome: 'Xand Avião', inicio: '11:30', seguidores: 10100618 }, { nome: 'Felipe Amorim', inicio: '11:30' }], estilo: 'eletronico' },
  { id: 'banda-do-fuxico', nome: 'Banda do Fuxico', data: '2026-02-08', inicio: '12:00', desfile: '18:00', fim: '22:00', localId: 'se', atracoes: [] },
  { id: 'academicos-do-baixo-augusta', nome: 'Acadêmicos do Baixo Augusta', data: '2026-02-08', inicio: '15:00', desfile: '16:00', fim: '18:00', localId: 'se', atracoes: [{ nome: 'Péricles', seguidores: 7014765 }, { nome: 'Wilson Simoninha' }, { nome: 'KL Jay' }, { nome: 'Rael' }, { nome: 'Tassia Reis' }, { nome: 'Tulipa Ruiz' }, { nome: 'André Frateschi' }, { nome: 'Rom Santana' }] },
  { id: 'banda-redonda', nome: 'Banda Redonda', data: '2026-02-09', inicio: '17:30', desfile: '20:00', fim: '23:00', localId: 'se', atracoes: [] },
  { id: 'banda-do-candinho', nome: 'Banda do Candinho', data: '2026-02-11', inicio: '19:00', desfile: '21:00', fim: '00:00', localId: 'se', atracoes: [] },
  { id: 'bloco-afro-ilu-oba-de-min', nome: 'Bloco Afro Ilú Obá De Min', data: '2026-02-13', inicio: '19:00', desfile: '20:00', fim: '23:00', localId: 'se', atracoes: [], publico: 'Mulheres' },
  { id: 'bloco-afrikaliente', nome: 'BLOCO AFRIKALIENTE', data: '2026-02-14', inicio: '10:00', desfile: '11:00', fim: '15:00', localId: 'se', atracoes: [] },
  { id: 'bloco-laco-branco', nome: 'Bloco Laço Branco', data: '2026-02-14', inicio: '10:00', desfile: '11:00', fim: '15:00', localId: 'se', atracoes: [] },
  { id: 'bloco-segura-a-onca', nome: 'Bloco Segura a Onça', data: '2026-02-14', inicio: '10:00', desfile: '11:00', fim: '15:00', localId: 'se', atracoes: [] },
  { id: 'djongador-o-bloco', nome: 'Djongador o Bloco', data: '2026-02-14', inicio: '10:00', desfile: '11:00', fim: '15:00', localId: 'se', atracoes: [] },
  { id: 'samby-junior-sp', nome: 'Samby Junior SP', data: '2026-02-14', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'se', atracoes: [], estilo: 'pop' },
  { id: 'tarado-ni-voce', nome: 'Tarado Ni Você', data: '2026-02-14', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'se', atracoes: [], estilo: 'mpb' },
  { id: 'bloco-tardes-de-emorio', nome: 'Bloco Tardes de Emoriô', data: '2026-02-14', inicio: '12:00', desfile: '13:00', fim: '17:00', localId: 'se', atracoes: [] },
  { id: 'bloco-minhoqueens', nome: 'Bloco Minhoqueens', data: '2026-02-14', inicio: '13:00', desfile: '14:00', fim: '17:00', localId: 'se', atracoes: [{ nome: 'Lia Clark', seguidores: 493353 }, { nome: 'MC Xuxu' }], estilo: 'pop', publico: 'LGBTQIA+' },
  { id: 'carnavrah', nome: 'CarnaVrah', data: '2026-02-14', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'perdi-foi-tudo-big-bear', nome: 'Perdi foi Tudo/Big Bear', data: '2026-02-14', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'bloco-preto-zumbiido-afropercussivo', nome: 'Bloco Preto ZUMBIIDO Afropercussivo', data: '2026-02-14', inicio: '15:00', desfile: '16:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'domingo-ela-nao-vai', nome: 'Domingo Ela não Vai', data: '2026-02-15', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'se', atracoes: [], estilo: 'axe' },
  { id: 'bloco-afro-percussivo-batuquedum', nome: 'Bloco Afro Percussivo Batuquedum', data: '2026-02-15', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'bloco-diquebra', nome: 'Bloco Diquebra', data: '2026-02-15', inicio: '14:00', desfile: '15:00', fim: '17:00', localId: 'se', atracoes: [] },
  { id: 'bloco-siga-bem-caminhoneira', nome: 'Bloco Siga Bem Caminhoneira', data: '2026-02-15', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'explode-coracao', nome: 'Explode Coração', data: '2026-02-15', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'se', atracoes: [], estilo: 'mpb' },
  { id: 'sp-forro', nome: 'SP Forró', data: '2026-02-15', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'bloco-educa', nome: 'Bloco éduca', data: '2026-02-16', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'se', atracoes: [] },
  { id: 'moita', nome: 'Moita', data: '2026-02-17', inicio: '10:00', desfile: '11:00', fim: '15:00', localId: 'se', atracoes: [] },
  { id: 'bloco-pagu', nome: 'Bloco Pagu', data: '2026-02-17', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'se', atracoes: [], publico: 'Mulheres' },
  { id: 'pipoca-da-rainha', nome: 'Pipoca da Rainha', data: '2026-02-22', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'se', atracoes: [{ nome: 'Daniela Mercury', seguidores: 1371243 }], estilo: 'axe' },
  // Santo Amaro
  { id: 'bloco-modo-surto', nome: 'Bloco Modo Surto', data: '2026-02-08', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'santo-amaro', atracoes: [{ nome: 'Luísa Sonza', seguidores: 29112113 }, { nome: 'Pocah', seguidores: 13194686 }, { nome: 'Melody' }, { nome: 'Gretchen' }, { nome: 'Zaynara' }, { nome: 'Viviane Batidão' }, { nome: 'Felipe Amorim' }, { nome: 'DENNIS' }, { nome: 'Puterrier' }], estilo: 'pop' },
  { id: 'bloco-gofun-experience', nome: 'Bloco GoFun Experience', data: '2026-02-16', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'santo-amaro', atracoes: [] },
  // Pinheiros
  { id: 'bloco-casa-comigo', nome: 'Bloco Casa Comigo', data: '2026-02-07', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-do-abrava', nome: 'Bloco do Abrava', data: '2026-02-07', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'pinheiros', atracoes: [{ nome: 'Tiago Abravanel', inicio: '12:00', seguidores: 3730929 }] },
  { id: 'os-arrebatados-baby-do-brasil', nome: 'Os Arrebatados (Baby do Brasil)', data: '2026-02-07', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-toca-um-samba-ai', nome: 'Bloco Toca Um Samba Aí', data: '2026-02-07', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-quizomba', nome: 'Bloco Quizomba', data: '2026-02-08', inicio: '09:00', desfile: '10:00', fim: '14:00', localId: 'pinheiros', atracoes: [] },
  { id: 'sambao', nome: 'Sambão', data: '2026-02-08', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-boca-antigo-bloco-boca-de-veludo', nome: 'Bloco Boca (Antigo Bloco Boca de Veludo)', data: '2026-02-08', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-besame-mucho', nome: 'Bloco Besame Mucho', data: '2026-02-14', inicio: '10:00', desfile: '11:00', fim: '14:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-bateria-de-rua', nome: 'Bloco Bateria de Rua', data: '2026-02-14', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-89', nome: 'Bloco 89', data: '2026-02-15', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'pinheiros', atracoes: [{ nome: 'Supla' }], estilo: 'rock' },
  { id: 'bloco-me-lembra-que-eu-vou', nome: 'Bloco Me Lembra Que Eu Vou', data: '2026-02-16', inicio: '09:00', desfile: '10:00', fim: '14:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-dre-tarde', nome: 'Bloco Dré Tarde', data: '2026-02-16', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'nao-serve-mestre', nome: 'Não Serve Mestre', data: '2026-02-16', inicio: '14:00', desfile: '15:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'se-fui-triste-nao-me-lembro', nome: 'Se fui triste nao me lembro', data: '2026-02-17', inicio: '13:00', desfile: '14:00', fim: '17:30', localId: 'pinheiros', atracoes: [{ nome: 'Di Ferrero', seguidores: 1239701 }], estilo: 'rock' },
  { id: 'bloco-praieiro-jammil', nome: 'Bloco Praieiro - Jammil', data: '2026-02-21', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-se-te-pego-nao-te-largo', nome: 'Bloco Se Te Pego não Te Largo', data: '2026-02-21', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  { id: 'bloco-quebrae', nome: 'Bloco Quebraê', data: '2026-02-22', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'pinheiros', atracoes: [] },
  // Lapa
  { id: 'bloco-ritaleena', nome: 'Bloco Ritaleena', data: '2026-02-07', inicio: '12:00', desfile: '13:00', fim: '17:00', localId: 'lapa', atracoes: [] },
  { id: 'fico-fei-nunca-2025', nome: 'Fico fei nunca 2025', data: '2026-02-14', inicio: '11:00', desfile: '12:00', fim: '16:00', localId: 'lapa', atracoes: [] },
  { id: 'bloco-emo', nome: 'Bloco Emo', data: '2026-02-14', inicio: '13:00', desfile: '14:00', fim: '18:00', localId: 'lapa', atracoes: [], estilo: 'rock' },
  { id: 'e-tao-bom', nome: 'É Tão Bom!', data: '2026-02-17', inicio: '12:00', desfile: '13:00', fim: '17:00', localId: 'lapa', atracoes: [] },
];
