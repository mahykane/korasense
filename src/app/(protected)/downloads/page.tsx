import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple, faWindows } from '@fortawesome/free-brands-svg-icons';
import { faDownload, faDiamond, faCheckCircle, faSync, faFolder } from '@fortawesome/free-solid-svg-icons';

export default function DownloadsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-2xl)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <div style={{
          width: '5rem',
          height: '5rem',
          margin: '0 auto var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          borderRadius: 'var(--radius-xl)',
          fontSize: '2.5rem',
          color: 'white'
        }}>
          <FontAwesomeIcon icon={faDiamond} />
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-md)',
          letterSpacing: '-0.02em'
        }}>
          KORASENSE FileSense
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Automatically sync your local files and folders to your KORASENSE knowledge base.
          Watch directories in real-time and keep your knowledge up to date.
        </p>
      </div>

      {/* Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-2xl)'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <FontAwesomeIcon icon={faSync} style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: 'var(--spacing-md)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
            Real-time Sync
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Automatically detects file changes and syncs them instantly to your knowledge base
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <FontAwesomeIcon icon={faFolder} style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: 'var(--spacing-md)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
            Multi-Folder Support
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Watch multiple directories simultaneously and organize your knowledge effectively
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: 'var(--spacing-md)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
            Easy Setup
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Simple configuration with your API key and start syncing in minutes
          </p>
        </div>
      </div>

      {/* Download Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-2xl)'
      }}>
        {/* macOS Download */}
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <FontAwesomeIcon icon={faApple} style={{ fontSize: '3rem', color: 'var(--text-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                macOS
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                macOS 10.13 or later
              </p>
            </div>
          </div>
          <a
            href="/downloads/KORASENSE-FileSense-macOS.zip"
            download
            className="btn-primary"
            style={{
              width: '100%',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            <FontAwesomeIcon icon={faDownload} />
            Download for Mac
          </a>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            marginTop: 'var(--spacing-sm)',
            textAlign: 'center'
          }}>
            Universal Binary (Intel & Apple Silicon) • 10.5 MB
          </p>
        </div>

        {/* Windows Download */}
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <FontAwesomeIcon icon={faWindows} style={{ fontSize: '3rem', color: 'var(--text-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Windows
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Windows 10 or later
              </p>
            </div>
          </div>
          <a
            href="/downloads/KORASENSE-FileSense.msi"
            download
            className="btn-primary"
            style={{
              width: '100%',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            <FontAwesomeIcon icon={faDownload} />
            Download for Windows
          </a>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            marginTop: 'var(--spacing-sm)',
            textAlign: 'center'
          }}>
            64-bit Installer
          </p>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          Installation & Setup
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{
              minWidth: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-10)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                Download & Install
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Download the appropriate package for your platform. On macOS, unzip the file and drag
                the app to your Applications folder. On Windows, run the MSI installer and follow
                the installation wizard.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{
              minWidth: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-10)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                Generate API Key
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Go to your KORASENSE dashboard settings and generate a new API key for FileSense.
                Keep this key secure as it provides access to your knowledge base.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{
              minWidth: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-10)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                Configure FileSense
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Launch FileSense and enter your backend URL (e.g., http://localhost:3000 or your production URL)
                and your API key. The app will authenticate and connect to your knowledge base.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{
              minWidth: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-10)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              4
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                Add Folders
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Click "Add Folder" to select directories you want to watch. FileSense will automatically
                detect supported file types and sync them to your knowledge base. Click "Start Watching"
                to begin real-time synchronization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div style={{
        marginTop: 'var(--spacing-2xl)',
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-md)'
        }}>
          System Requirements
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-md)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>macOS:</strong>
            <ul style={{ marginTop: 'var(--spacing-xs)', paddingLeft: '1.25rem' }}>
              <li>macOS 10.13 (High Sierra) or later</li>
              <li>Intel or Apple Silicon processor</li>
              <li>Minimum 100MB free disk space</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Windows:</strong>
            <ul style={{ marginTop: 'var(--spacing-xs)', paddingLeft: '1.25rem' }}>
              <li>Windows 10 or later</li>
              <li>64-bit processor</li>
              <li>Minimum 100MB free disk space</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
