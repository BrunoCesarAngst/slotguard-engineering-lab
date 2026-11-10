# Continuidade do SlotGuard

Referência: **10 de novembro de 2026**, fuso America/Sao_Paulo.
Este é o ponto de retomada para um novo chat do projeto. Preserve o trabalho
existente e confira o estado do repositório antes de fazer alterações.

**Organização de leitura:** comece por [COMECE_AQUI.md](../COMECE_AQUI.md) e pelo
[estado atual resumido](ESTADO_ATUAL.md). Este arquivo reúne os detalhes por
assunto; não é necessário carregar todas as seções em toda conversa. Os três
contextos anteriores estão no [índice histórico](contextos/README.md), incluindo
o segundo contexto recuperado. A fotografia desta consolidação foi preservada
como contexto 03. Este arquivo continua sendo a referência detalhada atualizável.

## 1. Estado em que o próximo chat deve começar

O SlotGuard já tem domínio Python, API FastAPI, interface TypeScript, testes,
Docker, demonstração publicada no Render e uma série de divulgação com vídeos.
**Ainda não tem persistência, cancelamento nem proteção transacional contra
reservas concorrentes.** Não começar reconstruindo essas partes já existentes.

O último commit funcional conferido é
`87c1c27b77ab1e59e8c4d4e4296c7e3cdcaba4d2`, na branch `main`.
Os três workflows desse commit terminaram aprovados:

| Workflow | Resultado e evidência |
| --- | --- |
| Python Quality | [Aprovado](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42745103776) |
| TypeScript Quality | [Aprovado, incluindo aplicação no Docker](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42745103869) |
| SlotGuard Videos | [Aprovado em 3min46s, modo smoke, quatro versões](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42745115196) |

A otimização mais recente usa **dois quadros simultâneos no GitHub**, contra
três anteriormente. O ganho foi medido em trechos curtos. Não afirmar que os
quatro vídeos completos já foram gerados novamente com esse ajuste.

Na abertura desta consolidação, o diretório de trabalho estava limpo. As mudanças
desta entrega são de documentação, sem alteração funcional. Para localizar o
commit da organização e confirmar sua publicação, consultar o histórico destes
arquivos, a branch remota e o CI correspondente. O commit funcional e as
execuções da tabela acima continuam sendo o checkpoint técnico de referência.

### Onde ficam as coisas

| Item | Local ou endereço |
| --- | --- |
| Projeto principal | `/Users/brunoangst/Exercism/projects/slotguard` |
| Workspace de aprendizado | `/Users/brunoangst/Exercism` |
| Repositório público | https://github.com/BrunoCesarAngst/slotguard-engineering-lab |
| Demonstração publicada | https://slotguard-zf3f.onrender.com/ |
| Documentação da API publicada | https://slotguard-zf3f.onrender.com/docs |
| Blog | https://brunoangst.com.br/blog/ |
| Produtor atual de vídeos | `video/`, dentro do repositório principal |
| Produtor antigo preservado | `/Users/brunoangst/Exercism/projects/slotguard-video` |

O estado publicado do Render e das redes foi conferido nas etapas anteriores;
esta consolidação não constitui uma nova verificação ao vivo de cada serviço.
Os resultados de CI acima foram consultados novamente nesta consolidação.

## 2. Propósito e modo de trabalhar com Bruno

SlotGuard — Engineering Lab é um laboratório público de engenharia de software
construído em torno de uma pergunta concreta: como rejeitar reservas que se
sobrepõem, permitindo que um atendimento comece quando outro termina?

O objetivo não é somente apresentar ferramentas ou contar testes. Bruno quer
aprender profundamente, demonstrar decisões de engenharia e criar um portfólio
que faça sentido para recrutadores, clientes e empresas. O projeto deve evoluir
para uma solução útil, sem apresentar o protótipo atual como sistema comercial
completo. Código, testes, documentação, demonstração e comunicação fazem parte
da entrega.

Preferências confirmadas ao longo dos chats:

- Atuar como mentor técnico e revisor. Explicar causa, responsabilidade, tipos,
  fluxo, complexidade e alternativas quando forem relevantes.
- Trabalhar com **TDD e incrementos pequenos**: teste, falha pelo motivo esperado,
  implementação mínima, verificações e refatoração.
- Quando Bruno estiver implementando, oferecer um passo e aguardar seu resultado.
  Se ele pedir dicas, não entregar imediatamente toda a solução.
- Quando pedir o teste ou arquivo completo, fornecê-lo. Quando pedir para fazer
  uma mudança, editar os arquivos e verificar o resultado dentro daquele escopo.
- Consolidar cada comportamento antes de acrescentar outro: documentação,
  verificações, revisão do diff e, quando solicitado, commit/publicação/CI.
- Não transformar um pedido de revisão antes do commit em autorização para
  publicar. Quando a publicação e o acompanhamento forem pedidos, concluir até
  saber o resultado dos workflows, sem parar no simples envio do commit.
- Preservar edições locais, arquivos históricos e publicações existentes.
- Reduzir repetição mecânica dos testes sem esconder cenário, ação e resultado.
  Usar auxiliares pequenos, `describe`, parametrização e fixtures quando ajudam.
- Distinguir teste vermelho esperado de erro de sintaxe, import, configuração ou
  serviço antigo. Vitest verde não substitui o typecheck.
- Não declarar que algo foi implementado, testado, publicado ou salvo sem evidência.
- Não propor aumento de plano, serviços pagos ou muitas instalações sem necessidade.
  Gratuidade, simplicidade de deploy e independência da máquina são prioridades.
- Não há uma quantidade predeterminada de testes que precisa ser atingida.

## 3. Direção arquitetural e evolução do plano

O plano original tinha quatro fases: Python, TypeScript, Java e Quarkus.
Python começou com o domínio puro; TypeScript seria uma demonstração visual.
Java estudaria modelagem e concorrência; Quarkus acrescentaria REST,
PostgreSQL, transações e integridade sob concorrência.

Uma decisão posterior mudou a implementação da fase TypeScript: **consumir o
motor Python por HTTP, em vez de duplicar as regras em TypeScript**. Por isso,
a API REST Python já existe, embora APIs também façam parte dos estudos futuros
de Quarkus. Não tratar essa antecipação como implementação de Quarkus.

Depois da interface, consideramos cancelamento ou persistência. Persistência
foi priorizada porque recarregar a página apaga as reservas e o cancelamento
precisará identificar reservas armazenadas. Houve uma proposta inicial de
SQLite, mas Bruno pediu primeiro uma análise de publicação gratuita e simples.
**A direção aceita passou a ser Render + Neon/PostgreSQL**, publicando antes a
versão atual sem banco. O repositório SQLite sugerido não foi implementado.

Arquitetura atual:

```text
Navegador
  └─ TypeScript: campos, mensagens, agenda em memória e cliente HTTP
       └─ FastAPI: modelos de entrada, adaptação e contratos HTTP
            └─ Python: Intervalo, Agenda e operações do domínio
```

Arquitetura pretendida para a próxima etapa de produto:

```text
Navegador → FastAPI + domínio Python → PostgreSQL gerenciado no Neon
                hospedados no Render       estado persistente
```

Java e Quarkus continuam como frentes futuras de aprendizado. Não substituir
o backend atual nem acrescentar outra linguagem apenas para cumprir uma lista
de tecnologias. Resolver a necessidade escolhida e explicitar os trade-offs.

## 4. Contrato do domínio Python

Horários são minutos desde meia-noite: 09h = 540, 10h = 600, 11h = 660.
Todo intervalo válido satisfaz `0 <= inicio < fim <= 1440` e representa
`[inicio, fim)`: início inclusivo, fim exclusivo.

| Existente | Solicitado | Resultado |
| --- | --- | --- |
| 540–600 | 600–660 | Consecutivo, permitido |
| 540–600 | 570–630 | Sobreposição, rejeitado ao reservar |
| 540–600 | 540–600 | Duplicação, rejeitada ao reservar |
| Qualquer agenda | 600–600 | Intervalo inválido |

- `python/models.py`: `Intervalo` e `Agenda` usam dataclasses `frozen=True`
  e `slots=True`.
- `Intervalo` exige `int` exato. Booleanos são rejeitados, embora `bool` seja
  subclasse de `int` em Python. Tipos errados geram `TypeError`; números fora
  da invariante geram `ValueError`.
- `Agenda.reservas` é `tuple[Intervalo, ...]`, com tupla e elementos validados.
  A agenda pode ser construída com intervalos sobrepostos: validade estrutural
  não equivale à política de aceitar uma nova reserva.
- `python/slotguard.py`: `tem_conflito` usa
  `novo.inicio < existente.fim and novo.fim > existente.inicio`, em O(1).
- `existe_conflito` percorre a agenda com retorno antecipado; pior caso O(n).
  `esta_disponivel` é a negação desse resultado.
- `agendar` rejeita conflito ou cria **outra Agenda**, concatenando a nova
  reserva à tupla. Não modifica a original; a cópia da coleção tem custo O(n).
- `python/exceptions.py`: `HorarioIndisponivelError` herda de `ValueError` e
  usa a mensagem `Horário indisponível.`.
- `python/demo.py`: demonstração progressiva no terminal com três tentativas,
  duas reservas aceitas e um conflito. As pausas são apresentação, não medição
  de desempenho do algoritmo.

Limites: um único dia, sem datas, fusos, virada de dia, horários comerciais,
profissionais, serviços, duração comercial, clientes ou recursos cadastrados.
Imutabilidade não resolve concorrência entre chamadas com a mesma agenda antiga.

## 5. API atual e o que ela ainda não faz

`python/api.py` cria o app FastAPI. Pydantic usa `StrictInt` para os horários.
`converter_entrada` transforma os dados externos em `Agenda` e `Intervalo`.
As duas operações recebem a agenda na própria requisição:

```json
{
  "reservas": [{"inicio": 540, "fim": 600}],
  "solicitacao": {"inicio": 600, "fim": 660}
}
```

| Operação | Sucesso | Erros previstos |
| --- | --- | --- |
| `POST /disponibilidade` | 200, `{"disponivel": true}` ou `false` | 422 para entrada inválida |
| `POST /reservas` | 201, `{"reservas": [...]}` com agenda atualizada | 409 para conflito; 422 para entrada inválida |

O domínio produz `Intervalo inválido.` ou `Horário indisponível.` nos cenários
correspondentes. O adaptador traduz as exceções para HTTP. Validações estruturais
do Pydantic podem ter `detail` em lista, diferente de uma mensagem textual de
domínio. Não presumir que todo 422 terá uma string.

O servidor **não armazena a agenda**, não é a fonte compartilhada das reservas
e não oferece endpoint de listagem persistente. O usuário pode enviar outra
agenda no JSON. Duas requisições com a mesma agenda antiga podem aceitar a mesma
reserva. O atual 409 detecta conflito em relação à agenda enviada; não é uma
garantia transacional de exclusividade entre usuários.

`configurar_interface(aplicacao, diretorio)` entrega `index.html` em `/` e
monta `/assets` com `StaticFiles` se a pasta existir. Os testes usam `tmp_path`
e uma aplicação própria para não depender de um build local do Vite.

`python/publicacao.py` conecta isso ao app real e exige
`typescript/dist/index.html`. A falta do build produz erro explícito.
`api:app` é usado no desenvolvimento e nos testes; `publicacao:app` na aplicação
empacotada. A documentação continua em `/docs`, com esquema em `/openapi.json`.

## 6. Interface TypeScript atual

É uma interface de DOM, sem framework de interface da aplicação. O React usado
pelo Remotion pertence ao produtor de vídeos, não à aplicação de agendamento.

### Responsabilidades dos arquivos

- `typescript/src/api.ts`: cliente `fetch`, tipos de transporte e validação da
  estrutura das respostas. Recebe `urlBase` opcional, com padrão vazio para a
  mesma origem. O JSON é lido como `unknown`, não confiado por anotação.
- `consultarDisponibilidade` retorna booleano; `reservarHorario` retorna
  `Promise<IntervaloEntrada[]>`. `ehIntervaloEntrada` verifica campos numéricos
  e `.every` verifica todos os elementos da lista.
- `lerDetalheTextual` centraliza a leitura de `detail`. `ErroConflitoApi` e
  `ErroValidacaoApi` preservam categorias conhecidas. Há mensagens genéricas
  para outros status e para respostas fora do formato esperado.
- `typescript/src/tela.ts`: `montarTela(container, consultar, reservar?,
  reservasIniciais = [])` recebe funções injetadas, permitindo testar a tela
  sem rede.
- `typescript/src/main.ts`: mantém `let reservas = [{inicio: 540, fim: 600}]`,
  passa a agenda inicial à tela e envia o estado mais recente em cada chamada.
  Só substitui a agenda após sucesso na reserva e devolve a lista para a tela.
- `typescript/vite.config.ts`: desenvolvimento em 127.0.0.1:5173 e proxy de
  `/disponibilidade` e `/reservas` para a API local em 8000.

### Comportamentos implementados com TDD

1. Campos Início e Fim editáveis, começando em 10h e 11h; conversão HH:mm → minutos.
2. Consulta com mensagens de disponível, indisponível, validação e erro genérico.
3. Reserva com confirmação, conflito, validação e erro genérico tratados.
4. Campos vazios impedem a operação e orientam o preenchimento; corrigir permite
   tentar novamente.
5. `Consultando…` e `Reservando…` durante a espera.
6. Os **dois botões** ficam desabilitados durante qualquer operação e são
   reabilitados no `finally`, inclusive após erro.
7. Na reserva, os **dois campos** também ficam bloqueados até terminar. Na
   consulta, continuam editáveis.
8. Editar qualquer horário limpa a mensagem e incrementa uma versão. Resultado
   ou erro de consulta iniciada com versão antiga não volta à tela, mesmo se
   os valores forem editados e depois restaurados. Isso não cancela o HTTP.
9. A seção Agenda exibe intervalos em HH:mm–HH:mm, ordenados pelo início usando
   cópia da lista, sem alterar a agenda recebida.
10. Sucesso substitui os itens da lista, sem duplicação. Conflito preserva os
    itens anteriores. Agenda vazia mostra `Nenhuma reserva na agenda.`; uma
    primeira reserva aceita oculta a orientação.

O bloqueio dos botões vale para a mesma tela. Não confundir com sincronização
entre abas, autenticação ou prevenção de concorrência no banco.

Fluxo manual já confirmado: abrir com 09h–10h; reservar 10h–11h; lista passa a ter
dois itens; consultar o mesmo horário retorna indisponível; tentar reservar de
novo mostra conflito e preserva a lista; recarregar volta a somente 09h–10h.

## 7. Testes e qualidade

Checkpoint da aplicação: **114 testes**, distribuídos assim:

| Área | Casos |
| --- | ---: |
| Python, modelos | 22 |
| Python, operações e propriedades | 22 |
| Python, HTTP e arquivos da interface | 10 |
| TypeScript, cliente HTTP | 17 |
| TypeScript, interface | 38 |
| TypeScript, integração com API Python real | 5 |
| Total | 114 |

A coleta Python foi reconferida nesta consolidação: 54 casos. Não se trata de
uma nova execução completa dos 114 testes; a aprovação do CI está nas execuções
referenciadas no início. As 24 amostras do benchmark de vídeo não integram essa
contagem de testes da aplicação.

O domínio usa pytest, parametrização e Hypothesis. Foram cobertos simetria do
conflito, limites compartilhados de intervalos consecutivos e propriedades de
agendamento. O teste de fronteira sugerido em uma interação no X já foi feito;
não recolocá-lo na lista de pendências.

O cliente HTTP usa `fetch` simulado. Os testes da interface usam Vitest, jsdom,
Testing Library e funções injetadas; promessas controladas verificam estados
pendentes e recuperação. Os cinco testes de integração usam a API real: consulta
disponível, validação da consulta, reserva consecutiva, conflito e reserva inválida.

Há Ruff lint e formatação, BasedPyright, `tsc --noEmit`, build e revisão do diff.
Nenhum número de testes substitui avaliar os comportamentos e os riscos.

### Comandos de verificação

Na pasta `python/`:

```bash
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/basedpyright .
.venv/bin/python -m pytest -q
```

Na pasta `typescript/`, com API ligada para a integração:

```bash
npm run typecheck
npm test
npm run test:ui
npm run test:integration
npm run build
```

Na raiz:

```bash
git diff --check
git diff --stat
git status --short
```

Python Quality executa Ruff, formatação, BasedPyright e pytest. TypeScript
Quality executa tipos, cliente, tela, integração com Python, build da imagem e
teste do contêiner por HTTP. O teste do contêiner verifica HTML, `/docs` e os
cinco cenários de integração. Não é um teste ponta a ponta com JavaScript sendo
executado em navegador; não ampliar a conclusão além disso.

## 8. Execução local e publicação da aplicação

Bruno usa macOS Apple Silicon, Zed e OrbStack. O ambiente de aprendizado inclui
o Engineering Dojo em `~/Exercism/.zed/dojo.sh`. O histórico também menciona
Java 21/25, Maven, Gradle e um laboratório independente em
`~/Exercism/quarkus-labs/lab-rest`. Isso não implementa Java/Quarkus no SlotGuard
e não foi revalidado nesta entrega.

### Desenvolvimento sem reconstruir dependências a cada sessão

Na raiz, com dependências preparadas:

```bash
bash iniciar.sh
```

O script inicia a API na porta 8000 e o Vite na 5173, aguarda disponibilidade e
encerra os dois ao pressionar Ctrl+C. Usa a `.venv` e as dependências locais,
sem reinstalar nada. Não mata outros processos se uma porta estiver ocupada.
Não iniciar servidores duplicados. Alterar Python exige reiniciar o script:
o processo atual não usa recarga automática.

Preparação inicial, quando realmente necessária:

```bash
python3.14 -m venv python/.venv
python/.venv/bin/python -m pip install -r python/requirements-dev.txt
cd typescript
npm ci
```

Aplicação: Python 3.14 e Node 22.21.1 como referências. As dependências estão
nos requirements e no package-lock. Não confundir com Python 3.12 do produtor
de vídeos, que é um ambiente separado.

### Docker da aplicação

O `Dockerfile` da raiz compila a interface com Node e executa a aplicação com
Python. Instala dependências dentro da imagem e copia o `dist` gerado, sem
depender de `.venv`, `node_modules` ou build do Mac. A `.dockerignore` exclui
esses arquivos e **todo `video/`**, evitando levar o produtor ao Render.

Executa `uvicorn publicacao:app --host 0.0.0.0 --port ${PORT:-10000}`, com
usuário sem privilégios. Um endereço serve interface e API; Vite não roda em
produção. Isso simplifica o deploy e dispensa configurar CORS entre dois sites.

```bash
docker build -t slotguard:local .
docker run --rm --name slotguard-teste -p 127.0.0.1:8001:10000 slotguard:local
```

A porta 8001 evita conflito com a API local. O Docker Engine precisa estar
ativo; o erro de socket do OrbStack foi resolvido abrindo o aplicativo, sem
instalar outro Docker.

### Render e Neon

`render.yaml` define um único Web Service Docker, branch main, plano `free`,
contexto e Dockerfile na raiz, health check `/` e `autoDeployTrigger: checksPass`.
O serviço foi criado por Blueprint e ficou Live em `slotguard-zf3f.onrender.com`.
O primeiro sync apareceu como falha, mas o serviço foi criado depois. O detalhe
consultado **não explicou a causa inicial**; não inventar uma causa nem recriar
o serviço ou fazer upgrade por causa daquele registro antigo.

A hospedagem gratuita pode entrar em repouso e atrasar o primeiro acesso.
Limites e cobrança devem ser conferidos na documentação e na conta antes de
novas decisões; não prometer disponibilidade ou capacidade ilimitadas.

Neon foi escolhido como direção para PostgreSQL, mas **nenhuma integração
de banco existe no código atual**. Não há `DATABASE_URL`, migrações ou repositório
de persistência implementado. A decisão evita depender de SQLite em disco
efêmero do serviço e de instalações permanentes de banco na máquina de Bruno.

## 9. Linha do tempo de entregas no repositório

Os marcos abaixo podem ser inspecionados com `git show <commit>`.

| Commit | Marco |
| --- | --- |
| `de827f9` | Núcleo Python com TDD; checkpoint histórico de 43 testes |
| `5b6cbe2` | Propriedade de intervalos consecutivos; núcleo passa a 44 casos |
| `f14b699` | Demonstração animada no terminal |
| `627619d` / `1c30806` | Contexto histórico e documentação Python |
| `b00701f` | API de disponibilidade |
| `d890930` | Interface TypeScript ligada à API e CI |
| `f06d853` | Inicialização local simplificada com iniciar.sh |
| `e323739` | Campos editáveis na consulta |
| `0a3e004` | Mensagens de validação da API na interface |
| `fdac4ea` | POST /reservas na API; naquela etapa a tela ainda só consultava |
| `6b0e782` | Reserva pela interface, cliente com validação e agenda em memória |
| `d458e9d` | Agenda exibida, atualizada no sucesso e preservada no conflito |
| `fab1f65` | Estado de agenda vazia |
| `a9237d3` | Ordenação da exibição sem alterar a agenda original |
| `b2554ec` | Limpeza de mensagens e descarte de respostas antigas da consulta |
| `58ff466` | Campos bloqueados durante a reserva |
| `bb80c90` | Interface compilada servida pela API e imagem Docker |
| `b105390` | Teste do contêiner em execução no CI |
| `f0b47c4` | Blueprint gratuito do Render |
| `9738981` | Produtor de vídeos versionado, Docker e rotina de divulgação |
| `637d750` | Workflow manual de vídeos com artefatos |
| `4bb11c1` | Benchmark de paralelismo com comparação de qualidade |
| `87c1c27` | Dois quadros simultâneos no GitHub e evidências do ganho |

A release histórica `v0.1.0` foi publicada para o núcleo Python. Não supor que
as entregas posteriores receberam novas releases só porque receberam commits.

## 10. Comunicação pública e decisões editoriais

A primeira etapa apresentou o núcleo Python: intervalos, conflitos, imutabilidade,
TDD e 43 testes no checkpoint retratado. A segunda apresentou a aplicação
demonstrável: Python + FastAPI + TypeScript, 114 testes, Docker, CI e Render.
As contagens dos vídeos são históricas; não atualizar uma etapa antiga como se
ela já tivesse funcionalidades futuras.

O site é um diário de desenvolvimento, não apenas uma lista de tecnologias.
Os artigos explicam problema, decisões, testes, demonstração, limites e intenção
futura. A etapa 2 recebeu capa, índice, arquitetura, tabela de testes e chamadas
no blog, início e Agora. Blog, contatos, laboratório e outros conteúdos devem
ser preservados.

**O GitHub é a fonte única do site**, no repositório
`BrunoCesarAngst/brunoangst.com.br`. Houve uma cópia divergente no Sites; a escolha
foi voltar à versão do GitHub. Não publicar alterações naquela cópia supondo
sincronização. O histórico registrava GitHub Pages em `gh-pages`; conferir a
configuração atual e localizar o checkout antes de editar. O caminho local
antigo do site não foi localizado nesta consolidação.

Inicialmente publicamos capas/textos e depois vídeos nativos, a pedido de Bruno.
Após dificuldades repetidas de upload, ele definiu outra rotina para o futuro:
**YouTube primeiro em @mbcangst; site e redes usam links/incorporações**.
As publicações nativas existentes ficam preservadas. Não apagar ou duplicar
posts automaticamente para adequar retroativamente a nova rotina.

Critério para nova divulgação: uma entrega compreensível e demonstrável, com
evidência e limitações claras. Um commit interno ou aumento isolado de testes
não obriga uma campanha. Antes de produzir, registrar antes/depois, commit,
testes executados, demonstração, limites e próximo passo. Publicar quando houver
pedido aplicável; não há autorização permanente para posts em cada commit.

A rotina detalhada está em [PUBLICACAO.md](PUBLICACAO.md). Nunca prometer alcance,
engajamento ou contratação; valorizar o trabalho com fatos. A demonstração ainda
não é um produto pronto para operação comercial com múltiplos clientes.

## 11. Publicações e links preservados

O registro histórico local está em
`/Users/brunoangst/Exercism/projects/slotguard-video/output/publicacao/status.json`.
Ele registra publicação e verificações de reprodução, não uma nova auditoria
ao vivo feita em 10 de novembro. Conteúdo nesse diretório não entra no Git.

| Canal | Etapa 1 | Etapa 2 |
| --- | --- | --- |
| Site | [Artigo e vídeo](https://brunoangst.com.br/blog/slotguard-primeiro-nucleo-python/#video) | [Artigo e vídeo](https://brunoangst.com.br/blog/slotguard-demonstracao-publica/#video) |
| LinkedIn, vídeos | [Publicação](https://www.linkedin.com/feed/update/urn:li:activity:7525708482294050817/) | [Publicação](https://www.linkedin.com/feed/update/urn:li:activity:7525690253727338496/) |
| X, vídeos | [Publicação](https://x.com/BrunoCesarAngst/status/2119939179215737229) | [Resposta com vídeo](https://x.com/BrunoCesarAngst/status/2119936570048327889) |
| Instagram @angstlogic | [Reel](https://www.instagram.com/angstlogic/reel/DfikUbzK7ME/) | [Reel](https://www.instagram.com/angstlogic/reel/DficYraKih1/) |
| Facebook | [Reel](https://www.facebook.com/reel/1122518357166717) | [Post atualizado com vídeo](https://www.facebook.com/100029726747048/videos/pcb.1861664551501085/1396642020208317) |
| YouTube @mbcangst | [Short](https://www.youtube.com/shorts/_W2k61MHA3A) | [Short](https://www.youtube.com/shorts/-9y3wLWDu0U) |

- [Playlist pública da série](https://www.youtube.com/playlist?list=PLZA_RnF0KFIw),
  conferida anteriormente com etapa 1 seguida da etapa 2.
- [Post de capa/texto da etapa 2 no LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7525652291694157824/),
  registrado como adicionado aos Destaques do perfil.
- [Post de capa da etapa 2 no X](https://x.com/BrunoCesarAngst/status/2119892833750679799).
- [Post posterior no X com artigo e demonstração](https://x.com/BrunoCesarAngst/status/2119926448823693795),
  ao qual o vídeo da etapa 2 foi acrescentado como resposta.

As reproduções da etapa 2 no LinkedIn e Instagram foram verificadas em revisão
posterior à publicação inicial. As etapas 1 também tiveram reprodução registrada.
No YouTube, não foram encontrados problemas de direitos autorais nas verificações
registradas. Não confundir publicação com simples preenchimento de um formulário.

### Correção de canal e pendência do YouTube

Bruno corrigiu explicitamente o destino para **um cidadão — @mbcangst**, canal
`UCDvmkutgPHo_yekz1RV078Q`. Um envio anterior da etapa 2 ficou no canal
@brunocesarangst6764 em `https://www.youtube.com/shorts/XoF8AfOYLXc`.
O destino canônico da série é @mbcangst; não reenviar para o canal antigo nem
apagar aquela publicação sem pedido específico.

As descrições relacionam as duas etapas e a playlist existe. O recurso nativo
de vídeo relacionado dos Shorts depende de recursos avançados. Bruno concluiu
uma verificação e o último estado observado foi **Pending / em análise**.
Conferir novamente antes de concluir essa ligação.

Foi corrigida uma orientação anterior: a verificação **não torna clicáveis os
URLs nas descrições/comentários de Shorts**. Usar vídeo relacionado, playlist e
links do perfil; vídeos convencionais têm regras próprias para links externos.
No Instagram, URL na legenda também não equivale a link clicável.

## 12. Produtor de vídeos reproduzível

Começamos com um piloto vertical de 20 segundos da etapa 2: capa animada,
reserva real, narração e legendas. Depois foram feitos os quatro vídeos completos,
com composição própria nos formatos vertical e horizontal. A voz inicial
Kokoro `pf_dora` foi substituída por **voz masculina `pm_alex`**, velocidade 0,96,
com pausas entre ideias e legendas ajustadas. Não houve clonagem da voz de Bruno.

As versões atuais têm aproximadamente 87,94 segundos na etapa 1 e 106,88 na
etapa 2, em 1080×1920 e 1920×1080, 30 fps, H.264/AAC, estéreo 48 kHz e pico
medido de −1,5 dB. Durações menores citadas antes da revisão de voz são históricas.

O produtor atual é `video/`, incorporado pelo commit `9738981`. O projeto irmão
`slotguard-video` é arquivo preservado, não a fonte para novas mudanças.

- `roteiros-completos.json`: conteúdo, cenas, legendas e durações mínimas.
- `src/Completos.tsx` e `src/index.tsx`: composições React/Remotion.
- `scripts/narrar-completos.py`: voz, pausas, faixas e legendas.
- `scripts/render-completos.mjs`: prévias e MP4.
- `scripts/verificar-completos.py`: codecs, dimensões, fps, quadros, duração,
  áudio, legendas e decodificação.
- `scripts/produzir.mjs`: diagnóstico e encadeamento dos passos, cópia de
  resultados anteriores e relatório `runs/<data>/producao.json`.
- `scripts/benchmark.mjs`, `verificar-benchmark.py` e `render-settings.mjs`:
  comparação de paralelismo e opções compartilhadas com a produção.
- `evidencias/`: checkpoints históricos, comportamento HTTP, validação Docker e
  benchmark versionados. As capturas demonstram esses checkpoints, não a versão
  mais recente da aplicação automaticamente.

O Docker do produtor reúne Node 22.21.1, Python 3.12.14, FFmpeg, Chromium,
eSpeak NG, bibliotecas e modelos Kokoro. Modelos oficiais são baixados no build
e verificados por SHA-256. As versões Node/Python e os locks estão no projeto.
A fonte Manrope tem licença local; dependências e Remotion têm condições próprias.
Não há música de terceiros nem API de voz paga.

Depois do build, síntese e renderização funcionam sem rede. O contêiner usa
área temporária, monta apenas a saída e não altera o código do host. O cache
do bundle foi desabilitado porque `node_modules` é somente leitura nesse fluxo.
Não adicionar modelos, ambientes, caches, WAV derivados ou MP4 gerados ao Git.

Na raiz do SlotGuard, com Docker e Compose funcionando:

```bash
bash video/gerar.sh --check
bash video/gerar.sh --preview
bash video/gerar.sh --smoke
bash video/gerar.sh --gerar
bash video/gerar.sh --gerar --only=Etapa2Horizontal
bash video/gerar.sh --benchmark
```

`--plan` mostra os passos. `--only` aceita as quatro composições e não é usado
no benchmark, que tem três cenários fixos. A seleção de um vídeo ainda prepara
a narração das duas etapas. `--smoke` gera dois segundos, não o vídeo inteiro.

Saídas: MP4, SRT/VTT, 38 prévias no modo completo, relatórios técnicos e cópias
anteriores em `video/output/`, ignorado pelo Git. A imagem ocupa aproximadamente
3 GB descomprimida; a primeira construção precisa de rede e espaço.

Uma validação inicial gerou os quatro vídeos completos em Linux ARM64; AMD64
foi primeiro testado sob emulação. A geração completa posterior no GitHub
confirmou o funcionamento em Linux AMD64 real do runner. Validação automática
não equivale a ter ouvido integralmente a voz nem substitui revisão editorial.

## 13. GitHub Actions dos vídeos e medição de desempenho

Workflow `.github/workflows/video-manual.yml`, nome **SlotGuard Videos**.
Somente manual, sem geração a cada push. Em Actions → Run workflow, escolher:

- `completos`, `previas`, `smoke` ou `benchmark`;
- `todos` ou uma composição: Etapa1Vertical/Horizontal, Etapa2Vertical/Horizontal.
- No benchmark, usar `todos`.

Usa `ubuntu-24.04`, Docker Linux AMD64, cache de camadas, limite de 60 minutos,
permissão `contents: read`, uma execução por branch de cada vez e rede desativada
na geração. Não publica imagem em registry nem vídeos no YouTube.

Artefatos comuns ficam sete dias; amostras do benchmark, um dia. O envio é
restrito aos resultados e relatórios, sem modelos ou cache de voz. Os arquivos
disponíveis também são enviados se houver falha, para diagnóstico; isso não
transforma uma execução falha em sucesso.

### Geração completa de referência

[Execução 42735589374](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42735589374):
quatro vídeos completos aprovados, aproximadamente **24min40s**.

| Parte | Tempo aproximado |
| --- | --- |
| Construção Docker e cache | 4min21s |
| Voz e legendas | 1min21s |
| Renderização e prévias | 18min18s |
| Validação técnica | 16s |
| Envio dos artefatos | 2s |

Renderizar 11.688 quadros em Full HD foi o principal custo. Os vídeos são
gerados consecutivamente. No primeiro build, exportar o cache consumiu 1min39s.
O cache ajuda na preparação, não elimina a renderização.

O pacote de aproximadamente 60 MB foi baixado e os quatro MP4 foram decodificados
integralmente também no Mac, sem erros. Foram examinadas prévias visuais. O
diretório local é `video/output/github-run-42735589374`.

### Benchmark e configuração aplicada

[Execução 42742253589](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42742253589):
quatro CPUs lógicas, Ubuntu 24.04 x64, AMD EPYC 7763 e aproximadamente 16 GB de RAM.
Comparamos 1, 2, 3 e 4 quadros simultâneos em três trechos de três segundos:
animação, reserva com captura de vídeo e conflito. Houve aquecimento e duas
rodadas com ordem invertida: 24 amostras medidas.

| Quadros simultâneos | Soma média dos três trechos por rodada |
| --- | ---: |
| 1 | 30,63 s |
| 2 | 30,10 s |
| 3, configuração anterior | 34,76 s |
| 4 | 40,14 s |

Dois quadros tiveram ganho médio de **13,4% contra três**, com melhora nas duas
rodadas. Um e dois ficaram próximos; dois foi o melhor resultado médio medido.
Todas as amostras passaram: SSIM 1,0 contra o baseline da mesma rodada/cenário,
áudio decodificado idêntico, dimensões/fps/codecs corretos e decodificação integral.
Regra de escolha: ganho médio mínimo de 5% e melhora nas duas rodadas; caso
contrário manter três. Não trocamos qualidade por velocidade.

Os dados completos estão em [evidencias/benchmark-github.json](../video/evidencias/benchmark-github.json).
O workflow passa `SLOTGUARD_RENDER_CONCURRENCY=2` ao Docker. Localmente o padrão
continua em três; o parâmetro aceita inteiros de 1 a 8. O valor usado e os
ajustes de renderização entram no relatório de produção.

A validação final [42745115196](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42745115196)
gerou quatro amostras smoke em **3min46s**, com sucesso. O download adicional
dessas amostras foi recusado na autorização; não registrar uma inspeção local
que não ocorreu. O pacote completo anterior e o benchmark foram baixados.

**Pendente:** medir os quatro vídeos completos com o novo paralelismo. Não
comparar 3min46s de smoke com 24min40s de vídeos integrais e chamar isso de ganho.
O ganho de 13,4% dos trechos não prova igual redução no tempo total.

O processamento permaneceu no runner padrão de um repositório público, sem
GPU ou serviços pagos. Armazenamento e regras dos planos devem ser reavaliados
quando o uso crescer. A otimização não exigiu mudar o plano do GitHub ou Render.

## 14. O que foi adiado, substituído ou descartado

| Ideia ou orientação antiga | Situação correta agora |
| --- | --- |
| Reimplementar o domínio em TypeScript | Escolhemos consumir a API Python |
| Começar persistência por SQLite | Substituído pela direção PostgreSQL/Neon e publicação primeiro |
| Cancelamento como próxima funcionalidade | Adiado; persistência resolve antes a perda do estado |
| Java e Quarkus já fazerem parte da aplicação | São fases planejadas; laboratório externo não equivale a integração |
| Upload nativo em todas as redes como rotina | Rotina atual é YouTube primeiro e divulgação por links |
| Conta @brunocesarangst6764 como destino principal | Bruno definiu @mbcangst |
| Verificação tornar URLs de Shorts clicáveis | Corrigido; descrições/comentários de Shorts continuam com limite próprio |
| Gerar vídeo automaticamente a cada commit | Não implementado e não é a rotina editorial desejada |
| Crescer a contagem de testes sem funcionalidade | Não é um objetivo do TDD |
| Tela bloqueada garantir exclusividade global | Só bloqueia operações pelos botões na mesma tela |
| Sites e GitHub serem duas fontes equivalentes do site | GitHub é a fonte única definida pelo autor |

Problemas já resolvidos não devem reabrir tarefas sem nova evidência: imports
ausentes de exceções em testes, retorno Promise de intervalo em vez de lista,
`await` fora do listener async, chaves/`finally` deslocados, código de assets
depois do `return`, variáveis dos botões no escopo errado e o daemon Docker
desligado. Em uma fase houve falha dos workflows antes dos testes, seguida de
execuções aprovadas; isso não demonstra defeito atual no domínio.

O 404 inicial de POST /reservas foi seguido por sucesso após reiniciar o ambiente.
O servidor Python não recarrega automaticamente: confirmar versão/processo antes
de alterar um contrato que já funciona. Mensagem de conflito é `Horário
indisponível.`, não `Intervalo indisponível.`.

## 15. Próxima etapa técnica e decisões ainda abertas

A prioridade de produto continua sendo **persistência simples com PostgreSQL**.
Publicação e reprodução do ambiente já foram preparadas; o trabalho recente de
vídeos é infraestrutura de apresentação, não persistência do agendamento.

Antes de modelar o banco, falta decidir: **a demonstração terá uma agenda
compartilhada ou agendas separadas por sessão/recurso?** A resposta afeta IDs,
consulta, limpeza de dados e conflitos. Não presumir que cadastro/login completo
precisa entrar no mesmo incremento.

Sequência pequena sugerida, ainda não implementada nem fechada em detalhes:

1. Definir a identidade da agenda e a semântica do protótipo persistente.
2. Preparar PostgreSQL temporário para testes com Docker/CI, sem instalação
   permanente na máquina. Separar teste/desenvolvimento dos dados da demonstração.
3. Com TDD, salvar e recuperar uma agenda por outra instância do adaptador,
   usando o mesmo banco escolhido para publicação.
4. Introduzir migrações e configuração do banco por ambiente, sem credenciais
   em código, logs, imagem ou documento público.
5. Fazer a API carregar o estado do servidor. O navegador não deverá continuar
   fornecendo a lista autoritativa de reservas como contrato definitivo.
6. Acrescentar a leitura da agenda ao iniciar/recarregar e verificar sobrevivência
   a reload, reinício e novo deploy.
7. Garantir criação atômica e integridade sob concorrência. Duas operações para
   o mesmo recurso/intervalo devem resultar em uma aceitação e um conflito.
8. Só depois escolher o menor incremento de cancelamento, com identidade de reserva.

Em uma conversa técnica no LinkedIn foi sugerido usar ranges e restrição
`EXCLUDE` do PostgreSQL por recurso, possivelmente com `btree_gist`. Essa é uma
possibilidade a estudar, **não uma decisão implementada**. `EXCLUDE` é específico
do PostgreSQL; domínio independente de infraestrutura não significa prometer
um mecanismo SQL idêntico para todo banco. Lock em uma única aplicação/JVM não
substitui garantias que precisam sobreviver a múltiplas instâncias.

Definir conexão, pooling, biblioteca de acesso, esquema, migrações e recursos
do plano gratuito com documentação atual antes de implementar. Não copiar
cotas ou preços antigos como garantias atuais, nem conectar os testes ao banco
de demonstração real.

Pendências opcionais separadas da persistência:

- Reconsultar recursos avançados do YouTube e, se ativos, concluir vídeo relacionado.
- Executar o modo completos com dois quadros para medir o tempo integral.
- Preparar futuras etapas de vídeo com novo roteiro/capturas/evidências revisados.
- Automatizar gatilho editorial por marco, se Bruno desejar; não existe hoje.
- Melhorias de experiência visual/acessibilidade podem ser incrementos futuros,
  sem afirmar que há calendário completo ou produto comercial pronto.

## 16. Documentos históricos e fontes de continuidade

Ordem sugerida de leitura: COMECE_AQUI; estado atual; seções relevantes deste
arquivo; fontes e testes do incremento escolhido. Consultar `docs/PUBLICACAO.md`
e `video/README.md` quando o assunto for apresentação ou produção de mídia.

`primeiroConexto.md` agora aponta para o contexto 01 arquivado, que preserva a
origem e o plano de quatro fases com estado de 6 de novembro. Trechos históricos
dizendo que TypeScript é somente planejado, que API
não existe, que publicação está pendente ou que o total atual é 43/44 estão
superados. Partes do ponto de retomada do README principal ainda citam 52 testes
Python; a entrega HTTP dos arquivos estáticos elevou o total para 54. Não alterar
as contagens dos checkpoints históricos dos vídeos por esse motivo.

Pequena dívida de documentação/configuração identificada: a `.gitignore` da raiz
contém linhas literais antigas de comando de criação do arquivo (`cat > ...` e
`EOF`). As regras úteis continuam presentes. Uma limpeza específica pode removê-las;
esta consolidação não altera esse arquivo nem refatora código funcional.

A consolidação usa o código atual, histórico Git, resultados do CI, documentos,
evidências locais e os chats disponíveis relacionados ao projeto:

| Chat | Referência |
| --- | --- |
| Continue refatoração TypeScript | Codex `01a1c033-9f22-7ce0-8aaf-17208af9e6aa`; interface, deploy, publicação e vídeos, além das medições posteriores nesta conversa |
| Atualizar demo.py | Codex `01a1b216-f40f-7032-9b81-01df61ca2e4a`; API, cliente, interface inicial e TDD |
| Localize chat do playground multilíngue | Codex `01a1ae63-24ae-7391-aec4-d5eb5f48a3ab`; artigo e escolha do GitHub como fonte do site |
| Montar playground visual multilinguagem | ChatGPT `6aeb0e76-03a4-83e8-9835-087b95fb844e`; plano, apresentação e discussão sobre concorrência no PostgreSQL |
| Testar intervalos consecutivos | ChatGPT `6aedc876-dcb0-83e9-8202-911f7a8c4ac9`; Hypothesis, demo e transição para TypeScript |
| Declarar modelos Pydantic | ChatGPT `6aee2dba-73d0-83e9-b3fd-097988e13117`; separação entrada HTTP/domínio |
| Configuração produtiva do Zed | ChatGPT `6aec646b-b1a0-83e9-84c4-25588ebd71cb`; contexto do ambiente e feedback de qualidade |

Isso é uma síntese operacional do histórico acessível, não um backup literal
de todos os diálogos. Chats de outros projetos não devem virar funcionalidades
atribuídas ao SlotGuard. Uma orientação antiga só prova que algo foi sugerido;
código, testes e evidências posteriores determinam se foi concluído.

## 17. Como o novo chat deve agir primeiro

1. Ler COMECE_AQUI, o estado atual e as instruções `AGENTS.md` aplicáveis;
   consultar as seções necessárias deste contexto.
2. Conferir `git status`, último commit e diff. Preservar trabalho local.
3. Não reabrir conquistas como se ainda fossem pendências: consulta, reserva,
   agenda, deploy, Docker, vídeos e benchmark já existem.
4. Confirmar com Bruno a frente desejada. A direção técnica prioritária é
   persistência com Render/Neon; a identidade da agenda precisa ser definida.
5. Propor um único incremento TDD, distinguindo decisão necessária de mera
   preferência de implementação. Se ele pedir execução, realizar e verificar.
6. Atualizar o contexto quando houver novo marco, preservando o significado dos
   checkpoints históricos e registrando verificações realmente executadas.

Mensagem curta que Bruno pode usar ao abrir outro chat:

> Continue o SlotGuard a partir de COMECE_AQUI.md e docs/ESTADO_ATUAL.md.
> Leia também AGENTS.md, consulte os detalhes necessários de docs/CONTINUIDADE.md,
> confira o estado do repositório e preserve as alterações locais.
> Quero seguir com TDD em incrementos pequenos, entendendo as decisões.
> Não confunda planejamento, resultado histórico e implementação atual.
