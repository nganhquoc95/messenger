# Messenger

A basic Electron application for Messenger.

## Getting Started

1. Install dependencies: `npm install`
2. Run the app: `npm start`

## Development

- Main process: `main.js`

## Building the App

### Prerequisites
- Node.js and npm installed
- electron-builder configured (already included)

### Build for Distribution (Windows & macOS)

```bash
npm run dist
```

This creates installers in the `dist/` directory:
- **Windows**: MSI installer
- **macOS**: DMG installer

### Build with Publish (CI/CD)

```bash
npm run build
```

This builds and publishes to configured distribution channels.

## Supported Targets

- **Windows**: MSI installer
- **macOS**: DMG installer

## Features

- Messenger.com integration in Electron
- Tray icon with quick access menu
- Show/Hide window functionality
- Clear Cache and temporary data
- Message badge counter from page title