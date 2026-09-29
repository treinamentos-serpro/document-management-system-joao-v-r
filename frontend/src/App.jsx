import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentService';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await listDocuments();
      setDocuments(data);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar os documentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Document Management System</p>
            <h1 style={styles.title}>Arquivos e documentos</h1>
          </div>
        </header>

        <UploadComponent onUploadSuccess={loadDocuments} />

        {error ? <p style={styles.error}>{error}</p> : null}

        <DocumentList documents={documents} isLoading={isLoading} />
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%)',
    fontFamily: 'system-ui, sans-serif',
    padding: '2rem 1rem',
    color: '#0f172a',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1.5rem',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
    fontSize: '0.72rem',
    color: '#2563eb',
    margin: 0,
  },
  title: {
    margin: '0.4rem 0 0',
    fontSize: 'clamp(2rem, 5vw, 3rem)',
  },
  error: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginBottom: '1rem',
    fontWeight: 600,
  },
};
