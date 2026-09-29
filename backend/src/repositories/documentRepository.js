const fs = require('node:fs');
const path = require('node:path');

const storageDirectory = path.resolve(__dirname, '..', '..', 'storage');

fs.mkdirSync(storageDirectory, { recursive: true });

const documents = new Map();

function getStorageDirectory() {
  return storageDirectory;
}

function createDocument(document) {
  documents.set(document.id, document);
  return { ...document };
}

function listDocuments() {
  return Array.from(documents.values()).map((document) => ({ ...document }));
}

function findDocumentById(id) {
  const document = documents.get(id);

  if (!document) {
    return null;
  }

  return { ...document };
}

module.exports = {
  getStorageDirectory,
  createDocument,
  listDocuments,
  findDocumentById,
};
