import { useState } from 'react';
import { uploadDocument } from '../services/documentService';

export default function UploadComponent({ onUploadSuccess }) {
  const [owner, setOwner] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setMessage('Selecione um arquivo antes de enviar.');
      return;
    }

    try {
      setIsUploading(true);
      setMessage('');

      await uploadDocument(file, owner || 'anonymous');
      setMessage('Documento enviado com sucesso!');
      setFile(null);
      setOwner('');
      event.target.reset();

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      setMessage(error.message || 'Não foi possível enviar o documento.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section style={styles.card}>
      <h2>Enviar documento</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.field}>
          <span>Usuário</span>
          <input
            type="text"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="Ex.: usuario-01"
            style={styles.input}
          />
        </label>

        <label style={styles.field}>
          <span>Arquivo</span>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={isUploading} style={styles.button}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>

      {message ? <p style={styles.message}>{message}</p> : null}
    </section>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'grid',
    gap: '1rem',
  },
  field: {
    display: 'grid',
    gap: '0.4rem',
    fontWeight: 600,
    color: '#1f2937',
  },
  input: {
    padding: '0.75rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
  },
  button: {
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  message: {
    marginTop: '1rem',
    color: '#0f766e',
    fontWeight: 600,
  },
};
