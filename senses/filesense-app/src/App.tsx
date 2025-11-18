import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
import { Store } from '@tauri-apps/plugin-store';
import './App.css';

interface Config {
  backend_url: string;
  auth_token?: string;
  tenant_id?: string;
  tenant_slug?: string;
  folders: string[];
}

interface IngestionStatus {
  total_files: number;
  processed_files: number;
  current_file?: string;
  is_running: boolean;
}

function App() {
  const [store, setStore] = useState<Store | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState('http://localhost:3000');
  const [authToken, setAuthToken] = useState('');
  const [status, setStatus] = useState<IngestionStatus>({
    total_files: 0,
    processed_files: 0,
    is_running: false,
  });

  // Initialize store on mount
  useEffect(() => {
    async function initStore() {
      try {
        const storeInstance = await Store.load('config.json');
        setStore(storeInstance);
      } catch (error) {
        console.error('Failed to initialize store:', error);
        setIsLoading(false);
      }
    }
    initStore();
  }, []);

  // Load config when store is ready
  useEffect(() => {
    if (!store) return;
    
    async function loadConfig() {
      try {
        const savedConfig = await store.get<Config>('config');
        if (savedConfig) {
          setConfig(savedConfig);
          setIsAuthenticated(!!savedConfig.auth_token);
          setBackendUrl(savedConfig.backend_url || 'http://localhost:3000');
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [store]);

  // Listen for ingestion status updates from backend events
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setupListener() {
      if (isAuthenticated && config) {
        // Listen for real-time progress events
        unlisten = await listen<IngestionStatus>('ingestion-progress', (event) => {
          console.log('Received progress update:', event.payload);
          setStatus(event.payload);
        });

        // Also poll status as backup
        const interval = setInterval(async () => {
          try {
            const newStatus = await invoke<IngestionStatus>('get_ingestion_status');
            setStatus(newStatus);
          } catch (error) {
            console.error('Failed to get status:', error);
          }
        }, 2000);

        return () => {
          clearInterval(interval);
          if (unlisten) unlisten();
        };
      }
    }

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [isAuthenticated, config]);

  async function handleLogin() {
    if (!backendUrl || !authToken) {
      alert('Please enter both Backend URL and API Key');
      return;
    }

    if (!store) {
      alert('Store not initialized');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Authenticating with:', backendUrl);
      
      // Authenticate and fetch tenant info
      const result = await invoke<{ tenant_id: string; tenant_slug: string }>('authenticate', {
        backendUrl,
        authToken,
      });

      console.log('Authentication successful:', result);

      const newConfig: Config = {
        backend_url: backendUrl,
        auth_token: authToken,
        tenant_id: result.tenant_id,
        tenant_slug: result.tenant_slug,
        folders: config?.folders || [],
      };

      // Save config to store
      await store.set('config', newConfig);
      await store.save();
      
      console.log('Config saved, updating state...');
      
      // Update state to trigger re-render
      setConfig(newConfig);
      setIsAuthenticated(true);
      
      console.log('Login complete!');
    } catch (error) {
      console.error('Authentication error:', error);
      alert(`Authentication failed: ${error}`);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddFolder() {
    if (!store) return;
    
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected && typeof selected === 'string') {
        const newFolders = [...(config?.folders || []), selected];
        const newConfig = { ...config!, folders: newFolders };
        await store.set('config', newConfig);
        await store.save();
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Failed to add folder:', error);
    }
  }

  async function handleRemoveFolder(folder: string) {
    if (!store) return;
    
    const newFolders = config!.folders.filter((f) => f !== folder);
    const newConfig = { ...config!, folders: newFolders };
    await store.set('config', newConfig);
    await store.save();
    setConfig(newConfig);
  }

  async function handleStartWatching() {
    if (!config || !config.auth_token || !config.tenant_id) {
      alert('Not authenticated or missing tenant information');
      return;
    }

    if (config.folders.length === 0) {
      alert('Please add at least one folder to watch');
      return;
    }

    try {
      await invoke('start_watching', {
        backendUrl: config.backend_url,
        apiKey: config.auth_token,
        tenantId: config.tenant_id,
        folders: config.folders,
      });
    } catch (error) {
      alert(`Failed to start watching: ${error}`);
    }
  }

  async function handleStopWatching() {
    try {
      await invoke('stop_watching');
    } catch (error) {
      alert(`Failed to stop watching: ${error}`);
    }
  }

  async function handleScanOnce() {
    try {
      await invoke('scan_once');
    } catch (error) {
      alert(`Failed to scan: ${error}`);
    }
  }

  async function handleLogout() {
    if (!store) return;
    
    await store.clear();
    await store.save();
    setConfig(null);
    setIsAuthenticated(false);
    setAuthToken('');
  }

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="app-header">
          <h1>📚 Opsense Knowledge Sync</h1>
          <p>Connect to your knowledge base</p>
        </div>
        
        <div className="content-container">
          <div className="card">
            <h3 className="card-title">Authentication</h3>
            <p className="card-subtitle">
              Enter your backend URL and API key to connect to your Opsense knowledge base.
            </p>

            <div className="form-group">
              <label className="form-label">
                Backend URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://localhost:3000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                API Key
              </label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="opsense_..."
              />
            </div>

            <button 
              className="btn-primary w-full"
              onClick={handleLogin} 
              disabled={!authToken || !backendUrl || isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Connect'}
            </button>
            
            {isLoading && (
              <p className="auth-message">
                Connecting to {backendUrl}...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = status.total_files > 0 
    ? (status.processed_files / status.total_files) * 100 
    : 0;

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>📚 Opsense Knowledge Sync</h1>
        <p>Tenant: {config?.tenant_slug || 'Unknown'}</p>
      </div>

      <div className="content-container">
        {/* Status Card */}
        <div className="card">
          <div className={`status-badge ${status.is_running ? 'status-running' : 'status-stopped'}`}>
            {status.is_running ? (
              <>
                <span className="status-indicator status-indicator-active"></span>
                Active
              </>
            ) : (
              <>
                <span className="status-indicator status-indicator-inactive"></span>
                Stopped
              </>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{status.total_files}</div>
              <div className="stat-label">Total Files</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{status.processed_files}</div>
              <div className="stat-label">Processed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{config?.folders.length || 0}</div>
              <div className="stat-label">Folders</div>
            </div>
          </div>

          {status.total_files > 0 && (
            <>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {status.current_file && (
                <p className="current-file-text">
                  {status.current_file.length > 50 
                    ? '...' + status.current_file.slice(-50) 
                    : status.current_file
                  }
                </p>
              )}
            </>
          )}

          <div className="button-group">
            {!status.is_running ? (
              <>
                <button className="btn-success" onClick={handleStartWatching}>
                  ▶️ Start Watching
                </button>
                <button className="btn-primary" onClick={handleScanOnce}>
                  🔄 Scan Once
                </button>
              </>
            ) : (
              <button className="btn-warning" onClick={handleStopWatching}>
                ⏹️ Stop
              </button>
            )}
          </div>
        </div>

        {/* Folders Card */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title mb-0">Watched Folders</h3>
            <button className="btn-primary" onClick={handleAddFolder}>
              + Add
            </button>
          </div>

          {config?.folders && config.folders.length > 0 ? (
            <ul className="folder-list">
              {config.folders.map((folder) => (
                <li key={folder} className="folder-item">
                  <span className="folder-path">{folder}</span>
                  <button
                    className="folder-remove"
                    onClick={() => handleRemoveFolder(folder)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <p className="empty-state-text">
                No folders added yet. Click "Add" to start watching directories.
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button 
          className="btn-secondary w-full" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
