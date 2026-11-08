// @vitest-environment jsdom

import {
  findByText,
  getByLabelText,
  getByRole,
  getByText,
  queryByText,
} from "@testing-library/dom";
import { afterEach, expect, test, vi } from "vitest";

import { montarTela } from "./tela";

import { ErroValidacaoApi } from "./api"

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