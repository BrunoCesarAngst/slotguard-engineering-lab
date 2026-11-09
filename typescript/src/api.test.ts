import { afterEach, describe, expect, test, vi } from "vitest";

import {
  consultarDisponibilidade,
  ErroConflitoApi,
  ErroValidacaoApi,
  reservarHorario,
} from "./api";

type Horario = [inicio: number, fim: number];

function montarEntrada({
  reservas,
  solicitacao,
}: {
  reservas: Horario[];
  solicitacao: Horario;
}) {
  const [inicio, fim] = solicitacao;

  return {
    reservas: reservas.map(([inicioReserva, fimReserva]) => ({
      inicio: inicioReserva,
      fim: fimReserva,
    })),
    solicitacao: { inicio, fim },
  };
}

function simularRespostaJson(corpo: unknown, status: number = 200) {
  const fetchSimulado = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json(corpo, { status }));

  vi.stubGlobal("fetch", fetchSimulado);

  return fetchSimulado;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("consultarDisponibilidade", () => {
  test("envia a consulta à API e retorna a disponibilidade", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 660],
    });

    const fetchSimulado = simularRespostaJson({ disponivel: true });

    const disponivel = await consultarDisponibilidade(entrada);

    expect(disponivel).toBe(true);
    expect(fetchSimulado).toHaveBeenCalledTimes(1);
    expect(fetchSimulado).toHaveBeenCalledWith("/disponibilidade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entrada),
    });
  });

  test("retorna false quando a API informa indisponibilidade", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [570, 630],
    });

    simularRespostaJson({ disponivel: false });

    const disponivel = await consultarDisponibilidade(entrada);

    expect(disponivel).toBe(false);
  });

  test("lança erro quando a API responde com 422", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 600],
    });

    simularRespostaJson({ detail: "Intervalo inválido." }, 422);

    const promessa = consultarDisponibilidade(entrada);

    await expect(promessa).rejects.toBeInstanceOf(ErroValidacaoApi);
    await expect(promessa).rejects.toThrow("Intervalo inválido.");
  });

  test("rejeita disponibilidade recebida como texto", async () => {
    const entrada = montarEntrada({
      reservas: [],
      solicitacao: [600, 660],
    });

    simularRespostaJson({ disponivel: "false" });

    await expect(consultarDisponibilidade(entrada)).rejects.toThrow(
      "Resposta inválida da API",
    );
  });

  test("utiliza a URL base informada para consultar a API", async () => {
    const entrada = montarEntrada({
      reservas: [],
      solicitacao: [600, 660],
    });

    const fetchSimulado = simularRespostaJson({ disponivel: true });

    await consultarDisponibilidade(entrada, "http://127.0.0.1:8000");

    expect(fetchSimulado).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/disponibilidade",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entrada),
      },
    );
  });
});

describe("reservarHorario", () => {
  test("envia a reserva à API e retorna a agenda atualizada", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 660],
    });

    const reservasEsperadas = [
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ];

    const fetchSimulado = simularRespostaJson(
      { reservas: reservasEsperadas },
      201,
    );

    const reservas = await reservarHorario(entrada);

    expect(reservas).toEqual(reservasEsperadas);
    expect(fetchSimulado).toHaveBeenCalledTimes(1);
    expect(fetchSimulado).toHaveBeenCalledWith("/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entrada),
    });
  });

  test("rejeita a reserva quando a API informa conflito", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [570, 630],
    });

    simularRespostaJson({ detail: "Horário indisponível." }, 409);

    const promessa = reservarHorario(entrada);

    await expect(promessa).rejects.toBeInstanceOf(ErroConflitoApi);
    await expect(promessa).rejects.toThrow("Horário indisponível.");
  });

  test("rejeita a reserva com a mensagem de validação da API", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 600],
    });

    simularRespostaJson({ detail: "Intervalo inválido." }, 422);

    const promessa = reservarHorario(entrada);

    await expect(promessa).rejects.toBeInstanceOf(ErroValidacaoApi);
    await expect(promessa).rejects.toThrow("Intervalo inválido.");
  });

  test.each([
    {
      cenario: "detail não textual",
      corpo: { detail: [{ msg: "Entrada inválida." }] },
    },
    {
      cenario: "detail ausente",
      corpo: {},
    },
  ])("lança erro genérico para 422 com $cenario", async ({ corpo }) => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 600],
    });

    simularRespostaJson(corpo, 422);

    const promessa = reservarHorario(entrada);

    await expect(promessa).rejects.toBeInstanceOf(Error);
    await expect(promessa).rejects.not.toBeInstanceOf(ErroValidacaoApi);
    await expect(promessa).rejects.toThrow(
      "Erro ao reservar horário: HTTP 422",
    );
  });

  test("lança erro genérico quando a API responde com 500", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 660],
    });

    simularRespostaJson({}, 500);

    const promessa = reservarHorario(entrada);

    await expect(promessa).rejects.toBeInstanceOf(Error);
    await expect(promessa).rejects.not.toBeInstanceOf(ErroValidacaoApi);
    await expect(promessa).rejects.not.toBeInstanceOf(ErroConflitoApi);
    await expect(promessa).rejects.toThrow(
      "Erro ao reservar horário: HTTP 500",
    );
  });

  test("rejeita resposta de sucesso sem a propriedade reservas", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 660],
    });

    simularRespostaJson({}, 201);

    const promessa = reservarHorario(entrada);

    await expect(promessa).rejects.toThrow("Resposta inválida da API");
  });

  test("rejeita resposta em que reservas não é uma lista", async () => {
    const entrada = montarEntrada({
      reservas: [[540, 600]],
      solicitacao: [600, 660],
    });

    simularRespostaJson(
      { reservas: { inicio: 600, fim: 660 } },
      201,
    );

    const promessa = reservarHorario(entrada);

    await expect(promessa).rejects.toThrow("Resposta inválida da API");
  });

  test.each([
    {
      cenario: "início ausente",
      reserva: { fim: 660 },
    },
    {
      cenario: "fim ausente",
      reserva: { inicio: 600 },
    },
    {
      cenario: "início como texto",
      reserva: { inicio: "600", fim: 660 },
    },
    {
      cenario: "fim como texto",
      reserva: { inicio: 600, fim: "660" },
    },
  ])(
    "rejeita reserva recebida com $cenario",
    async ({ reserva }) => {
      const entrada = montarEntrada({
        reservas: [[540, 600]],
        solicitacao: [600, 660],
      });

      simularRespostaJson(
        {
          reservas: [
            { inicio: 540, fim: 600 },
            reserva,
          ],
        },
        201,
      );

      const promessa = reservarHorario(entrada);

      await expect(promessa).rejects.toThrow(
        "Resposta inválida da API",
      );
    },
  );
});
