import { consultarDisponibilidade } from "./api";
import { montarTela } from "./tela";

const container = document.getElementById("app");

if (container === null) {
  throw new Error("Elemento #app não encontrado");
}

const reservas = [{ inicio: 540, fim: 600 }];

montarTela(container, (solicitacao) =>
  consultarDisponibilidade({
    reservas,
    solicitacao,
  }),
);