import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UploadComponent from './UploadComponent';
import * as documentService from '../services/documentService';

describe('UploadComponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe uma mensagem quando o formulário é enviado sem arquivo selecionado', async () => {
    const user = userEvent.setup();
    render(<UploadComponent />);

    await user.click(screen.getByRole('button', { name: /enviar documento/i }));

    expect(await screen.findByText('Selecione um arquivo antes de enviar.')).toBeInTheDocument();
  });

  it('envia o documento e notifica sucesso ao selecionar um arquivo', async () => {
    const uploadSpy = vi.spyOn(documentService, 'uploadDocument').mockResolvedValue({ id: '1' });
    const onUploadSuccess = vi.fn();
    const user = userEvent.setup();

    render(<UploadComponent onUploadSuccess={onUploadSuccess} />);

    const file = new File(['conteudo'], 'documento.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/arquivo/i);
    await user.upload(fileInput, file);

    const ownerInput = screen.getByLabelText(/usuário/i);
    await user.type(ownerInput, 'joao');

    await user.click(screen.getByRole('button', { name: /enviar documento/i }));

    await waitFor(() => expect(uploadSpy).toHaveBeenCalledWith(file, 'joao'));
    expect(await screen.findByText('Documento enviado com sucesso!')).toBeInTheDocument();
    expect(onUploadSuccess).toHaveBeenCalledTimes(1);
  });

  it('exibe a mensagem de erro retornada pelo serviço quando o upload falha', async () => {
    vi.spyOn(documentService, 'uploadDocument').mockRejectedValue(new Error('Arquivo é obrigatório.'));
    const user = userEvent.setup();

    render(<UploadComponent />);

    const file = new File(['conteudo'], 'documento.pdf');
    await user.upload(screen.getByLabelText(/arquivo/i), file);
    await user.click(screen.getByRole('button', { name: /enviar documento/i }));

    expect(await screen.findByText('Arquivo é obrigatório.')).toBeInTheDocument();
  });
});
