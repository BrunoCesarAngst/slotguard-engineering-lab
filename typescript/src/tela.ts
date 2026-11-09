import type { IntervaloEntrada } from "./api";
import { ErroConflitoApi, ErroValidacaoApi } from "./api";

function converterParaMinutos(horario: string): number {
  const [horas, minutos] = horario.split(":");

  return Number(horas) * 60 + Number(minutos);
}

export function montarTela(
  container: HTMLElement,
  consultar: (solicitacao: IntervaloEntrada) => Promise<boolean>,
  reservar?: (
    solicitacao: IntervaloEntrada
  ) => Promise<IntervaloEntrada[]>,
  reservasIniciais: IntervaloEntrada[] = [],
): void {
  const tituloAgenda = document.createElement("h2");
  tituloAgenda.textContent = "Agenda";

  const listaReservas = document.createElement("ul");

  const mensagemAgendaVazia = document.createElement("p");
  mensagemAgendaVazia.textContent = "Nenhuma reserva na agenda.";

  function atualizarAgenda(reservas: IntervaloEntrada[]): void {
    listaReservas.replaceChildren();

    mensagemAgendaVazia.hidden = reservas.length > 0;

    const reservasOrdenadas = [...reservas].sort(
      (primeira, segunda) => primeira.inicio - segunda.inicio,
    );

    reservasOrdenadas.forEach((reserva) => {
      const item = document.createElement("li");

      item.textContent =
        `${formatarHorario(reserva.inicio)}–${formatarHorario(reserva.fim)}`;

      listaReservas.append(item);
    });
  }

  atualizarAgenda(reservasIniciais);

  container.append(tituloAgenda, mensagemAgendaVazia, listaReservas);

  const rotuloInicio = document.createElement("label");
  rotuloInicio.htmlFor = "inicio";
  rotuloInicio.textContent = "Início";

  const inicio = document.createElement("input");
  inicio.id = "inicio";
  inicio.type = "time";
  inicio.value = "10:00";

  const rotuloFim = document.createElement("label");
  rotuloFim.htmlFor = "fim";
  rotuloFim.textContent = "Fim";

  const fim = document.createElement("input");
  fim.id = "fim";
  fim.type = "time";
  fim.value = "11:00";

  const botao = document.createElement("button")
  botao.type = "button"
  botao.textContent = "Consultar disponibilidade"

  const botoes = [botao];

  const resultado = document.createElement("p");

  let versaoHorarios = 0;

  inicio.addEventListener("input", () => {
    versaoHorarios += 1;
    resultado.textContent = "";
  });

  fim.addEventListener("input", () => {
    versaoHorarios += 1;
    resultado.textContent = "";
  });

  botao.addEventListener("click", async () => {

    if (inicio.value === "") {
      resultado.textContent = "Preencha o horário de início.";
      return;
    }

    if (fim.value === "") {
      resultado.textContent = "Preencha o horário de fim.";
      return;
    }

    botoes.forEach((botao) => {
      botao.disabled = true;
    });
    resultado.textContent = "Consultando…"

    const versaoConsulta = versaoHorarios;

    try {
      const disponivel = await consultar({
        inicio: converterParaMinutos(inicio.value),
        fim: converterParaMinutos(fim.value),
      });

      if (versaoConsulta !== versaoHorarios) {
        return;
      }

      if (disponivel) {
        resultado.textContent = "Horário disponível";
      } else {
        resultado.textContent = "Horário indisponível";
      }
    } catch (erro: unknown) {
      if (versaoConsulta !== versaoHorarios) {
        return;
      }

      if (erro instanceof ErroValidacaoApi) {
        resultado.textContent = erro.message
      } else {
        resultado.textContent = "Não foi possível consultar a disponibilidade";
      }
    } finally {
      botoes.forEach((botao) => {
        botao.disabled = false;
      });
    }
  });

  container.append(
    rotuloInicio,
    inicio,
    rotuloFim,
    fim,
    botao,
    resultado,
  );

  if (reservar !== undefined) {
    const botaoReservar = document.createElement("button");
    botaoReservar.type = "button";
    botaoReservar.textContent = "Reservar horário";
    botoes.push(botaoReservar);

    botaoReservar.addEventListener("click", async () => {
      if (inicio.value === "") {
        resultado.textContent = "Preencha o horário de início.";
        return;
      }

      if (fim.value === "") {
        resultado.textContent = "Preencha o horário de fim.";
        return;
      }

      botoes.forEach((botao) => {
        botao.disabled = true;
      });

      inicio.disabled = true;
      fim.disabled = true;

      resultado.textContent = "Reservando…";

      try {
        const agendaAtualizada = await reservar({
          inicio: converterParaMinutos(inicio.value),
          fim: converterParaMinutos(fim.value),
        });

        atualizarAgenda(agendaAtualizada);

        resultado.textContent = "Horário reservado";
      } catch (erro: unknown) {
        if (
          erro instanceof ErroConflitoApi ||
          erro instanceof ErroValidacaoApi
        ) {
          resultado.textContent = erro.message;
        } else {
          resultado.textContent = "Não foi possível reservar o horário";
        }
      } finally {
        botoes.forEach((botao) => {
          botao.disabled = false;
        });

        inicio.disabled = false;
        fim.disabled = false;
      }
    });

    resultado.before(botaoReservar);
  }
}

function formatarHorario(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  return `${String(horas).padStart(2, "0")}:${String(minutosRestantes).padStart(2, "0")}`;
}
