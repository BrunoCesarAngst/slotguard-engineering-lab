"""Obtém os pesos oficiais e só aceita os bytes registrados no manifesto."""
import hashlib
import json
import os
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
DEST = Path(os.environ.get("SLOTGUARD_MODELS", ROOT / "models"))
DEST.mkdir(parents=True, exist_ok=True)
for model in json.loads((ROOT / "modelos.json").read_text()):
    target = DEST / model["file"]
    if target.exists():
        with target.open("rb") as source:
            if hashlib.file_digest(source, "sha256").hexdigest() == model["sha256"]:
                continue
    temporary = target.with_suffix(target.suffix + ".download")
    try:
        request = urllib.request.Request(model["url"], headers={"User-Agent": "SlotGuard-video"})
        with urllib.request.urlopen(request, timeout=120) as response, temporary.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
        with temporary.open("rb") as source:
            actual = hashlib.file_digest(source, "sha256").hexdigest()
        if actual != model["sha256"]:
            raise RuntimeError(f"Integridade inválida de {model['file']}: {actual}")
        temporary.replace(target)
        print(f"Modelo conferido: {model['file']}", flush=True)
    finally:
        temporary.unlink(missing_ok=True)
