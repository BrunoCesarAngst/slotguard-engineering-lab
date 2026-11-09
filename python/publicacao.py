from pathlib import Path

from api import app, configurar_interface

raiz_projeto = Path(__file__).resolve().parent.parent
diretorio_interface = raiz_projeto / "typescript" / "dist"

if not (diretorio_interface / "index.html").is_file():
    raise RuntimeError(
        "Interface compilada não encontrada. Execute npm run build na pasta typescript."
    )

configurar_interface(app, diretorio_interface)
