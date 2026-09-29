import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as documentService from './services/documentService';

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carrega e exibe os documentos ao montar', async () => {
    vi.spyOn(documentService, 'listDocuments').mockResolvedValue([
      {
        id: 'doc-1',
        originalName: 'relatorio.pdf',
        owner: 'joao',
        uploadedAt: '2026-01-01T10:00:00.000Z',
        size: 1024,
      },
    ]);

    render(<App />);

    expect(await screen.findByText('relatorio.pdf')).toBeInTheDocument();
  });

  it('exibe uma mensagem de erro quando o carregamento dos documentos falha', async () => {
    vi.spyOn(documentService, 'listDocuments').mockRejectedValue(new Error('Falha ao carregar.'));

    render(<App />);

    expect(await screen.findByText('Falha ao carregar.')).toBeInTheDocument();
  });
});
