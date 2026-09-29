const crypto = require('node:crypto');
const { createDocument, listDocuments, findDocumentById } = require('../repositories/documentRepository');

function createDocumentRecord(file, owner) {
  if (!file) {
    const error = new Error('Arquivo é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: owner || 'anonymous',
    storagePath: file.path,
  };

  return createDocument(document);
}

function getAllDocuments() {
  return listDocuments();
}

function getDocumentById(id) {
  return findDocumentById(id);
}

module.exports = {
  createDocumentRecord,
  getAllDocuments,
  getDocumentById,
};
