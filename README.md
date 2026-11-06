# SlotGuard — Engineering Lab

Laboratório de engenharia de software para construção de um motor
de agendamentos com prevenção de conflitos de horário.

## Objetivo

Explorar algoritmos, modelagem de domínio, testes, tipagem,
arquitetura e concorrência utilizando diferentes tecnologias.

## Fases

| Fase | Tecnologia | Estado |
|---|---|---|
| 1 | Python | v0.1.0 — Núcleo funcional |
| 2 | TypeScript | Planejada |
| 3 | Java | Planejada |
| 4 | Quarkus | Planejada |

## Implementação Python

A versão inicial oferece:

- Intervalos e agendas tipados e imutáveis.
- Detecção de sobreposição entre horários.
- Consulta de disponibilidade.
- Agendamento com rejeição de conflitos.
- Testes com pytest e Hypothesis.

[Documentação, exemplos e instruções de execução](python/README.md)

## Limitações atuais

O núcleo trabalha com intervalos dentro de um único dia
e ainda não inclui persistência nem controle transacional
para solicitações simultâneas.

## Engenharia

As verificações automatizadas incluem Ruff, BasedPyright e pytest.
EOF