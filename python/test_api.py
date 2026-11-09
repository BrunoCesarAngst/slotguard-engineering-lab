from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api import app, configurar_interface


@pytest.fixture
def cliente() -> Iterator[TestClient]:
    with TestClient(app) as cliente_http:
        yield cliente_http


def montar_entrada(
    *,
    reservas: list[tuple[int, int]],
    solicitacao: tuple[int, int],
) -> dict[str, object]:
    inicio, fim = solicitacao

    return {
        "reservas": [
            {"inicio": inicio_reserva, "fim": fim_reserva}
            for inicio_reserva, fim_reserva in reservas
        ],
        "solicitacao": {"inicio": inicio, "fim": fim},
    }


def test_consulta_disponibilidade_para_intervalos_consecutivos(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 600)],
        solicitacao=(600, 660),
    )

    resposta = cliente.post("/disponibilidade", json=entrada)

    assert resposta.status_code == 200
    assert resposta.json() == {"disponivel": True}


def test_consulta_disponibilidade_para_intervalos_conflitantes(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 600)],
        solicitacao=(570, 630),
    )

    resposta = cliente.post("/disponibilidade", json=entrada)

    assert resposta.status_code == 200
    assert resposta.json() == {"disponivel": False}


def test_rejeita_solicitacao_com_duracao_zero(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 600)],
        solicitacao=(600, 600),
    )

    resposta = cliente.post("/disponibilidade", json=entrada)

    assert resposta.status_code == 422
    assert resposta.json() == {"detail": "Intervalo inválido."}


def test_rejeita_reserva_com_duracao_zero(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 540)],
        solicitacao=(600, 660),
    )

    resposta = cliente.post("/disponibilidade", json=entrada)

    assert resposta.status_code == 422
    assert resposta.json() == {"detail": "Intervalo inválido."}


def test_reserva_horario_disponivel_e_retorna_agenda_atualizada(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 600)],
        solicitacao=(600, 660),
    )

    resposta = cliente.post("/reservas", json=entrada)

    assert resposta.status_code == 201
    assert resposta.json() == {
        "reservas": [
            {"inicio": 540, "fim": 600},
            {"inicio": 600, "fim": 660},
        ]
    }


def test_rejeita_reserva_com_horario_conflitante(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 600)],
        solicitacao=(570, 630),
    )

    resposta = cliente.post("/reservas", json=entrada)

    assert resposta.status_code == 409
    assert resposta.json() == {"detail": "Horário indisponível."}


def test_rejeita_criacao_de_reserva_com_solicitacao_de_duracao_zero(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 600)],
        solicitacao=(600, 600),
    )

    resposta = cliente.post("/reservas", json=entrada)

    assert resposta.status_code == 422
    assert resposta.json() == {"detail": "Intervalo inválido."}


def test_rejeita_criacao_com_reserva_existente_de_duracao_zero(
    cliente: TestClient,
) -> None:
    entrada = montar_entrada(
        reservas=[(540, 540)],
        solicitacao=(600, 660),
    )

    resposta = cliente.post("/reservas", json=entrada)

    assert resposta.status_code == 422
    assert resposta.json() == {"detail": "Intervalo inválido."}


def test_entrega_html_da_interface_na_raiz(tmp_path: Path) -> None:
    html = "<!doctype html><html><body>SlotGuard de teste</body></html>"

    arquivo_index = tmp_path / "index.html"
    _ = arquivo_index.write_text(html, encoding="utf-8")

    aplicacao = FastAPI()
    configurar_interface(aplicacao, tmp_path)

    with TestClient(aplicacao) as cliente_http:
        resposta = cliente_http.get("/")

    assert resposta.status_code == 200
    assert resposta.headers["content-type"].startswith("text/html")
    assert resposta.text == html


def test_entrega_javascript_da_interface(tmp_path: Path) -> None:
    diretorio_assets = tmp_path / "assets"
    diretorio_assets.mkdir()

    javascript = 'console.log("SlotGuard de teste");'
    arquivo_javascript = diretorio_assets / "index-teste.js"
    _ = arquivo_javascript.write_text(javascript, encoding="utf-8")

    aplicacao = FastAPI()
    configurar_interface(aplicacao, tmp_path)

    with TestClient(aplicacao) as cliente_http:
        resposta = cliente_http.get("/assets/index-teste.js")

    assert resposta.status_code == 200
    assert resposta.text == javascript
    assert resposta.headers["content-type"].split(";")[0] in {
        "text/javascript",
        "application/javascript",
    }
