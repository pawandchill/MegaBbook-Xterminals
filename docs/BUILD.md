# Build and Distribution Guide

## Requirements

- Node.js 20+
- npm 10+
- Windows 11 or Windows Server 2022 for end-user packaging
- A system with Git installed

## Local development

```bash
npm install
npm run dev
```

## Type-checking and testing

```bash
npm run typecheck
npm run test
```

## Production build

```bash
npm run build
```

The build command compiles the React frontend, transpiles Electron main-process TypeScript, and packages the app as a Windows NSIS installer in `dist-release/`.

## Packaging nuances

- The generated Windows application targets the `win` platform and uses `electron-builder`.
- The `assets` directory should include a valid icon for the installer and tray icon.
- Production deployments should sign the Windows executables with a trusted certificate for enterprise rollout.

## Recommended CI/CD pipeline

1. Install dependencies
2. Run lint and typecheck
3. Run unit tests
4. Build the Windows package
5. Upload artifacts to a release store
6. Deploy via internal software distribution management
