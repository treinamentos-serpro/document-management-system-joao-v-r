const documentService = require('../services/documentService');

function uploadDocument(req, res) {
  try {
    const document = documentService.createDocumentRecord(req.file, req.body.owner);
    return res.status(201).json(document);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Erro ao processar o upload do documento.',
    });
  }
}

function listDocuments(req, res) {
  try {
    const documents = documentService.getAllDocuments();
    return res.status(200).json(documents);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Erro ao listar os documentos.',
    });
  }
}

function downloadDocument(req, res) {
  try {
    const document = documentService.getDocumentById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    return res.download(document.storagePath, document.originalName);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Erro ao baixar o documento.',
    });
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
