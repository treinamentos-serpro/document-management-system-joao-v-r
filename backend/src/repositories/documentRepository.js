const fs = require('node:fs');
const path = require('node:path');

const storageDirectory = path.resolve(__dirname, '..', '..', 'storage');

fs.mkdirSync(storageDirectory, { recursive: true });

const documents = new Map();

function getStorageDirectory() {
  return storageDirectory;
}

function cloneDocument(document) {
  return { ...document };
}

function createDocument(document) {
  documents.set(document.id, document);
  return cloneDocument(document);
}

function listDocuments() {
  return Array.from(documents.values()).map(cloneDocument);
}

function findDocumentById(id) {
  const document = documents.get(id);

  if (!document) {
    return null;
  }

  return cloneDocument(document);
}

module.exports = {
  getStorageDirectory,
  createDocument,
  listDocuments,
  findDocumentById,
};
