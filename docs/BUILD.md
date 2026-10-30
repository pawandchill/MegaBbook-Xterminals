# Build and Distribution Guide

## Requirements

- Node.js 20+
- npm 10+
- Windows 11 or Windows Server 2022
- Git

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

This will create the Windows installer package in `dist-release`.

## Testing and validation

```bash
npm run typecheck
npm run test
```

## Recommended CI/CD

- install dependencies
- run lint and typecheck
- run Vitest unit tests
- build the Windows package
- upload the installer to an internal software distribution channel
