import time

from exceptions import HorarioIndisponivelError
from models import Agenda, Intervalo
from slotguard import agendar


def formatar_horario(total_minutos: int) -> str:
    horas, minutos = divmod(total_minutos, 60)
    return f"{horas:02d}:{minutos:02d}"


def animar(mensagem: str, duracao: float = 1.5) -> None:
    simbolos = ("|", "/", "-", "\\")
    intervalo = 0.1
    passos = max(1, round(duracao / intervalo))

    for indice in range(passos):
        simbolo = simbolos[indice % len(simbolos)]

        print(
            f"\r{mensagem} {simbolo}",
            end="",
            flush=True,
        )

        time.sleep(intervalo)

    # Limpa a linha da animação.
    print(
        "\r" + " " * (len(mensagem) + 2) + "\r",
        end="",
        flush=True,
    )


def main() -> None:
    original = Agenda()

    cliente_a = Intervalo(540, 600)  # 09:00–10:00
    cliente_b = Intervalo(570, 630)  # 09:30–10:30
    cliente_c = Intervalo(600, 660)  # 10:00–11:00

    bloqueadas = 0

    print("=" * 48)
    print("          SLOTGUARD | ENGINEERING LAB")
    print("             DEMONSTRAÇÃO v0.1")
    print("=" * 48)

    time.sleep(3)

    print("\nIniciando simulação de agendamentos...")
    time.sleep(3)

    print("\n[1/3] Nova solicitação: Cliente A")
    print("      Horário: 09:00–10:00")

    animar("      Verificando disponibilidade")

    agenda = agendar(original, cliente_a)
    print("      ✓ RESERVA CONFIRMADA")

    time.sleep(3)

    print("\n[2/3] Nova solicitação: Cliente B")
    print("      Horário: 09:30–10:30")

    animar("      Verificando disponibilidade")

    try:
        agenda = agendar(agenda, cliente_b)
    except HorarioIndisponivelError:
        bloqueadas += 1
        print("      ✗ RESERVA BLOQUEADA")
        print("      Motivo: conflito com horário existente")

    time.sleep(3)

    print("\n[3/3] Nova solicitação: Cliente C")
    print("      Horário: 10:00–11:00")

    animar("      Verificando disponibilidade")

    agenda = agendar(agenda, cliente_c)
    print("      ✓ RESERVA CONFIRMADA")

    time.sleep(3)

    print("\n" + "=" * 48)
    print("                  AGENDA FINAL")
    print("=" * 48)

    animar("Consultando reservas", duracao=1)

    for indice, reserva in enumerate(agenda.reservas, start=1):
        inicio = formatar_horario(reserva.inicio)
        fim = formatar_horario(reserva.fim)

        print(f"  {indice}. {inicio}–{fim} | CONFIRMADA")
        time.sleep(0.9)

    time.sleep(0.8)

    print("\n" + "-" * 48)
    print(f"  Reservas confirmadas: {len(agenda.reservas)}")
    print(f"  Tentativas bloqueadas: {bloqueadas}")
    print(f"  Agenda original: {len(original.reservas)} reservas")
    print("-" * 48)

    time.sleep(0.8)

    print("\n✓ Demonstração concluída.")
    print("  Integridade da agenda preservada.\n")


if __name__ == "__main__":
    main()
