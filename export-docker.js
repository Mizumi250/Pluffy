// ============================================================
// PLUFF EXPORT — DOCKER + DEPLOY GUIDE GENERATOR
//
// Imported by export.js. Pure generator: it only writes files into the
// exported project folder. It never touches the engine.
//
//   --docker  → Dockerfile(s), docker-compose.yml, docker/Caddyfile,
//               deploy.env (+ deploy.env.example), PostgreSQL dump (pgsql)
//   always    → DEPLOY.md (step-by-step, host-neutral)
//
// Docker is only offered for WEB stacks. Mobile and desktop stacks are
// built with their own tools (EAS / Gradle / Xcode / Tauri / Electron),
// so --docker is rejected for them.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'

export const DOCKER_STACKS = ['nextjs', 'react-vite', 'tanstack-start', 'astro', 'react-inertia']
export const MOBILE_STACKS = ['expo', 'react-native', 'lynx', 'native']
export const DESKTOP_STACKS = ['tauri', 'electron']

export const supportsDocker = stack => DOCKER_STACKS.includes(stack)
export const stackKind = stack =>
  supportsDocker(stack) ? 'web' : MOBILE_STACKS.includes(stack) ? 'mobile' : DESKTOP_STACKS.includes(stack) ? 'desktop' : 'unknown'

export function dockerRejectionMessage(stack) {
  const kind = stackKind(stack)
  const how = kind === 'mobile'
    ? 'Mobile apps are built with EAS / Gradle / Xcode, not Docker. See DEPLOY.md in the export for the exact steps.'
    : kind === 'desktop'
      ? 'Desktop apps are built into installers per operating system, not Docker. See DEPLOY.md in the export for the exact steps.'
      : `"${stack}" is not a known stack.`
  return `--docker is not available for the "${stack}" stack. ${how}\n  Docker is only for web stacks: ${DOCKER_STACKS.join(', ')}.`
}

// ─────────────────────────────────────────────
// BACKEND PROFILES
// ─────────────────────────────────────────────

const BACKENDS = {
  'laravel':         { label: 'Laravel (PHP)',        port: 8001, rtPort: 8081, workdir: '/app',         php: true },
  'laravel-inertia': { label: 'Laravel + Inertia',    port: 8000, rtPort: 8081, workdir: '/app',         php: true },
  'express':         { label: 'Express (TypeScript)', port: 8001, rtPort: 8080, workdir: '/app' },
  'fastapi':         { label: 'FastAPI (Python)',     port: 8001, rtPort: 8080, workdir: '/app' },
  'aspnet':          { label: 'ASP.NET Core (C#)',    port: 8001, rtPort: 8080, workdir: '/app' },
  'spring-boot':     { label: 'Spring Boot (Java)',   port: 8001, rtPort: 8080, workdir: '/app' },
  'go':              { label: 'Go (Chi)',             port: 8001, rtPort: 8080, workdir: '/app/backend' },
  'rust':            { label: 'Rust (Axum)',          port: 8001, rtPort: null, workdir: '/app/backend' },
}

const FRONTENDS = {
  'nextjs':         { label: 'Next.js',         port: 3001, prefix: 'NEXT_PUBLIC_' },
  'react-vite':     { label: 'React + Vite',    port: 3001, prefix: 'VITE_' },
  'tanstack-start': { label: 'TanStack Start',  port: 3001, prefix: 'VITE_' },
  'astro':          { label: 'Astro',           port: 3001, prefix: 'PUBLIC_' },
  'react-inertia':  { label: 'React + Inertia', port: null, prefix: 'VITE_' },
}

const q = s => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

function names(ctx) {
  const inertia = ctx.stack === 'react-inertia'
  const backend = BACKENDS[ctx.backend]
  const frontend = FRONTENDS[ctx.stack]
  const sqliteDir = ctx.backend === 'go' ? 'storage/databases' : 'database/arkzen'
  return {
    inertia, backend, frontend,
    // folder holding the backend Dockerfile (Inertia: the project root IS the backend)
    backDir: inertia ? ctx.projectDir : ctx.projBack,
    backContext: inertia ? '.' : './backend',
    sqlitePath: `${sqliteDir}/${ctx.tatName}.sqlite`,
    hasRealtimeServer: ctx.hasBackend && ctx.hasRealtime && !!backend.rtPort,
    wantsQueue: ctx.hasBackend && ctx.hasJobs && ['laravel', 'laravel-inertia', 'express', 'fastapi'].includes(ctx.backend),
    wantsReverb: ctx.hasBackend && ctx.hasRealtime && ctx.backend.startsWith('laravel'),
  }
}

// ─────────────────────────────────────────────
// ENVIRONMENT PER BACKEND (compose expressions)
// ─────────────────────────────────────────────

function backendEnv(ctx) {
  const n = names(ctx)
  const port = n.backend.port
  const env = {}
  const common = () => {
    env.ARKZEN_ENGINE_SECRET = '${ARKZEN_ENGINE_SECRET:?Set ARKZEN_ENGINE_SECRET in deploy.env}'
    env.ARKZEN_DB_DRIVER = ctx.isPg ? 'pgsql' : 'sqlite'
    env.ARKZEN_DB_PREFIX = ctx.dbPrefix
    if (ctx.isPg) {
      env.DB_HOST = 'db'
      env.DB_PORT = '5432'
      env.DB_DATABASE = ctx.pgDatabaseName
      env.DB_USERNAME = '${DB_USERNAME:-postgres}'
      env.DB_PASSWORD = '${DB_PASSWORD:?Set DB_PASSWORD in deploy.env}'
      if (ctx.backend === 'go' || ctx.backend === 'rust') env.DB_SSLMODE = 'disable'
    }
  }
  const realtime = (port2, key = 'REVERB_APP_KEY') => {
    if (!n.hasRealtimeServer) return
    env.REVERB_PORT = String(port2)
    env[key] = '${REVERB_APP_KEY:-arkzen-key}'
    env.REVERB_APP_SECRET = '${REVERB_APP_SECRET:-pluff-secret}'
  }

  switch (ctx.backend) {
    case 'laravel':
    case 'laravel-inertia':
      env.APP_NAME = ctx.tatName
      env.APP_ENV = 'production'
      env.APP_DEBUG = 'false'
      env.APP_URL = '${PUBLIC_URL:-http://localhost:8080}'
      env.APP_KEY = '${APP_KEY:-}'
      env.LOG_CHANNEL = 'stderr'
      env.DB_CONNECTION = ctx.isPg ? 'pgsql' : 'sqlite'
      if (!ctx.isPg) env.DB_DATABASE = n.sqlitePath
      env.SESSION_DRIVER = 'file'
      env.CACHE_STORE = 'file'
      env.QUEUE_CONNECTION = 'database'
      env.BROADCAST_CONNECTION = ctx.hasRealtime ? 'reverb' : 'log'
      env.MAIL_MAILER = '${MAIL_MAILER:-log}'
      env.MAIL_FROM_ADDRESS = '${MAIL_FROM_ADDRESS:-hello@example.com}'
      common()
      if (ctx.hasRealtime) {
        env.REVERB_APP_ID = '${REVERB_APP_ID:-pluff-app}'
        env.REVERB_APP_KEY = '${REVERB_APP_KEY:-arkzen-key}'
        env.REVERB_APP_SECRET = '${REVERB_APP_SECRET:-pluff-secret}'
        env.REVERB_HOST = 'reverb'          // server → reverb, inside the Docker network
        env.REVERB_PORT = '8081'
        env.REVERB_SCHEME = 'http'
        env.REVERB_SERVER_HOST = '0.0.0.0'
        env.REVERB_SERVER_PORT = '8081'
      }
      break
    case 'express':
    case 'fastapi':
    case 'spring-boot':
      env.PORT = String(port)
      env.APP_URL = '${PUBLIC_URL:-http://localhost:8080}'
      common()
      env.QUEUE_CONNECTION = ctx.backend === 'spring-boot' ? 'sync' : 'database'
      env.MAIL_MAILER = '${MAIL_MAILER:-log}'
      env.MAIL_FROM_ADDRESS = '${MAIL_FROM_ADDRESS:-hello@example.com}'
      realtime(8080)
      break
    case 'aspnet':
      env.ASPNETCORE_URLS = `http://0.0.0.0:${port}`
      common()
      realtime(8080)
      break
    case 'go':
      env.PORT = String(port)
      env.PLUFF_ROOT = '/app'
      env.PLUFF_STORAGE_DIR = 'storage'
      common()
      realtime(8080)
      break
    case 'rust':
      env.HOST = '0.0.0.0'
      env.PORT = String(port)
      env.PLUFF_ROOT = '/app'
      env.ARKZEN_MODULE_DIR = 'storage/arkzen-modules'
      env.ARKZEN_DATABASE_DIR = 'database/arkzen'
      common()
      env.MAIL_MAILER = '${MAIL_MAILER:-log}'
      env.MAIL_FROM_ADDRESS = '${MAIL_FROM_ADDRESS:-hello@example.com}'
      break
  }
  return env
}

// ─────────────────────────────────────────────
// DOCKERFILES
// ─────────────────────────────────────────────

const NODE_IMAGE = 'node:22-bookworm-slim'

function entrypointScript(ctx, keys) {
  const n = names(ctx)
  const laravel = n.backend.php
  return `#!/bin/sh
# Generated by export-docker.js — runs before the app starts.
# 1) Writes .env from the container's environment (some backends, e.g. "php artisan serve",
#    read ONLY the .env file and ignore real environment variables).
set -e
cd "\${APP_DIR:-${n.backend.workdir}}"
: > .env
for key in ${keys.join(' ')}; do
  val=$(printenv "$key" || true)
  [ -n "$val" ] || continue
  esc=$(printf '%s' "$val" | sed -e 's/\\\\/\\\\\\\\/g' -e 's/"/\\\\"/g' -e 's/\\$/\\\\$/g')
  printf '%s="%s"\\n' "$key" "$esc" >> .env
done
${laravel ? `
# 2) Laravel: keep one APP_KEY across restarts (stored in the persistent storage volume).
mkdir -p database storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
if [ -z "\${APP_KEY:-}" ]; then
  [ -s storage/.app_key ] || php artisan key:generate --show > storage/.app_key
  printf 'APP_KEY="%s"\\n' "$(cat storage/.app_key)" >> .env
fi
php artisan storage:link --force >/dev/null 2>&1 || true
# 3) Only the web container migrates (RUN_MIGRATIONS=1) so containers don't race.
if [ "\${RUN_MIGRATIONS:-0}" = "1" ]; then
  php artisan migrate --force || echo "WARNING: php artisan migrate failed — see the message above"
fi
` : ''}
exec "$@"
`
}

function dockerignore(ctx) {
  return [
    '.git', '.env', '.env.*', '!.env.example', '*.log', '.DS_Store',
    'node_modules', 'vendor', '.venv', '__pycache__', '.next', 'dist', '.output', '.astro',
    'bin', 'obj', 'target', 'projects', 'docker-compose.yml', 'deploy.env',
  ].join('\n') + '\n'
}

function backendDockerfile(ctx) {
  const n = names(ctx)
  const p = n.backend.port
  const tail = (cmd) => `COPY docker-entrypoint.sh /usr/local/bin/pluff-entrypoint
RUN chmod +x /usr/local/bin/pluff-entrypoint
ENTRYPOINT ["pluff-entrypoint"]
CMD ${JSON.stringify(cmd)}
`
  switch (ctx.backend) {
    case 'laravel':
    case 'laravel-inertia': {
      const assets = n.inertia ? `# ---- build the React/Inertia assets ----
FROM ${NODE_IMAGE} AS assets
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY . .
RUN npm run build

` : ''
      return `${assets}FROM php:8.4-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends git unzip && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/mlocati/php-extension-installer:latest /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_pgsql pgsql pdo_sqlite pcntl bcmath zip intl gd exif opcache
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY . .
${n.inertia ? 'COPY --from=assets /app/public/build ./public/build\n' : ''}RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts \\
 && (php artisan package:discover --ansi || true)
ENV PHP_CLI_SERVER_WORKERS=4 APP_DIR=/app
EXPOSE ${p}
${tail(['php', 'artisan', 'serve', '--host=0.0.0.0', `--port=${p}`])}`
    }
    case 'express':
      return `FROM ${NODE_IMAGE}
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY . .
ENV APP_DIR=/app
EXPOSE ${p} 8080
${tail(['npm', 'start'])}`
    case 'fastapi':
      return `FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONUTF8=1 APP_DIR=/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE ${p} 8080
${tail(['python', '-m', 'uvicorn', 'pluff.server:app', '--host', '0.0.0.0', '--port', String(p)])}`
    case 'aspnet':
      return `FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /app
ENV APP_DIR=/app DOTNET_CLI_TELEMETRY_OPTOUT=1
COPY *.csproj ./
RUN dotnet restore Pluff.AspNet.csproj
COPY . .
EXPOSE ${p} 8080
${tail(['dotnet', 'run', '--no-restore', '--project', 'Pluff.AspNet.csproj'])}`
    case 'spring-boot':
      return `FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
ENV APP_DIR=/app
COPY pom.xml ./
RUN mvn -B dependency:build-classpath -Dmdep.outputFile=target/classpath.txt
COPY . .
RUN mvn -B -q compile
EXPOSE ${p} 8080
${tail(['sh', '-c', `exec java -cp "target/classes:$(cat target/classpath.txt)" ${ctx.springServerClass}`])}`
    case 'go':
      return `FROM golang:1.22-bookworm
WORKDIR /app/backend
ENV APP_DIR=/app/backend
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /usr/local/bin/pluff-server ./cmd/server
EXPOSE ${p} 8080
${tail(['pluff-server'])}`
    case 'rust':
      return `FROM rust:1-bookworm
WORKDIR /app/backend
ENV APP_DIR=/app/backend
COPY . .
RUN cargo build --release
EXPOSE ${p}
${tail(['sh', '-c', 'exec ./target/release/pluff-rust-backend'])}`
  }
  return ''
}

function frontendDockerfile(ctx) {
  const f = FRONTENDS[ctx.stack]
  const rt = ctx.hasBackend && ctx.hasRealtime
  // Realtime settings are baked in at build time (the browser needs the PUBLIC address).
  const args = rt ? `ARG REALTIME_HOST=localhost
ARG REALTIME_PORT=8080
ARG REALTIME_SCHEME=ws
ARG REVERB_APP_KEY=arkzen-key
ENV ${f.prefix}REVERB_HOST=$REALTIME_HOST ${f.prefix}REVERB_PORT=$REALTIME_PORT ${f.prefix}REVERB_SCHEME=$REALTIME_SCHEME ${f.prefix}REVERB_APP_KEY=$REVERB_APP_KEY
` : ''
  const install = `COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY . .
`
  switch (ctx.stack) {
    case 'nextjs':
      return `FROM ${NODE_IMAGE}
WORKDIR /app
${install}${args}ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=${f.port}
RUN npm run build
EXPOSE ${f.port}
CMD ["npm", "start"]
`
    case 'astro':
      return `FROM ${NODE_IMAGE}
WORKDIR /app
${install}${args}RUN npm run build
ENV HOST=0.0.0.0 PORT=${f.port}
EXPOSE ${f.port}
CMD ["node", "./dist/server/entry.mjs"]
`
    case 'tanstack-start':
      return `FROM ${NODE_IMAGE}
WORKDIR /app
${install}${args}RUN npm run build
EXPOSE ${f.port}
# Same server as "npm start" (vite preview), made reachable from other containers.
CMD ["npx", "vite", "preview", "--config", "vite.docker.config.ts", "--host", "0.0.0.0", "--port", "${f.port}"]
`
    case 'react-vite':
      return `FROM ${NODE_IMAGE} AS build
WORKDIR /app
${install}${args}RUN npm run build

FROM nginx:1-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE ${f.port}
`
  }
  return ''
}

const NGINX_SPA = (port) => `server {
  listen ${port};
  root /usr/share/nginx/html;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
  location ~* \\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?)$ { expires 7d; add_header Cache-Control "public"; }
}
`

// Lets "vite preview" accept requests that arrive through the reverse proxy.
const VITE_DOCKER_CONFIG = `// Generated for Docker: same config as vite.config.ts, but "vite preview" accepts any Host header
// (it sits behind the reverse proxy) and listens on all interfaces.
import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config'

export default defineConfig(async (env) =>
  mergeConfig(typeof base === 'function' ? await base(env) : base, {
    preview: { host: true, allowedHosts: true },
  }),
)
`

// ─────────────────────────────────────────────
// CADDY (reverse proxy) + COMPOSE
// ─────────────────────────────────────────────

function caddyfile(ctx) {
  const n = names(ctx)
  const front = n.inertia ? `app:${n.backend.port}` : `frontend:${n.frontend.port}`
  const lines = [
    '# One public address. Caddy sends /api and /storage to the backend and everything else to the website.',
    '# Set SITE_ADDRESS in deploy.env to your domain and Caddy gets a free HTTPS certificate automatically.',
    '{$SITE_ADDRESS::80} {',
    '  encode gzip',
  ]
  if (n.hasRealtimeServer) {
    const rtHost = n.wantsReverb ? 'reverb' : 'backend'
    lines.push(`  @realtime path /app/* /apps/*`, `  handle @realtime {`, `    reverse_proxy {$REALTIME_UPSTREAM:${rtHost}:${n.backend.rtPort}}`, `  }`)
  }
  if (ctx.hasBackend && !n.inertia) {
    lines.push(`  @backend path /api/* /storage/*`, `  handle @backend {`, `    reverse_proxy {$BACKEND_UPSTREAM:backend:${n.backend.port}}`, `  }`)
  }
  lines.push(`  handle {`, `    reverse_proxy {$FRONTEND_UPSTREAM:${front}}`, `  }`, '}')
  return lines.join('\n') + '\n'
}

function composeYaml(ctx) {
  const n = names(ctx)
  const env = backendEnv(ctx)
  const bName = n.inertia ? 'app' : 'backend'
  const persist = ctx.isPg ? ['storage'] : (ctx.backend.startsWith('laravel') ? ['database', 'storage'] : ['database', 'storage'])
  const wd = n.backend.workdir
  const envBlock = Object.entries(env).map(([k, v]) => `      ${k}: ${q(v)}`).join('\n')
  const volumeLines = persist.map(d => `      - ${bName}-${d}:${wd}/${d}`).join('\n')
  const volumeNames = []
  const out = []
  out.push(`# Generated by export-docker.js for "${ctx.tatName}". Start with:`)
  out.push(`#   docker compose --env-file deploy.env up -d --build`)
  out.push(`name: ${ctx.tatName}`)
  out.push('services:')
  out.push(`  proxy:
    build:
      context: ./docker
      dockerfile: Dockerfile.proxy
    restart: unless-stopped
    ports:
      - "\${HTTP_PORT:-8080}:80"
      - "\${HTTPS_PORT:-8443}:443"
    environment:
      SITE_ADDRESS: "\${SITE_ADDRESS:-:80}"
    volumes:
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      - ${n.inertia ? 'app' : (ctx.hasBackend ? 'backend\n      - frontend' : 'frontend')}`)
  volumeNames.push('caddy-data', 'caddy-config')

  if (ctx.isPg) {
    out.push(`  db:
    image: postgres:\${POSTGRES_VERSION:-16}
    restart: unless-stopped
    environment:
      POSTGRES_USER: "\${DB_USERNAME:-postgres}"
      POSTGRES_PASSWORD: "\${DB_PASSWORD:?Set DB_PASSWORD in deploy.env}"
      POSTGRES_DB: ${q(ctx.pgDatabaseName)}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/db-init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USERNAME:-postgres} -d ${ctx.pgDatabaseName}"]
      interval: 5s
      timeout: 5s
      retries: 20`)
    volumeNames.push('pgdata')
  }

  const dependsOnDb = ctx.isPg ? `\n    depends_on:\n      db:\n        condition: service_healthy` : ''
  if (ctx.hasBackend) {
    const buildBlock = `    build:\n      context: ${n.backContext}\n    image: ${ctx.tatName}-${bName}:latest`
    const rtPorts = ''
    const migrate = n.backend.php ? '\n      RUN_MIGRATIONS: "1"' : ''
    out.push(`  ${bName}:
${buildBlock}
    restart: unless-stopped
    environment:
${envBlock}${migrate}
    volumes:
${volumeLines}${dependsOnDb}${rtPorts}`)
    persist.forEach(d => volumeNames.push(`${bName}-${d}`))

    if (n.wantsQueue) {
      const queueCmd = ctx.backend === 'express' ? '["npm", "run", "queue"]'
        : ctx.backend === 'fastapi' ? '["python", "-m", "pluff.worker"]'
          : '["php", "artisan", "queue:work", "--queue=default,heavy", "--sleep=3", "--tries=3"]'
      out.push(`  queue:
${buildBlock}
    restart: unless-stopped
    command: ${queueCmd}
    environment:
${envBlock}
    volumes:
${volumeLines}
    depends_on:
      - ${bName}`)
    }
    if (n.wantsReverb) {
      out.push(`  reverb:
${buildBlock}
    restart: unless-stopped
    command: ["php", "artisan", "reverb:start", "--host=0.0.0.0", "--port=8081"]
    environment:
${envBlock}
    volumes:
${volumeLines}
    depends_on:
      - ${bName}`)
    }
  }

  if (!n.inertia) {
    const rtArgs = ctx.hasBackend && ctx.hasRealtime
      ? `\n      args:\n        REALTIME_HOST: "\${REALTIME_HOST:-localhost}"\n        REALTIME_PORT: "\${REALTIME_PORT:-\${HTTP_PORT:-8080}}"\n        REALTIME_SCHEME: "\${REALTIME_SCHEME:-ws}"\n        REVERB_APP_KEY: "\${REVERB_APP_KEY:-arkzen-key}"`
      : ''
    out.push(`  frontend:
    build:
      context: ./frontend${rtArgs}
    image: ${ctx.tatName}-frontend:latest
    restart: unless-stopped`)
  }

  out.push('volumes:\n' + volumeNames.map(v => `  ${v}:`).join('\n'))
  return out.join('\n') + '\n'
}

function deployEnv(ctx, withSecrets) {
  const n = names(ctx)
  const secret = withSecrets ? crypto.randomBytes(24).toString('hex') : ''
  const dbPass = withSecrets ? crypto.randomBytes(18).toString('hex') : ''
  const lines = [
    '# Settings for docker compose. Use it with:',
    '#   docker compose --env-file deploy.env up -d --build',
    '# NEVER commit deploy.env to git (it holds your passwords). deploy.env.example is the safe copy.',
    '',
    '# --- Where the site is reachable ---',
    '# On your own computer leave these as they are and open http://localhost:8080',
    '# On a server with a domain: SITE_ADDRESS=yourdomain.com  HTTP_PORT=80  HTTPS_PORT=443',
    '#                            PUBLIC_URL=https://yourdomain.com',
    'HTTP_PORT=8080',
    'HTTPS_PORT=8443',
    'SITE_ADDRESS=:80',
    'PUBLIC_URL=http://localhost:8080',
    '',
    '# --- Secrets (change them; any long random text works) ---',
    `ARKZEN_ENGINE_SECRET=${secret}`,
  ]
  if (ctx.isPg) lines.push('', '# --- PostgreSQL ---', 'DB_USERNAME=postgres', `DB_PASSWORD=${dbPass}`, `POSTGRES_VERSION=${ctx.pgVersion || '16'}`)
  if (n.backend.php) lines.push('', '# Laravel app key (created for you). Keep it: changing it logs every user out.', `APP_KEY=${withSecrets ? 'base64:' + crypto.randomBytes(32).toString('base64') : ''}`)
  if (ctx.hasBackend && ctx.hasRealtime) {
    lines.push('', '# --- Realtime (websockets) ---',
      '# Only change these when you use a domain with HTTPS: REALTIME_HOST=yourdomain.com REALTIME_PORT=443 REALTIME_SCHEME=wss',
      '# They are baked into the website at build time, so run "up -d --build" again after changing them.',
      'REALTIME_HOST=localhost', 'REALTIME_PORT=8080', 'REALTIME_SCHEME=ws', 'REVERB_APP_KEY=arkzen-key', `REVERB_APP_SECRET=${withSecrets ? crypto.randomBytes(16).toString('hex') : ''}`)
  }
  lines.push('', '# --- Email: "log" writes mails to the log. Use "smtp" and add MAIL_HOST/PORT/USERNAME/PASSWORD for real mail ---', 'MAIL_MAILER=log', 'MAIL_FROM_ADDRESS=hello@example.com')
  return lines.join('\n') + '\n'
}

// ─────────────────────────────────────────────
// POSTGRES DUMP (so the Docker database starts with your tables + data)
// ─────────────────────────────────────────────

function dumpPostgres(ctx) {
  const dir = path.join(ctx.projectDir, 'docker', 'db-init')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${ctx.pgDatabaseName}.sql`)
  const pg = ctx.pg
  const res = spawnSync('pg_dump', ['-h', pg.host, '-p', String(pg.port), '-U', pg.user, '-d', ctx.pgDatabaseName, '--no-owner', '--no-privileges', '--format=plain', '-f', file], {
    encoding: 'utf-8', env: { ...process.env, PGPASSWORD: pg.password || '' },
  })
  if (res.status === 0 && fs.existsSync(file)) {
    const v = spawnSync('pg_dump', ['--version'], { encoding: 'utf-8' }).stdout?.match(/(\d+)(?:\.\d+)?\s*$/m)?.[1]
    if (v) ctx.pgVersion = v
    ctx.log.success(`docker/db-init/${ctx.pgDatabaseName}.sql (PostgreSQL dump, loaded automatically on first start)`)
    return true
  }
  fs.rmSync(file, { force: true })
  fs.writeFileSync(path.join(dir, 'README.txt'), 'Put a .sql dump of your database here. PostgreSQL loads every .sql file in this folder the first time the db container starts with an empty data volume.\n')
  ctx.log.warn(`Could not run pg_dump (${(res.error?.message || res.stderr || 'is PostgreSQL client installed?').toString().trim().split('\n')[0]}).`)
  ctx.log.warn('The Docker database will start EMPTY. Put a .sql dump in docker/db-init/ before the first "docker compose up" (see DEPLOY.md).')
  ctx.dumpFailed = true
  return false
}

// ─────────────────────────────────────────────
// WRITE DOCKER FILES
// ─────────────────────────────────────────────

export function writeDockerFiles(ctx) {
  const n = names(ctx)
  const w = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content) }
  const root = ctx.projectDir
  const keys = Object.keys(backendEnv(ctx))

  if (ctx.hasBackend) {
    w(path.join(n.backDir, 'Dockerfile'), backendDockerfile(ctx))
    w(path.join(n.backDir, 'docker-entrypoint.sh'), entrypointScript(ctx, keys))
    w(path.join(n.backDir, '.dockerignore'), dockerignore(ctx))
    ctx.log.success(`${n.inertia ? '' : 'backend/'}Dockerfile + docker-entrypoint.sh (${n.backend.label})`)
  }
  if (!n.inertia) {
    w(path.join(ctx.projFront, 'Dockerfile'), frontendDockerfile(ctx))
    w(path.join(ctx.projFront, '.dockerignore'), dockerignore(ctx))
    if (ctx.stack === 'react-vite') w(path.join(ctx.projFront, 'nginx.conf'), NGINX_SPA(n.frontend.port))
    if (ctx.stack === 'tanstack-start') w(path.join(ctx.projFront, 'vite.docker.config.ts'), VITE_DOCKER_CONFIG)
    ctx.log.success(`frontend/Dockerfile (${n.frontend.label})`)
  }
  w(path.join(root, 'docker', 'Caddyfile'), caddyfile(ctx))
  w(path.join(root, 'docker', 'Dockerfile.proxy'), 'FROM caddy:2-alpine\nCOPY Caddyfile /etc/caddy/Caddyfile\n')
  if (ctx.isPg && ctx.hasBackend) dumpPostgres(ctx)
  w(path.join(root, 'docker-compose.yml'), composeYaml(ctx))
  w(path.join(root, 'deploy.env'), deployEnv(ctx, true))
  w(path.join(root, 'deploy.env.example'), deployEnv(ctx, false))
  ctx.log.success('docker-compose.yml, docker/Caddyfile, deploy.env (+ deploy.env.example)')
}

// ─────────────────────────────────────────────
// DEPLOY.md  — written for EVERY export
// ─────────────────────────────────────────────

const fence = (lang, lines) => '```' + lang + '\n' + [].concat(lines).join('\n') + '\n```'

const MANUAL_BACKEND = {
  'laravel': { need: ['PHP 8.3 or newer with these extensions: pdo_sqlite (or pdo_pgsql for PostgreSQL), mbstring, openssl, bcmath, zip, intl, gd', 'Composer 2'],
    run: ['cd backend', 'composer install --no-dev --optimize-autoloader', 'cp .env.example .env   # skip if backend/.env already exists', 'php artisan key:generate --force', 'php artisan migrate --force', 'php artisan storage:link', 'php artisan serve --host=0.0.0.0 --port=8001'],
    queue: 'php artisan queue:work --queue=default,heavy --sleep=3 --tries=3', rt: 'php artisan reverb:start --host=0.0.0.0 --port=8081' },
  'laravel-inertia': { need: ['PHP 8.3 or newer with these extensions: pdo_sqlite (or pdo_pgsql for PostgreSQL), mbstring, openssl, bcmath, zip, intl, gd', 'Composer 2', 'Node.js 22'],
    run: ['composer install --no-dev --optimize-autoloader', 'npm ci', 'npm run build', 'cp .env.example .env   # skip if .env already exists', 'php artisan key:generate --force', 'php artisan migrate --force', 'php artisan storage:link', 'php artisan serve --host=0.0.0.0 --port=8000'],
    queue: 'php artisan queue:work --queue=default,heavy --sleep=3 --tries=3', rt: 'php artisan reverb:start --host=0.0.0.0 --port=8081' },
  'express': { need: ['Node.js 22'], run: ['cd backend', 'npm ci', 'npm start'], queue: 'npm run queue', rt: null },
  'fastapi': { need: ['Python 3.11 or newer'],
    run: ['cd backend', 'python3 -m venv .venv', '.venv/bin/pip install -r requirements.txt', '.venv/bin/python -m uvicorn pluff.server:app --host 0.0.0.0 --port 8001'],
    queue: '.venv/bin/python -m pluff.worker', rt: null },
  'aspnet': { need: ['.NET SDK 8.0'], run: ['cd backend', 'dotnet restore Pluff.AspNet.csproj', 'ASPNETCORE_URLS=http://0.0.0.0:8001 dotnet run --no-restore --project Pluff.AspNet.csproj'], queue: null, rt: null },
  'spring-boot': { need: ['JDK 17 or newer', 'Apache Maven 3.9'],
    run: ['cd backend', 'mvn -B dependency:build-classpath -Dmdep.outputFile=target/classpath.txt', 'mvn -B compile', 'PORT=8001 java -cp "target/classes:$(cat target/classpath.txt)" dev.pluff.Server'], queue: null, rt: null },
  'go': { need: ['Go 1.22 or newer'], run: ['cd backend', 'go build -o pluff-server ./cmd/server', 'PORT=8001 PLUFF_ROOT=.. ./pluff-server'], queue: null, rt: null },
  'rust': { need: ['Rust (install with rustup)'], run: ['cd backend', 'cargo build --release', 'PORT=8001 PLUFF_ROOT=.. ./target/release/pluff-rust-backend'], queue: null, rt: null },
}

const MANUAL_FRONTEND = {
  'nextjs': { run: ['cd frontend', 'npm ci', 'npm run build', 'npm start        # listens on port 3001'], need: 'Node.js 22' },
  'react-vite': { run: ['cd frontend', 'npm ci', 'npm run build   # creates frontend/dist — plain static files'], need: 'Node.js 22', staticDir: 'frontend/dist' },
  'tanstack-start': { run: ['cd frontend', 'npm ci', 'npm run build', 'npm start        # listens on port 3001'], need: 'Node.js 22' },
  'astro': { run: ['cd frontend', 'npm ci', 'npm run build', 'HOST=0.0.0.0 PORT=3001 node dist/server/entry.mjs'], need: 'Node.js 22' },
}

function guideHeader(ctx) {
  const n = names(ctx)
  const kind = stackKind(ctx.stack)
  const rows = [
    ['Website / app', kind === 'web' ? (n.frontend?.label || ctx.stack) : ctx.stack],
    ['Backend', ctx.hasBackend ? n.backend.label : (kind === 'web' ? 'none (frontend only)' : 'not included in this export')],
    ['Database', ctx.hasBackend ? (ctx.isPg ? `PostgreSQL (database "${ctx.pgDatabaseName}")` : `SQLite (file ${n.sqlitePath})`) : '–'],
    ['Realtime', ctx.hasBackend && ctx.hasRealtime ? 'yes (websockets)' : 'no'],
    ['Background jobs', ctx.hasBackend && ctx.hasJobs ? 'yes' : 'no'],
  ]
  return `# Deploy ${ctx.tatName}

Follow the steps **in order**. Copy and paste each command exactly. Lines starting with \`#\` are notes, not commands.
If something fails, jump to **Troubleshooting** at the bottom.

## What you are deploying

| Part | This export |
|------|-------------|
${rows.map(r => `| ${r[0]} | ${r[1]} |`).join('\n')}
`
}

function hostTypes(ctx, n) {
  const inertiaOrBackend = n.inertia ? 'app' : 'backend'
  const services = [
    ['proxy', 'docker/', '80', 'YES — the only public one'],
    ...(ctx.hasBackend ? [[inertiaOrBackend, n.inertia ? '.' : 'backend/', String(n.backend.port), 'no (private)']] : []),
    ...(!n.inertia ? [['frontend', 'frontend/', String(n.frontend.port), 'no (private)']] : []),
    ...(n.wantsQueue ? [['queue', 'same image as ' + inertiaOrBackend + ', different start command', '–', 'no (private)']] : []),
    ...(n.wantsReverb ? [['reverb', 'same image as ' + inertiaOrBackend + ', different start command', '8081', 'no (private)']] : []),
    ...(ctx.isPg ? [['db', 'image postgres', '5432', 'no (private)']] : []),
  ]
  return `## Step 3 — Put it online (pick the kind of host that fits you)

The files in this folder do **not** depend on one company. Whatever you choose, three things must be true:

1. **One public address.** \`/api/*\` and \`/storage/*\` go to the backend, everything else goes to the website. The \`proxy\` container already does this.
2. **Secrets and settings** from \`deploy.env\` are set on the server.
3. **The data survives restarts** (the compose file already keeps it in Docker volumes).

### Host type A — a server you rent (VPS). Works with any provider
Any provider that gives you a Linux server with a public IP (DigitalOcean, Hetzner, Linode, Vultr, AWS Lightsail, Oracle Cloud, a company server…).

1. Create a server: **Ubuntu 24.04**, at least **2 GB RAM** (Rust and Spring Boot builds need more: 4 GB).
2. Connect: \`ssh root@YOUR_SERVER_IP\`
3. Install Docker on the server: ${'`curl -fsSL https://get.docker.com | sh`'}
4. Copy this project folder to the server. From **your computer**, inside this folder:
${fence('bash', ['rsync -av --exclude node_modules --exclude vendor --exclude .venv --exclude target ./ root@YOUR_SERVER_IP:~/' + ctx.tatName + '/'])}
   (No rsync? Use git instead: put the folder in a **private** repository, then \`git clone\` it on the server. \`deploy.env\` is not in git, so create it on the server from \`deploy.env.example\`.)
5. Point your domain to the server: in your domain's DNS settings add an **A record** → \`YOUR_SERVER_IP\`. Wait a few minutes.
6. On the server, edit the settings: \`cd ~/${ctx.tatName} && nano deploy.env\` and set:
${fence('ini', ['HTTP_PORT=80', 'HTTPS_PORT=443', 'SITE_ADDRESS=yourdomain.com', 'PUBLIC_URL=https://yourdomain.com', ...(ctx.hasBackend && ctx.hasRealtime ? ['REALTIME_HOST=yourdomain.com', 'REALTIME_PORT=443', 'REALTIME_SCHEME=wss'] : [])])}
7. Start it: \`docker compose --env-file deploy.env up -d --build\`
8. Open \`https://yourdomain.com\`. The HTTPS certificate is created automatically (needs ports 80 and 443 open in the provider's firewall).

### Host type B — a control panel that understands docker-compose
Panels such as Coolify, Dokploy or Portainer let you click instead of typing commands.

1. Put this folder in a Git repository (private is fine) and push it.
2. In the panel, create a new **Docker Compose** application from that repository. Use \`docker-compose.yml\`.
3. Copy every line of \`deploy.env\` into the panel's **Environment Variables** section (panels do not read \`deploy.env\` by themselves).
4. Set the domain in the panel. If the panel gives its own HTTPS, keep \`SITE_ADDRESS=:80\` and point the panel's domain at the \`proxy\` service, port 80.
5. Press **Deploy**.

### Host type C — your own computer or a home server (no public IP needed)
Good for demos. Run it with the steps above on your own machine, then expose port 8080 with a tunnel tool (Cloudflare Tunnel, Tailscale Funnel, ngrok…): tell the tool to forward to \`http://localhost:8080\`. The tool gives you a public address. Set \`PUBLIC_URL\` in \`deploy.env\` to that address and run \`docker compose --env-file deploy.env up -d --build\` again.

### Host type D — managed platforms that run one container per service
(Render, Railway, Fly.io, Google Cloud Run, Azure Container Apps, AWS ECS…). These do not read \`docker-compose.yml\`, so each service is created by hand. It works, but it is more steps — use A, B or C first if you can.

Create one service per row, all in the **same private network/project**:

| Service | Build from (folder with a Dockerfile) | Port | Public? |
|---------|----------------------------------------|------|---------|
${services.map(s => `| ${s.join(' | ')} |`).join('\n')}

Then:
1. Give each service the environment variables listed in \`docker-compose.yml\` under its \`environment:\` section (values come from \`deploy.env\`).
2. On the \`proxy\` service set \`BACKEND_UPSTREAM\`, \`FRONTEND_UPSTREAM\`${ctx.hasBackend && ctx.hasRealtime ? ' and \`REALTIME_UPSTREAM\`' : ''} to the **private address and port** the platform shows for those services (format \`host:port\`). Example: \`BACKEND_UPSTREAM=my-backend.internal:${n.backend.port}\`.
3. Make only \`proxy\` public. Add your domain to it in the platform's settings.
${ctx.isPg ? '4. For the database you can use the platform\'s own managed PostgreSQL instead of the \`db\` service: set \`DB_HOST\`, \`DB_PORT\`, \`DB_USERNAME\`, \`DB_PASSWORD\` to its values, then load \`docker/db-init/*.sql\` into it once with \`psql\`.\n' : '4. SQLite lives in a file: attach a **persistent disk/volume** to the backend service and mount it at `' + n.backend.workdir + '/database` and `' + n.backend.workdir + '/storage`. Without a persistent disk your data is lost on every deploy.\n'}`
}

function dockerGuide(ctx) {
  const n = names(ctx)
  const dbNote = ctx.isPg
    ? `This project uses **PostgreSQL**. A database container (\`db\`) is included and **loads ${ctx.dumpFailed ? 'nothing yet (the dump failed — see the warning in the export output, put a .sql file in docker/db-init/ first)' : `your existing tables and data from docker/db-init/${ctx.pgDatabaseName}.sql`}** the first time it starts.`
    : 'This project uses **SQLite**. The database file is inside the backend container and kept in the Docker volume `' + (n.inertia ? 'app' : 'backend') + '-database`.'
  return `## Step 1 — Install Docker

- **Windows / Mac:** install **Docker Desktop** from docker.com, open it, and wait until it says it is running.
- **Linux server:** ${'`curl -fsSL https://get.docker.com | sh`'}

Check it works:
${fence('bash', ['docker --version', 'docker compose version'])}
Both must print a version number.

## Step 2 — Run it on your own computer first

Open a terminal **inside this folder** (the one that contains \`docker-compose.yml\`).

1. The file \`deploy.env\` was created for you with random secrets. You can start right away.
2. Build and start everything (the first time can take 5–20 minutes, Rust and Spring Boot are the slowest):
${fence('bash', 'docker compose --env-file deploy.env up -d --build')}
3. Check that everything is running (every line should say \`running\` or \`healthy\`):
${fence('bash', 'docker compose --env-file deploy.env ps')}
4. Open **http://localhost:8080** in your browser.

${dbNote}

Useful commands (always in this folder):

| What you want | Command |
|---------------|---------|
| See live logs | \`docker compose --env-file deploy.env logs -f\` |
| See logs of one part | \`docker compose --env-file deploy.env logs -f ${n.inertia ? 'app' : (ctx.hasBackend ? 'backend' : 'frontend')}\` |
| Stop (keeps your data) | \`docker compose --env-file deploy.env down\` |
| Start again | \`docker compose --env-file deploy.env up -d\` |
| Update after changing code | \`docker compose --env-file deploy.env up -d --build\` |
| Stop **and delete all data** | \`docker compose --env-file deploy.env down -v\` |

${!ctx.hasBackend ? '' : 'Backup (do this before updating a real site):'}
${!ctx.hasBackend ? '' : ctx.isPg
    ? fence('bash', ['docker compose --env-file deploy.env exec -T db pg_dump -U postgres ' + ctx.pgDatabaseName + ' > backup.sql', '# restore: cat backup.sql | docker compose --env-file deploy.env exec -T db psql -U postgres ' + ctx.pgDatabaseName])
    : fence('bash', [`docker compose --env-file deploy.env cp ${n.inertia ? 'app' : 'backend'}:${n.backend.workdir}/database ./backup-database`, `docker compose --env-file deploy.env cp ${n.inertia ? 'app' : 'backend'}:${n.backend.workdir}/storage ./backup-storage`])}

${hostTypes(ctx, n)}
## Troubleshooting

| Problem | What to do |
|---------|------------|
| \`port is already allocated\` | Something else uses port 8080. Change \`HTTP_PORT=8081\` in \`deploy.env\`, run the start command again, open http://localhost:8081 |
| \`variable is not set ... Set DB_PASSWORD\` | You forgot \`--env-file deploy.env\` in the command, or the value is empty in \`deploy.env\` |
| Page is blank or shows 502 | The backend may still be starting. Wait a minute, then run the logs command and read the last red lines |
| Build is very slow or "killed" | The server ran out of memory. Use a server with 4 GB RAM or add swap |
| Realtime/notifications do not update live | After changing a domain in \`deploy.env\` run the **update** command again, because the address is built into the website |
| HTTPS certificate not created | The domain's A record must point to the server **and** ports 80 and 443 must be open in the firewall |
| \`permission denied\` talking to Docker (Linux) | ${'`sudo usermod -aG docker $USER`'} then log out and in again |
| I re-exported and the app looks old | Data in volumes is kept on purpose. If you do not need the old data: \`docker compose --env-file deploy.env down -v\` then start again |
`
}

function manualGuide(ctx) {
  const n = names(ctx)
  const kind = stackKind(ctx.stack)
  const mb = MANUAL_BACKEND[ctx.backend]
  const mf = MANUAL_FRONTEND[ctx.stack]
  const needs = [...(ctx.hasBackend ? mb.need : []), ...(mf ? [mf.need] : [])]
  const dbLine = ctx.hasBackend
    ? (ctx.isPg
      ? `This project uses PostgreSQL. Create the database \`${ctx.pgDatabaseName}\` on your server and fill it with your tables (export a dump from the machine where you built this: \`pg_dump -U postgres ${ctx.pgDatabaseName} > dump.sql\`, then \`psql -U postgres ${ctx.pgDatabaseName} < dump.sql\` on the server). In \`backend/.env\` set \`DB_HOST\`, \`DB_PORT\`, \`DB_USERNAME\`, \`DB_PASSWORD\`.`
      : `This project uses SQLite: the database is the file \`${n.sqlitePath}\` inside the backend folder. Nothing to install — just keep that file (back it up by copying it).`)
    : ''
  // Step numbers adapt to what this export contains (no gaps).
  const S = { front: ctx.hasBackend ? 5 : 4 }
  S.proxy = S.front + (mf ? 1 : 0)
  S.keep = S.proxy + 1
  const unit = (name, cmd, dir) => fence('ini', ['[Unit]', `Description=${ctx.tatName} ${name}`, 'After=network.target', '', '[Service]', `WorkingDirectory=${dir}`, `ExecStart=${cmd}`, 'Restart=always', 'User=www-data', '', '[Install]', 'WantedBy=multi-user.target'])
  return `## Deploy without Docker (a plain Linux server)

> Want the easy way? Re-export with Docker: \`node mizumi.js export ${ctx.tatName} ${ctx.stack} --docker\`. This section is for people who prefer to install everything by hand.

### Step 1 — Install on the server
${needs.map(x => `- ${x}`).join('\n')}
- Caddy (free web server that handles HTTPS): see caddyserver.com/docs/install

### Step 2 — Copy the project to the server
${fence('bash', ['rsync -av --exclude node_modules --exclude vendor --exclude .venv --exclude target ./ root@YOUR_SERVER_IP:/srv/' + ctx.tatName + '/'])}

### Step 3 — Database
${dbLine || 'No backend in this export, so no database.'}

${ctx.hasBackend ? `### Step 4 — Start the backend
${fence('bash', mb.run)}
It listens on port ${n.backend.port}.${mb.queue && ctx.hasJobs ? `\nBackground jobs need a **second** process, in the same folder:\n${fence('bash', mb.queue)}` : ''}${mb.rt && ctx.hasRealtime ? `\nRealtime needs a **third** process:\n${fence('bash', mb.rt)}` : ''}
` : ''}${mf ? `### Step ${S.front} — Build and start the website
${fence('bash', mf.run)}
${mf.staticDir ? `Serve the folder \`${mf.staticDir}\` with Caddy (next step).` : 'It listens on port 3001.'}
` : ''}### Step ${S.proxy} — Make it one public website (HTTPS)
Create \`/etc/caddy/Caddyfile\` and replace \`yourdomain.com\`:
${fence('caddyfile', ['yourdomain.com {', ...(ctx.hasBackend && !n.inertia ? ['  handle /api/* { reverse_proxy localhost:' + n.backend.port + ' }', '  handle /storage/* { reverse_proxy localhost:' + n.backend.port + ' }'] : []), ...(ctx.hasBackend && ctx.hasRealtime && n.backend.rtPort ? ['  handle /app/* { reverse_proxy localhost:' + n.backend.rtPort + ' }'] : []),
    ...(mf?.staticDir ? ['  handle {', `    root * /srv/${ctx.tatName}/${mf.staticDir}`, '    try_files {path} /index.html', '    file_server', '  }'] : ['  handle { reverse_proxy localhost:' + (n.inertia ? n.backend.port : n.frontend.port) + ' }']), '}'])}
Then: \`sudo systemctl reload caddy\`. Point your domain's **A record** to the server first.

### Step ${S.keep} — Keep it running after you close the terminal
Create one service file per process, for example \`/etc/systemd/system/${ctx.tatName}-backend.service\`:
${unit('backend', 'THE START COMMAND FROM THE BACKEND STEP', `/srv/${ctx.tatName}${n.inertia ? '' : '/backend'}`)}
Then: \`sudo systemctl daemon-reload && sudo systemctl enable --now ${ctx.tatName}-backend\`. Repeat for the website${mb?.queue && ctx.hasJobs ? ', queue worker' : ''}${mb?.rt && ctx.hasRealtime ? ' and realtime' : ''} (change the name and the command).

## Troubleshooting

| Problem | What to do |
|---------|------------|
| Site shows 502 | The process behind Caddy is not running. \`sudo systemctl status ${ctx.tatName}-backend\` and \`journalctl -u ${ctx.tatName}-backend -n 50\` |
| HTTPS not working | A record must point to the server, ports 80 and 443 must be open |
| Command not found | A tool from Step 1 is missing or too old. Check versions |
`
}

function mobileGuide(ctx) {
  const stack = ctx.stack
  const build = stack === 'expo' ? `### Build with EAS (Expo's build service)
1. Create a free account at expo.dev.
2. Install the tool and log in:
${fence('bash', ['npm install -g eas-cli', 'eas login'])}
3. Inside this folder, once:
${fence('bash', ['eas build:configure'])}
4. **Android** test build you can install directly (APK):
${fence('bash', ['eas build --platform android --profile preview'])}
   When it finishes EAS prints a download link.
5. **iOS** (needs an Apple Developer account, 99 USD/year):
${fence('bash', ['eas build --platform ios'])}
6. Publish to the stores:
${fence('bash', ['eas submit --platform android', 'eas submit --platform ios'])}
` : stack === 'react-native' ? `### Android
1. Install **JDK 17** and **Android Studio** (it installs the Android SDK).
2. Create a signing key once (keep the file and passwords safe — you cannot update the app without them):
${fence('bash', ['keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key -keyalg RSA -keysize 2048 -validity 10000'])}
3. Put the keystore in \`android/app/\` and add its details to \`android/gradle.properties\` (follow reactnative.dev/docs/signed-apk-android).
4. Build:
${fence('bash', ['cd android', './gradlew assembleRelease      # APK  -> android/app/build/outputs/apk/release/', './gradlew bundleRelease        # AAB for Google Play'])}
### iOS (needs a Mac)
1. Open \`ios/*.xcworkspace\` in Xcode.
2. Choose your team under **Signing & Capabilities**.
3. Menu **Product → Archive**, then **Distribute App**.
` : `### Lynx
1. Build the bundle:
${fence('bash', ['npm install', 'npm run build'])}
2. Lynx bundles run inside a Lynx host app. Follow the packaging guide at lynxjs.org to embed the bundle in an Android or iOS host app, then build that app with Gradle (Android) or Xcode (iOS).
`
  return `## Build and publish the mobile app

> Mobile apps are **not** deployed with Docker. They are built into an installable file (APK/AAB for Android, IPA for iOS).

### Step 1 — Put the backend online first
This export contains **only the app**. The app talks to a backend over the internet, so deploy the backend before you build:
${fence('bash', [`node mizumi.js export ${ctx.tatName} nextjs --docker`])}
That creates \`projects/${ctx.tatName}/\` with a \`DEPLOY.md\` that shows exactly how to put it online (use any web stack — the backend is the same). You get a public address like \`https://yourdomain.com\`.

### Step 2 — Tell the app where the backend is
${stack === 'expo'
    ? `Create a file named \`.env\` in this folder:\n${fence('ini', ['EXPO_PUBLIC_ARKZEN_BACKEND_URL=https://yourdomain.com'])}`
    : 'Search the project for the backend/API address setting (look for `BACKEND_URL` or `API_URL`) and replace the local address (`http://localhost…`) with your public one.'}
A phone cannot reach \`localhost\` — it must be a real public address.

### Step 3 — Build
${build}
## Troubleshooting

| Problem | What to do |
|---------|------------|
| App opens but shows no data | The backend address (Step 2) is wrong or the backend is offline. Open that address in a phone browser to test |
| \`http://\` blocked on Android/iOS | Use \`https://\` for the backend (the proxy in the web export does it for you with a domain) |
`
}

function desktopGuide(ctx) {
  const tauri = ctx.stack === 'tauri'
  return `## Build the desktop app

> Desktop apps are **not** deployed with Docker. They are built into an installer for each operating system.
> **You must build on the system you are building for:** Windows installer on Windows, macOS on a Mac, Linux on Linux (or use the free GitHub Actions option below).

### Step 1 — Put the backend online first
${ctx.hasBackend ? 'The `backend/` folder in this export is the same backend a web export has, but a desktop app is not deployed with Docker. The easy way to put that backend online is to export the same tatemono again with a web stack:' : 'If your tatemono has a backend, put it online first by exporting it with a web stack:'}
${fence('bash', [`node mizumi.js export ${ctx.tatName} nextjs --docker`])}
Follow the \`DEPLOY.md\` it creates. You get a public address like \`https://yourdomain.com\`.

### Step 2 — Tell the app where the backend is
Search \`frontend/\` (ignore \`node_modules\`) for \`8001\` and \`localhost\` and replace those local addresses with your public address. If nothing is found, this tatemono does not call a backend and you can skip this step.

### Step 3 — Install the tools
${tauri ? `- Node.js 22
- Rust (install with rustup)
- Tauri system requirements for your OS: tauri.app/start/prerequisites` : '- Node.js 22'}

### Step 4 — Build the installer
${fence('bash', tauri ? ['cd frontend', 'npm install', 'npm run tauri:build'] : ['cd frontend', 'npm install', 'npm run   # lists the scripts; run the one that packages the app (it calls electron-builder)'])}
${tauri ? 'The installers appear in `frontend/src-tauri/target/release/bundle/` (`.msi`/`.exe` on Windows, `.dmg` on macOS, `.deb`/`.AppImage` on Linux).' : 'The installers appear in the `dist/` (or `release/`) folder that electron-builder prints at the end.'}

### Step 5 — Share it
- Send the installer file to your users, or upload it to a GitHub Release / your website.
- **Windows and macOS warn about unsigned apps.** Removing the warning needs a code-signing certificate (Windows) or an Apple Developer account (macOS). For internal use you can ignore the warning.

### Build all three operating systems for free (optional)
Put this folder in a GitHub repository and use the official ${tauri ? '`tauri-apps/tauri-action`' : '`electron-builder` with GitHub Actions'} workflow — it builds Windows, macOS and Linux installers in the cloud.

## Troubleshooting

| Problem | What to do |
|---------|------------|
| Build fails with "command not found" | A tool from Step 3 is missing. Reopen the terminal after installing |
| App opens but shows no data | Step 2 was skipped, or the backend is offline |
`
}

export function writeDeployGuide(ctx) {
  const kind = stackKind(ctx.stack)
  let body = guideHeader(ctx)
  if (kind === 'mobile') body += '\n' + mobileGuide(ctx)
  else if (kind === 'desktop') body += '\n' + desktopGuide(ctx)
  else if (ctx.docker) body += '\n' + dockerGuide(ctx)
  else body += '\n' + manualGuide(ctx)
  fs.writeFileSync(path.join(ctx.projectDir, 'DEPLOY.md'), body)
  ctx.log.success(`DEPLOY.md (${kind === 'web' ? (ctx.docker ? 'Docker' : 'manual') : kind} deploy steps)`)
}