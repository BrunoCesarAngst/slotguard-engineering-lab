# syntax=docker/dockerfile:1

# Etapa 1: compilar a interface
FROM node:22.21.1-bookworm-slim AS interface

WORKDIR /build/typescript

COPY typescript/package.json typescript/package-lock.json ./
RUN npm ci

COPY typescript/ ./
RUN npm run build


# Etapa 2: executar a aplicação
FROM python:3.14-slim-bookworm AS aplicacao

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/python

COPY python/requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY python/api.py python/publicacao.py python/models.py \
     python/slotguard.py python/exceptions.py ./

COPY --from=interface /build/typescript/dist /app/typescript/dist

USER 10001:10001

EXPOSE 10000

CMD ["sh", "-c", "exec python -m uvicorn publicacao:app --host 0.0.0.0 --port \"${PORT:-10000}\""]