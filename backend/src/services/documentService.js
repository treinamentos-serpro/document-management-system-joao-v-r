const crypto = require('node:crypto');
const {
  createDocument,
  listDocuments,
  findDocumentById,
} = require('../repositories/documentRepository');

function validateUploadedFile(file) {
  if (!file) {
    const error = new Error('Arquivo é obrigatório.');
    error.statusCode = 400;
    throw error;
  }
}

function buildDocumentFromUpload({ originalName, size, path, owner }) {
  return {
    id: crypto.randomUUID(),
    originalName,
    size,
    uploadedAt: new Date().toISOString(),
    owner: owner || 'anonymous',
    storagePath: path,
  };
}

function createDocumentRecord({ file, owner }) {
  validateUploadedFile(file);

  const document = buildDocumentFromUpload({
    originalName: file.originalName,
    size: file.size,
    path: file.path,
    owner,
  });

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
