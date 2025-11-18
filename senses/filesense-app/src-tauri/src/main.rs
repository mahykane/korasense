// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::path::Path;
use std::fs;
use tauri::Emitter;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Config {
    backend_url: String,
    auth_token: Option<String>,
    tenant_id: Option<String>,
    tenant_slug: Option<String>,
    folders: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct IngestionStatus {
    total_files: usize,
    processed_files: usize,
    current_file: Option<String>,
    is_running: bool,
}

type AppState = Arc<Mutex<HashMap<String, String>>>;
type StatusState = Arc<Mutex<IngestionStatus>>;

#[derive(Clone, serde::Serialize)]
struct AuthResult {
    tenant_id: String,
    tenant_slug: String,
}

#[derive(Debug, Deserialize)]
struct AuthResponse {
    user: UserInfo,
    tenant: TenantInfo,
}

#[derive(Debug, Deserialize)]
struct UserInfo {
    id: String,
    email: String,
    name: String,
}

#[derive(Debug, Deserialize)]
struct TenantInfo {
    id: String,
    name: String,
    slug: String,
}

#[tauri::command]
async fn authenticate(
    backend_url: String,
    auth_token: String,
) -> Result<AuthResult, String> {
    // Call the backend API to validate token and fetch tenant info
    let client = reqwest::Client::new();
    let url = format!("{}/api/external/auth", backend_url);
    
    let response = client
        .get(&url)
        .header("x-api-key", &auth_token)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Authentication failed: {}", response.status()));
    }

    let auth_response: AuthResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(AuthResult {
        tenant_id: auth_response.tenant.id,
        tenant_slug: auth_response.tenant.slug,
    })
}

#[tauri::command]
async fn get_ingestion_status(status: tauri::State<'_, StatusState>) -> Result<IngestionStatus, String> {
    let status = status.lock().unwrap();
    Ok(status.clone())
}

#[tauri::command]
async fn start_watching(
    app: tauri::AppHandle,
    status: tauri::State<'_, StatusState>,
    backend_url: String,
    api_key: String,
    tenant_id: String,
    folders: Vec<String>,
) -> Result<(), String> {
    // Set running status
    {
        let mut status = status.lock().unwrap();
        status.is_running = true;
        status.total_files = 0;
        status.processed_files = 0;
    }
    
    // Clone necessary data for background task
    let status_clone = status.inner().clone();
    
    // Start file processing in background
    tauri::async_runtime::spawn(async move {
        println!("Started watching {} folders", folders.len());
        
        // Collect all files first
        let mut all_files = Vec::new();
        for folder in &folders {
            if let Ok(files) = collect_files(&folder) {
                all_files.extend(files);
            }
        }
        
        // Update total files count
        {
            let mut status = status_clone.lock().unwrap();
            status.total_files = all_files.len();
        }
        
        println!("Found {} files to process", all_files.len());
        
        // Process each file
        for file_path in all_files {
            // Check if stop was requested
            {
                let status = status_clone.lock().unwrap();
                if !status.is_running {
                    println!("⏸️  Stopping ingestion as requested by user");
                    break;
                }
            }
            
            {
                let mut status = status_clone.lock().unwrap();
                status.current_file = Some(file_path.clone());
            }
            
            println!("Processing: {}", file_path);
            
            // Read file content
            if let Ok(content) = fs::read(&file_path) {
                // Send to backend
                let client = reqwest::Client::new();
                let url = format!("{}/api/ingest", backend_url);
                
                // Determine file type
                let file_type = if file_path.ends_with(".pdf") {
                    "application/pdf"
                } else if file_path.ends_with(".docx") {
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                } else if file_path.ends_with(".txt") {
                    "text/plain"
                } else if file_path.ends_with(".md") {
                    "text/markdown"
                } else {
                    "application/octet-stream"
                };
                
                // Create form with file
                let file_name = Path::new(&file_path)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("unknown");
                
                let part = reqwest::multipart::Part::bytes(content)
                    .file_name(file_name.to_string())
                    .mime_str(file_type)
                    .unwrap();
                
                let form = reqwest::multipart::Form::new()
                    .part("file", part)
                    .text("tenantId", tenant_id.clone());
                
                match client
                    .post(&url)
                    .header("x-api-key", &api_key)
                    .multipart(form)
                    .send()
                    .await
                {
                    Ok(response) => {
                        let status = response.status();
                        if status.is_success() {
                            println!("✓ Ingested: {}", file_path);
                        } else {
                            let body = response.text().await.unwrap_or_else(|_| "Unable to read response".to_string());
                            println!("✗ Failed to ingest {}: {} - {}", file_path, status, body);
                        }
                    }
                    Err(e) => {
                        println!("✗ Error ingesting {}: {}", file_path, e);
                    }
                }
            }
            
            // Update processed count
            {
                let mut status = status_clone.lock().unwrap();
                status.processed_files += 1;
            }
            
            // Emit event to frontend
            let _ = app.emit("ingestion-progress", IngestionStatus {
                total_files: {
                    let status = status_clone.lock().unwrap();
                    status.total_files
                },
                processed_files: {
                    let status = status_clone.lock().unwrap();
                    status.processed_files
                },
                current_file: Some(file_path.clone()),
                is_running: true,
            });
        }
        
        // Mark as complete
        {
            let mut status = status_clone.lock().unwrap();
            status.is_running = false;
            status.current_file = None;
        }
        
        println!("Finished processing all files");
    });
    
    Ok(())
}

// Helper function to recursively collect files
fn collect_files(folder: &str) -> Result<Vec<String>, std::io::Error> {
    let mut files = Vec::new();
    let path = Path::new(folder);
    
    if path.is_file() {
        // Single file
        if is_supported_file(folder) {
            files.push(folder.to_string());
        }
        return Ok(files);
    }
    
    if path.is_dir() {
        // Recursively walk directory
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let entry_path = entry.path();
            
            if entry_path.is_file() {
                if let Some(path_str) = entry_path.to_str() {
                    if is_supported_file(path_str) {
                        files.push(path_str.to_string());
                    }
                }
            } else if entry_path.is_dir() {
                if let Some(path_str) = entry_path.to_str() {
                    if let Ok(mut subfiles) = collect_files(path_str) {
                        files.append(&mut subfiles);
                    }
                }
            }
        }
    }
    
    Ok(files)
}

// Check if file has supported extension
fn is_supported_file(path: &str) -> bool {
    path.ends_with(".pdf") || 
    path.ends_with(".docx") || 
    path.ends_with(".txt") || 
    path.ends_with(".md")
}

#[tauri::command]
async fn stop_watching(status: tauri::State<'_, StatusState>) -> Result<(), String> {
    let mut status = status.lock().unwrap();
    status.is_running = false;
    Ok(())
}

#[tauri::command]
async fn scan_once(status: tauri::State<'_, StatusState>) -> Result<(), String> {
    let mut status = status.lock().unwrap();
    status.total_files = 0;
    status.processed_files = 0;
    
    // Scan logic will go here
    println!("Scanning folders once");
    
    Ok(())
}

fn main() {
    let status_state: StatusState = Arc::new(Mutex::new(IngestionStatus {
        total_files: 0,
        processed_files: 0,
        current_file: None,
        is_running: false,
    }));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(status_state)
        .invoke_handler(tauri::generate_handler![
            authenticate,
            get_ingestion_status,
            start_watching,
            stop_watching,
            scan_once
        ])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
