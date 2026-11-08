# SlotGuard

**Motor de agendamentos com detecção de conflitos, modelos de domínio tipados e testes automatizados.**

> **Estado:** v0.1 — núcleo de domínio em Python. Esta versão é uma biblioteca de estudo e demonstração de engenharia de software, **não** um serviço de agendamento pronto para produção.

## O problema

Sistemas de agendamento precisam decidir se um intervalo solicitado se sobrepõe a horários já reservados. Uma comparação incorreta pode permitir dois atendimentos no mesmo período; uma validação incompleta pode aceitar horários impossíveis.

O SlotGuard separa a **integridade dos dados** das **regras de negócio** e testa ambas, com foco em correção, imutabilidade e evolução segura do código.

## O que a versão Python faz

- Representa horários como minutos a partir da meia-noite.
- Rejeita intervalos com tipos incorretos, duração zero, ordem invertida ou valores fora dos limites.
- Detecta sobreposição entre dois intervalos e procura conflitos em uma agenda.
- Consulta a disponibilidade de uma solicitação.
- Efetiva um agendamento retornando uma **nova agenda**, sem modificar a anterior.
- Rejeita uma tentativa de agendar um horário ocupado com `HorarioIndisponivelError`.
- Verifica exemplos e propriedades usando **pytest** e **Hypothesis**.
- Expõe uma consulta HTTP de disponibilidade por uma camada FastAPI que
  reutiliza o domínio existente, consumida pela interface TypeScript.

## Modelo de domínio

### `Intervalo`

Um intervalo é um objeto de valor imutável com dois campos inteiros: `inicio` e `fim`. O construtor impõe a invariante:

```text
0 <= inicio < fim <= 1440
```

Os horários seguem a convenção **[início, fim)**: o início pertence ao intervalo, mas o fim não. Assim, `09:00–10:00` e `10:00–11:00` são reservas consecutivas **sem conflito**.

Exemplos:

| Entrada | Interpretação | Resultado |
| --- | --- | --- |
| `Intervalo(540, 600)` | 09:00–10:00 | Válido |
| `Intervalo(600, 660)` | 10:00–11:00 | Válido |
| `Intervalo(1380, 1440)` | 23:00–24:00 | Válido |
| `Intervalo(600, 540)` | Fim antes do início | `ValueError` |
| `Intervalo(540, 540)` | Duração zero | `ValueError` |
| `Intervalo(-30, 60)` | Início negativo | `ValueError` |
| `Intervalo(540.5, 600)` | Minutos não inteiros | `TypeError` |
| `Intervalo(True, 600)` | Booleano usado como horário | `TypeError` |

A implementação usa `@dataclass(frozen=True, slots=True)` e valida os tipos também em tempo de execução. A tipagem estática, por si só, **não** valida dados externos.

### `Agenda`

Uma `Agenda` contém uma `tuple[Intervalo, ...]`. A construção verifica o tipo da coleção e de seus elementos. A agenda e os intervalos não são modificáveis por atribuições normais.

**Decisão de projeto:** nesta versão, uma `Agenda` pode conter intervalos sobrepostos. O modelo garante integridade **estrutural**; impedir uma **nova reserva conflitante** é responsabilidade da operação `agendar()`.

## Como usar

Execute os exemplos a partir do diretório que contém `models.py` e `slotguard.py`:

```python
from exceptions import HorarioIndisponivelError
from models import Agenda, Intervalo
from slotguard import agendar, esta_disponivel, tem_conflito

manha = Intervalo(540, 600)  # 09:00–10:00
proximo = Intervalo(600, 660)  # 10:00–11:00

assert tem_conflito(manha, proximo) is False

original = Agenda(reservas=(manha,))
assert esta_disponivel(original, proximo) is True

atualizada = agendar(original, proximo)
assert atualizada.reservas == (manha, proximo)
assert original.reservas == (manha,)  # estado original preservado

try:
    agendar(atualizada, proximo)
except HorarioIndisponivelError:
    print("Horário indisponível")
```

### Contratos das operações

| Operação | Responsabilidade | Resultado |
| --- | --- | --- |
| `tem_conflito(existente, novo)` | Verificar sobreposição de dois intervalos | `bool` |
| `existe_conflito(agenda, novo)` | Procurar alguma sobreposição na agenda | `bool` |
| `esta_disponivel(agenda, novo)` | Consultar se a solicitação está livre | `bool` |
| `agendar(agenda, novo)` | Incluir horário livre sem alterar o estado anterior | Nova `Agenda` ou `HorarioIndisponivelError` |

## Estrutura da versão Python

```text
python/
├── models.py          # Intervalo e Agenda: tipos, invariantes e imutabilidade
├── exceptions.py      # HorarioIndisponivelError
├── slotguard.py       # Conflitos, disponibilidade e agendamento
├── demo.py            # Demonstração animada no terminal
├── api.py             # Adaptador HTTP para consulta de disponibilidade
├── test_api.py        # Testes do contrato HTTP
├── test_models.py     # Testes dos modelos
└── test_slotguard.py  # Testes das operações e propriedades
```

## Executar os testes

**Ambiente utilizado no desenvolvimento:** Python 3.14.7, pytest 9.2.0 e Hypothesis 6.170.14.

Na pasta `python/`:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m pytest -v
```

Na verificação local de 8 de novembro de 2026, a suíte executou **48 casos do pytest sem falhas**, incluindo quatro testes da API. Esse total pode mudar conforme os testes evoluírem. Os testes do Hypothesis geram múltiplos exemplos **dentro** de um único caso contabilizado pelo pytest.

### Verificações de qualidade

Com o ambiente virtual ativado, execute na pasta `python/` os mesmos comandos utilizados pelo GitHub Actions:

```bash
ruff check .
ruff format --check .
basedpyright .
python -m pytest -q
```

### Estratégia de verificação

- **Testes de exemplos:** sobreposição parcial, contenção, intervalos consecutivos e limites.
- **Testes de modelos:** construção válida/inválida, tipos, imutabilidade e integridade da coleção.
- **Testes parametrizados:** vários cenários usando uma mesma regra de verificação.
- **Testes baseados em propriedades:** simetria do conflito, ausência de conflito entre intervalos consecutivos com limite compartilhado, indisponibilidade após agendar e rejeição de tentativas duplicadas.

Uma suíte verde demonstra que os comportamentos exercitados passaram; **não prova ausência de defeitos** nem segurança sob concorrência.

## Consulta HTTP de disponibilidade

`api.py` adapta os dados JSON para `Agenda` e `Intervalo` e chama
`esta_disponivel()`. A API não duplica a regra de conflitos.

`POST /disponibilidade` recebe:

```json
{
  "reservas": [{ "inicio": 540, "fim": 600 }],
  "solicitacao": { "inicio": 600, "fim": 660 }
}
```

Uma consulta válida responde com status `200` e `{"disponivel": true}` ou
`{"disponivel": false}`. Uma indisponibilidade é um resultado normal da
consulta. Dados de entrada inválidos respondem com `422`; por exemplo,
um intervalo de duração zero produz `{"detail": "Intervalo inválido."}`.

Cada requisição informa as reservas a consultar. Este endpoint não cria
reservas nem mantém uma agenda persistente no servidor.

Para iniciar a API e a interface juntas, execute `bash iniciar.sh` na raiz
do repositório. A documentação interativa fica em
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
Veja a [retomada e instalação no README principal](../README.md#retomar-o-desenvolvimento).

## Demonstração no terminal

Com o ambiente virtual ativado, na pasta `python/`:

```bash
python demo.py
```

A demonstração utiliza as operações reais do domínio e apresenta as solicitações progressivamente:

1. Cliente A, das 09:00 às 10:00: reserva confirmada.
2. Cliente B, das 09:30 às 10:30: tentativa bloqueada por conflito.
3. Cliente C, das 10:00 às 11:00: reserva confirmada, sem conflito no limite compartilhado.

Ao final, a agenda contém duas reservas, uma tentativa foi bloqueada e a agenda original permanece vazia. As animações e pausas são intencionais para apresentação e ficam apenas em `demo.py`; elas não representam o tempo de execução do algoritmo.

## Decisões técnicas e trade-offs

1. **Minutos inteiros em vez de strings de horário:** simplifica comparações e evita ambiguidades de formatação, mas não representa datas e fusos.
2. **Intervalos com fim exclusivo:** permite reservas consecutivas sem falso conflito.
3. **Objetos de valor imutáveis:** protegem invariantes e reduzem efeitos colaterais, mas cada agendamento cria uma nova agenda.
4. **Validação nos modelos:** evita repetir verificações nas funções de negócio; entradas externas devem ser convertidas e validadas nas fronteiras da aplicação.
5. **Busca linear:** `existe_conflito()` tem complexidade **O(n)** no pior caso, para `n` reservas. É adequada ao protótipo; volumes maiores podem exigir outra estrutura de dados.
6. **Exceção de domínio:** `HorarioIndisponivelError` distingue um conflito de agendamento de um intervalo malformado.

## Limitações conhecidas

- Os intervalos estão restritos a **um dia**, representado por valores de `0` a `1440`; ainda não há datas, fusos, horário de verão ou reservas que atravessem a meia-noite.
- Não existem cadastro de clientes, profissionais, serviços, duração comercial ou horários de funcionamento.
- O núcleo é independente de HTTP e de interface gráfica. O projeto possui
  uma API de consulta FastAPI e uma interface TypeScript, mas ainda não há
  autenticação nem persistência.
- A agenda está em memória e a operação é uma transformação imutável de valores.
- **Não há garantia de exclusividade em operações simultâneas.** Duas chamadas baseadas na mesma agenda antiga podem aceitar o mesmo horário. A proteção real contra concorrência exigirá coordenação do estado e garantias transacionais na persistência.

## Próximas fases do Engineering Dojo

- **TypeScript (em andamento):** interface de consulta conectada à API Python,
  com horários editáveis, validação de preenchimento e testes de interação.
- **Java:** modelar o domínio e reproduzir condições de corrida, explorando concorrência e seus limites.
- **Quarkus:** expor uma API REST, adicionar persistência e testar a prevenção de reservas duplicadas sob concorrência com garantias apropriadas no banco.

A interface TypeScript já utiliza o domínio por meio da API Python. As fases
Java e Quarkus permanecem no **plano de evolução** e ainda não estão implementadas no SlotGuard.

## Objetivo do projeto

O SlotGuard é um laboratório público para demonstrar raciocínio algorítmico, modelagem de domínio, TDD, testes baseados em propriedades e decisões de arquitetura. O foco é apresentar **problemas verificáveis, soluções reproduzíveis e limitações explícitas**, em vez de apenas listar tecnologias.
