import { expect, test } from "vitest";

import {
  consultarDisponibilidade,
  ErroConflitoApi,
  ErroValidacaoApi,
  reservarHorario,
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

test("cria uma reserva consecutiva usando a API Python real", async () => {
  const entrada = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 600, fim: 660 },
  };

  const promessa = reservarHorario(
    entrada,
    "http://127.0.0.1:8000",
  );

  await expect(promessa).resolves.toEqual([
    { inicio: 540, fim: 600 },
    { inicio: 600, fim: 660 },
  ]);
});

test("rejeita uma reserva conflitante usando a API Python real", async () => {
  const entrada = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 570, fim: 630 },
  };

  const promessa = reservarHorario(
    entrada,
    "http://127.0.0.1:8000",
  );

  await expect(promessa).rejects.toBeInstanceOf(ErroConflitoApi);
  await expect(promessa).rejects.toThrow("Horário indisponível.");
});

test("rejeita uma reserva inválida usando a API Python real", async () => {
  const entrada = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 600, fim: 600 },
  };

  const promessa = reservarHorario(
    entrada,
    "http://127.0.0.1:8000",
  );

  await expect(promessa).rejects.toBeInstanceOf(ErroValidacaoApi);
  await expect(promessa).rejects.toThrow("Intervalo inválido.");
});