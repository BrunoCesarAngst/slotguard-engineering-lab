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

O núcleo trabalha com intervalos dentro de um único dia. A agenda da interface
fica apenas na memória da página: recarregar restaura a reserva inicial de
09h–10h. Não há agenda compartilhada entre abas ou usuários, persistência,
autenticação nem controle transacional para solicitações simultâneas.
Duas chamadas baseadas na mesma agenda antiga podem aceitar o mesmo horário;
o bloqueio dos dois botões na mesma tela não oferece proteção contra essa
concorrência.

## Engenharia

As verificações automatizadas incluem Ruff, BasedPyright, pytest,
checagem de tipos TypeScript e testes com Vitest. Os workflows Python Quality
e TypeScript Quality executam no GitHub Actions, incluindo uma chamada real
do cliente TypeScript à API Python.

## Divulgação e vídeos

A rotina de divulgação usa o **YouTube @mbcangst como publicação principal**.
Os posts nas outras redes usam textos adaptados e o link; o site incorpora o
vídeo. As publicações nativas já realizadas são preservadas.

Consulte a [rotina permanente, critérios de etapa e limites da automação](docs/PUBLICACAO.md).
O produtor está versionado em [`video/`](video/README.md), separado da aplicação.
Com Docker e Compose em execução, gere os vídeos sem instalar Node, Python ou
FFmpeg na máquina:

```bash
bash video/gerar.sh --check
bash video/gerar.sh --gerar
```

Os resultados ficam em `video/output/` e não entram no Git. A primeira construção
da imagem baixa as dependências e os modelos; a geração roda sem rede.
Também é possível gerar sem Docker local em **Actions → SlotGuard Videos →
Run workflow**, baixando os resultados como artefatos mantidos por sete dias.
Uma etapa deve representar uma entrega demonstrável com evidências revisadas;
novos commits não disparam publicações automaticamente.

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
- A interface oferece os botões “Consultar disponibilidade” e “Reservar horário”,
  conectados a `POST /disponibilidade` e `POST /reservas`, respectivamente.
- A seção “Agenda” exibe os intervalos no formato `HH:mm–HH:mm`, começando
  com a reserva inicial `09:00–10:00`. Os campos “Início” e “Fim” são
  editáveis e começam com 10h e 11h.
- As reservas são exibidas em ordem de início, tanto na montagem inicial
  quanto após uma reserva aceita. A ordenação atua sobre uma cópia da lista,
  sem modificar a agenda recebida nem as regras do domínio Python.
- Quando a agenda está vazia, a tela mostra “Nenhuma reserva na agenda.”.
  A mensagem fica oculta quando há reservas, inclusive após a primeira
  reserva aceita. A aplicação continua iniciando com a reserva de 09h–10h;
  o estado vazio é coberto pelos testes da interface.
- Ao clicar, a tela converte os horários de `HH:mm` para minutos. As regras
  de validade dos intervalos e de conflito permanecem no domínio Python.
- Campos vazios exibem uma orientação e impedem a operação. Após corrigir
  o campo, é possível tentar novamente.
- Editar “Início” ou “Fim” limpa a mensagem de resultado, sem iniciar outra
  chamada à API e sem modificar a agenda. Se houver uma consulta pendente,
  seu resultado ou erro será ignorado após qualquer edição dos horários,
  mesmo que os valores voltem aos anteriores. Isso descarta a apresentação
  da resposta antiga; não cancela a requisição HTTP.
- Durante cada operação, os dois botões ficam desabilitados e a tela mostra
  inicialmente “Consultando…” ou “Reservando…”. Isso impede iniciar uma
  consulta durante uma reserva ou uma reserva durante uma consulta na mesma
  tela. Ambos os botões são reabilitados ao terminar, inclusive em caso de erro.
- Durante a reserva, os campos “Início” e “Fim” também ficam desabilitados,
  preservando os horários enviados até a resposta. São reabilitados no fim,
  tanto após sucesso quanto após erro. Campos vazios são verificados antes
  desse bloqueio.
- Durante a consulta, os campos continuam editáveis. Editá-los limpa a
  mensagem e invalida a resposta pendente, mas mantém os botões bloqueados
  até a consulta terminar. O descarte de respostas antigas se aplica à consulta.
- A consulta mostra “Horário disponível” ou “Horário indisponível”.
- A reserva aceita mostra “Horário reservado”. A agenda retornada substitui
  a agenda local, atualiza a lista exibida sem duplicar itens e passa a ser
  enviada nas próximas consultas e reservas. Uma reserva rejeitada mantém
  os itens anteriores na tela.
- `POST /reservas` responde `201` com a agenda atualizada, `409` para conflito
  e `422` para entrada inválida. O cliente reconhece `ErroConflitoApi` e
  `ErroValidacaoApi`; a tela apresenta mensagens como “Horário indisponível.”
  e “Intervalo inválido.”.
- Falhas genéricas exibem “Não foi possível consultar a disponibilidade” ou
  “Não foi possível reservar o horário”, conforme a operação.
- Cada requisição fornece sua própria agenda. O servidor não armazena reservas;
  a interface mantém a agenda somente na memória da página, sem recuperá-la
  após recarregar e sem sincronizá-la entre abas ou usuários.
- O Vite encaminha `/disponibilidade` e `/reservas` para a API local.
  Essa configuração vale para desenvolvimento; não constitui configuração
  de publicação.

### Ponto de retomada — 9 de novembro de 2026

A interface consulta e cria reservas pela API Python. A reserva aceita atualiza
a agenda mantida em `main.ts`, usada nas operações seguintes, e a lista exibida
na tela. `main.ts` fornece a agenda inicial a `montarTela`, que formata os
intervalos para leitura. O domínio Python continua responsável pelas decisões
de disponibilidade e agendamento.

A estrutura TypeScript reúne **17 testes do cliente HTTP**, **38 testes da
interface** e **5 testes de integração real** — **60 casos** ao todo. A integração
cobre consulta disponível, validação da consulta, reserva consecutiva, conflito
e validação da reserva. Os testes da interface usam funções simuladas para
verificar mensagens, conversão dos horários, campos vazios, recuperação após
correção, estados dos botões durante a espera e bloqueio de operações
simultâneas nas duas direções na mesma tela. Também cobrem a exibição da agenda
inicial, sua atualização após uma reserva aceita e a preservação da lista
quando há conflito. O estado de agenda vazia e a ocultação da orientação após
a primeira reserva aceita também são verificados por testes automatizados.
Três testes adicionais cobrem a ordem de início na exibição inicial, a
preservação da agenda original e a ordenação após reservar um horário anterior.
Outros quatro testes verificam a limpeza da mensagem ao editar cada campo e o
descarte de resultados e erros de consultas cujos horários mudaram durante a
espera, com reabilitação dos dois botões ao terminar.
Dois testes com promessa controlada verificam o bloqueio dos campos durante
a reserva e sua reabilitação após sucesso ou falha.

Na verificação final local de 9 de novembro de 2026, passaram a checagem de
tipos TypeScript e todos os **60 testes TypeScript**, incluindo a integração
com a API real. Também passaram Ruff lint, Ruff format, BasedPyright,
os **52 testes Python** e `git diff --check`. Esses resultados locais não
confirmam publicação nem aprovação do CI para as alterações atuais.

A pendência identificada na revisão foi corrigida: consulta e reserva agora
bloqueiam os dois botões até a conclusão da operação. Os testes verificam que
clicar no outro botão durante a espera não inicia uma segunda operação e que
ambos são reabilitados ao terminar. Isso evita a sobreposição de respostas de
consulta e reserva iniciadas pelos botões na mesma tela; a limitação de
concorrência entre abas ou usuários permanece.

O autor também confirmou manualmente no navegador:

| Sequência na mesma página | Resultado observado |
|---|---|
| Abrir a interface | Agenda com `09:00–10:00` |
| Reservar 10h–11h | Horário reservado; lista com `09:00–10:00` e `10:00–11:00`, sem duplicação |
| Consultar novamente 10h–11h | Horário indisponível |
| Tentar reservar novamente 10h–11h | Mensagem “Horário indisponível.”; os dois itens permanecem na lista |
| Recarregar a página | Agenda restaurada com somente `09:00–10:00` |

Essa conferência manual verifica o uso da agenda atualizada nas operações
seguintes e complementa os testes automatizados. A agenda não é persistente:
ao recarregar a página, volta à reserva inicial de 09h–10h.

Continuar com TDD e mudanças pequenas. Antes de preparar um commit, executar
as verificações abaixo e revisar o diff. Commit, publicação e acompanhamento
dos workflows dependem de solicitação do autor.

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
