# Histórico dos contextos do SlotGuard

Os arquivos numerados preservam o que se sabia em cada passagem de contexto.
Não são três conjuntos de instruções atuais. Para retomar, usar
[COMECE_AQUI.md](../../COMECE_AQUI.md), depois o
[estado atual](../ESTADO_ATUAL.md) e as seções pertinentes da
[continuidade completa](../CONTINUIDADE.md).

| Registro | Data de referência | O que representa | Origem |
| --- | --- | --- | --- |
| [01 — Origem e núcleo Python](01-2026-11-06-nucleo-python.md) | 06/11/2026 | Domínio, TDD, plano de quatro fases, demo e ambiente | `primeiroConexto.md`, preservado neste arquivo |
| [02 — Cliente TypeScript e API](02-2026-11-09-cliente-typescript.md) | 09/11/2026 | API de reservas publicada; cliente em refatoração; tela ainda só consultava naquele momento | Bloco integral recuperado do chat “Atualizar demo.py” |
| [03 — Consolidação do projeto e vídeos](03-2026-11-10-consolidacao.md) | 10/11/2026 | Interface completa do checkpoint, Render, publicações, Docker dos vídeos e otimização no GitHub | Fotografia de `docs/CONTINUIDADE.md` antes desta organização |

O contexto 02 não foi reconstituído por adivinhação: a resposta original foi
localizada no histórico e seu bloco foi salvo sem atualizar os fatos antigos.
O contexto 01 recebeu apenas a organização de arquivo e o ajuste do link de
retomada. O contexto 03 mantém a consolidação anterior, com links relativos
ajustados para sua localização histórica.

## Exemplos de fatos que mudaram

- Em 01, TypeScript era plano; em 02 a tela consultava; no checkpoint atual
  também reserva, mostra a agenda e trata estados pendentes e erros.
- Os 43/44 testes do núcleo e os 52 testes Python de 02 são números históricos.
  O checkpoint atual da aplicação reúne 114 casos entre Python e TypeScript.
- O cliente local não publicado de 02 foi consolidado e superado por commits
  posteriores. Não recuperar aquele estado por cima dos arquivos atuais.
- “Próximos passos” de 01 e 02 não são tarefas pendentes de hoje.

## Como arquivar uma próxima passagem

Quando solicitado, copiar o resumo correspondente para
`NN-AAAA-MM-DD-assunto.md`, registrar fonte/data e acrescentar uma linha à tabela.
Manter o resumo corrente em `../ESTADO_ATUAL.md` e os detalhes em
`../CONTINUIDADE.md`. Não modificar fotografias antigas para incorporar novos
resultados. Esses arquivos são resumos históricos, não exportações integrais
de todos os chats.
