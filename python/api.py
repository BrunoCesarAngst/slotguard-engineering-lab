from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, StrictInt

from exceptions import HorarioIndisponivelError
from models import Agenda, Intervalo
from slotguard import agendar, esta_disponivel

app = FastAPI()


class IntervaloEntrada(BaseModel):
    inicio: StrictInt
    fim: StrictInt


class ConsultaDisponibilidadeEntrada(BaseModel):
    reservas: list[IntervaloEntrada]
    solicitacao: IntervaloEntrada


def converter_entrada(
    entrada: ConsultaDisponibilidadeEntrada,
) -> tuple[Agenda, Intervalo]:
    reservas = tuple(
        Intervalo(inicio=item.inicio, fim=item.fim) for item in entrada.reservas
    )

    agenda = Agenda(reservas=reservas)

    solicitacao = Intervalo(
        inicio=entrada.solicitacao.inicio,
        fim=entrada.solicitacao.fim,
    )

    return agenda, solicitacao


@app.post("/disponibilidade")
def consultar_disponibilidade(
    entrada: ConsultaDisponibilidadeEntrada,
) -> dict[str, bool]:
    try:
        agenda, solicitacao = converter_entrada(entrada)
    except ValueError as erro:
        raise HTTPException(
            status_code=422,
            detail=str(erro),
        ) from erro

    return {"disponivel": esta_disponivel(agenda, novo=solicitacao)}


@app.post("/reservas", status_code=201)
def reservar_horario(
    entrada: ConsultaDisponibilidadeEntrada,
) -> dict[str, list[dict[str, int]]]:
    try:
        agenda, solicitacao = converter_entrada(entrada)
    except ValueError as erro:
        raise HTTPException(
            status_code=422,
            detail=str(erro),
        ) from erro

    try:
        atualizada = agendar(agenda, solicitacao)
    except HorarioIndisponivelError as erro:
        raise HTTPException(
            status_code=409,
            detail=str(erro),
        ) from erro

    return {
        "reservas": [
            {"inicio": reserva.inicio, "fim": reserva.fim}
            for reserva in atualizada.reservas
        ]
    }
