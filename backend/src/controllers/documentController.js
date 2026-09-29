const documentService = require('../services/documentService');

function toUploadedFileDto(file) {
  return {
    originalName: file.originalname,
    size: file.size,
    path: file.path,
  };
}

function uploadDocument(req, res) {
  try {
    const file = req.file ? toUploadedFileDto(req.file) : null;
    const document = documentService.createDocumentRecord({ file, owner: req.body.owner });
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
