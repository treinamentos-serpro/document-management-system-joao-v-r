import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadDocument, listDocuments, uploadDocument } from './documentService';

function mockJsonResponse(body, { ok = true, status = 200, headers = {} } = {}) {
  return {
    ok,
    status,
    headers: {
      get: (name) => headers[name.toLowerCase()] ?? 'application/json',
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

describe('documentService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('uploadDocument', () => {
    it('envia o arquivo e o owner via multipart/form-data para /api/upload', async () => {
      const responseBody = { id: '1', originalName: 'a.txt', owner: 'joao' };
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse(responseBody, { status: 201 }));
      vi.stubGlobal('fetch', fetchMock);

      const file = new File(['conteudo'], 'a.txt', { type: 'text/plain' });
      const result = await uploadDocument(file, 'joao');

      expect(result).toEqual(responseBody);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/upload');
      expect(options.method).toBe('POST');
      expect(options.body).toBeInstanceOf(FormData);
      expect(options.body.get('file')).toBe(file);
      expect(options.body.get('owner')).toBe('joao');
    });

    it('usa "anonymous" como owner padrão quando nenhum é informado', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: '1' }, { status: 201 }));
      vi.stubGlobal('fetch', fetchMock);

      const file = new File(['x'], 'x.txt');
      await uploadDocument(file);

      const [, options] = fetchMock.mock.calls[0];
      expect(options.body.get('owner')).toBe('anonymous');
    });

    it('lança um erro com a mensagem do backend quando a resposta não é ok', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(mockJsonResponse({ message: 'Arquivo é obrigatório.' }, { ok: false, status: 400 }));
      vi.stubGlobal('fetch', fetchMock);

      const file = new File(['x'], 'x.txt');

      await expect(uploadDocument(file, 'joao')).rejects.toThrow('Arquivo é obrigatório.');
    });
  });

  describe('listDocuments', () => {
    it('retorna a lista de documentos vinda de /api/documents', async () => {
      const documents = [{ id: '1' }, { id: '2' }];
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse(documents));
      vi.stubGlobal('fetch', fetchMock);

      const result = await listDocuments();

      expect(result).toEqual(documents);
      expect(fetchMock).toHaveBeenCalledWith('/api/documents', expect.objectContaining({ method: 'GET' }));
    });

    it('lança um erro genérico quando a resposta não é ok e não possui mensagem', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({}, { ok: false, status: 500 }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(listDocuments()).rejects.toThrow('Erro ao processar a requisição.');
    });
  });

  describe('downloadDocument', () => {
    it('baixa o arquivo e dispara o clique de download no navegador', async () => {
      const blob = new Blob(['conteudo']);
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: (name) => (name === 'content-disposition' ? 'attachment; filename="relatorio.pdf"' : null),
        },
        blob: () => Promise.resolve(blob),
      });
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      });

      const clickSpy = vi.fn();
      const anchor = { click: clickSpy, style: {} };
      vi.spyOn(document, 'createElement').mockReturnValue(anchor);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

      const result = await downloadDocument('doc-1');

      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith('/api/documents/doc-1/download');
      expect(anchor.href).toBe('blob:mock-url');
      expect(anchor.download).toBe('relatorio.pdf');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('lança um erro quando o download falha', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Documento não encontrado.' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await expect(downloadDocument('id-inexistente')).rejects.toThrow('Documento não encontrado.');
    });
  });
});
