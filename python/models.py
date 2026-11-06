from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Intervalo:
    inicio: int
    fim: int

    def __post_init__(self) -> None:
        # Verificar tipos
        if type(self.inicio) is not int or type(self.fim) is not int:
            raise TypeError("Tipo de dado inválido.")

        # Verificar limites e duração positiva
        if not (0 <= self.inicio < self.fim <= 1440):
            raise ValueError("Intervalo inválido.")


@dataclass(frozen=True, slots=True)
class Agenda:
    reservas: tuple[Intervalo, ...] = ()

    def __post_init__(self) -> None:
        # Garantir que reservas é uma tupla
        if type(self.reservas) is not tuple:
            raise TypeError("As reservas devem ser uma tupla.")

        # Garantir que todos os itens são Intervalo
        for reserva in self.reservas:
            # Proteção em tempo de execução contra dados externos inválidos.
            if not isinstance(reserva, Intervalo):  # pyright: ignore[reportUnnecessaryIsInstance]
                raise TypeError("A resarva não é um intervavo.")
