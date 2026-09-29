async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message || 'Erro ao processar a requisição.';
    throw new Error(message);
  }

  return data;
}

export async function uploadDocument(file, owner = 'anonymous') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  return request('/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function listDocuments() {
  return request('/documents', {
    method: 'GET',
  });
}

export async function downloadDocument(documentId) {
  const response = await fetch(`/api/documents/${documentId}/download`);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Não foi possível baixar o documento.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const disposition = response.headers.get('content-disposition');
  const filename = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/)?.[1] || 'documento';

  anchor.href = url;
  anchor.download = decodeURIComponent(filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);

  return true;
}
