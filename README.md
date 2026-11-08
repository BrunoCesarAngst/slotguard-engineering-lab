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
| 2 | TypeScript | Em andamento — interface conectada à API Python |
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

A demonstração animada pode ser executada com `python demo.py` na pasta
`python/`, após preparar o ambiente descrito na documentação acima.

## Limitações atuais

O núcleo trabalha com intervalos dentro de um único dia
e ainda não inclui persistência nem controle transacional
para solicitações simultâneas.

## Engenharia

As verificações automatizadas incluem Ruff, BasedPyright, pytest,
checagem de tipos TypeScript e testes com Vitest. Os workflows Python Quality
e TypeScript Quality executam no GitHub Actions, incluindo uma chamada real
do cliente TypeScript à API Python.

## Retomar o desenvolvimento

Com as dependências já instaladas, na raiz do projeto:

```bash
bash iniciar.sh
```

O comando inicia a API Python e a interface Vite no mesmo terminal e aguarda
ambas responderem. Não é necessário ativar a `.venv` nem iniciar servidores
em terminais separados. Ele usa a `.venv` local e o Vite instalado no projeto,
sem instalar ou atualizar dependências automaticamente.

Abra http://127.0.0.1:5173/ no navegador. Deixe o terminal aberto enquanto
trabalha. Para encerrar os dois servidores, pressione **Ctrl+C** uma vez.
Os arquivos salvos permanecem no disco; os servidores precisam ser iniciados
novamente na próxima sessão.

O comando também funciona a partir de outra pasta se você informar o caminho
do script. Neste ambiente de desenvolvimento:

```bash
bash ~/Exercism/projects/slotguard/iniciar.sh
```

Se houver um servidor antigo nas portas `8000` ou `5173`, o script avisa e
para sem encerrar processos existentes. Use Ctrl+C nos terminais antigos e
execute novamente. Não inicie `npm run dev` ou Uvicorn separadamente enquanto
o script estiver em execução.

### O que está disponível

- Interface: http://127.0.0.1:5173/
- Documentação interativa da API: http://127.0.0.1:8000/docs
- Reserva fixa: 09h–10h. Os campos “Início” e “Fim” da solicitação são
  editáveis, com valores iniciais de 10h e 11h.
- Ao clicar, a tela converte os horários de `HH:mm` para minutos e envia
  a solicitação à API. As regras de validade dos intervalos e de conflito
  permanecem no domínio Python.
- Campos vazios exibem uma orientação de preenchimento e impedem a consulta.
  Após corrigir o campo, é possível consultar novamente.
- O botão consulta a API real, mostra “Consultando…” e fica desabilitado
  durante a espera. Depois apresenta disponibilidade ou uma mensagem de erro.
- O Vite encaminha `/disponibilidade` para a API local. Essa configuração
  vale para desenvolvimento; não constitui configuração de publicação.

### Ponto de retomada — 8 de novembro de 2026

Os campos editáveis estão implementados e conectados à API real. A etapa
inclui rótulos associados aos campos, valores iniciais, leitura no clique,
conversão para minutos, bloqueio de campos vazios e recuperação após correção.

Verificações locais desta entrega: **48 testes Python**, **5 testes do cliente
HTTP**, **11 testes da tela** e **1 teste de integração real** — **17 testes
TypeScript** ao todo. O typecheck também foi aprovado. Os testes da tela
utilizam jsdom; o teste de integração chama o servidor Python real.

Em 8 de novembro, foram confirmados no navegador os cinco cenários abaixo,
com a reserva existente fixa de 09h–10h:

| Cenário | Resultado observado |
|---|---|
| Solicitação 10h–11h | Horário disponível |
| Solicitação 09h30–10h30 | Horário indisponível |
| Início vazio e fim preenchido | Preencha o horário de início. |
| Fim vazio e início preenchido | Preencha o horário de fim. |
| Corrigir o campo vazio e consultar | Consulta realizada e mensagem anterior substituída pelo resultado |

Essa conferência no navegador é uma verificação manual, separada dos testes
automatizados. Os workflows publicados do commit `f06d853` passaram antes
desta entrega. As alterações dos campos editáveis ainda precisam de revisão,
commit, publicação e confirmação dos dois workflows no novo commit.

Continuar com TDD, mudanças pequenas e código escrito pelo autor do projeto.
Não substituir a lógica Python por uma nova implementação TypeScript.

### Executar verificações

Em um segundo terminal, na pasta `typescript/`:

```bash
npm run typecheck
npm test
npm run test:ui
npm run test:integration
```

Somente `test:integration` depende da API ligada; `bash iniciar.sh` já a fornece.
Os testes da tela usam jsdom, sem abrir um navegador.

Na raiz do projeto, as verificações Python podem ser executadas sem ativar
o ambiente virtual:

```bash
cd python
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/basedpyright .
.venv/bin/python -m pytest -q
```

### Instalação inicial ou reconstrução das dependências

Esta preparação não precisa ser repetida a cada sessão. No macOS, tenha
Python 3.14, Node 22.21.1 com npm e os comandos `bash`, `curl` e `lsof` disponíveis.
Na raiz do projeto:

```bash
python3.14 -m venv python/.venv
python/.venv/bin/python -m pip install -r python/requirements-dev.txt
cd typescript
npm ci
cd ..
bash iniciar.sh
```

Após obter novas alterações que modifiquem os arquivos de dependências,
repita apenas a instalação Python e/ou `npm ci`, conforme o lado alterado.
