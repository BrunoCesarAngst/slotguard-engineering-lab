export interface IntervaloEntrada {
  inicio: number;
  fim: number;
}

interface ConsultaDisponibilidadeEntrada {
  reservas: IntervaloEntrada[];
  solicitacao: IntervaloEntrada;
}

export class ErroValidacaoApi extends Error { }

export class ErroConflitoApi extends Error { }

function ehIntervaloEntrada(valor: unknown): valor is IntervaloEntrada {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "inicio" in valor &&
    typeof valor.inicio === "number" &&
    "fim" in valor &&
    typeof valor.fim === "number"
  );
}

async function lerDetalheTextual(
  resposta: Response,
): Promise<string | undefined> {
  const erro: unknown = await resposta.json();

  if (
    typeof erro === "object" &&
    erro !== null &&
    "detail" in erro &&
    typeof erro.detail === "string"
  ) {
    return erro.detail;
  }

  return undefined;
}

export async function consultarDisponibilidade(
  consulta: ConsultaDisponibilidadeEntrada,
  urlBase: string = "",
): Promise<boolean> {
  const resposta = await fetch(`${urlBase}/disponibilidade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(consulta),
  });

  if (!resposta.ok) {
    if (resposta.status === 422) {
      const detalhe = await lerDetalheTextual(resposta);

      if (detalhe !== undefined) {
        throw new ErroValidacaoApi(detalhe);
      }
    }

    throw new Error(
      `Erro ao consultar disponibilidade: HTTP ${resposta.status}`,
    );
  }

  // const dados: { disponivel: boolean } = await resposta.json();
  const dados: unknown = await resposta.json();

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("disponivel" in dados) ||
    typeof dados.disponivel !== "boolean"
  ) {
    throw new Error("Resposta inválida da API")
  }

  return dados.disponivel;
}

export async function reservarHorario(
  entrada: ConsultaDisponibilidadeEntrada,
  urlBase: string = "",
): Promise<IntervaloEntrada[]> {
  const resposta = await fetch(`${urlBase}/reservas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entrada),
  })

  if (resposta.status === 409) {
    const detalhe = await lerDetalheTextual(resposta);

    throw new ErroConflitoApi(detalhe ?? "Horário indisponível.");
  }

  if (resposta.status === 422) {
    const detalhe = await lerDetalheTextual(resposta);

    if (detalhe !== undefined) {
      throw new ErroValidacaoApi(detalhe);
    }

    throw new Error(
      `Erro ao reservar horário: HTTP ${resposta.status}`,
    );
  }

  if (!resposta.ok) {
    throw new Error(
      `Erro ao reservar horário: HTTP ${resposta.status}`
    )
  }

  const dados: unknown = await resposta.json();

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("reservas" in dados) ||
    !Array.isArray(dados.reservas) ||
    !dados.reservas.every(ehIntervaloEntrada)
  ) {
    throw new Error("Resposta inválida da API");
  }

  return dados.reservas;
}
