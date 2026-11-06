from collections.abc import Callable

import pytest
from hypothesis import given
from hypothesis import strategies as st
from hypothesis.strategies import SearchStrategy

from exceptions import HorarioIndisponivelError
from models import Agenda, Intervalo
from slotguard import (
    agendar,
    esta_disponivel,
    existe_conflito,
    tem_conflito,
)

# 1. Detecção de conflitos


@pytest.mark.parametrize(
    ("existente", "novo", "esperado"),
    [
        pytest.param(
            Intervalo(540, 600),
            Intervalo(600, 660),
            False,
            id="reservas-consecutivas",
        ),
        pytest.param(
            Intervalo(540, 600),
            Intervalo(570, 630),
            True,
            id="sobreposicao-parcial",
        ),
        pytest.param(
            Intervalo(540, 660),
            Intervalo(570, 600),
            True,
            id="nova-reserva-contida",
        ),
        pytest.param(
            Intervalo(570, 600),
            Intervalo(540, 660),
            True,
            id="nova-reserva-engloba",
        ),
    ],
)
def test_tem_conflito(
    existente: Intervalo,
    novo: Intervalo,
    esperado: bool,
) -> None:
    assert tem_conflito(existente, novo) is esperado


def test_reserva_limite_final_dia() -> None:
    existente = Intervalo(1320, 1380)
    novo = Intervalo(1380, 1440)

    assert tem_conflito(existente, novo) is False


# 2. Busca de conflitos na agenda


def test_conflito_na_ultima_reserva() -> None:
    agenda = Agenda(
        reservas=(
            Intervalo(540, 600),
            Intervalo(600, 660),
            Intervalo(840, 900),
        )
    )
    novo = Intervalo(870, 930)

    assert existe_conflito(agenda, novo) is True


# 3. Consulta de disponibilidade


@pytest.mark.parametrize(
    ("agenda", "novo", "esperado"),
    [
        pytest.param(
            Agenda(
                reservas=(
                    Intervalo(540, 600),
                    Intervalo(660, 720),
                )
            ),
            Intervalo(600, 660),
            True,
            id="horario-disponivel",
        ),
        pytest.param(
            Agenda(reservas=(Intervalo(540, 600),)),
            Intervalo(570, 630),
            False,
            id="horario-ocupado",
        ),
        pytest.param(
            Agenda(
                reservas=(
                    Intervalo(540, 600),
                    Intervalo(660, 720),
                )
            ),
            Intervalo(675, 705),
            False,
            id="conflito-segunda-reserva",
        ),
    ],
)
def test_disponibilidade(
    agenda: Agenda,
    novo: Intervalo,
    esperado: bool,
) -> None:
    assert esta_disponivel(agenda, novo) is esperado


@pytest.mark.parametrize(
    ("funcao", "esperado"),
    [
        pytest.param(
            existe_conflito,
            False,
            id="agenda-vazia-sem-conflito",
        ),
        pytest.param(
            esta_disponivel,
            True,
            id="agenda-vazia-disponivel",
        ),
    ],
)
def test_comportamento_agenda_vazia(
    funcao: Callable[[Agenda, Intervalo], bool],
    esperado: bool,
) -> None:
    agenda = Agenda()
    novo = Intervalo(540, 600)

    assert funcao(agenda, novo) is esperado


# 4. Efetivação de agendamentos


def test_agendar_horario_disponivel() -> None:
    agenda = Agenda(reservas=(Intervalo(540, 600),))
    novo = Intervalo(600, 660)

    resultado = agendar(agenda, novo)

    assert resultado == Agenda(
        reservas=(
            Intervalo(540, 600),
            Intervalo(600, 660),
        )
    )
    assert agenda.reservas == (Intervalo(540, 600),)
    assert resultado is not agenda


def test_agendar_horario_ocupado() -> None:
    agenda = Agenda(reservas=(Intervalo(540, 600),))
    novo = Intervalo(570, 630)

    with pytest.raises(
        HorarioIndisponivelError,
        match="Horário indisponível",
    ):
        _ = agendar(agenda, novo)

    assert agenda.reservas == (Intervalo(540, 600),)


def test_nova_agenda_com_reserva() -> None:
    agenda = Agenda()
    novo = Intervalo(540, 600)

    resultado = agendar(agenda, novo)

    assert resultado.reservas == (novo,)
    assert agenda.reservas == ()
    assert resultado is not agenda


def test_nao_agendar_duas_vezes_o_mesmo_horario() -> None:
    original = Agenda()
    novo = Intervalo(540, 600)

    atualizada = agendar(original, novo)

    with pytest.raises(
        HorarioIndisponivelError,
        match="Horário indisponível",
    ):
        _ = agendar(atualizada, novo)

    assert original.reservas == ()
    assert atualizada.reservas == (novo,)


@pytest.mark.parametrize(
    ("a", "b"),
    [
        pytest.param(
            Intervalo(540, 600),
            Intervalo(570, 630),
            id="sobrepostos",
        ),
        pytest.param(
            Intervalo(540, 600),
            Intervalo(600, 660),
            id="consecutivos",
        ),
        pytest.param(
            Intervalo(540, 600),
            Intervalo(660, 720),
            id="separados",
        ),
    ],
)
def test_conflito_e_simetrico(a: Intervalo, b: Intervalo) -> None:
    assert tem_conflito(a, b) is tem_conflito(b, a)


def intervalos_validos() -> SearchStrategy[Intervalo]:
    return st.integers(min_value=0, max_value=1439).flatmap(
        lambda inicio: st.integers(
            min_value=inicio + 1,
            max_value=1440,
        ).map(lambda fim: Intervalo(inicio=inicio, fim=fim))
    )


@given(
    a=intervalos_validos(),
    b=intervalos_validos(),
)
def test_conflito_simetrico_com_hypothesis(
    a: Intervalo,
    b: Intervalo,
) -> None:
    assert tem_conflito(a, b) is tem_conflito(b, a)


@given(novo=intervalos_validos())
def test_reserva_agendada_fica_indisponivel(
    novo: Intervalo,
) -> None:
    original = Agenda()
    atualizada = agendar(original, novo)

    # A nova reserva foi adicionada
    assert novo in atualizada.reservas

    # O horário reservado agora está indisponível
    assert esta_disponivel(atualizada, novo) is False

    # A agenda original continua vazia
    assert original.reservas == ()


@given(novo=intervalos_validos())
def test_nao_permite_reserva_duplicada(
    novo: Intervalo,
) -> None:
    original = Agenda()

    # Primeiro agendamento
    atualizada = agendar(original, novo)

    # Uma segunda tentativa deve ser rejeitada
    with pytest.raises(HorarioIndisponivelError):
        _ = agendar(atualizada, novo)

    # A agenda permanece com apenas uma reserva
    assert len(atualizada.reservas) == 1
    assert atualizada.reservas == (novo,)
