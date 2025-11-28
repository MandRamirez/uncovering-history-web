// Script para popular MongoDB con puntos de interés reales de Rivera/Santana do Livramento
// Ejecutar con: mongosh <tu-connection-string> < populate-points.js

// Usar la base de datos correcta
use('uncovering_history');

// Función helper para generar QR code único
function generateQRCode() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Fecha actual
const now = new Date();

// Puntos de interés reales de Rivera/Santana do Livramento
const points = [
  {
    // 1. Parque Internacional
    recordState: 'FILLED',
    isDeleted: false,
    version: 1,
    syncStatus: 'SYNCED',
    conflictFlags: [],
    clientCreatedAt: now,
    clientUpdatedAt: now,
    serverSyncedAt: now,
    createdAt: now,
    updatedAt: now,
    location: {
      x: -55.53167,  // lon
      y: -30.89167   // lat
    },
    geohash: '-30.8917_-55.5317',
    name: 'Parque Internacional',
    normalizedName: 'parque internacional',
    normalizedKey: 'parque internacional_-30.8917_-55.5317',
    typeId: 'Parque',
    address: 'Av. Getúlio Vargas, Rivera/Santana do Livramento',
    country: 'Brasil/Uruguai',
    normalizedAddress: 'av getulio vargas rivera santana do livramento',
    neighborhood: 'Centro',
    description: 'O Parque Internacional é um símbolo único da integração fronteiriça entre Brasil e Uruguai. Inaugurado em 1943, este parque binacional permite que visitantes transitem livremente entre os dois países sem controle de fronteira. Com amplas áreas verdes, monumentos históricos e espaços de lazer, o parque representa a paz e amizade entre as nações vizinhas. É um local tradicional para eventos culturais, encontros familiares e práticas esportivas.',
    qrCode: generateQRCode(),
    customFields: {},
    childIds: [],
    childCount: 0,
    hasChildren: false,
    photoIds: [],
    photoUrls: [],
    _class: 'com.uncovering_history.api.model.InterestPoint'
  },
  {
    // 2. Ponte Internacional da Concórdia
    recordState: 'FILLED',
    isDeleted: false,
    version: 1,
    syncStatus: 'SYNCED',
    conflictFlags: [],
    clientCreatedAt: now,
    clientUpdatedAt: now,
    serverSyncedAt: now,
    createdAt: now,
    updatedAt: now,
    location: {
      x: -55.54056,  // lon
      y: -30.89472   // lat
    },
    geohash: '-30.8947_-55.5406',
    name: 'Ponte Internacional da Concórdia',
    normalizedName: 'ponte internacional da concordia',
    normalizedKey: 'ponte internacional da concordia_-30.8947_-55.5406',
    typeId: 'Marco Histórico',
    address: 'Av. Presidente Vargas, Rivera/Santana do Livramento',
    country: 'Brasil/Uruguai',
    normalizedAddress: 'av presidente vargas rivera santana do livramento',
    neighborhood: 'Centro',
    description: 'A Ponte Internacional da Concórdia, construída em 1933, é uma das principais ligações terrestres entre Brasil e Uruguai. Atravessando o rio Jaguarão, esta ponte histórica simboliza a união e cooperação entre os dois países. Seu nome, "Concórdia", reflete o espírito de harmonia que caracteriza a relação fronteiriça. A estrutura, com sua arquitetura característica da época, testemunhou décadas de intercâmbio comercial, cultural e social entre Rivera e Santana do Livramento.',
    qrCode: generateQRCode(),
    customFields: {},
    childIds: [],
    childCount: 0,
    hasChildren: false,
    photoIds: [],
    photoUrls: [],
    _class: 'com.uncovering_history.api.model.InterestPoint'
  },
  {
    // 3. Catedral de Sant'Ana (Santana do Livramento)
    recordState: 'FILLED',
    isDeleted: false,
    version: 1,
    syncStatus: 'SYNCED',
    conflictFlags: [],
    clientCreatedAt: now,
    clientUpdatedAt: now,
    serverSyncedAt: now,
    createdAt: now,
    updatedAt: now,
    location: {
      x: -55.53278,  // lon
      y: -30.88889   // lat
    },
    geohash: '-30.8889_-55.5328',
    name: 'Catedral de Sant\'Ana',
    normalizedName: 'catedral de santana',
    normalizedKey: 'catedral de santana_-30.8889_-55.5328',
    typeId: 'Igreja',
    address: 'Praça General Vasco Alves, Santana do Livramento',
    country: 'Brasil',
    normalizedAddress: 'praca general vasco alves santana do livramento',
    neighborhood: 'Centro',
    description: 'A Catedral de Sant\'Ana é o principal templo católico de Santana do Livramento. Construída no início do século XX, a catedral apresenta uma arquitetura neogótica imponente, com destaque para suas torres gêmeas e vitrais coloridos. O interior abriga obras de arte sacra de grande valor histórico e cultural. A catedral é o coração religioso da comunidade brasileira da fronteira e testemunha importante da história da evangelização na região.',
    qrCode: generateQRCode(),
    customFields: {},
    childIds: [],
    childCount: 0,
    hasChildren: false,
    photoIds: [],
    photoUrls: [],
    _class: 'com.uncovering_history.api.model.InterestPoint'
  },
  {
    // 4. Free Shop - Zona Franca de Rivera
    recordState: 'FILLED',
    isDeleted: false,
    version: 1,
    syncStatus: 'SYNCED',
    conflictFlags: [],
    clientCreatedAt: now,
    clientUpdatedAt: now,
    serverSyncedAt: now,
    createdAt: now,
    updatedAt: now,
    location: {
      x: -55.53972,  // lon
      y: -30.90083   // lat
    },
    geohash: '-30.9008_-55.5397',
    name: 'Zona Franca de Rivera',
    normalizedName: 'zona franca de rivera',
    normalizedKey: 'zona franca de rivera_-30.9008_-55.5397',
    typeId: 'Área Comercial',
    address: 'Av. Ceballos, Rivera',
    country: 'Uruguai',
    normalizedAddress: 'av ceballos rivera',
    neighborhood: 'Centro',
    description: 'A Zona Franca de Rivera é uma das principais atrações comerciais da fronteira, oferecendo produtos importados com isenção de impostos. Estabelecida para fomentar o comércio transfronteiriço, a área abriga dezenas de lojas de free shop que vendem eletrônicos, bebidas, perfumes e outros produtos. É um importante polo econômico que atrai visitantes de todo o Brasil e contribui significativamente para a economia local. A zona franca representa a vocação comercial histórica da cidade de Rivera.',
    qrCode: generateQRCode(),
    customFields: {},
    childIds: [],
    childCount: 0,
    hasChildren: false,
    photoIds: [],
    photoUrls: [],
    _class: 'com.uncovering_history.api.model.InterestPoint'
  },
  {
    // 5. Monumento ao Gaúcho
    recordState: 'FILLED',
    isDeleted: false,
    version: 1,
    syncStatus: 'SYNCED',
    conflictFlags: [],
    clientCreatedAt: now,
    clientUpdatedAt: now,
    serverSyncedAt: now,
    createdAt: now,
    updatedAt: now,
    location: {
      x: -55.52889,  // lon
      y: -30.89333   // lat
    },
    geohash: '-30.8933_-55.5289',
    name: 'Monumento ao Gaúcho',
    normalizedName: 'monumento ao gaucho',
    normalizedKey: 'monumento ao gaucho_-30.8933_-55.5289',
    typeId: 'Monumento',
    address: 'Praça Internacional, Santana do Livramento',
    country: 'Brasil',
    normalizedAddress: 'praca internacional santana do livramento',
    neighborhood: 'Centro',
    description: 'O Monumento ao Gaúcho é uma obra escultórica que homenageia a figura emblemática do gaúcho sul-rio-grandense e platino. Localizado em área estratégica da cidade, o monumento celebra a cultura, tradições e valores do povo da campanha. A escultura retrata o gaúcho montado a cavalo, simbolizando a coragem, liberdade e identidade regional. É ponto de encontro tradicional e referência importante para compreender a cultura fronteiriça compartilhada entre Brasil e Uruguai.',
    qrCode: generateQRCode(),
    customFields: {},
    childIds: [],
    childCount: 0,
    hasChildren: false,
    photoIds: [],
    photoUrls: [],
    _class: 'com.uncovering_history.api.model.InterestPoint'
  }
];

// Insertar los puntos en la colección
print('🚀 Insertando puntos de interés en la base de datos...\n');

points.forEach((point, index) => {
  try {
    db.interest_point.insertOne(point);
    print(`✅ ${index + 1}. ${point.name} - ${point.country}`);
  } catch (error) {
    print(`❌ Error al insertar ${point.name}: ${error.message}`);
  }
});

print('\n✨ Proceso completado!');
print(`Total de puntos insertados: ${points.length}`);
