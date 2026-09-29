const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

async function startServer() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

test('deve realizar upload, listagem e download de um documento', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const fileContent = 'conteudo do documento de teste';
    const formData = new FormData();
    formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'arquivo.txt');
    formData.append('owner', 'usuario-01');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(uploadResponse.status, 201, 'deve criar o documento');

    const uploadedDocument = await uploadResponse.json();
    assert.ok(uploadedDocument.id, 'deve retornar um id');
    assert.strictEqual(uploadedDocument.originalName, 'arquivo.txt');
    assert.strictEqual(uploadedDocument.owner, 'usuario-01');

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200, 'deve listar documentos');

    const documents = await listResponse.json();
    assert.ok(Array.isArray(documents), 'deve retornar uma lista');
    assert.ok(documents.some((document) => document.id === uploadedDocument.id));

    const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
    assert.strictEqual(downloadResponse.status, 200, 'deve baixar o arquivo');

    const downloadText = await downloadResponse.text();
    assert.strictEqual(
      downloadText,
      fileContent,
      'o conteúdo baixado deve ser o mesmo do arquivo enviado',
    );
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
