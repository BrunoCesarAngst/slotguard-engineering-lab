import {
  consultarDisponibilidade,
  reservarHorario,
} from "./api";
import { montarTela } from "./tela";

const container = document.getElementById("app");

if (container === null) {
  throw new Error("Elemento #app não encontrado");
}

let reservas = [{ inicio: 540, fim: 600 }];

montarTela(
  container,
  (solicitacao) =>
    consultarDisponibilidade({
      reservas,
      solicitacao,
    }),
  async (solicitacao) => {
    const agendaAtualizada = await reservarHorario({
      reservas,
      solicitacao,
    });

    reservas = agendaAtualizada;

    return agendaAtualizada;
  },
);