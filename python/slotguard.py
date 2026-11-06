# qualquer horário do dia vira apenas a soma dos seus minutos a partir da meia-noite
# (Horas × 60) + Minutos = Total de Minutos
# 18:45 -> (18 × 60) + 45 = 1125

from exceptions import HorarioIndisponivelError
from models import Agenda, Intervalo


def tem_conflito(
    existente: Intervalo,
    novo: Intervalo,
) -> bool:
    return novo.inicio < existente.fim and novo.fim > existente.inicio


def existe_conflito(agenda: Agenda, novo: Intervalo) -> bool:
    for reserva in agenda.reservas:
        if tem_conflito(reserva, novo):
            return True

    return False


def esta_disponivel(agenda: Agenda, novo: Intervalo) -> bool:
    return not existe_conflito(agenda, novo)


def agendar(
    agenda: Agenda,
    novo: Intervalo,
) -> Agenda:
    if not esta_disponivel(agenda, novo):
        raise HorarioIndisponivelError("Horário indisponível.")

    # Construir uma nova Agenda
    novas_reservas = agenda.reservas + (novo,)

    # contendo as reservas antigas e novo
    return Agenda(reservas=novas_reservas)
