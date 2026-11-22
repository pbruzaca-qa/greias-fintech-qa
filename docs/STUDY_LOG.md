# Diário Técnico e de Aprendizado — GRÉIAS Fintech QA

Registro incremental da construção do projeto para treino de QA em transição de carreira, inspirado na organização documental do Lab Kinetic.

## Linha do Tempo por Blocos

### Bloco 0 — Planejamento e Definição Antes do Código
- Decisão inicial de construir uma ilha 2D em pixel art foi adiada de forma consciente ao identificar o gargalo de produção artística; priorizou-se primeiro o **sistema bancário testável (SUT)** com base na estética oficial do Gréias.
- Escolha da stack **Next.js (App Router) + TypeScript + Tailwind CSS** para permitir, no mesmo projeto, testes manuais/exploratórios, inspeção real de rede HTTP (status `201`, `400`, `422`, `429`, `500`, `504`) e preparação para automação E2E (`data-testid`).

### Bloco 1 — Landing Page, Conta Padrão (`Perseu B.`), Onboarding e Reset
- Implementação fiel à paleta oficial (`#0A0A0A`, `#0E0E0E`, `#F2EFE9`, `#A6A29A`, `#9CB4A3` cirúrgico).
- Criação da conta padrão determinística `Perseu B.` (`$12,500.00`), fluxo `Open Digital Account` com validações em cliente/servidor, `Idempotency-Key` e `POST /api/reset`.

### Bloco 2 — `01 Instant Transfers` (Pix & Wire) + `03 Live Statement` Base
- Regras financeiras em **centavos inteiros** (evitando imprecisão de ponto flutuante).
- Diferenciação de trilhos: Pix (`$0.00`) vs. Wire (`$2.50` de taxa entrando no cálculo de saldo suficiente), bloqueio de autotransferência e controle de limites (`$5,000.00`/operação e `$10,000.00`/dia).
- Correção do bug real `BUG-GRE-001` descoberto durante teste exploratório com tradução no Chrome.

### Bloco 3 — `02 Smart Card Control`
- Separação de segurança entre `GET /api/account` (dados mascarados) e `POST /api/card/credentials` (revelação sob demanda de PAN/CVV).
- Congelamento (`FROZEN`), ajuste de limite da fatura, simulador de compras com registro de tentativas `DECLINED` no extrato e pagamento de fatura.

### Bloco 4 — `Live Statement` Avançado, Chaos Monkey Expandido e Alinhamento ao Lab Kinetic
- Filtros reais por query string (`GET /api/statement?type=&status=&q=`), modal inspetor de JSON acessível com retorno de foco e exportação CSV/JSON.
- Correção do bug real `BUG-GRE-002` (sincronização do estado `chaos` durante indisponibilidade de `/api/account`).
- Expansão do Chaos Monkey com `HTTP 504 Timeout` e `Disable Idempotency (Race Condition)`, pareando os cenários estudados no Lab Kinetic.

## Horizonte Futuro (Ainda não implementado)
- Suíte automatizada com Playwright (UI + API).
- Avaliação de segurança e conexão conceitual com a ilha (`← Back to the cliff`) e o Lab Kinetic.
- Integração de apresentação em site de portfólio.