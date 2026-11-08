import { expect, test } from "vitest";

import {
  consultarDisponibilidade,
  ErroValidacaoApi,
} from "./api";

test("consulta disponibilidade na API Python real", async () => {
  const consulta = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 600, fim: 660 },
  };

  const promessa = consultarDisponibilidade(
    consulta,
    "http://127.0.0.1:8000",
  );

  await expect(promessa).resolves.toBe(true);
});

test("recebe a mensagem de validação da API Python real", async () => {
  const consulta = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 600, fim: 600 },
  };

  const promessa = consultarDisponibilidade(
    consulta,
    "http://127.0.0.1:8000",
  );

  await expect(promessa).rejects.toBeInstanceOf(ErroValidacaoApi);
  await expect(promessa).rejects.toThrow("Intervalo inválido.");
});