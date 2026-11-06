from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, StrictInt

from models import Agenda, Intervalo
from slotguard import esta_disponivel

app = FastAPI()


class IntervaloEntrada(BaseModel):
    inicio: StrictInt
    fim: StrictInt


class ConsultaDisponibilidadeEntrada(BaseModel):
    reservas: list[IntervaloEntrada]
    solicitacao: IntervaloEntrada


@app.post("/disponibilidade")
def consultar_disponibilidade(
    entrada: ConsultaDisponibilidadeEntrada,
) -> dict[str, bool]:
    try:
        reservas = tuple(
            Intervalo(inicio=item.inicio, fim=item.fim) for item in entrada.reservas
        )

        agenda: Agenda = Agenda(reservas=reservas)
        solicitacao = Intervalo(entrada.solicitacao.inicio, entrada.solicitacao.fim)

    except ValueError as erro:
        raise HTTPException(
            status_code=422,
            detail=str(erro),
        ) from erro

    return {"disponivel": esta_disponivel(agenda, novo=solicitacao)}
