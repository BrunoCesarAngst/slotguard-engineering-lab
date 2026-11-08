import { afterEach, expect, test, vi } from "vitest";

import { consultarDisponibilidade, ErroValidacaoApi } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("envia a consulta à API e retorna a disponibilidade", async () => {
  const consulta = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 600, fim: 660 },
  };

  const fetchSimulado = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ disponivel: true }));

  vi.stubGlobal("fetch", fetchSimulado);

  const disponivel = await consultarDisponibilidade(consulta);

  // Acrescente aqui as verificações.
  expect(disponivel).toBe(true);
  expect(fetchSimulado).toHaveBeenCalledTimes(1);
  expect(fetchSimulado).toHaveBeenCalledWith("/disponibilidade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(consulta),
  });
});

test("retorna false quando a API informa indisponibilidade", async () => {
  const consulta = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 570, fim: 630 },
  };

  const fetchSimulado = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ disponivel: false }));

  vi.stubGlobal("fetch", fetchSimulado);

  const disponivel = await consultarDisponibilidade(consulta);

  expect(disponivel).toBe(false)
});

test("lança erro quando a API responde com 422", async () => {
  const consulta = {
    reservas: [{ inicio: 540, fim: 600 }],
    solicitacao: { inicio: 600, fim: 600 },
  };

  const fetchSimulado = vi.fn<typeof fetch>().mockResolvedValue(
    Response.json(
      { detail: "Intervalo inválido." },
      { status: 422 },
    ),
  );

  vi.stubGlobal("fetch", fetchSimulado);

  const promessa = consultarDisponibilidade(consulta)

  await expect(promessa).rejects.toBeInstanceOf(ErroValidacaoApi)
  await expect(promessa).rejects.toThrow("Intervalo inválido.");
});

test("rejeita disponibilidade recebida como texto", async () => {
  const consulta = {
    reservas: [],
    solicitacao: { inicio: 600, fim: 660 },
  };

  const fetchSimulado = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ disponivel: "false" }));

  vi.stubGlobal("fetch", fetchSimulado);

  await expect(
    consultarDisponibilidade(consulta),
  ).rejects.toThrow("Resposta inválida da API");
});

test("utiliza a URL base informada para consultar a API", async () => {
  const consulta = {
    reservas: [],
    solicitacao: { inicio: 600, fim: 660 },
  };

  const fetchSimulado = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ disponivel: true }));

  vi.stubGlobal("fetch", fetchSimulado);

  await consultarDisponibilidade(
    consulta,
    "http://127.0.0.1:8000",
  );

  expect(fetchSimulado).toHaveBeenCalledWith(
    "http://127.0.0.1:8000/disponibilidade",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consulta),
    },
  );
});