# KORASENSE FileSense Downloads

This directory contains the desktop applications for KORASENSE FileSense.

## Files

- `KORASENSE-FileSense.dmg` - macOS installer (Universal Binary for Intel & Apple Silicon)
- `KORASENSE-FileSense.msi` - Windows installer (64-bit)

## Building from Source

To build the applications:

```bash
cd senses/filesense-app
npm install
npm run tauri:build
```

The built applications will be in `src-tauri/target/release/bundle/`.

## Updating Downloads

After building:

1. Copy the DMG file: `cp src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg ../../public/downloads/KORASENSE-FileSense.dmg`
2. Copy the MSI file: `cp src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/*.msi ../../public/downloads/KORASENSE-FileSense.msi`

Note: Windows builds require a Windows machine or cross-compilation setup.
