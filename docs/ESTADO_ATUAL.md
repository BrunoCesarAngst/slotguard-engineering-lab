# Estado atual do SlotGuard

Atualizado em **10 de novembro de 2026**, America/Sao_Paulo.
Resumo operacional para abrir uma nova janela. Comece em
[COMECE_AQUI.md](../COMECE_AQUI.md); detalhes em
[CONTINUIDADE.md](CONTINUIDADE.md).

## Último estado técnico conferido

- Repositório público: `BrunoCesarAngst/slotguard-engineering-lab`, branch `main`.
- Último commit funcional conferido: `87c1c27b77ab1e59e8c4d4e4296c7e3cdcaba4d2`.
- Domínio Python imutável, com intervalos `[inicio, fim)` em minutos e rejeição
  de conflitos. TypeScript consome FastAPI; não replica as regras.
- Tela consulta, reserva, atualiza/ordena a agenda, trata erros e estados vazios,
  bloqueia os botões durante operações e descarta respostas antigas da consulta.
- Agenda em memória da página. Recarregar restaura 09h–10h. Sem persistência,
  cancelamento, autenticação ou exclusividade transacional entre usuários.
- Aplicação empacotada em Docker e publicada no Render Free:
  https://slotguard-zf3f.onrender.com/ . Disponibilidade pública não foi
  reconsultada nesta organização documental.
- Checkpoint de testes da aplicação: 54 Python + 17 cliente + 38 tela + 5
  integração = **114 casos**. A coleta Python foi conferida; não se reexecutou
  toda a suíte apenas para organizar estes documentos.

## Evidências recentes

| Verificação no commit funcional | Resultado |
| --- | --- |
| [Python Quality](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42745103776) | Aprovado |
| [TypeScript Quality](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42745103869) | Aprovado; inclui build e teste HTTP do contêiner |
| [SlotGuard Videos](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42745115196) | Aprovado; quatro amostras smoke, 3min46s |

O benchmark anterior comparou 24 amostras. Dois quadros simultâneos reduziram
o tempo dos trechos em 13,4% contra três, com SSIM 1,0 e áudio decodificado
idêntico à referência. O workflow usa dois; o padrão local continua em três.
**Os quatro vídeos completos ainda não foram medidos novamente com o ajuste.**

## Organização dos contextos

A organização documental reúne entrada única, resumo atual, continuidade
detalhada e arquivo dos contextos 01–03. Ela não altera o código da aplicação.
O contexto 02 foi recuperado integralmente de uma resposta do chat “Atualizar
demo.py”. O contexto 01 foi preservado em arquivo histórico, com o caminho antigo
mantido como referência. O contexto 03 foi fotografado antes de reorganizar as
entradas. O commit da organização pode ser localizado por `git log` nos arquivos
de documentação; suas verificações estão no GitHub Actions do mesmo commit.
Conferir `git status` e a branch remota para o estado efetivo ao retomar.

## Direção e decisões abertas

A direção escolhida é **Render + Neon/PostgreSQL**, com deploy simples e planos
gratuitos. Primeiro publicamos a aplicação atual; o próximo avanço de produto
é persistência. A sugestão de SQLite foi substituída e não foi implementada.
Java e Quarkus continuam como fases futuras de aprendizado.

Antes do primeiro incremento de banco, decidir se a agenda demonstrável será
compartilhada ou separada por sessão/recurso. Depois, preparar um teste pequeno
de salvar e recuperar dados em PostgreSQL temporário, preservando o domínio.
A API deverá passar a carregar o estado do servidor, e a reserva concorrente
precisará de garantia transacional. Isso é planejamento, não código entregue.

Outras pendências separadas: reconsultar recursos avançados do YouTube
@mbcangst e, se liberados, ligar os Shorts com vídeo relacionado; medir os
vídeos integrais com dois quadros. O gatilho editorial automático não existe.

## Como retomar

1. Conferir pasta, `git status`, commit e alterações locais.
2. Ler a seção do assunto escolhido na continuidade completa.
3. Identificar o objetivo da conversa; não presumir que uma pendência autoriza
   publicação, acesso a contas ou execução automática de todas as etapas.
4. Propor ou executar o menor incremento autorizado, com verificação pertinente.
5. Registrar novos resultados aqui e atualizar as fontes anexadas no ChatGPT
   quando elas forem cópias dos arquivos locais.
