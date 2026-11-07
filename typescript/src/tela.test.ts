// @vitest-environment jsdom

import {
  findByText,
  getByRole,
  getByText,
  queryByText,
} from "@testing-library/dom";
import { afterEach, expect, test, vi } from "vitest";

import { montarTela } from "./tela";

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