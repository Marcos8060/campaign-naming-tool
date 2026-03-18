# Camparc

A production-ready, multi-tenant B2B SaaS platform for standardizing campaign naming and providing cross-channel marketing intelligence.

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 20+
- Python 3.11+

### Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Start all services:
   ```bash
   make up
   ```

3. Run migrations:
   ```bash
   make migrate
   ```

4. Seed demo data:
   ```bash
   make seed
   ```

## Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 (run with `--profile tools`) |

## Supported Platforms

- Meta (Facebook/Instagram)
- Google Ads
- TikTok
- DV360
- LinkedIn
