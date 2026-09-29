import { memo } from 'react';
import DownloadButton from './DownloadButton';

const DocumentList = memo(function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p>Carregando documentos...</p>;
  }

  if (!documents.length) {
    return <p style={styles.empty}>Nenhum documento enviado até o momento.</p>;
  }

  return (
    <section style={styles.card}>
      <h2>Documentos</h2>
      <ul style={styles.list}>
        {documents.map((document) => (
          <li key={document.id} style={styles.item}>
            <div>
              <strong>{document.originalName}</strong>
              <div style={styles.meta}>
                <span>{document.owner}</span>
                <span>{new Date(document.uploadedAt).toLocaleString()}</span>
                <span>{document.size} bytes</span>
              </div>
            </div>

            <DownloadButton documentId={document.id} fileName={document.originalName} />
          </li>
        ))}
      </ul>
    </section>
  );
});

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '1rem',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#f8fafc',
  },
  meta: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
    fontSize: '0.85rem',
    color: '#475569',
    marginTop: '0.35rem',
  },
  empty: {
    color: '#475569',
    margin: '1rem 0 0',
  },
};

export default DocumentList;
