from fastapi.testclient import TestClient

from api import app


def test_consulta_disponibilidade_para_intervalos_consecutivos() -> None:
    with TestClient(app) as cliente:
        resposta = cliente.post(
            "/disponibilidade",
            json={
                "reservas": [{"inicio": 540, "fim": 600}],
                "solicitacao": {"inicio": 600, "fim": 660},
            },
        )

    assert resposta.status_code == 200
    assert resposta.json() == {"disponivel": True}


def test_consulta_disponibilidade_para_intervalos_conflitantes() -> None:
    with TestClient(app) as cliente:
        resposta = cliente.post(
            "/disponibilidade",
            json={
                "reservas": [{"inicio": 540, "fim": 600}],
                "solicitacao": {"inicio": 570, "fim": 630},
            },
        )

    assert resposta.status_code == 200

    assert resposta.json() == {"disponivel": False}


def test_rejeita_solicitacao_com_duracao_zero() -> None:
    with TestClient(app) as cliente:
        resposta = cliente.post(
            "/disponibilidade",
            json={
                "reservas": [{"inicio": 540, "fim": 600}],
                "solicitacao": {"inicio": 600, "fim": 600},
            },
        )

    assert resposta.status_code == 422

    assert resposta.json() == {"detail": "Intervalo inválido."}


def test_rejeita_reserva_com_duracao_zero() -> None:
    with TestClient(app) as cliente:
        resposta = cliente.post(
            "/disponibilidade",
            json={
                "reservas": [{"inicio": 540, "fim": 540}],
                "solicitacao": {"inicio": 600, "fim": 660},
            },
        )

    assert resposta.status_code == 422
    assert resposta.json() == {"detail": "Intervalo inválido."}
