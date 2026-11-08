import type { IntervaloEntrada } from "./api";
import { ErroValidacaoApi } from "./api";

function converterParaMinutos(horario: string): number {
  const [horas, minutos] = horario.split(":");

  return Number(horas) * 60 + Number(minutos);
}

export function montarTela(
  container: HTMLElement,
  consultar: (solicitacao: IntervaloEntrada) => Promise<boolean>,
): void {
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

  const resultado = document.createElement("p");
  botao.addEventListener("click", async () => {

    if (inicio.value === "") {
      resultado.textContent = "Preencha o horário de início.";
      return;
    }

    if (fim.value === "") {
      resultado.textContent = "Preencha o horário de fim.";
      return;
    }

    botao.disabled = true;
    resultado.textContent = "Consultando…"

    try {
      const disponivel = await consultar({
        inicio: converterParaMinutos(inicio.value),
        fim: converterParaMinutos(fim.value),
      });
      if (disponivel) {
        resultado.textContent = "Horário disponível";
      } else {
        resultado.textContent = "Horário indisponível";
      }
    } catch (erro: unknown) {
      if (erro instanceof ErroValidacaoApi) {
        resultado.textContent = erro.message
      } else {
        resultado.textContent = "Não foi possível consultar a disponibilidade";
      }
    } finally {
      botao.disabled = false;
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
}
