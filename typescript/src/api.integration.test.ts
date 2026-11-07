import { expect, test } from "vitest";

import { consultarDisponibilidade } from "./api";

test("consulta disponibilidade na API Python real", async () => {
  const consulta = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 600, fim: 660 },
  };

  const disponivel = await consultarDisponibilidade(
    consulta,
    "http://127.0.0.1:8000",
  );

  expect(disponivel).toBe(true);
});