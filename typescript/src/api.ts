export interface IntervaloEntrada {
  inicio: number;
  fim: number;
}

interface ConsultaDisponibilidadeEntrada {
  reservas: IntervaloEntrada[];
  solicitacao: IntervaloEntrada;
}

export class ErroValidacaoApi extends Error {}

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
      const erro: unknown = await resposta.json()

      if (
        typeof erro === "object" &&
        erro !== null &&
        "detail" in erro &&
        typeof erro.detail === "string"
      ) {
        throw new ErroValidacaoApi(erro.detail);
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