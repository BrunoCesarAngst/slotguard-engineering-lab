# syntax=docker/dockerfile:1
FROM node:22.21.1-bookworm-slim AS node
FROM python:3.12.14-slim-bookworm

# Chromium do Debian está disponível tanto em Linux amd64 quanto arm64.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium ffmpeg espeak-ng libsndfile1 ca-certificates fonts-liberation \
    && rm -rf /var/lib/apt/lists/*
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium \
    XDG_CACHE_HOME=/tmp/cache HOME=/tmp
WORKDIR /opt/video
COPY requirements.txt requirements.lock ./
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.lock \
    && /opt/venv/bin/pip check
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Pesos entram na imagem por download verificado, nunca pela cópia da máquina.
COPY modelos.json ./
COPY scripts/baixar-modelos.py scripts/baixar-modelos.py
RUN SLOTGUARD_MODELS=/opt/models python scripts/baixar-modelos.py

COPY src ./src
COPY scripts ./scripts
COPY public ./public
COPY roteiros-completos.json ./
COPY docker-entrypoint.sh /usr/local/bin/slotguard-video
RUN chmod +x /usr/local/bin/slotguard-video
USER 1000:1000
ENTRYPOINT ["slotguard-video"]
CMD ["--check"]
