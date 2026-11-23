// French regions and departments, plus large cities, used for location search and CV detection.
window.VE_GEO = (() => {
  const R = {
    ARA: 'Auvergne-Rhône-Alpes', BFC: 'Bourgogne-Franche-Comté', BRE: 'Bretagne', CVL: 'Centre-Val de Loire',
    COR: 'Corse', GES: 'Grand Est', HDF: 'Hauts-de-France', IDF: 'Île-de-France', NOR: 'Normandie',
    NAQ: 'Nouvelle-Aquitaine', OCC: 'Occitanie', PDL: 'Pays de la Loire', PAC: "Provence-Alpes-Côte d'Azur",
    GUA: 'Guadeloupe', MTQ: 'Martinique', GUF: 'Guyane', LRE: 'La Réunion', MAY: 'Mayotte',
  };
  const D = [
    ['01', 'Ain', 'ARA'], ['03', 'Allier', 'ARA'], ['07', 'Ardèche', 'ARA'], ['15', 'Cantal', 'ARA'], ['26', 'Drôme', 'ARA'],
    ['38', 'Isère', 'ARA'], ['42', 'Loire', 'ARA'], ['43', 'Haute-Loire', 'ARA'], ['63', 'Puy-de-Dôme', 'ARA'], ['69', 'Rhône', 'ARA'],
    ['73', 'Savoie', 'ARA'], ['74', 'Haute-Savoie', 'ARA'],
    ['21', "Côte-d'Or", 'BFC'], ['25', 'Doubs', 'BFC'], ['39', 'Jura', 'BFC'], ['58', 'Nièvre', 'BFC'], ['70', 'Haute-Saône', 'BFC'],
    ['71', 'Saône-et-Loire', 'BFC'], ['89', 'Yonne', 'BFC'], ['90', 'Territoire de Belfort', 'BFC'],
    ['22', "Côtes-d'Armor", 'BRE'], ['29', 'Finistère', 'BRE'], ['35', 'Ille-et-Vilaine', 'BRE'], ['56', 'Morbihan', 'BRE'],
    ['18', 'Cher', 'CVL'], ['28', 'Eure-et-Loir', 'CVL'], ['36', 'Indre', 'CVL'], ['37', 'Indre-et-Loire', 'CVL'], ['41', 'Loir-et-Cher', 'CVL'], ['45', 'Loiret', 'CVL'],
    ['2A', 'Corse-du-Sud', 'COR'], ['2B', 'Haute-Corse', 'COR'],
    ['08', 'Ardennes', 'GES'], ['10', 'Aube', 'GES'], ['51', 'Marne', 'GES'], ['52', 'Haute-Marne', 'GES'], ['54', 'Meurthe-et-Moselle', 'GES'],
    ['55', 'Meuse', 'GES'], ['57', 'Moselle', 'GES'], ['67', 'Bas-Rhin', 'GES'], ['68', 'Haut-Rhin', 'GES'], ['88', 'Vosges', 'GES'],
    ['02', 'Aisne', 'HDF'], ['59', 'Nord', 'HDF'], ['60', 'Oise', 'HDF'], ['62', 'Pas-de-Calais', 'HDF'], ['80', 'Somme', 'HDF'],
    ['75', 'Paris', 'IDF'], ['77', 'Seine-et-Marne', 'IDF'], ['78', 'Yvelines', 'IDF'], ['91', 'Essonne', 'IDF'], ['92', 'Hauts-de-Seine', 'IDF'],
    ['93', 'Seine-Saint-Denis', 'IDF'], ['94', 'Val-de-Marne', 'IDF'], ['95', "Val-d'Oise", 'IDF'],
    ['14', 'Calvados', 'NOR'], ['27', 'Eure', 'NOR'], ['50', 'Manche', 'NOR'], ['61', 'Orne', 'NOR'], ['76', 'Seine-Maritime', 'NOR'],
    ['16', 'Charente', 'NAQ'], ['17', 'Charente-Maritime', 'NAQ'], ['19', 'Corrèze', 'NAQ'], ['23', 'Creuse', 'NAQ'], ['24', 'Dordogne', 'NAQ'],
    ['33', 'Gironde', 'NAQ'], ['40', 'Landes', 'NAQ'], ['47', 'Lot-et-Garonne', 'NAQ'], ['64', 'Pyrénées-Atlantiques', 'NAQ'],
    ['79', 'Deux-Sèvres', 'NAQ'], ['86', 'Vienne', 'NAQ'], ['87', 'Haute-Vienne', 'NAQ'],
    ['09', 'Ariège', 'OCC'], ['11', 'Aude', 'OCC'], ['12', 'Aveyron', 'OCC'], ['30', 'Gard', 'OCC'], ['31', 'Haute-Garonne', 'OCC'],
    ['32', 'Gers', 'OCC'], ['34', 'Hérault', 'OCC'], ['46', 'Lot', 'OCC'], ['48', 'Lozère', 'OCC'], ['65', 'Hautes-Pyrénées', 'OCC'],
    ['66', 'Pyrénées-Orientales', 'OCC'], ['81', 'Tarn', 'OCC'], ['82', 'Tarn-et-Garonne', 'OCC'],
    ['44', 'Loire-Atlantique', 'PDL'], ['49', 'Maine-et-Loire', 'PDL'], ['53', 'Mayenne', 'PDL'], ['72', 'Sarthe', 'PDL'], ['85', 'Vendée', 'PDL'],
    ['04', 'Alpes-de-Haute-Provence', 'PAC'], ['05', 'Hautes-Alpes', 'PAC'], ['06', 'Alpes-Maritimes', 'PAC'], ['13', 'Bouches-du-Rhône', 'PAC'],
    ['83', 'Var', 'PAC'], ['84', 'Vaucluse', 'PAC'],
    ['971', 'Guadeloupe', 'GUA'], ['972', 'Martinique', 'MTQ'], ['973', 'Guyane', 'GUF'], ['974', 'La Réunion', 'LRE'], ['976', 'Mayotte', 'MAY'],
  ];
  const CITIES = {
    paris: '75', marseille: '13', lyon: '69', toulouse: '31', nice: '06', nantes: '44', montpellier: '34', strasbourg: '67',
    bordeaux: '33', lille: '59', rennes: '35', reims: '51', toulon: '83', grenoble: '38', dijon: '21', angers: '49', nimes: '30',
    'clermont-ferrand': '63', 'le mans': '72', 'aix-en-provence': '13', brest: '29', tours: '37', amiens: '80', limoges: '87',
    metz: '57', rouen: '76', caen: '14', orleans: '45', mulhouse: '68', nancy: '54', 'saint-etienne': '42', 'le havre': '76',
    perpignan: '66', besancon: '25', 'boulogne-billancourt': '92', versailles: '78', nanterre: '92', 'saint-denis': '93',
    montreuil: '93', bondy: '93', bobigny: '93', aubervilliers: '93', creteil: '94', vincennes: '94', 'ivry-sur-seine': '94',
    argenteuil: '95', cergy: '95', 'la defense': '92', 'issy-les-moulineaux': '92', 'levallois-perret': '92', 'neuilly-sur-seine': '92',
    courbevoie: '92', puteaux: '92', 'rueil-malmaison': '92', evry: '91', massy: '91', saclay: '91', 'marne-la-vallee': '77',
    meaux: '77', melun: '77', 'saint-quentin-en-yvelines': '78',
  };
  const SPECIAL = [
    { id: 'REMOTE', label: { fr: 'Télétravail complet (toute la France)', en: 'Fully remote (anywhere in France)' } },
    { id: 'FRANCE', label: { fr: 'Toute la France', en: 'Anywhere in France' } },
  ];
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const items = [
    ...SPECIAL.map((s) => ({ id: s.id, kind: 'special', label: s.label })),
    ...Object.entries(R).filter(([k]) => !['GUA', 'MTQ', 'GUF', 'LRE', 'MAY'].includes(k))
      .map(([k, name]) => ({ id: 'R:' + k, kind: 'region', name })),
    ...D.map(([code, name, r]) => ({ id: 'D:' + code, kind: 'dept', code, name, region: R[r] })),
  ];
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  return { R, D, CITIES, items, byId, norm };
})();
