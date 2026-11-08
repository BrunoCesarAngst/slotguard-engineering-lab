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
- A API oferece `POST /disponibilidade` para consulta e `POST /reservas`
  para devolver uma agenda com uma nova reserva aceita. A interface ainda
  oferece **apenas consulta**; não há botão de reservar nem atualização da
  agenda pela tela nesta etapa.
- `POST /reservas` responde `201` com a agenda atualizada, `409` quando há
  conflito e `422` para intervalos inválidos. Cada requisição fornece sua
  própria agenda; o servidor não persiste as reservas.
- Reserva fixa: 09h–10h. Os campos “Início” e “Fim” da solicitação são
  editáveis, com valores iniciais de 10h e 11h.
- Ao clicar, a tela converte os horários de `HH:mm` para minutos e envia
  a solicitação à API. As regras de validade dos intervalos e de conflito
  permanecem no domínio Python.
- Campos vazios exibem uma orientação de preenchimento e impedem a consulta.
  Após corrigir o campo, é possível consultar novamente.
- O botão consulta a API real, mostra “Consultando…” e fica desabilitado
  durante a espera. Depois apresenta disponibilidade ou uma mensagem de erro.
- Quando a API responde com `422` e um `detail` textual, o cliente lança
  `ErroValidacaoApi` e a tela apresenta essa mensagem, como “Intervalo inválido.”.
  Outros erros mantêm a mensagem “Não foi possível consultar a disponibilidade”.
  Após corrigir os horários, é possível consultar novamente.
- O Vite encaminha `/disponibilidade` para a API local. Essa configuração
  vale para desenvolvimento; não constitui configuração de publicação.

### Ponto de retomada — 8 de novembro de 2026

Os campos editáveis estão implementados e conectados à API real. A etapa
inclui rótulos associados aos campos, valores iniciais, leitura no clique,
conversão para minutos, bloqueio de campos vazios e recuperação após correção.
A mensagem de validação e sua recuperação foram publicadas no commit
`0a3e004`, com os workflows Python Quality e TypeScript Quality aprovados.

A etapa atual acrescenta `POST /reservas`, reutilizando `agendar()` para
devolver uma nova agenda ou rejeitar conflitos. `converter_entrada()`
centraliza a construção de `Agenda` e `Intervalo` para as duas rotas.
Os testes HTTP usam a fixture `cliente` para gerenciar o `TestClient` e
`montar_entrada()` para preparar o JSON; as respostas esperadas permanecem
explícitas em cada teste.

Verificações locais desta etapa: Ruff lint e format aprovados, BasedPyright
sem diagnósticos e **52 testes Python aprovados**, incluindo **8 testes da
API**. Os **2 testes de integração TypeScript existentes** também passaram;
eles verificam sucesso e validação em `/disponibilidade`, não a criação de
reservas. O novo endpoint é exercitado pelos testes Python com `TestClient`.

A suíte TypeScript permanece com **5 testes do cliente HTTP**, **12 testes
da tela** e **2 testes de integração real** — **19 testes** ao todo, aprovados
no CI anterior. A interface ainda oferece **apenas consulta**. A conexão
de uma ação de reservar ao novo endpoint será uma etapa posterior, com TDD.

Em 8 de novembro, foram confirmados no navegador os cenários abaixo,
com a reserva existente fixa de 09h–10h:

| Cenário | Resultado observado |
|---|---|
| Solicitação 10h–11h | Horário disponível |
| Solicitação 09h30–10h30 | Horário indisponível |
| Início vazio e fim preenchido | Preencha o horário de início. |
| Fim vazio e início preenchido | Preencha o horário de fim. |
| Corrigir o campo vazio e consultar | Consulta realizada e mensagem anterior substituída pelo resultado |
| Solicitação 10h–10h | Intervalo inválido. Botão reabilitado após a resposta |
| Corrigir o fim para 11h e consultar novamente | Horário disponível, mensagem de validação removida e botão habilitado |

Essa conferência no navegador é uma verificação manual da consulta,
separada dos testes automatizados. Os campos editáveis foram publicados
no commit `e323739`, e a apresentação da validação em `0a3e004`.
`POST /reservas` e as refatorações desta etapa foram verificados localmente
e ainda aguardam commit, publicação e confirmação dos dois workflows.

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

Após alterar arquivos Python, encerre `iniciar.sh` com Ctrl+C e execute-o
novamente antes da integração: o servidor Python atual não recarrega o
código automaticamente.

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
