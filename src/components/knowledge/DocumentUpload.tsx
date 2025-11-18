'use client';

import { useState } from 'react';

interface UploadProgress {
  file: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

export default function DocumentUpload({ tenantId, apiKey }: { tenantId: string; apiKey?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setProgress((prev) => [
        ...prev,
        ...newFiles.map((f) => ({ file: f.name, status: 'pending' as const })),
      ]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to uploading
      setProgress((prev) =>
        prev.map((p, idx) =>
          idx === i ? { ...p, status: 'uploading' } : p
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenantId', tenantId);

        const headers: Record<string, string> = {};
        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }

        const response = await fetch('/api/ingest', {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();

        // Update status to success
        setProgress((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: 'success',
                  message: `Uploaded successfully (${result.chunks_created} chunks)`,
                }
              : p
          )
        );
      } catch (error: any) {
        // Update status to error
        setProgress((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  status: 'error',
                  message: error.message,
                }
              : p
          )
        );
      }
    }

    setIsUploading(false);
  };

  const handleClear = () => {
    setFiles([]);
    setProgress([]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setProgress((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card" style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 700, 
        marginBottom: 'var(--spacing-md)',
        color: 'var(--text-primary)'
      }}>
        Upload Documents
      </h2>
      <p className="text-secondary" style={{ marginBottom: 'var(--spacing-xl)', fontSize: '0.9375rem' }}>
        Upload PDF, Word, text, or markdown files to add them to your knowledge base.
      </p>

      {/* File Input */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <label
          htmlFor="file-upload"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '8rem',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: 'var(--bg-tertiary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.backgroundColor = 'var(--accent-5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1.25rem 1.5rem'
          }}>
            <svg
              style={{ width: '2.5rem', height: '2.5rem', marginBottom: 'var(--spacing-sm)' }}
              className="text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-secondary" style={{ marginBottom: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>Click to upload</span> or drag and drop
            </p>
            <p className="text-tertiary" style={{ fontSize: '0.75rem' }}>
              PDF, DOCX, TXT, MD (max 50MB per file)
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            multiple
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 600, 
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--text-primary)'
          }}>
            Selected Files ({files.length})
          </h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--spacing-xs)', 
            maxHeight: '16rem', 
            overflowY: 'auto' 
          }}>
            {progress.map((item, index) => {
              const getBgColor = () => {
                if (item.status === 'success') return 'var(--accent-10)';
                if (item.status === 'error') return 'var(--accent-5)';
                if (item.status === 'uploading') return 'var(--accent-5)';
                return 'var(--bg-tertiary)';
              };
              
              const getBorderColor = () => {
                if (item.status === 'success') return 'var(--accent-40)';
                if (item.status === 'error') return 'var(--accent-20)';
                if (item.status === 'uploading') return 'var(--accent-20)';
                return 'var(--border)';
              };

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${getBorderColor()}`,
                    backgroundColor: getBgColor()
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500, 
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.file}
                    </p>
                    {item.message && (
                      <p className={item.status === 'error' ? 'text-secondary' : 'text-tertiary'} 
                         style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {item.message}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'var(--spacing-md)', gap: 'var(--spacing-xs)' }}>
                    {item.status === 'pending' && (
                      <>
                        <span className="text-tertiary" style={{ fontSize: '0.75rem' }}>Pending</span>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          disabled={isUploading}
                          title="Remove file"
                          className="accent-text"
                          style={{ 
                            opacity: isUploading ? 0.5 : 1,
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            padding: '0.25rem'
                          }}
                        >
                          <svg
                            style={{ width: '1.25rem', height: '1.25rem' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                    {item.status === 'uploading' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <div className="spinner" style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          border: '2px solid var(--accent-20)',
                          borderTopColor: 'var(--accent)',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }}></div>
                        <span className="accent-text" style={{ fontSize: '0.75rem' }}>Uploading...</span>
                      </div>
                    )}
                    {item.status === 'success' && (
                      <svg
                        className="accent-text"
                        style={{ width: '1.25rem', height: '1.25rem' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {item.status === 'error' && (
                      <svg
                        className="accent-text"
                        style={{ width: '1.25rem', height: '1.25rem' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
        </button>
        <button
          onClick={handleClear}
          disabled={files.length === 0 || isUploading}
          className="btn-secondary"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
