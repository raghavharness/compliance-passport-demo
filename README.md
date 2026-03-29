# Compliance Passport Demo

A simple calculator API used to demonstrate the **Compliance Passport Agent** for Harness Agent Dev Day 2026.

## Quick Start

```bash
npm install
npm test
npm start
```

## API Endpoints

- `GET /health` - Health check
- `POST /calculate` - Calculate: `{ "a": 5, "b": 3, "operation": "add" }`

## Compliance Passport Agent

This repo demonstrates automated compliance evidence collection for every CI build. See the [Compliance Passport Agent documentation](./docs/) for details.
