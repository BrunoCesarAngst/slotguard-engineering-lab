export function montarTela(
  container: HTMLElement,
  consultar: () => Promise<boolean>,
): void {
  const botao = document.createElement("button")
  botao.type = "button"
  botao.textContent = "Consultar disponibilidade"

  const resultado = document.createElement("p");
  botao.addEventListener("click", async () => {

    botao.disabled = true;
    resultado.textContent = "Consultando…"

    try {
      const disponivel = await consultar();
      if (disponivel) {
        resultado.textContent = "Horário disponível";
      } else {
        resultado.textContent = "Horário indisponível";
      }
    } catch {
      resultado.textContent = "Não foi possível consultar a disponibilidade";
    } finally {
      botao.disabled = false;
    }
  });

  container.append(botao, resultado)
}