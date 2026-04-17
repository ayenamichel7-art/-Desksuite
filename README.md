<div align="center">

# 🏢 Desksuite

### Alternative Souveraine à Google Workspace

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com)
[![CodeQL](https://img.shields.io/badge/Security-CodeQL-purple?logo=github)](https://github.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#license)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose)

**Desksuite** est une plateforme SaaS multi-tenant de productivité d'entreprise, conçue comme une alternative souveraine et sécurisée à Google Workspace. Chaque entreprise dispose de son propre espace de travail isolé avec ses données, son branding personnalisé et ses outils collaboratifs.

</div>

---

## 📋 Table des Matières

- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Sécurité](#-sécurité)
- [CI/CD & Qualité](#-cicd--qualité)
- [License](#-license)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Cloudflare Zero Trust Tunnel                    │
├─────────────────────────────────────────────────────────────────────┤
│                        Nginx Reverse Proxy                          │
│                 (Gzip, Security Headers, Rate Limit)                │
├─────────────┬──────────────┬──────────────┬────────────────────────┤
│  /api/*     │  /app/*      │  /storage/*  │  /*                    │
│  Laravel    │  Reverb WS   │  MinIO S3    │  React SPA             │
│  Octane     │  Real-time   │  Files       │  Vite                  │
├─────────────┴──────────────┴──────────────┴────────────────────────┤
│                    Internal Service Network                         │
├──────────┬───────────┬───────────┬──────────┬─────────────────────-┤
│ Postgres │   Redis   │  Horizon  │  Celery  │  Prefect             │
│  16      │   7       │  Queue    │  Worker  │  Orchestrator        │
└──────────┴───────────┴───────────┴──────────┴──────────────────────┘
```

---

## ✨ Fonctionnalités

| Module | Description |
|--------|-------------|
| 📁 **Drive** | Stockage de fichiers avec MinIO S3, upload/download, corbeille, OCR |
| 📝 **Docs** | Éditeur de documents riche (TipTap), collaboration en temps réel |
| 📊 **Sheets** | Tableur intégré avec import/export Excel |
| 🎨 **Slides** | Présentations collaboratives |
| 📅 **Calendar** | Calendrier d'équipe avec FullCalendar, export iCal |
| 💬 **Chat** | Messagerie interne en temps réel via Reverb/WebSockets |
| 💰 **Finances** | Gestion des dépenses, OCR de tickets, rapprochement bancaire |
| 📋 **Projects** | Gestion de projets et tâches avec timer intégré |
| 📄 **PDF Pro** | Génération de factures/devis professionnels avec branding |
| 🤖 **Telegram Bot** | Interface conversationnelle pour piloter le workspace |
| 🛡️ **Backup** | Sauvegardes automatisées PostgreSQL + fichiers vers MinIO |
| 📊 **Analytics** | Dashboard d'administration avec métriques en temps réel |
| 🔐 **Portail Client** | Portail public pour signature de devis et téléchargement de factures |
| 📋 **Formulaires** | Création et gestion de formulaires dynamiques |

---

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 19 + TypeScript + Vite 6 + TailwindCSS + DaisyUI |
| **Backend** | Laravel 12 + Octane (Swoole) + Sanctum + Horizon |
| **Real-time** | Laravel Reverb (WebSockets) |
| **Worker IA** | Python 3.12 + FastAPI + Celery + APScheduler |
| **Orchestration** | Prefect (Workflows planifiés) |
| **Base de données** | PostgreSQL 16 |
| **Cache & Queues** | Redis 7 |
| **Stockage Objet** | MinIO (S3-compatible) |
| **Reverse Proxy** | Nginx (Gzip, Security Headers) |
| **Tunnel** | Cloudflare Zero Trust |
| **CI/CD** | GitHub Actions + CodeQL + Dependabot |

---

## 🚀 Installation

### Prérequis

- Docker & Docker Compose v2+
- Git
- Make (optionnel mais recommandé)

### Installation Rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/ayenamichel7-art/-Desksuite.git
cd -Desksuite

# 2. Configurer l'environnement
cp .env.example .env
# ⚠️ Éditez .env avec vos propres valeurs (tokens, mots de passe, etc.)

# 3. Installer & lancer (avec Make)
make install

# OU manuellement :
docker compose build
docker compose up -d
docker compose exec laravel composer install
docker compose exec laravel php artisan key:generate
docker compose exec laravel php artisan migrate --seed
```

### Accès

| Service | URL |
|---------|-----|
| 🌐 Application | `http://desksuite.localhost:8081` |
| 🔧 Flower (Celery) | `http://localhost:5555` |
| 📊 Prefect | `http://localhost:4200` |

---

## ⚙️ Configuration

Toutes les configurations sensibles sont gérées via des variables d'environnement. Consultez `.env.example` pour la liste complète.

### Variables Critiques

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Clé de chiffrement Laravel (auto-générée) |
| `INTERNAL_API_TOKEN` | Token d'authentification inter-services |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `MINIO_ROOT_PASSWORD` | Mot de passe MinIO |
| `TELEGRAM_BOT_TOKEN` | Token de votre bot Telegram |
| `CLOUDFLARE_TUNNEL_TOKEN` | Token de votre tunnel Cloudflare |

> ⚠️ **IMPORTANT** : Ne committez JAMAIS le fichier `.env`. Utilisez `.env.example` comme template.

---

## 🛡️ Sécurité

La sécurité est au cœur de Desksuite. Consultez [SECURITY.md](SECURITY.md) pour les détails complets.

### Mesures Implémentées

- 🔐 **Isolation Multi-tenant** — Chaque entreprise a ses données isolées au niveau base de données
- 🛡️ **Zero Trust Networking** — Tunnel Cloudflare, pas d'exposition directe des ports
- 🔑 **Authentification Sanctum** — Tokens Bearer avec rotation automatique
- 🧱 **Security Headers** — X-Frame-Options, X-XSS-Protection, X-Content-Type-Options, Referrer-Policy
- 🗝️ **Tokens Inter-services** — Communication signée entre Laravel et Python Worker
- 📊 **Audit & Watchdog** — Rapport quotidien automatique des activités suspectes via Telegram
- 🔍 **SAST** — Analyse statique du code via CodeQL à chaque push
- 📦 **Dependency Scanning** — Dependabot surveille les vulnérabilités dans toutes les dépendances
- 🚫 **Pre-commit Hooks** — Bloquent automatiquement le commit de secrets

### Signaler une Vulnérabilité

Consultez [SECURITY.md](SECURITY.md) pour la procédure de signalement responsable.

---

## 🔄 CI/CD & Qualité

### Pipeline GitHub Actions

Chaque push déclenche automatiquement :

1. **Laravel Tests** — PHPUnit/Pest sur le backend
2. **Frontend Build** — Lint + Build TypeScript/React
3. **Python Lint** — Flake8 + Bandit (analyse de sécurité)
4. **CodeQL Analysis** — Analyse SAST sur JavaScript, Python et PHP

### Outils Locaux

```bash
# Installer les hooks pre-commit (anti-leak de secrets)
make setup-hooks

# Lancer un audit de sécurité complet
make security-audit

# Lancer les tests
make test-all

# Lancer le linting
make lint
```

### Dependabot

Dependabot est configuré pour surveiller et mettre à jour automatiquement :
- 📦 NPM (Frontend)
- 🐘 Composer (Backend)
- 🐍 Pip (Python Worker)
- ⚙️ GitHub Actions (CI/CD)

---

## 📂 Structure du Projet

```
Desksuite/
├── .github/
│   ├── workflows/main.yml     # CI/CD Pipeline
│   └── dependabot.yml         # Dependency monitoring
├── backend/                   # Laravel 12 (API + Octane)
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/api.php
│   └── Dockerfile
├── frontend/                  # React 19 (SPA)
│   ├── src/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   └── Dockerfile
├── python-worker/             # FastAPI + Celery + Prefect
│   ├── main.py
│   ├── services.py
│   ├── celery_app.py
│   └── Dockerfile
├── infra/
│   └── nginx/default.conf     # Reverse proxy config
├── scripts/
│   ├── pre-commit             # Git hook anti-secrets
│   └── security-audit.sh      # Local security scanner
├── docker-compose.yml
├── Makefile
├── LICENSE
├── SECURITY.md
└── README.md
```

---

## 👤 Auteur

**Ayena Michel** — Full-Stack Engineer & System Architect

---

## 📜 License

Ce projet est sous **licence propriétaire**. Aucune utilisation, copie, modification ou distribution n'est autorisée sans l'accord écrit de l'auteur. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

© 2026 Ayena Michel — Tous droits réservés.
