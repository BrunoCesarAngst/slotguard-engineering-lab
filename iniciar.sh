#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$PROJECT_ROOT/python/.venv/bin/python"
VITE="$PROJECT_ROOT/typescript/node_modules/vite/bin/vite.js"

for ferramenta in node curl lsof; do
  if ! command -v "$ferramenta" > /dev/null; then
    echo "Não encontrei $ferramenta. Consulte a instalação inicial no README.md."
    exit 1
  fi
done

if [[ ! -x "$PYTHON" || ! -f "$VITE" ]]; then
  echo "Prepare as dependências conforme a instalação inicial no README.md."
  exit 1
fi

if ! "$PYTHON" -c 'import fastapi, uvicorn' > /dev/null 2>&1; then
  echo "Instale as dependências Python conforme o README.md."
  exit 1
fi

for porta in 8000 5173; do
  if lsof -nP -iTCP:"$porta" -sTCP:LISTEN > /dev/null 2>&1; then
    echo "A porta $porta já está ocupada."
    echo "Se for o SlotGuard anterior, encerre-o com Ctrl+C no terminal correspondente."
    echo "Nenhum processo existente foi encerrado. Depois execute este comando novamente."
    exit 1
  fi
done

api_pid=""
interface_pid=""

encerrar() {
  trap - EXIT INT TERM
  echo
  echo "Encerrando os servidores iniciados por este comando..."
  for processo in "$api_pid" "$interface_pid"; do
    if [[ -n "$processo" ]]; then
      kill "$processo" 2>/dev/null || true
      wait "$processo" 2>/dev/null || true
    fi
  done
}

trap encerrar EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

(
  cd "$PROJECT_ROOT/python"
  exec "$PYTHON" -m uvicorn api:app --host 127.0.0.1 --port 8000
) &
api_pid=$!

(
  cd "$PROJECT_ROOT/typescript"
  exec node "$VITE" --host 127.0.0.1 --port 5173 --strictPort
) &
interface_pid=$!

pronto=false
for tentativa in {1..30}; do
  if ! kill -0 "$api_pid" 2>/dev/null || ! kill -0 "$interface_pid" 2>/dev/null; then
    echo "Um servidor encerrou durante a inicialização. Confira a mensagem acima."
    exit 1
  fi

  if curl --fail --silent --max-time 2 http://127.0.0.1:8000/openapi.json > /dev/null &&
    curl --fail --silent --max-time 2 http://127.0.0.1:5173/ > /dev/null; then
    pronto=true
    break
  fi
  sleep 1
done

if [[ "$pronto" != true ]]; then
  echo "Os servidores não ficaram prontos dentro do limite. Confira as mensagens acima."
  exit 1
fi

echo
echo "SlotGuard pronto: http://127.0.0.1:5173/"
echo "Documentação da API: http://127.0.0.1:8000/docs"
echo "Deixe este terminal aberto. Para encerrar os dois servidores, pressione Ctrl+C."

while kill -0 "$api_pid" 2>/dev/null && kill -0 "$interface_pid" 2>/dev/null; do
  sleep 1
done

echo "Um dos servidores encerrou. Encerrando também o outro."
exit 1
