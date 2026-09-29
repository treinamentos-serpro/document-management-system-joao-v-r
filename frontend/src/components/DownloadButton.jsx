import { useCallback, useState } from 'react';
import { downloadDocument } from '../services/documentService';

export default function DownloadButton({ documentId, fileName }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    try {
      setIsDownloading(true);
      await downloadDocument(documentId);
    } catch (error) {
      window.alert(error.message || 'Não foi possível baixar o documento.');
    } finally {
      setIsDownloading(false);
    }
  }, [documentId]);

  return (
    <button type="button" onClick={handleDownload} disabled={isDownloading} style={styles.button}>
      {isDownloading ? 'Baixando...' : `Baixar ${fileName || 'arquivo'}`}
    </button>
  );
}

const styles = {
  button: {
    padding: '0.55rem 0.8rem',
    border: 'none',
    borderRadius: '8px',
    background: '#10b981',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
