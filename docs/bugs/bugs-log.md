# Registro de Triagem e Defeitos — GRÉIAS Fintech QA

> Este log aplica a disciplina de triagem do estudo: **injeções controladas do Chaos Monkey** (`HTTP 500`, `504`, `429`, `Bypass Client Validation`, `Stale Balance`, `Disable Idempotency`) **não** são abertas como defeitos acidentais — são cenários simulados sob demanda.
> Apenas comportamentos inesperados fora da especificação entram como defeitos reais.

## Defeitos Reais Registrados

| ID | Título | Severidade | Módulo | Evidência / Sintoma | Status | Relatório |
| --- | --- | --- | --- | --- | --- | --- |
| `BUG-GRE-001` | Crash de DOM (`NotFoundError: removeChild`) ao alternar Pix ↔ Wire com tradução do navegador ativa | Alta | Instant Transfers / React UI | Troca de `<form>` sem `key` + nós de texto soltos após mutação `<font>` do Google Translate | `FIXED / VERIFIED` | [`BUG-GRE-001.md`](./BUG-GRE-001.md) |
| `BUG-GRE-002` | Falso negativo no indicador do Chaos Monkey quando `/api/account` falha no carregamento | Média | EnvironmentProvider / Chaos Drawer | Ao recarregar `/workspace` com HTTP 500 ativo, `snapshot` ficava `null` e o botão exibia Chaos como desligado | `FIXED / VERIFIED` | [`BUG-GRE-002.md`](./BUG-GRE-002.md) |

## Diferenciação: Injeções Controladas (Não são defeitos do produto)

* **`CHAOS-500` / `CHAOS-504` / `CHAOS-429`:** retornos HTTP provocados intencionalmente pelo middleware `applyChaosMiddleware` para validar tratamento de erro e atomicidade de saldo.
* **`CHAOS-STALE-BALANCE`:** congelamento visual intencional do saldo no cabeçalho para treino de comparação UI vs. resposta real de API.
* **`CHAOS-RACE-CONDITION`:** desligamento intencional da `Idempotency-Key` para reproduzir cenário de débito duplicado sob concorrência.