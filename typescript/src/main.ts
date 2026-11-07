import { consultarDisponibilidade } from "./api";
import { montarTela } from "./tela";

const container = document.getElementById("app");

if (container === null) {
  throw new Error("Elemento #app não encontrado");
}

const consulta = {
  reservas: [{ inicio: 540, fim: 600 }],
  solicitacao: { inicio: 600, fim: 660 },
};

montarTela(container, () => consultarDisponibilidade(consulta));