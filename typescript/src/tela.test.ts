// @vitest-environment jsdom

import {
  findByText,
  getAllByRole,
  getByLabelText,
  getByRole,
  getByText,
  queryAllByRole,
  queryByText,
  within,
} from "@testing-library/dom";
import { afterEach, expect, test, vi } from "vitest";

import { montarTela } from "./tela";

import { ErroConflitoApi, ErroValidacaoApi } from "./api";
import type { IntervaloEntrada } from "./api";

afterEach(() => {
  document.body.replaceChildren();
});

test("mostra horário disponível após consultar", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  montarTela(container, consultar);

  expect(queryByText(container, "Horário disponível")).toBeNull();

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  const resultado = await findByText(
    container,
    "Horário disponível",
  );

  expect(resultado.textContent).toBe("Horário disponível");
  expect(consultar).toHaveBeenCalledTimes(1);
});

test("mostra horário indisponível quando a consulta retorna false", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(false);

  montarTela(container, consultar);

  expect(queryByText(container, "Horário indisponível")).toBeNull();

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  const resultado = await findByText(
    container,
    "Horário indisponível",
  );

  expect(resultado.textContent).toBe("Horário indisponível");
  expect(consultar).toHaveBeenCalledTimes(1);
});

test("mostra mensagem de erro quando a consulta falha", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockRejectedValue(new Error("Falha na consulta"));

  montarTela(container, consultar);

  const mensagem = "Não foi possível consultar a disponibilidade";

  expect(queryByText(container, mensagem)).toBeNull();

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  const resultado = await findByText(container, mensagem);

  expect(resultado.textContent).toBe(mensagem);
  expect(consultar).toHaveBeenCalledTimes(1);
});

test("desabilita o botão durante a consulta e reabilita ao terminar", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  let concluirConsulta!: (disponivel: boolean) => void;

  const consultaPendente = new Promise<boolean>((resolve) => {
    concluirConsulta = resolve;
  });

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockReturnValue(consultaPendente);

  montarTela(container, consultar);

  const botao = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Consultar disponibilidade" },
  );

  expect(botao.disabled).toBe(false);

  botao.click();

  expect(consultar).toHaveBeenCalledTimes(1);
  expect(botao.disabled).toBe(true);

  concluirConsulta(true);

  await findByText(container, "Horário disponível");

  expect(botao.disabled).toBe(false);
});

test("reabilita o botão quando a consulta falha", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  let falharConsulta!: (erro: Error) => void;

  const consultaPendente = new Promise<boolean>((_resolve, reject) => {
    falharConsulta = reject;
  });

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockReturnValue(consultaPendente);

  montarTela(container, consultar);

  const botao = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Consultar disponibilidade" },
  );

  botao.click();

  expect(botao.disabled).toBe(true);

  falharConsulta(new Error("Falha na consulta"));

  await findByText(
    container,
    "Não foi possível consultar a disponibilidade",
  );

  expect(botao.disabled).toBe(false);
  expect(consultar).toHaveBeenCalledTimes(1);
});

test("mostra Consultando… enquanto aguarda a consulta", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  let concluirConsulta!: (disponivel: boolean) => void;

  const consultaPendente = new Promise<boolean>((resolve) => {
    concluirConsulta = resolve;
  });

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockReturnValue(consultaPendente);

  montarTela(container, consultar);

  expect(queryByText(container, "Consultando…")).toBeNull();

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  expect(getByText(container, "Consultando…").textContent)
    .toBe("Consultando…");

  concluirConsulta(true);

  await findByText(container, "Horário disponível");

  expect(queryByText(container, "Consultando…")).toBeNull();
});

test("exibe campos de início e fim com os horários iniciais", () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  montarTela(container, consultar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );

  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  // Escreva aqui as verificações dos dois campos.
  expect(inicio.type).toBe("time")
  expect(inicio.value).toBe("10:00")
  expect(fim.type).toBe("time")
  expect(fim.value).toBe("11:00")
});

test("consulta usando os horários editados convertidos para minutos", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  montarTela(container, consultar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );

  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  inicio.value = "09:30";
  fim.value = "10:30";

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  await findByText(container, "Horário disponível");

  expect(consultar).toHaveBeenCalledTimes(1);
  expect(consultar).toHaveBeenCalledWith({
    inicio: 570,
    fim: 630,
  });
});

test("pede o horário de início quando o campo está vazio", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  montarTela(container, consultar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );

  inicio.value = "";

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  const resultado = await findByText(
    container,
    "Preencha o horário de início.",
  );

  expect(resultado.textContent).toBe("Preencha o horário de início.");
  expect(consultar).not.toHaveBeenCalled();
});

test("pede o horário de fim quando o campo está vazio", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  montarTela(container, consultar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  inicio.value = "";

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  const resultado = await findByText(
    container,
    "Preencha o horário de fim.",
  );

  expect(resultado.textContent).toBe("Preencha o horário de fim.");
  expect(consultar).not.toHaveBeenCalled();
});

test("permite consultar após corrigir o início vazio", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  montarTela(container, consultar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  inicio.value = "";
  botao.click();

  await findByText(container, "Preencha o horário de início.");
  expect(consultar).not.toHaveBeenCalled();

  inicio.value = "10:00";
  botao.click();

  await findByText(container, "Horário disponível");

  expect(consultar).toHaveBeenCalledTimes(1);
  expect(consultar).toHaveBeenCalledWith({
    inicio: 600,
    fim: 660,
  });

  expect(
    queryByText(container, "Preencha o horário de início."),
  ).toBeNull();
});

test("mostra a mensagem de validação devolvida pela API", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockRejectedValue(
      new ErroValidacaoApi("Intervalo inválido."),
    );

  montarTela(container, consultar);

  const botao = getByRole(container, "button", {
    name: "Consultar disponibilidade",
  });

  botao.click();

  const resultado = await findByText(
    container,
    "Intervalo inválido.",
  );

  expect(resultado.textContent).toBe("Intervalo inválido.");
  expect(consultar).toHaveBeenCalledTimes(1);
});

test("reserva o horário e mostra a confirmação", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ]);

  montarTela(container, consultar, reservar);

  expect(
    queryByText(container, "Horário reservado"),
  ).toBeNull();

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, "Horário reservado");

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 600,
    fim: 660,
  });
  expect(consultar).not.toHaveBeenCalled();
});

test("mostra mensagem de erro quando a reserva falha", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockRejectedValue(new Error("Falha na comunicação"));

  montarTela(container, consultar, reservar);

  const mensagem = "Não foi possível reservar o horário";

  expect(queryByText(container, mensagem)).toBeNull();

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, mensagem);

  expect(
    queryByText(container, "Horário reservado"),
  ).toBeNull();
  expect(reservar).toHaveBeenCalledTimes(1);
  expect(consultar).not.toHaveBeenCalled();
});

test("mostra a mensagem de conflito quando a reserva está indisponível", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockRejectedValue(
      new ErroConflitoApi("Horário indisponível."),
    );

  montarTela(container, consultar, reservar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );
  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  inicio.value = "09:30";
  fim.value = "10:30";

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, "Horário indisponível.");

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 570,
    fim: 630,
  });
  expect(
    queryByText(container, "Horário reservado"),
  ).toBeNull();
});

test("mostra a mensagem de validação quando a reserva é inválida", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockRejectedValue(
      new ErroValidacaoApi("Intervalo inválido."),
    );

  montarTela(container, consultar, reservar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );
  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  inicio.value = "10:00";
  fim.value = "10:00";

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, "Intervalo inválido.");

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 600,
    fim: 600,
  });
  expect(
    queryByText(container, "Horário reservado"),
  ).toBeNull();
});

test("desabilita o botão durante a reserva e reabilita ao terminar", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  let concluirReserva!: (reservas: IntervaloEntrada[]) => void;

  const reservaPendente = new Promise<IntervaloEntrada[]>((resolve) => {
    concluirReserva = resolve;
  });

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockReturnValue(reservaPendente);

  montarTela(container, consultar, reservar);

  const botao = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Reservar horário" },
  );

  expect(botao.disabled).toBe(false);

  botao.click();

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(botao.disabled).toBe(true);

  concluirReserva([
    { inicio: 540, fim: 600 },
    { inicio: 600, fim: 660 },
  ]);

  await findByText(container, "Horário reservado");

  expect(botao.disabled).toBe(false);
});

test("reabilita o botão quando a reserva falha", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  let falharReserva!: (erro: Error) => void;

  const reservaPendente = new Promise<IntervaloEntrada[]>(
    (_resolve, reject) => {
      falharReserva = reject;
    },
  );

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockReturnValue(reservaPendente);

  montarTela(container, consultar, reservar);

  const botao = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Reservar horário" },
  );

  botao.click();

  expect(botao.disabled).toBe(true);
  expect(reservar).toHaveBeenCalledTimes(1);

  falharReserva(new Error("Falha na comunicação"));

  await findByText(
    container,
    "Não foi possível reservar o horário",
  );

  expect(botao.disabled).toBe(false);
});

test("mostra Reservando… enquanto aguarda a reserva", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  let concluirReserva!: (reservas: IntervaloEntrada[]) => void;

  const reservaPendente = new Promise<IntervaloEntrada[]>((resolve) => {
    concluirReserva = resolve;
  });

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockReturnValue(reservaPendente);

  montarTela(container, consultar, reservar);

  expect(queryByText(container, "Reservando…")).toBeNull();

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  expect(getByText(container, "Reservando…").textContent)
    .toBe("Reservando…");

  concluirReserva([
    { inicio: 540, fim: 600 },
    { inicio: 600, fim: 660 },
  ]);

  await findByText(container, "Horário reservado");

  expect(queryByText(container, "Reservando…")).toBeNull();
});

test("pede o horário de início sem reservar quando o campo está vazio", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ]);

  montarTela(container, consultar, reservar);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );

  inicio.value = "";

  const botao = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Reservar horário" },
  );

  botao.click();

  await findByText(container, "Preencha o horário de início.");

  expect(reservar).not.toHaveBeenCalled();
  expect(consultar).not.toHaveBeenCalled();
  expect(botao.disabled).toBe(false);
});

test("pede o horário de fim sem reservar quando o campo está vazio", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ]);

  montarTela(container, consultar, reservar);

  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  fim.value = "";

  const botao = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Reservar horário" },
  );

  botao.click();

  await findByText(container, "Preencha o horário de fim.");

  expect(reservar).not.toHaveBeenCalled();
  expect(consultar).not.toHaveBeenCalled();
  expect(botao.disabled).toBe(false);
});

test("permite reservar após corrigir o fim vazio", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ]);

  montarTela(container, consultar, reservar);

  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  fim.value = "";
  botao.click();

  await findByText(container, "Preencha o horário de fim.");
  expect(reservar).not.toHaveBeenCalled();

  fim.value = "11:00";
  botao.click();

  await findByText(container, "Horário reservado");

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 600,
    fim: 660,
  });
  expect(
    queryByText(container, "Preencha o horário de fim."),
  ).toBeNull();
});

test("impede reservar enquanto uma consulta está pendente", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  let concluirConsulta!: (disponivel: boolean) => void;

  const consultaPendente = new Promise<boolean>((resolve) => {
    concluirConsulta = resolve;
  });

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockReturnValue(consultaPendente);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ]);

  montarTela(container, consultar, reservar);

  const botaoConsultar = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Consultar disponibilidade" },
  );

  const botaoReservar = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Reservar horário" },
  );

  expect(botaoConsultar.disabled).toBe(false);
  expect(botaoReservar.disabled).toBe(false);

  botaoConsultar.click();

  try {
    expect(botaoConsultar.disabled).toBe(true);
    expect(botaoReservar.disabled).toBe(true);

    botaoReservar.click();

    expect(consultar).toHaveBeenCalledTimes(1);
    expect(reservar).not.toHaveBeenCalled();
  } finally {
    concluirConsulta(true);
    await findByText(container, "Horário disponível");
  }

  expect(botaoConsultar.disabled).toBe(false);
  expect(botaoReservar.disabled).toBe(false);
});

test("impede consultar enquanto uma reserva está pendente", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  let concluirReserva!: (reservas: IntervaloEntrada[]) => void;

  const reservaPendente = new Promise<IntervaloEntrada[]>((resolve) => {
    concluirReserva = resolve;
  });

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockReturnValue(reservaPendente);

  montarTela(container, consultar, reservar);

  const botaoConsultar = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Consultar disponibilidade" },
  );

  const botaoReservar = getByRole<HTMLButtonElement>(
    container,
    "button",
    { name: "Reservar horário" },
  );

  expect(botaoConsultar.disabled).toBe(false);
  expect(botaoReservar.disabled).toBe(false);

  botaoReservar.click();

  try {
    expect(botaoReservar.disabled).toBe(true);
    expect(botaoConsultar.disabled).toBe(true);

    botaoConsultar.click();

    expect(reservar).toHaveBeenCalledTimes(1);
    expect(consultar).not.toHaveBeenCalled();
  } finally {
    concluirReserva([
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ]);

    await findByText(container, "Horário reservado");
  }

  expect(botaoConsultar.disabled).toBe(false);
  expect(botaoReservar.disabled).toBe(false);
});

test("mostra as reservas da agenda inicial", () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservasIniciais = [{ inicio: 540, fim: 600 }];

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue(reservasIniciais);

  montarTela(
    container,
    consultar,
    reservar,
    reservasIniciais,
  );

  expect(
    getByRole(container, "heading", { name: "Agenda" }).textContent,
  ).toBe("Agenda");

  expect(
    getByText(container, "09:00–10:00").textContent,
  ).toBe("09:00–10:00");

  expect(consultar).not.toHaveBeenCalled();
  expect(reservar).not.toHaveBeenCalled();
});

test("atualiza a agenda exibida após uma reserva aceita", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservasIniciais = [
    { inicio: 540, fim: 600 },
  ];

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 540, fim: 600 },
      { inicio: 600, fim: 660 },
    ]);

  montarTela(
    container,
    consultar,
    reservar,
    reservasIniciais,
  );

  const lista = getByRole(container, "list");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual(["09:00–10:00"]);

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, "Horário reservado");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual([
    "09:00–10:00",
    "10:00–11:00",
  ]);

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 600,
    fim: 660,
  });
});

test("mantém a agenda exibida quando a reserva conflita", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockRejectedValue(
      new ErroConflitoApi("Horário indisponível."),
    );

  const reservasIniciais = [
    { inicio: 540, fim: 600 },
  ];

  montarTela(
    container,
    consultar,
    reservar,
    reservasIniciais,
  );

  const lista = getByRole(container, "list");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual(["09:00–10:00"]);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );
  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  inicio.value = "09:30";
  fim.value = "10:30";

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, "Horário indisponível.");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual(["09:00–10:00"]);

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 570,
    fim: 630,
  });
  expect(queryByText(container, "Horário reservado")).toBeNull();
});

test("mostrar uma orientação qundo a aegenda está vazia", () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<(solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>>()
    .mockResolvedValue([]);

  montarTela(container, consultar, reservar, []);

  expect(
      getByText(container, "Nenhuma reserva na agenda.").textContent,
    ).toBe("Nenhuma reserva na agenda.");

    expect(queryAllByRole(container, "listitem")).toHaveLength(0);

    expect(consultar).not.toHaveBeenCalled();
    expect(reservar).not.toHaveBeenCalled();
})

test("oculta a mensagem de agenda vazia após a primeira reserva aceita", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 600, fim: 660 },
    ]);

  montarTela(container, consultar, reservar, []);

  const mensagem = getByText(
    container,
    "Nenhuma reserva na agenda.",
  );

  expect(mensagem.hidden).toBe(false);

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, "Horário reservado");

  expect(mensagem.hidden).toBe(true);

  const lista = getByRole(container, "list");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual(["10:00–11:00"]);

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 600,
    fim: 660,
  });
});

test("mostra as reservas em ordem de início", () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservasIniciais = [
    { inicio: 600, fim: 660 },
    { inicio: 540, fim: 600 },
  ];

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue(reservasIniciais);

  montarTela(
    container,
    consultar,
    reservar,
    reservasIniciais,
  );

  const lista = getByRole(container, "list");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual([
    "09:00–10:00",
    "10:00–11:00",
  ]);

  expect(consultar).not.toHaveBeenCalled();
  expect(reservar).not.toHaveBeenCalled();
});

test("não modifica a agenda original ao ordenar a exibição", () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservasIniciais = [
    { inicio: 600, fim: 660 },
    { inicio: 540, fim: 600 },
  ];

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue(reservasIniciais);

  montarTela(
    container,
    consultar,
    reservar,
    reservasIniciais,
  );

  const lista = getByRole(container, "list");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual([
    "09:00–10:00",
    "10:00–11:00",
  ]);

  expect(reservasIniciais).toEqual([
    { inicio: 600, fim: 660 },
    { inicio: 540, fim: 600 },
  ]);
});

test("mantém a agenda exibida em ordem após reservar um horário anterior", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const consultar = vi
    .fn<() => Promise<boolean>>()
    .mockResolvedValue(true);

  const reservasIniciais = [
    { inicio: 600, fim: 660 },
  ];

  const reservar = vi
    .fn<
      (solicitacao: IntervaloEntrada) => Promise<IntervaloEntrada[]>
    >()
    .mockResolvedValue([
      { inicio: 600, fim: 660 },
      { inicio: 540, fim: 600 },
    ]);

  montarTela(
    container,
    consultar,
    reservar,
    reservasIniciais,
  );

  const lista = getByRole(container, "list");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual(["10:00–11:00"]);

  const inicio = getByLabelText<HTMLInputElement>(
    container,
    "Início",
  );
  const fim = getByLabelText<HTMLInputElement>(
    container,
    "Fim",
  );

  inicio.value = "09:00";
  fim.value = "10:00";

  const botao = getByRole(container, "button", {
    name: "Reservar horário",
  });

  botao.click();

  await findByText(container, "Horário reservado");

  expect(
    within(lista).getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual([
    "09:00–10:00",
    "10:00–11:00",
  ]);

  expect(reservar).toHaveBeenCalledTimes(1);
  expect(reservar).toHaveBeenCalledWith({
    inicio: 540,
    fim: 600,
  });
});