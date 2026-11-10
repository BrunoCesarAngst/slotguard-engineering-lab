# SlotGuard — comece por aqui

Esta é a entrada única para ChatGPT, ChatGPT Work e Codex retomarem o projeto.
Leia primeiro este arquivo e o [estado atual](docs/ESTADO_ATUAL.md). Depois,
consulte somente o assunto necessário na [continuidade completa](docs/CONTINUIDADE.md).
Não carregar todos os registros históricos como instruções de trabalho.

## O que é o projeto

SlotGuard é um laboratório público de agendamento sem conflitos, desenvolvido
com Bruno César Angst para aprendizado profundo, portfólio e evolução para uma
solução útil. Já existem domínio Python, API FastAPI, interface TypeScript,
Docker, demonstração no Render e produtor de vídeos. Persistência no Neon é a
direção escolhida, mas ainda não foi implementada. Java e Quarkus são planos.

## Mapa de leitura

| Arquivo | Função | Quando ler |
| --- | --- | --- |
| [AGENTS.md](AGENTS.md) | Instruções de trabalho no repositório | Ao começar no Codex |
| [docs/ESTADO_ATUAL.md](docs/ESTADO_ATUAL.md) | Último ponto conferido, pendências e retomada | Em todo novo chat |
| [docs/CONTINUIDADE.md](docs/CONTINUIDADE.md) | Arquitetura, decisões, comandos e histórico consolidado | Nas seções relevantes à tarefa |
| [README.md](README.md) | Uso e desenvolvimento da aplicação | Para executar e verificar |
| [python/README.md](python/README.md) | Contrato e uso do domínio/API | Ao trabalhar no backend |
| [docs/PUBLICACAO.md](docs/PUBLICACAO.md) | Política de divulgação e links canônicos | Ao preparar ou publicar conteúdo |
| [video/README.md](video/README.md) | Geração, Docker e benchmark dos vídeos | Ao trabalhar em mídia |
| [docs/contextos/README.md](docs/contextos/README.md) | Índice dos contextos 01, 02 e 03 | Para recuperar a evolução, sem reabrir tarefas antigas |

## Como trabalhar com Bruno

- Explicar decisões e seguir TDD em incrementos pequenos.
- Quando ele estiver implementando, orientar um passo e aguardar o resultado.
  Quando pedir execução, fazer a alteração autorizada e verificar.
- Preservar alterações locais e distinguir sugestão, implementação, teste e publicação.
- Revisão antes do commit não é pedido de publicação. Publicação autorizada deve
  ser acompanhada até o resultado das verificações solicitadas.
- Priorizar deploy simples, uso gratuito e dependências reproduzíveis.
- Python continua responsável pelas regras. Não duplicar o domínio no TypeScript.
- Divulgação: YouTube primeiro em @mbcangst; demais redes/site recebem links ou
  incorporações. Preservar posts antigos; não publicar automaticamente por commit.

## O que fazer quando as fontes discordarem

Uma instrução atual de Bruno define o pedido da conversa. Os documentos ajudam
a executá-lo, sem substituir as instruções e os limites do ambiente.

Para descobrir o estado técnico, verificar código, diff, commit e evidência da
execução pertinente. Um relato de teste antigo não comprova o resultado de uma
alteração nova. Entre resumos, usar o estado atual datado e a continuidade
completa; os arquivos numerados são fotografias históricas.

Se houver divergência, informar qual é e conferir antes de editar. Não executar
os “próximos passos” de um arquivo histórico como se fossem uma fila atual.
Não afirmar acesso a arquivos, chats, contas ou rede que não esteja disponível.

## Usar no ChatGPT e no ChatGPT Work

No projeto SlotGuard, disponibilizar as versões atuais de:

1. `COMECE_AQUI.md`;
2. `docs/ESTADO_ATUAL.md`;
3. `docs/CONTINUIDADE.md`.

Adicionar `docs/PUBLICACAO.md` e `video/README.md` se o trabalho envolver vídeos
ou redes. Os contextos antigos só precisam ser anexados quando houver uma
questão histórica específica.

Sem acesso conectado à pasta, anexar esses arquivos nas fontes do projeto ou
no chat. Um caminho escrito numa mensagem não disponibiliza o arquivo. Arquivos
anexados são cópias daquele momento: substituí-los depois de atualizações no
repositório. Não presumir sincronização automática entre uploads, chats ou modos.

Chat e Work podem usar o contexto fornecido pelo projeto; a tarefa deve dizer
qual entrega é desejada. Não presumir que todos os diálogos anteriores foram
carregados apenas por terem ocorrido em outro chat.

## Usar no Codex

Abrir o repositório SlotGuard como pasta principal de trabalho, quando possível:

`/Users/brunoangst/Exercism/projects/slotguard`

Ler `AGENTS.md`, este arquivo e o estado atual; conferir `git status` e o último
commit. O Codex pode ler os arquivos disponíveis no checkout dentro das
permissões da sessão. A instrução `AGENTS.md` aponta para os documentos; ela
não transforma automaticamente o conteúdo de toda a pasta em contexto lido.

Se começar pelo workspace Exercism, localizar o repositório independente em
`projects/slotguard`. Não fazer commit do workspace inteiro nem de outros projetos.

Essa distinção entre projetos com fontes enviadas e pastas locais segue a
[documentação oficial de projetos e chats](https://learn.chatgpt.com/docs/projects).
O papel do arquivo de instruções está na
[documentação de AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

## Manter a continuidade daqui para frente

Ao encerrar um marco, atualizar `docs/ESTADO_ATUAL.md` com data, commit de
referência, mudanças locais, testes efetivamente executados, resultado do CI,
decisão aberta e menor próximo passo. Atualizar as seções correspondentes da
continuidade completa quando arquitetura ou direção mudarem.

Não criar um quarto resumo corrente concorrente com o terceiro. Quando houver
pedido de guardar um checkpoint, salvar uma fotografia numerada em
`docs/contextos/` e adicionar ao índice. Os contextos antigos não são reescritos
para parecer atuais. Git mantém o histórico das atualizações dos documentos vivos.

Salvar não significa publicar: registrar separadamente se houve commit e push.
Não guardar senhas, tokens, documentos pessoais ou códigos de autenticação.

Mensagem de abertura reutilizável:

> Continue o SlotGuard. Leia COMECE_AQUI.md e docs/ESTADO_ATUAL.md e consulte as
> seções necessárias de docs/CONTINUIDADE.md. Confira as fontes disponíveis,
> preserve o trabalho local e separe estado atual de registros históricos.
> Quero trabalhar em [objetivo desta conversa], seguindo TDD em passos pequenos.
