# Contexto 02 — Cliente TypeScript e API de reservas

**Histórico de 9 de novembro de 2026. Recuperado em 10 de novembro de 2026.**
Fonte: resposta de continuidade do chat Codex “Atualizar demo.py”,
`01a1b216-f40f-7032-9b81-01df61ca2e4a`, turno
`01a1c013-de1f-70f3-8c78-376bcec96dd2`.

O texto abaixo foi extraído integralmente do bloco de continuidade da resposta,
sem atualizar suas afirmações históricas. Seus “próximos passos” descrevem
naquele momento a interface somente de consulta e alterações ainda não publicadas.
Essas condições foram superadas. Para agir hoje, comece em
[COMECE_AQUI.md](../../COMECE_AQUI.md) e confira o
[estado atual](../ESTADO_ATUAL.md).

---

# Continuidade — SlotGuard
Referência: 9 de novembro de 2026.

## Como trabalhar comigo

Você está continuando um projeto existente. Atue como mentor técnico e revisor.

- Quero escrever o código e entender cada decisão.
- Seguimos TDD: teste → falha esperada → implementação mínima → verde → refatoração.
- Prefiro uma mudança pequena por vez, com explicações que desenvolvam minha autonomia.
- Explique conceitos, tipos, fluxo e responsabilidades.
- Quando eu pedir orientação, apresente o próximo incremento e aguarde meu resultado.
- Quando eu pedir explicitamente para fazer alterações, pode editar os arquivos.
- Quando eu pedir o arquivo completo, pode fornecê-lo.
- Refatorações devem preservar os cenários e resultados existentes.
- Não confunda uma sugestão anterior com implementação confirmada.
- Não declare commit, publicação ou CI aprovado sem verificar.
- Preserve minhas alterações locais.

## Projeto e objetivo

SlotGuard — Engineering Lab: sistema de agendamentos com prevenção de conflitos, desenvolvido como laboratório de aprendizado e portfólio.

Projeto local:

`/Users/brunoangst/Exercism/projects/slotguard`

Repositório:

https://github.com/BrunoCesarAngst/slotguard-engineering-lab

Branch: `main`.

Direção atual:

**Interface TypeScript → API Python → domínio Python existente.**

Decidimos aproveitar o motor Python, em vez de reimplementá-lo em TypeScript. O TypeScript adapta entradas, realiza chamadas HTTP e apresenta resultados.

Java e Quarkus continuam planejados para estudos posteriores de concorrência, API e persistência.

## Regras do domínio

Horários são minutos desde meia-noite:

- 09:00 = 540.
- 10:00 = 600.
- 11:00 = 660.

Intervalos seguem `[inicio, fim)`, com:

`0 <= inicio < fim <= 1440`

Reservas consecutivas não conflitam.

Python exige inteiros exatos e rejeita booleanos como horários.

- `Intervalo`: objeto imutável que valida os horários.
- `Agenda`: coleção imutável de intervalos.
- `esta_disponivel()`: consulta conflitos.
- `agendar()`: devolve nova agenda ou lança `HorarioIndisponivelError`.
- `HorarioIndisponivelError` herda de `ValueError`.

Uma `Agenda` pode ser estruturalmente criada com intervalos sobrepostos. Impedir uma nova reserva conflitante é responsabilidade de `agendar()`.

Não há persistência nem garantia contra concorrência real.

## O que já foi publicado

Último commit local e publicado confirmado:

`fdac4ea — feat: expose reservation creation through Python API`

Os workflows Python Quality e TypeScript Quality passaram nesse commit:

- 52 testes Python, incluindo oito testes da API.
- Naquele momento, 19 testes TypeScript: cinco do cliente HTTP, 12 da tela e dois de integração.

A API oferece:

### POST /disponibilidade

Entrada:

```json
{
  "reservas": [{"inicio": 540, "fim": 600}],
  "solicitacao": {"inicio": 600, "fim": 660}
}
```

Responde `200` com `{"disponivel": true}` ou `false`.

### POST /reservas

Recebe o mesmo formato de entrada.

- `201`: devolve `{"reservas": [...]}` com a agenda atualizada.
- `409`: `{"detail": "Horário indisponível."}`.
- `422`: entrada inválida; duração zero produz `{"detail": "Intervalo inválido."}`.

Cada requisição fornece sua própria agenda. O servidor não armazena a nova reserva.

`converter_entrada()` centraliza a construção de `Agenda` e `Intervalo`. Conversão inválida e conflito possuem tratamentos separados, preservando a distinção entre `422` e `409`.

Os testes Python usam:

- Fixture `cliente`, com `TestClient` e `yield`.
- Auxiliar `montar_entrada`, recebendo reservas e solicitação como pares de minutos.
- Dados dos cenários e resultados esperados explícitos em cada teste.

## Interface atual

A tela ainda oferece **apenas consulta**.

Já possui:

- Campos “Início” e “Fim”, inicialmente 10:00 e 11:00.
- Reserva existente fixa de 09h–10h.
- Conversão dos valores editados para minutos no clique.
- Orientações para campos vazios, sem chamar a API.
- Botão desabilitado durante a consulta.
- Mensagem “Consultando…”.
- Disponibilidade, indisponibilidade e mensagem genérica de comunicação.
- Apresentação de “Intervalo inválido.” recebida da API.
- Recuperação após corrigir os horários.

Ainda não existe botão de reservar, atualização da agenda pela tela ou persistência.

`main.ts` chama somente `consultarDisponibilidade`.

O proxy do Vite encaminha somente `/disponibilidade`. `/reservas` ainda precisará ser acrescentado quando conectarmos a reserva pelo navegador.

## Alterações locais atuais — NÃO publicadas

Em 9 de novembro, `git status` mostrou somente:

```text
 M typescript/src/api.test.ts
 M typescript/src/api.ts
```

Esses arquivos contêm o cliente HTTP de criação de reservas e seus testes. Não descarte essas alterações.

### api.ts

Exporta:

- `IntervaloEntrada`.
- `ErroValidacaoApi`.
- `ErroConflitoApi`.
- `consultarDisponibilidade()`.
- `reservarHorario()`.

`reservarHorario(entrada, urlBase = "")` envia `POST /reservas` e retorna `Promise<IntervaloEntrada[]>`.

Tratamentos implementados:

- `409`: `ErroConflitoApi`, usando detalhe textual ou “Horário indisponível.”.
- `422` com detalhe textual: `ErroValidacaoApi`.
- `422` sem detalhe textual: erro genérico.
- Outros erros HTTP, incluindo `500`: erro genérico.
- Resposta de sucesso inválida: “Resposta inválida da API”.

Auxiliares privados:

- `lerDetalheTextual(resposta)`: lê o JSON uma vez e retorna texto ou `undefined`. Os chamadores continuam escolhendo a categoria do erro.
- `ehIntervaloEntrada(valor: unknown): valor is IntervaloEntrada`: verifica objeto não nulo, presença de `inicio` e `fim` e valores numéricos.

A resposta de reserva é verificada como objeto com lista `reservas`, e todos os elementos passam por `.every(ehIntervaloEntrada)`.

**Detalhe a conferir no próximo passo:** o arquivo salvo ainda lê a resposta de sucesso de `reservarHorario` com:

```typescript
const dados: { reservas: IntervaloEntrada[] } =
  await resposta.json();
```

A orientação mais recente propunha trocar essa anotação por `unknown`, pois agora existem verificações em tempo de execução. As verificações foram implementadas, mas essa troca não foi feita. Avaliar como próxima refatoração pequena, preservando os testes.

### api.test.ts

Está organizado com:

- `describe("consultarDisponibilidade")`.
- `describe("reservarHorario")`.
- `montarEntrada({ reservas, solicitacao })`, usando pares `[inicio, fim]`.
- `simularRespostaJson(corpo, status = 200)`.
- `afterEach` restaurando os globais.
- `test.each` para comportamentos iguais com entradas diferentes.

Princípio adotado: centralizar preparação repetitiva e manter operação e expectativas explícitas. Não esconder os asserts em auxiliares genéricos.

Existem **17 casos do cliente HTTP**:

- Cinco de consulta.
- Doze de reserva, incluindo sucesso, conflito, validação, fallbacks de `422`, `500`, propriedade ausente, valor não array e quatro casos de elementos inválidos.

Os quatro últimos casos verificam início/fim ausente ou textual. Cada resposta contém uma reserva válida antes da inválida, exigindo verificar toda a lista.

## Última verificação efetiva

Em 9 de novembro, foram executados e passaram:

```text
npm run typecheck
npm test       → 17 testes aprovados
npm run test:ui → 12 testes aprovados
git diff --check → sem problemas
```

Os dois testes de integração existentes continuam no arquivo, mas **não foram reexecutados nessa conferência de 9 de novembro**. Eles cobrem apenas consulta real: sucesso e validação.

A estrutura TypeScript soma atualmente 31 casos: 17 do cliente, 12 da tela e dois de integração. Não afirmar que todos passaram nesta última execução.

## Como iniciar

De qualquer pasta:

```bash
bash ~/Exercism/projects/slotguard/iniciar.sh
```

Abrir:

http://127.0.0.1:5173/

Documentação da API:

http://127.0.0.1:8000/docs

O script inicia Python e Vite, aguarda ambos responderem e encerra os dois com Ctrl+C. Não precisa ativar a `.venv`.

Se as portas estiverem ocupadas, avisa sem encerrar processos existentes.

Após alterar Python, reinicie o script: o servidor não usa recarga automática.

## Verificações

Na pasta `typescript/`:

```bash
npm run typecheck
npm test
npm run test:ui
npm run test:integration
```

Somente integração exige a API ligada.

Na pasta `python/`:

```bash
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/basedpyright .
.venv/bin/python -m pytest -q
```

Os workflows já executam essas verificações. O workflow TypeScript inicia uma API Python temporária, aguarda `/openapi.json`, executa a integração e encerra seu processo.

## Próximos passos

1. Ler os arquivos atuais e preservar as alterações locais.
2. Avaliar a troca da anotação da resposta de reserva para `unknown`, confirmando o verde.
3. Consolidar o cliente HTTP de reservas antes de modificar a tela.
4. Criar testes de integração reais de reserva: sucesso, conflito e validação, um por vez.
5. Depois adicionar a ação de reservar à tela com TDD.
6. Conectar `main.ts`, atualizar a agenda recebida e configurar o proxy `/reservas`.
7. Atualizar documentação e conferir os cenários no navegador.
8. Fazer commit, publicar e acompanhar ambos os workflows quando eu solicitar.

JSON malformado, reservas nulas/primitivas e outros limites não devem ser considerados cobertos só porque os 17 testes passaram. Avaliar novos casos conforme sua relevância, sem expandir indefinidamente a etapa.

Os READMEs ainda descrevem o checkpoint publicado anterior. Precisarão ser atualizados ao consolidar o cliente TypeScript de reservas. `primeiroConexto.md` contém histórico antigo e não deve prevalecer sobre o código e este estado verificado.

**Comece informando o estado atual e propondo somente o próximo incremento pequeno. Não reinicie o projeto nem entregue a implementação de todas as etapas futuras.**
