use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::mpsc::channel;

#[derive(Parser)]
#[command(name = "filesense")]
#[command(about = "Opsense FileSense - Watch folders and ingest documents")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run the file watcher continuously
    Run,
    /// Scan folders once and exit
    Once,
}

#[derive(Debug, Deserialize)]
struct Config {
    tenant_slug: String,
    api_key: String,
    backend_url: String,
    folders: Vec<String>,
}

#[derive(Debug, Serialize)]
struct IngestPayload {
    tenant_slug: String,
    api_key: String,
    file_name: String,
    doc_type_hint: String,
    content: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Load config
    let config = load_config()?;

    match cli.command {
        Commands::Run => run_watcher(&config).await?,
        Commands::Once => scan_once(&config).await?,
    }

    Ok(())
}

fn load_config() -> Result<Config> {
    let config_path = dirs::home_dir()
        .context("Could not find home directory")?
        .join(".opsense_filesense.toml");

    let config_str = fs::read_to_string(&config_path)
        .context("Could not read config file at ~/.opsense_filesense.toml")?;

    let config: Config = toml::from_str(&config_str)
        .context("Could not parse config file")?;

    Ok(config)
}

async fn run_watcher(config: &Config) -> Result<()> {
    println!("Starting FileSense watcher...");
    println!("Backend: {}", config.backend_url);
    println!("Tenant: {}", config.tenant_slug);
    println!("Watching {} folders", config.folders.len());

    let (tx, rx) = channel();
    let mut watcher: RecommendedWatcher = Watcher::new(
        tx,
        notify::Config::default(),
    )?;

    // Watch all configured folders
    for folder in &config.folders {
        println!("  - {}", folder);
        watcher.watch(folder.as_ref(), RecursiveMode::Recursive)?;
    }

    println!("\nWatching for changes... Press Ctrl+C to stop.");

    for res in rx {
        match res {
            Ok(event) => handle_event(event, config).await?,
            Err(e) => println!("Watch error: {:?}", e),
        }
    }

    Ok(())
}

async fn handle_event(event: Event, config: &Config) -> Result<()> {
    use notify::EventKind;

    match event.kind {
        EventKind::Create(_) | EventKind::Modify(_) => {
            for path in event.paths {
                if should_process(&path) {
                    println!("Processing: {:?}", path);
                    if let Err(e) = ingest_file(&path, config).await {
                        eprintln!("Error ingesting file: {}", e);
                    }
                }
            }
        }
        _ => {}
    }

    Ok(())
}

async fn scan_once(config: &Config) -> Result<()> {
    println!("Scanning folders once...");

    for folder in &config.folders {
        let folder_path = PathBuf::from(folder);
        if !folder_path.exists() {
            eprintln!("Folder does not exist: {}", folder);
            continue;
        }

        scan_folder(&folder_path, config).await?;
    }

    println!("Scan complete.");
    Ok(())
}

fn scan_folder<'a>(path: &'a PathBuf, config: &'a Config) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<()>> + Send + 'a>> {
    Box::pin(async move {
        let entries = fs::read_dir(path)?;

        for entry in entries {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                scan_folder(&path, config).await?;
            } else if should_process(&path) {
                println!("Processing: {:?}", path);
                if let Err(e) = ingest_file(&path, config).await {
                    eprintln!("Error: {}", e);
                }
            }
        }

        Ok(())
    })
}

fn should_process(path: &PathBuf) -> bool {
    if let Some(ext) = path.extension() {
        let ext = ext.to_string_lossy().to_lowercase();
        matches!(ext.as_str(), "txt" | "md" | "pdf" | "doc" | "docx")
    } else {
        false
    }
}

async fn ingest_file(path: &PathBuf, config: &Config) -> Result<()> {
    let content = fs::read_to_string(path)
        .context("Could not read file")?;

    let file_name = path.file_name()
        .context("Could not get file name")?
        .to_string_lossy()
        .to_string();

    let doc_type_hint = guess_doc_type(&file_name, path);

    let payload = IngestPayload {
        tenant_slug: config.tenant_slug.clone(),
        api_key: config.api_key.clone(),
        file_name,
        doc_type_hint,
        content,
    };

    let client = reqwest::Client::new();
    let url = format!("{}/api/ingest", config.backend_url);

    let response = client
        .post(&url)
        .json(&payload)
        .send()
        .await?;

    if response.status().is_success() {
        println!("✓ Ingested successfully");
    } else {
        let status = response.status();
        let error_text = response.text().await?;
        eprintln!("✗ Failed ({}): {}", status, error_text);
    }

    Ok(())
}

fn guess_doc_type(file_name: &str, path: &PathBuf) -> String {
    let file_name_lower = file_name.to_lowercase();
    let path_str = path.to_string_lossy().to_lowercase();

    if path_str.contains("policy") || path_str.contains("policies") {
        return "POLICY".to_string();
    }

    if path_str.contains("incident") {
        return "INCIDENT".to_string();
    }

    if path_str.contains("architecture") || path_str.contains("design") {
        return "ARCHITECTURE".to_string();
    }

    if file_name_lower.contains("policy") {
        return "POLICY".to_string();
    }

    if file_name_lower.contains("incident") {
        return "INCIDENT".to_string();
    }

    "OTHER".to_string()
}
