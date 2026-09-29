import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DownloadButton from './DownloadButton';
import * as documentService from '../services/documentService';

describe('DownloadButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('chama downloadDocument com o id do documento ao clicar', async () => {
    const downloadSpy = vi.spyOn(documentService, 'downloadDocument').mockResolvedValue(true);
    const user = userEvent.setup();

    render(<DownloadButton documentId="doc-1" fileName="relatorio.pdf" />);

    await user.click(screen.getByRole('button', { name: /baixar relatorio\.pdf/i }));

    expect(downloadSpy).toHaveBeenCalledWith('doc-1');
  });

  it('exibe um alerta quando o download falha', async () => {
    vi.spyOn(documentService, 'downloadDocument').mockRejectedValue(new Error('Documento não encontrado.'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<DownloadButton documentId="doc-1" fileName="relatorio.pdf" />);

    await user.click(screen.getByRole('button', { name: /baixar relatorio\.pdf/i }));

    expect(alertSpy).toHaveBeenCalledWith('Documento não encontrado.');
  });
});
