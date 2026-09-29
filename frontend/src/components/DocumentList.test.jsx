import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DocumentList from './DocumentList';

describe('DocumentList', () => {
  it('exibe o estado de carregamento', () => {
    render(<DocumentList documents={[]} isLoading />);

    expect(screen.getByText('Carregando documentos...')).toBeInTheDocument();
  });

  it('exibe uma mensagem quando não há documentos', () => {
    render(<DocumentList documents={[]} isLoading={false} />);

    expect(screen.getByText('Nenhum documento enviado até o momento.')).toBeInTheDocument();
  });

  it('lista os documentos recebidos com um botão de download para cada um', () => {
    const documents = [
      {
        id: 'doc-1',
        originalName: 'relatorio.pdf',
        owner: 'joao',
        uploadedAt: '2026-01-01T10:00:00.000Z',
        size: 1024,
      },
      {
        id: 'doc-2',
        originalName: 'planilha.xlsx',
        owner: 'maria',
        uploadedAt: '2026-01-02T10:00:00.000Z',
        size: 2048,
      },
    ];

    render(<DocumentList documents={documents} isLoading={false} />);

    expect(screen.getByText('relatorio.pdf')).toBeInTheDocument();
    expect(screen.getByText('planilha.xlsx')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /baixar/i })).toHaveLength(2);
  });
});
