# BUG-GRE-002 — Falso negativo no estado do Chaos Monkey durante indisponibilidade de `/api/account`

- **Status:** `FIXED / VERIFIED`
- **Severidade:** Média (perda de observabilidade do estado ativo de falha injetada)
- **Descoberto em:** Teste manual de resiliência ao recarregar `/workspace` com `Force HTTP 500 Outage` ativo

## Ambiente
- Rota: `/workspace?module=statement`
- Pré-condição: `Force HTTP 500 Outage` ativado no Chaos Monkey

## Passos para Reproduzir
1. Abrir o drawer `QA // Chaos Monkey` e ativar `Force HTTP 500 Outage`.
2. Recarregar a página no navegador (`F5`).
3. Observar a tela de erro de `/api/account` e olhar para o botão flutuante no canto inferior direito.

## Comportamento Esperado
Mesmo quando `/api/account` retornar `500`, o botão flutuante deve continuar sinalizando **`QA // Chaos Active`** em âmbar e refletir os switches ligados dentro do drawer.

## Comportamento Observado
A página mostrava corretamente o erro de carregamento da conta, porém o botão flutuante aparecia cinza como **`QA // Chaos Monkey`** (aparentando estar desativado).

## Causa Raiz
O `ChaosMonkeyDrawer` derivava o estado de `snapshot?.chaos`. Quando o recarregamento falhava em `GET /api/account`, `snapshot` permanecia `null`, fazendo o componente cair no fallback `enabled: false`.

## Correção Aplicada e Verificação
- Criado estado independente `chaos` em `src/components/EnvironmentProvider.tsx`, sincronizado via `GET /api/chaos` (endpoint isento das falhas injetadas).
- Adicionado recarregamento automático de `/api/account` ao desativar `Force HTTP 500`, `504`, `429` ou `Stale Balance`.
- Re-testado recarregando `/workspace?module=statement` com `HTTP 500` ativo: botão permanece em **`QA // Chaos Active`** e recupera a conta ao restaurar o modo normal.