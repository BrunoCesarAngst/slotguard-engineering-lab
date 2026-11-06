"""Testes dos invariantes e da imutabilidade dos modelos do SlotGuard."""

from dataclasses import FrozenInstanceError

import pytest

from models import Agenda, Intervalo


@pytest.mark.parametrize(
    ("inicio", "fim"),
    [
        pytest.param(540, 600, id="horario-normal"),
        pytest.param(0, 60, id="inicio-zero"),
        pytest.param(1380, 1440, id="fim-limite-dia"),
    ],
)
def test_criar_intervalo_valido(inicio: int, fim: int) -> None:
    intervalo = Intervalo(inicio=inicio, fim=fim)

    assert intervalo.inicio == inicio
    assert intervalo.fim == fim


@pytest.mark.parametrize(
    ("inicio", "fim"),
    [
        pytest.param(600, 540, id="intervalo-invertido"),
        pytest.param(540, 540, id="duracao-zero"),
        pytest.param(-30, 60, id="inicio-negativo"),
        pytest.param(1380, 1441, id="fim-acima-limite"),
    ],
)
def test_rejeitar_intervalo_invalido(inicio: int, fim: int) -> None:
    with pytest.raises(ValueError):
        _ = Intervalo(inicio=inicio, fim=fim)


def test_rejeitar_inicio_decimal() -> None:
    with pytest.raises(TypeError):
        _ = Intervalo(inicio=540.5, fim=600)  # pyright: ignore[reportArgumentType]


def test_rejeitar_inicio_booleano() -> None:
    with pytest.raises(TypeError):
        _ = Intervalo(inicio=True, fim=600)


def test_rejeitar_fim_decimal() -> None:
    with pytest.raises(TypeError):
        _ = Intervalo(inicio=540, fim=600.5)  # pyright: ignore[reportArgumentType]


def test_rejeitar_fim_booleano() -> None:
    with pytest.raises(TypeError):
        _ = Intervalo(inicio=540, fim=True)


def test_rejeitar_fim_texto() -> None:
    with pytest.raises(TypeError):
        _ = Intervalo(inicio=540, fim="a!b@")  # pyright: ignore[reportArgumentType]


def test_rejeitar_fim_none() -> None:
    with pytest.raises(TypeError):
        _ = Intervalo(inicio=540, fim=None)  # pyright: ignore[reportArgumentType]


def test_rejeitar_fim_ausente() -> None:
    with pytest.raises(TypeError):
        _ = Intervalo(inicio=540)  # pyright: ignore[reportCallIssue]


def test_intervalo_inicio_imutavel() -> None:
    intervalo = Intervalo(inicio=540, fim=600)

    with pytest.raises(FrozenInstanceError):
        setattr(intervalo, "inicio", 570)  # noqa: B010

    assert intervalo.inicio == 540


def test_intervalo_fim_imutavel() -> None:
    intervalo = Intervalo(inicio=540, fim=600)

    with pytest.raises(FrozenInstanceError):
        setattr(intervalo, "fim", 630)  # noqa: B010

    assert intervalo.fim == 600


def test_criar_agenda_valida() -> None:
    reservas = (
        Intervalo(inicio=540, fim=600),
        Intervalo(inicio=600, fim=660),
    )
    agenda = Agenda(reservas=reservas)

    assert agenda.reservas == reservas
    assert len(agenda.reservas) == 2


def test_agenda_rejeita_elemento_invalido() -> None:
    reservas = (
        Intervalo(inicio=540, fim=600),
        "reserva inválida",
    )

    with pytest.raises(TypeError):
        _ = Agenda(reservas=reservas)  # pyright: ignore[reportArgumentType]


def test_agenda_rejeita_lista() -> None:
    reservas = [
        Intervalo(inicio=540, fim=600),
        Intervalo(inicio=600, fim=660),
    ]

    with pytest.raises(TypeError):
        _ = Agenda(reservas=reservas)  # pyright: ignore[reportArgumentType]


def test_agenda_vazia_valida() -> None:
    agenda = Agenda()

    assert agenda.reservas == ()
    assert len(agenda.reservas) == 0


def test_agenda_aceita_intervalos_sobrepostos() -> None:
    reservas = (
        Intervalo(inicio=540, fim=600),
        Intervalo(inicio=570, fim=630),
    )
    agenda = Agenda(reservas=reservas)

    assert agenda.reservas == reservas


def test_agenda_reservas_imutaveis() -> None:
    reservas = (Intervalo(540, 600),)
    agenda = Agenda(reservas=reservas)

    with pytest.raises(FrozenInstanceError):
        setattr(agenda, "reservas", (Intervalo(600, 660),))  # noqa: B010

    assert agenda.reservas == reservas
