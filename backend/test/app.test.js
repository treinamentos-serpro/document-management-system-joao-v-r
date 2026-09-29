const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

async function startServer() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function stopServer(server) {
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

async function uploadFile(baseUrl, { fileContent, fileName, owner }) {
  const formData = new FormData();
  formData.append('file', new Blob([fileContent], { type: 'text/plain' }), fileName);
  formData.append('owner', owner);

  return fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });
}

test('GET /documents deve retornar lista vazia quando não há documentos', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);

    const documents = await listResponse.json();
    assert.deepStrictEqual(documents, [], 'deve retornar uma lista vazia antes de qualquer upload');
  } finally {
    await stopServer(server);
  }
});

test('deve realizar upload, listagem e download de um documento', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const fileContent = 'conteudo do documento de teste';

    const uploadResponse = await uploadFile(baseUrl, {
      fileContent,
      fileName: 'arquivo.txt',
      owner: 'usuario-01',
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
    await stopServer(server);
  }
});

test('POST /upload deve retornar 400 quando nenhum arquivo é enviado', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const formData = new FormData();
    formData.append('owner', 'usuario-01');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(uploadResponse.status, 400, 'deve rejeitar upload sem arquivo');

    const body = await uploadResponse.json();
    assert.ok(body.message, 'deve retornar uma mensagem de erro');
  } finally {
    await stopServer(server);
  }
});

test('POST /upload deve usar "anonymous" como owner quando não informado', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const uploadResponse = await uploadFile(baseUrl, {
      fileContent: 'outro conteudo',
      fileName: 'sem-owner.txt',
      owner: '',
    });

    assert.strictEqual(uploadResponse.status, 201);

    const uploadedDocument = await uploadResponse.json();
    assert.strictEqual(uploadedDocument.owner, 'anonymous');
  } finally {
    await stopServer(server);
  }
});

test('GET /documents deve refletir múltiplos uploads realizados', async () => {
  const { server, baseUrl } = await startServer();

  try {
    await uploadFile(baseUrl, { fileContent: 'a', fileName: 'a.txt', owner: 'joao' });
    await uploadFile(baseUrl, { fileContent: 'b', fileName: 'b.txt', owner: 'maria' });

    const listResponse = await fetch(`${baseUrl}/documents`);
    const documents = await listResponse.json();

    const originalNames = documents.map((document) => document.originalName);
    assert.ok(originalNames.includes('a.txt'));
    assert.ok(originalNames.includes('b.txt'));
  } finally {
    await stopServer(server);
  }
});

test('GET /documents/:id/download deve retornar 404 para um id inexistente', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const downloadResponse = await fetch(`${baseUrl}/documents/id-inexistente/download`);
    assert.strictEqual(downloadResponse.status, 404, 'deve retornar 404 para documento inexistente');

    const body = await downloadResponse.json();
    assert.ok(body.message, 'deve retornar uma mensagem de erro');
  } finally {
    await stopServer(server);
  }
});

test('as rotas também respondem sob o prefixo /api', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo via /api']), 'via-api.txt');
    formData.append('owner', 'usuario-02');

    const apiUploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(apiUploadResponse.status, 201);
    const uploadedDocument = await apiUploadResponse.json();

    const apiListResponse = await fetch(`${baseUrl}/api/documents`);
    assert.strictEqual(apiListResponse.status, 200);

    const apiDownloadResponse = await fetch(`${baseUrl}/api/documents/${uploadedDocument.id}/download`);
    assert.strictEqual(apiDownloadResponse.status, 200);
  } finally {
    await stopServer(server);
  }
});

