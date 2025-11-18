'use client';

interface Document {
  id: string;
  title: string;
  originalFileName: string;
  docType: string;
  source: string;
  status: string;
  createdAt: Date;
  _count: {
    chunks: number;
  };
}

interface DocumentListProps {
  documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
  const getStatusStyle = (status: string) => {
    const styles = {
      EMBEDDED: { backgroundColor: 'var(--accent-10)', color: 'var(--accent)' },
      PARSED: { backgroundColor: 'var(--secondary-10)', color: 'var(--secondary)' },
      UPLOADED: { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' },
    };
    return styles[status as keyof typeof styles] || styles.UPLOADED;
  };

  const getDocTypeStyle = (type: string) => {
    // All types use accent color to maintain 70-20-10 rule
    return { color: 'var(--accent)' };
  };

  return (
    <div className="card">
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        marginBottom: 'var(--spacing-md)',
        color: 'var(--text-primary)'
      }}>
        Documents
      </h2>
      
      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl) 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📄</div>
          <p className="text-secondary">No documents yet</p>
          <p className="text-tertiary" style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>
            Configure a Sense client to start ingesting documents
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-tertiary" style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-md)', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Title
                </th>
                <th className="text-tertiary" style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-md)', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Type
                </th>
                <th className="text-tertiary" style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-md)', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </th>
                <th className="text-tertiary" style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-md)', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Chunks
                </th>
                <th className="text-tertiary" style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-md)', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Source
                </th>
                <th className="text-tertiary" style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-md)', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr 
                  key={doc.id}
                  style={{ 
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      {doc.title}
                    </div>
                    <div className="text-tertiary" style={{ fontSize: '0.8125rem', marginTop: '0.125rem' }}>
                      {doc.originalFileName}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500,
                      ...getDocTypeStyle(doc.docType)
                    }}>
                      {doc.docType}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <span style={{ 
                      padding: '0.25rem 0.625rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '0.375rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      ...getStatusStyle(doc.status)
                    }}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="text-secondary" style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    {doc._count.chunks}
                  </td>
                  <td className="text-tertiary" style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    {doc.source}
                  </td>
                  <td className="text-tertiary" style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
