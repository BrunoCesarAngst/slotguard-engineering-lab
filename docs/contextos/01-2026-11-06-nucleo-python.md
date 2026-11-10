# Contexto 01 — Origem e núcleo Python

**Registro histórico de 6 de novembro de 2026.**
Arquivo original: `primeiroConexto.md`. Transferido para este arquivo em
10 de novembro de 2026, preservando integralmente o conteúdo original
versionado. A orientação de retomada fica no cabeçalho deste arquivo. Não usar seu estado ou suas pendências como atuais.
Comece em [COMECE_AQUI.md](../../COMECE_AQUI.md).

---

# CONTEXTO DE CONTINUIDADE — PROJETO SLOTGUARD

**Data de referência:** 6 de novembro de 2026  
**Projeto:** SlotGuard — Engineering Lab  
**Estado atual:** núcleo Python v0.1 funcional, com 44 testes aprovados.

**Ambiente:** Mac Apple Silicon, editor Zed, Python 3.14.7.

## Atualização verificada — 6 de novembro de 2026

Esta atualização prevalece sobre os registros históricos abaixo quando houver divergências de estado:

- A propriedade de intervalos consecutivos com limite compartilhado já está implementada em `python/test_slotguard.py`.
- Verificação local: Ruff lint e format aprovados; BasedPyright com zero erros e avisos; pytest com **44 testes aprovados em 0,17 segundo**.
- `python/demo.py` existe e contém a demonstração animada com as três solicitações, utilizando as operações reais do domínio.
- No momento desta conferência, antes do commit de atualização da documentação, a branch `main` local e a remota apontavam para `627619d`, que sucede o commit da demonstração (`f14b699`).
- O workflow **Python Quality** passou nesse commit: [execução confirmada no GitHub Actions](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/actions/runs/42245524010).
- A [release v0.1.0](https://github.com/BrunoCesarAngst/slotguard-engineering-lab/releases/tag/v0.1.0) está publicada.
- Esta atualização de documentação inclui a demonstração, as dependências de desenvolvimento e os comandos de qualidade no README Python.
- A fase TypeScript permanece planejada. O próximo passo técnico é definir os cenários de referência e iniciar o primeiro teste do domínio, antes da interface visual.

As seções seguintes preservam o histórico anterior; referências a 43 testes, avisos pendentes e publicação ou demonstração não confirmadas descrevem aquele momento.

---

## 1. Instrução

Você está continuando um projeto de engenharia de software chamado **SlotGuard**, desenvolvido comigo de maneira incremental.

Não trate este projeto como uma ideia nova. Já existe implementação, testes, decisões arquiteturais e uma estratégia de evolução.

Seu papel deve ser o de **mentor técnico e revisor de engenharia de software**, ajudando-me a desenvolver conhecimento profundo enquanto construo um projeto público de portfólio.

Minhas preferências de trabalho:

- Quero escrever o código e compreender as decisões, não apenas copiar soluções prontas.
- Seguimos TDD: vermelho → verde → refatoração.
- Prefiro mudanças pequenas, verificáveis e justificadas.
- Uso tipagem explícita, análise estática e testes automatizados.
- Quero entender causas, princípios, complexidade, trade-offs e alternativas arquiteturais.
- Quando meu código estiver incorreto, identifique o problema e explique objetivamente.
- Não avance para outras funcionalidades antes de estabilizar a etapa atual.
- Não refaça configurações que já estão funcionando.
- Não apresente como concluído algo que não tenha sido confirmado por código ou resultados de execução.
- Quando eu pedir dicas, não entregue imediatamente a solução completa.
- Quando eu pedir explicitamente um arquivo ou implementação pronta, pode entregá-la.

O objetivo não é apenas aprender linguagens. Quero construir **competência profissional demonstrável**, com código que possa ser examinado por recrutadores e potenciais clientes.

---

## 2. Visão geral do projeto

### Nome

**SlotGuard — Engineering Lab**

### Problema central

Evitar agendamentos com horários conflitantes.

Exemplo: uma barbearia possui uma reserva das 09h às 10h. Outro cliente solicita das 09h30 às 10h30.

O sistema deve identificar a sobreposição e rejeitar a segunda reserva.

Por outro lado, se um atendimento termina às 10h e outro começa exatamente às 10h, não existe conflito.

### Objetivo técnico

Construir um sistema de reservas progressivamente mais robusto para estudar e demonstrar:

- Algoritmos e estruturas de dados.
- Modelagem de domínio.
- Tipagem estática e validação em tempo de execução.
- Invariantes e imutabilidade.
- Testes unitários e TDD.
- Testes baseados em propriedades.
- Exceções de negócio.
- Arquitetura de software.
- Concorrência e condições de corrida.
- Persistência e transações.
- APIs REST.
- Integração contínua e documentação.

### Objetivo profissional

Usar o SlotGuard como demonstração pública da minha capacidade de transformar um problema real em software bem estruturado, testável e evolutivo.

Quero fortalecer meu posicionamento como desenvolvedor independente, criando oportunidades de contratação, trabalhos por projeto e prestação de serviços.

O repositório, a documentação e a comunicação pública fazem parte do produto final.

---

## 3. As quatro fases planejadas

### Fase 1 — Python: núcleo de domínio

**Estado: funcional; qualidade e publicação em andamento.**

Responsabilidades:

- Representação e validação de intervalos.
- Detecção de sobreposição.
- Agenda tipada e imutável.
- Consulta de disponibilidade.
- Efetivação de reservas.
- Exceções específicas de domínio.
- Testes com pytest e Hypothesis.
- Documentação e automação de qualidade.

Esta é a fase em que estamos trabalhando.

### Fase 2 — TypeScript: simulador visual

**Estado: planejada, ainda não implementada no SlotGuard.**

Objetivo: criar uma demonstração visual interativa, que qualquer pessoa consiga usar para experimentar reservas, conflitos e disponibilidade.

Competências previstas:

- TypeScript com tipagem rigorosa.
- Modelagem de dados e interfaces.
- Testes automatizados.
- Gestão de estado.
- Interface de calendário e linha do tempo.
- Reutilização dos cenários e contratos definidos no Python.

A demonstração deve ser adequada para portfólio e redes sociais.

### Fase 3 — Java: domínio e concorrência

**Estado: planejada.**

Objetivo: modelar os mesmos conceitos em Java e estudar o que acontece quando duas operações tentam reservar o mesmo horário simultaneamente.

Competências previstas:

- Records e objetos de valor.
- JUnit.
- Imutabilidade.
- Threads e sincronização.
- Condições de corrida.
- Operações atômicas.
- Testes de concorrência.
- Limitações de locks locais.

Uma proteção limitada a uma JVM não resolve necessariamente o problema quando existem múltiplas instâncias da aplicação.

### Fase 4 — Quarkus: API e persistência

**Estado: planejada para o SlotGuard. Existe um laboratório Quarkus separado já configurado.**

Objetivo: transformar a lógica de reservas em uma API REST com persistência, testes de integração e garantias apropriadas de integridade.

Competências previstas:

- Quarkus.
- REST e contratos HTTP.
- PostgreSQL.
- Transações.
- Tratamento de exceções.
- OpenAPI.
- Testes de integração.
- Observabilidade.
- Prevenção de conflitos concorrentes no banco de dados.

Um resultado desejado é diferenciar erros de entrada, como HTTP 400, de conflitos de negócio, como HTTP 409.

Esses mapeamentos ainda não foram implementados.

---

## 4. Ambiente de desenvolvimento

### Local do projeto

```text
~/Exercism/projects/slotguard/python
```

O workspace principal está em:

```text
~/Exercism
```

O editor utilizado é o **Zed**.

O projeto SlotGuard fica dentro da pasta `projects`, mas deve ser publicado como repositório Git independente, sem incluir todo o workspace Exercism.

### Ambiente Python

- Python 3.14.7.
- Ambiente virtual `.venv`.
- pytest 9.2.0.
- Hypothesis 6.170.14.
- Ruff.
- BasedPyright.

Comandos habituais:

```bash
cd ~/Exercism/projects/slotguard/python
source .venv/bin/activate
python -m pytest -q
```

Para testes individuais:

```bash
python -m pytest -v test_models.py
python -m pytest -v test_slotguard.py
```

### Engineering Dojo no Zed

O workspace Exercism possui um sistema de tarefas chamado Engineering Dojo, com um script central:

```text
~/Exercism/.zed/dojo.sh
```

Foi desenvolvido para executar testes e acompanhar alterações em projetos Python, TypeScript, Java e Maven/Quarkus.

As tarefas trabalhadas incluem `Dojo: Test`, `Dojo: Watch` e `Dojo: Dev`.

O laboratório Quarkus separado está em:

```text
~/Exercism/quarkus-labs/lab-rest
```

Esse laboratório já executou o Quarkus em modo de desenvolvimento, respondeu ao endpoint `/hello` e apresentou um teste aprovado.

Isso não significa que a fase Quarkus do SlotGuard esteja implementada.

### Java

Foram configurados SDKMAN, Temurin Java 21 e Java 25, Maven, Gradle e Quarkus CLI.

Java 21 foi utilizado para os projetos. Java 25 foi instalado também para atender às necessidades do servidor de linguagem Java do Zed.

A configuração detalhada desse ambiente pode ser retomada quando chegarmos à fase Java.

---

## 5. Organização atual do núcleo Python

Os arquivos desenvolvidos são:

```text
slotguard/
└── python/
    ├── .venv/
    ├── models.py
    ├── exceptions.py
    ├── slotguard.py
    ├── test_models.py
    ├── test_slotguard.py
    ├── pyproject.toml
    ├── requirements-dev.txt
    └── README.md
```

`models.py`, `exceptions.py`, `slotguard.py` e os arquivos de teste estão comprovadamente em uso.

O README da fase Python também apareceu nas verificações do Ruff.

Foram propostas configurações para `pyproject.toml` e comandos para gerar `requirements-dev.txt`; a presença e o conteúdo final desses arquivos devem ser conferidos no projeto local, sem presumir que todas as orientações foram executadas.

---

## 6. Decisões fundamentais do domínio

### Representação temporal

Os horários são representados por minutos contados desde a meia-noite.

Exemplos:

```python
09:00 = 540
10:00 = 600
18:45 = 1125
24:00 = 1440
```

Os intervalos utilizam a convenção de início inclusivo e fim exclusivo:

```text
[inicio, fim)
```

Isso permite reservas consecutivas:

```text
09:00–10:00
10:00–11:00
```

Sem conflito.

### Invariante temporal

Todo intervalo deve respeitar:

```text
0 <= inicio < fim <= 1440
```

Consequências:

- Duração zero é inválida.
- Intervalo invertido é inválido.
- Horário inicial negativo é inválido.
- Fim maior que 1440 é inválido.
- Início igual a zero é válido.
- Término igual a 1440 é válido.

Reservas que atravessam a meia-noite exigirão uma representação com datas e ainda não fazem parte do contrato atual.

### Tipagem

Os horários devem ser exatamente do tipo `int`.

Usamos a ideia de:

```python
type(valor) is int
```

em vez de depender exclusivamente de `isinstance(valor, int)` porque, em Python, `bool` é subclasse de `int`.

Valores como `True`, `540.5`, strings e `None` devem ser rejeitados como tipos incorretos.

### Exceções

- `TypeError` para tipo incorreto.
- `ValueError` para horário numericamente inválido.
- `HorarioIndisponivelError` para conflito de agendamento.

---

## 7. Modelos de domínio

### `Intervalo`

Arquivo: `models.py`.

Modelo criado com:

```python
@dataclass(frozen=True, slots=True)
class Intervalo:
    inicio: int
    fim: int
```

Possui `__post_init__()` para validar:

1. Que `inicio` e `fim` são inteiros exatos.
2. Que os horários respeitam a invariante temporal.

O modelo é estruturalmente imutável por sua interface normal.

O `frozen=True` impede atribuições usuais aos campos. `slots=True` restringe atributos dinâmicos.

### `Agenda`

Também em `models.py`.

```python
@dataclass(frozen=True, slots=True)
class Agenda:
    reservas: tuple[Intervalo, ...] = ()
```

Seu `__post_init__()` verifica:

1. Que `reservas` é uma tupla.
2. Que cada elemento é uma instância de `Intervalo`.

A agenda é imutável pela interface normal.

**Decisão arquitetural importante:** `Agenda` pode ser criada contendo intervalos sobrepostos.

A validade estrutural da agenda é diferente da política de permitir novos agendamentos.

A regra de indisponibilidade pertence às operações do domínio, não ao construtor de `Agenda`.

---

## 8. Algoritmos já implementados

Arquivo: `slotguard.py`.

### `tem_conflito()`

Recebe dois objetos `Intervalo`.

A expressão central é:

```python
return (
    novo.inicio < existente.fim
    and novo.fim > existente.inicio
)
```

Esse algoritmo é simétrico para intervalos válidos.

A complexidade temporal e espacial de uma comparação é O(1).

### `existe_conflito()`

Recebe uma `Agenda` e um novo `Intervalo`.

Percorre `agenda.reservas` e chama `tem_conflito()` para cada elemento.

Retorna `True` quando encontra o primeiro conflito.

Retorna `False` se percorrer todas as reservas sem encontrar nenhum.

Utiliza encerramento antecipado (*early return*).

Complexidade temporal O(n) no pior caso, com n reservas.

### `esta_disponivel()`

Recebe `Agenda` e `Intervalo`.

Retorna a negação de `existe_conflito()`.

Seu contrato é:

- Sem conflito: `True`.
- Com conflito: `False`.

### `agendar()`

Recebe `Agenda` e `Intervalo` e retorna uma **nova `Agenda`**.

Se o horário estiver ocupado, lança `HorarioIndisponivelError`.

Se estiver livre, concatena a tupla existente com `(novo,)` e constrói outra agenda.

Não modifica a agenda original.

### `HorarioIndisponivelError`

Arquivo: `exceptions.py`.

Foi definida como uma exceção especializada que herda de `ValueError`:

```python
class HorarioIndisponivelError(ValueError):
    pass
```

A classe distingue conflito de negócio de intervalos estruturalmente inválidos.

---

## 9. Testes implementados e confirmados

**Última suíte completa confirmada: 43 passed in 0.13s.**

Distribuição:

| Arquivo | Testes |
|---|---:|
| `test_models.py` | 22 |
| `test_slotguard.py` | 21 |
| **Total** | **43** |

### `test_models.py` — 22 testes

Coberturas:

- Criação de intervalos válidos em horários normais.
- Início igual a zero.
- Fim igual a 1440.
- Intervalos invertidos.
- Duração zero.
- Início negativo.
- Fim superior a 1440.
- Rejeição de início decimal.
- Rejeição de início booleano.
- Rejeição de fim decimal.
- Rejeição de fim booleano.
- Rejeição de fim em texto.
- Rejeição de `None`.
- Argumento `fim` ausente.
- Imutabilidade de `inicio` e `fim`.
- Criação de agenda válida.
- Rejeição de elementos incorretos na agenda.
- Rejeição de lista no lugar de tupla.
- Agenda vazia.
- Aceitação estrutural de intervalos sobrepostos.
- Imutabilidade da coleção `Agenda.reservas`.

Os testes foram organizados com `pytest.mark.parametrize` onde havia repetição.

Os testes de imutabilidade usam `FrozenInstanceError`.

Foi utilizado `setattr()` intencionalmente para tentar modificar atributos congelados, com `# noqa: B010` nas linhas correspondentes.

### `test_slotguard.py` — 21 testes

Coberturas:

- Reservas consecutivas.
- Sobreposição parcial.
- Intervalo novo contido no existente.
- Intervalo novo englobando o existente.
- Limite final do dia.
- Conflito na última reserva da agenda.
- Horário disponível.
- Horário ocupado.
- Conflito na segunda reserva.
- Agenda vazia, sem conflito.
- Agenda vazia, com horário disponível.
- Agendamento disponível.
- Agendamento ocupado com exceção de domínio.
- Criação de agenda nova.
- Preservação da agenda original.
- Rejeição de tentativa repetida de agendar o mesmo horário.
- Simetria dos conflitos em três cenários parametrizados.
- Simetria utilizando Hypothesis.
- Propriedade de que uma reserva efetivada fica indisponível.
- Propriedade de que uma segunda reserva idêntica é rejeitada.

### Hypothesis

A biblioteca foi utilizada para property-based testing.

Existe uma estratégia chamada:

```python
intervalos_validos()
```

Ela produz objetos `Intervalo` respeitando:

```text
0 <= inicio < fim <= 1440
```

Foi utilizada uma estratégia tipada com `SearchStrategy[Intervalo]`, combinando `flatmap()` e `map()`, em substituição a uma primeira versão com `@st.composite`.

A mudança foi motivada por diagnósticos do BasedPyright no Zed.

As propriedades verificadas incluem:

1. `tem_conflito(a, b) == tem_conflito(b, a)`.
2. Depois de agendar, o horário torna-se indisponível.
3. Uma tentativa sequencial de reservar novamente o mesmo intervalo lança `HorarioIndisponivelError`.
4. A agenda original permanece inalterada.

Os 43 casos contados pelo pytest não representam apenas 43 conjuntos de entradas: os testes Hypothesis executam múltiplos exemplos gerados internamente.

---

## 10. Qualidade de código e ferramentas

O objetivo 3 foi configurar:

- Ruff lint.
- Ruff format.
- BasedPyright.
- pytest.
- Dependências declaradas.
- GitHub Actions.

Foram utilizados os comandos:

```bash
ruff check .
ruff format --check .
basedpyright .
python -m pytest -q
```

Foram executados:

```bash
ruff check --fix .
ruff format .
```

O Ruff corrigiu dois problemas de organização de imports e formatou arquivos.

### Último diagnóstico conhecido do BasedPyright

```text
0 errors, 14 warnings, 0 notes
```

Os avisos eram:

- `reportUnusedCallResult` em testes que intencionalmente esperam exceções e descartam o retorno.
- `reportUnnecessaryIsInstance` na validação em tempo de execução da classe `Agenda`.

Foram propostas correções:

- Atribuir chamadas intencionalmente descartadas à variável `_`.
- Manter a verificação de elementos de `Agenda` e usar uma supressão localizada para o aviso de `isinstance()`.

**Não existe confirmação posterior, neste histórico, de que o BasedPyright tenha chegado a zero avisos.**

Portanto, antes de publicar a versão definitiva, devemos executar as quatro verificações novamente.

### `pyproject.toml`

Foi proposta uma configuração com Python 3.14, Ruff e BasedPyright no modo `recommended`.

O conteúdo final existente no disco deve ser confirmado caso necessário.

### `requirements-dev.txt`

Foi proposto gerar o arquivo com as dependências diretas e versões instaladas:

```bash
python -m pip freeze | grep -Ei '^(pytest|hypothesis|ruff|basedpyright)==' > requirements-dev.txt
```

A presença e as versões finais registradas devem ser verificadas.

---

## 11. Documentação e publicação GitHub

Foi produzido um `README.md` para a fase Python v0.1, cobrindo:

- Problema resolvido.
- Arquitetura.
- Exemplos de utilização.
- Execução dos testes.
- Decisões técnicas.
- Limitações.
- Próximas fases.

O README apareceu nas verificações de formatação do Ruff, portanto existia no ambiente de desenvolvimento durante essa execução.

Também planejamos um README principal para o repositório multilíngue.

### Repositório desejado

Nome sugerido:

```text
slotguard-engineering-lab
```

Estrutura planejada:

```text
slotguard/
├── .github/
│   └── workflows/
│       └── python-quality.yml
├── .gitignore
├── README.md
├── python/
├── typescript/
├── java/
└── quarkus/
```

O repositório deve ter a raiz em `~/Exercism/projects/slotguard`, e não em `~/Exercism`, para não publicar acidentalmente os demais exercícios.

Foi proposto:

- Criar `.gitignore`.
- Inicializar Git independente.
- Criar um commit inicial.
- Publicar no GitHub com GitHub CLI.
- Executar GitHub Actions.
- Criar a release `v0.1.0`.

### Estado real da publicação

**Não foi apresentada confirmação de que o repositório remoto, o workflow ou a release tenham sido efetivamente criados.**

Não presumir que o GitHub Actions esteja funcionando apenas porque o arquivo YAML foi proposto.

Também não inventar URL do repositório.

Antes de chamar a publicação de concluída, verificar o repositório remoto, o status do workflow e a release.

---

## 12. Demonstração e redes sociais

O SlotGuard também é um projeto de posicionamento profissional.

Quero divulgar meu trabalho no:

- LinkedIn.
- X.
- Instagram.
- Facebook.

A apresentação deve alcançar tanto desenvolvedores e recrutadores quanto pessoas de negócios que entendem o problema dos agendamentos.

### Conceito de comunicação

Título sugerido:

**“Um horário. Dois clientes. Apenas uma reserva.”**

Mensagem:

Um cliente reserva das 09h às 10h. Outro solicita das 09h30 às 10h30. O sistema identifica a sobreposição e rejeita a segunda solicitação.

Isso deve demonstrar a relação entre um problema real e o comportamento do software.

### Demonstração

Foi sugerido um arquivo `demo.py`, com uma demonstração de terminal:

1. Cliente A reserva das 09h às 10h: confirmado.
2. Cliente B tenta reservar das 09h30 às 10h30: bloqueado.
3. Cliente C reserva das 10h às 11h: confirmado.
4. A agenda final contém duas reservas.
5. A agenda original permanece intacta.

A demonstração utiliza as funções reais de `slotguard.py`.

**Ainda não houve confirmação de que `demo.py` tenha sido criado e executado localmente.**

Também foi proposto um vídeo curto, com gravação do terminal, explicações visuais e exibição final dos testes.

Para LinkedIn, a narrativa é mais técnica e orientada a engenharia. Para Instagram e Facebook, o problema deve ser apresentado em linguagem acessível. No X, a comunicação deve ser curta, objetiva e natural.

### Interação real no X

Recebi este comentário sobre o projeto:

> Se o fim do intervalo é exclusivo, uma reserva pode terminar às 10h e outra começar às 10h sem conflito. Esse caso de fronteira também cabe nas propriedades do Hypothesis.

Foi elaborada esta resposta sugerida:

> Boa! Esse caso já está coberto nos testes parametrizados, mas ainda não como propriedade no Hypothesis. Vou incluir também. É justamente nesses detalhes de fronteira que bugs passam despercebidos.

O comentário é tecnicamente pertinente.

**Essa é uma pendência concreta e interessante para continuar o projeto:** acrescentar um teste baseado em propriedades que gere intervalos consecutivos e confirme que não há conflito.

---

## 13. Limitações técnicas assumidas conscientemente

O núcleo Python atual:

- Opera com minutos de um único dia.
- Não associa reservas a datas reais.
- Não modela clientes ou profissionais.
- Não possui persistência.
- Não implementa autenticação.
- Não possui interface visual.
- Não disponibiliza uma API.
- Não garante exclusividade sob concorrência real.

### Limitação mais importante

Se duas solicitações utilizarem a mesma versão antiga de uma agenda vazia, ambas poderão produzir novas agendas contendo a mesma reserva.

Isso acontece porque `agendar()` é uma operação imutável sobre o estado recebido.

A imutabilidade evita efeitos colaterais, mas não substitui controle de concorrência.

Quando chegarmos às fases Java e Quarkus, precisaremos estudar mecanismos capazes de impedir conflitos mesmo com operações simultâneas.

A solução definitiva deve considerar os limites das transações e garantir integridade no nível adequado, possivelmente utilizando mecanismos do PostgreSQL.

Ainda não decidimos a implementação concreta dessa proteção.

---

## 14. O que falta fazer imediatamente

O núcleo funcional Python já atingiu um estágio sólido. Não quero introduzir funcionalidades desnecessárias antes de consolidar a primeira entrega.

Ordem recomendada:

### Próximo passo A — Teste de fronteira com Hypothesis

Acrescentar a propriedade sugerida na conversa do X.

Objetivo:

Para quaisquer dois intervalos válidos e consecutivos, quando o fim do primeiro coincide com o início do segundo, `tem_conflito()` deve retornar `False`.

Exemplo:

```text
A = [09:00, 10:00)
B = [10:00, 11:00)
```

O objetivo é gerar automaticamente diferentes horários que respeitem essa relação, não apenas repetir os exemplos fixos.

Seguir TDD e manter tipagem explícita.

### Próximo passo B — Confirmar a qualidade automatizada

Executar:

```bash
ruff check .
ruff format --check .
basedpyright .
python -m pytest -q
```

Corrigir diagnósticos reais, sem desabilitar regras globalmente sem justificativa.

Confirmar a presença de `requirements-dev.txt` e a configuração do `pyproject.toml`.

### Próximo passo C — Verificar a publicação no GitHub

Confirmar se existe um repositório independente.

Se não existir, criá-lo de maneira segura.

Depois configurar e executar o workflow de qualidade, confirmando que passa no GitHub.

Criar a release `v0.1.0` apenas após a publicação e as verificações.

### Próximo passo D — Demonstração real

Criar e executar `demo.py`.

Produzir uma apresentação visual breve e fiel ao estágio atual.

Evitar fingir que já existe um aplicativo web ou uma API funcional.

### Próximo passo E — Iniciar a fase TypeScript

Depois da primeira versão Python estar documentada e publicamente demonstrável, iniciar o simulador visual.

Reaproveitar as regras de domínio e definir cenários compartilhados entre as linguagens.

---

## 15. Critérios de qualidade para continuar

Quero preservar os seguintes princípios:

**TDD:** escrever o teste antes do comportamento novo.

**Invariantes:** impedir a criação normal de objetos inválidos.

**Tipagem:** combinar BasedPyright com validações necessárias em tempo de execução.

**Imutabilidade:** preferir novas versões de estado em vez de modificar estruturas existentes.

**Separação de responsabilidades:** os modelos garantem integridade estrutural; os algoritmos aplicam as regras de negócio.

**Reutilização:** não duplicar condições de sobreposição em diferentes funções.

**Testes relevantes:** remover duplicações inúteis sem perder cenários importantes.

**Property-based testing:** procurar propriedades gerais e contraexemplos, não apenas exemplos que sabemos que funcionam.

**Complexidade:** discutir desempenho e trade-offs quando forem materialmente relevantes.

**Concorrência:** não confundir validação sequencial com segurança transacional.

**Profissionalismo:** apresentar resultados verificáveis e reconhecer limitações.

**Aprendizado:** desenvolver entendimento próprio, não simplesmente acumular código gerado por IA.

---

## 16. Como o novo chat deve começar

Não recomece o SlotGuard do zero.

Não proponha novamente modelos básicos de intervalo ou agenda: já foram implementados, testados e refatorados.

Não recomende substituir a arquitetura atual sem uma justificativa concreta.

Considere como último resultado funcional confirmado:

```text
43 passed in 0.13s
```

Considere que o próximo trabalho técnico relevante é **acrescentar ao Hypothesis a propriedade dos intervalos consecutivos com limite compartilhado**, mantendo a convenção `[inicio, fim)`.

Ao mesmo tempo, o projeto está na etapa de consolidar qualidade e publicação no GitHub antes de iniciar a demonstração visual em TypeScript.

Oriente-me a partir desse ponto, com passos pequenos e objetivos. Se precisar conhecer a versão exata de um arquivo, peça seu conteúdo atual ou utilize as ferramentas de leitura disponíveis em vez de supor que o código ainda está idêntico aos exemplos deste documento.

**Objetivo final:** concluir as quatro fases e transformar o SlotGuard em um projeto de engenharia de software que demonstre conhecimento técnico, capacidade de implementação, pensamento crítico e potencial profissional para clientes e recrutadores.
