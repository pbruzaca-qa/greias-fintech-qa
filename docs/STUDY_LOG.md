# Diário Técnico e de Aprendizado — GRÉIAS Fintech QA

Registro incremental da construção do projeto para prática real de QA em transição de carreira, espelhando o mesmo rigor documental e de triagem do **Gréias Lab** (anteriormente Lab Kinetic).

## Linha do Tempo por Blocos e Etapas

### Bloco 0 — Planejamento e Definição Antes do Código
- Decisão inicial de construir uma ilha 2D em pixel art foi adiada de forma consciente ao identificar o gargalo de produção artística; priorizou-se primeiro o **sistema bancário testável (SUT)** com base na estética oficial do Gréias.
- Escolha da stack **Next.js 14 (App Router) + TypeScript estrito + Tailwind CSS** para permitir, no mesmo projeto, testes manuais/exploratórios, inspeção real de rede HTTP (status `201`, `400`, `422`, `429`, `500`, `504`) e preparação para futura automação E2E (`data-testid`).

### Bloco 1 — Landing Page, Conta Padrão (`Perseu B.`), Onboarding e Reset
- Implementação fiel à paleta oficial (`#0A0A0A`, `#0E0E0E`, `#F2EFE9`, `#A6A29A`, `#9CB4A3` cirúrgico).
- Criação da conta padrão determinística `Perseu B.` (`$12,500.00`), fluxo `Open Digital Account` com validações em cliente/servidor, `Idempotency-Key` e `POST /api/reset`.

### Bloco 2 — `01 Instant Transfers` (Pix & Wire) + `03 Live Statement` Base
- Regras financeiras exclusivamente em **centavos inteiros** (evitando imprecisão de ponto flutuante).
- Diferenciação de trilhos: Pix (`$0.00`) vs. Wire (`$2.50` de taxa entrando no cálculo de saldo suficiente), bloqueio de autotransferência e controle de limites (`$5,000.00`/operação e `$10,000.00`/dia).
- Correção do bug real `BUG-GRE-001` descoberto durante teste exploratório com tradução manual no Chrome.

### Bloco 3 — `02 Smart Card Control`
- Separação de segurança entre `GET /api/account` (dados mascarados) e `POST /api/card/credentials` (revelação sob demanda de PAN/CVV).
- Congelamento (`FROZEN`), ajuste de limite da fatura (`$100.00` a `$25,000.00`), simulador de compras com registro de tentativas `DECLINED` no extrato e pagamento de fatura.
- Correção do bug real `BUG-GRE-003` (duplicação da máscara de CVV no `GreiasCardVisual` ao revelar/ocultar credenciais).

### Bloco 4 — `Live Statement` Avançado e Chaos Monkey Expandido
- Filtros reais por query string (`GET /api/statement?type=&status=&q=`), modal inspetor de JSON acessível com retorno de foco no `Esc` e exportação CSV/JSON.
- Correção do bug real `BUG-GRE-002` (sincronização independente do estado `chaos` via `GET /api/chaos` durante indisponibilidade de `/api/account`).
- Expansão do Chaos Monkey com `HTTP 504 Timeout` e `Disable Idempotency (Race Condition)`.

### Etapa B — Remoção do "Penhasco", `QaUtilityBar` e `StudyHubDrawer`
- Experimento breve de uma tela de entrada em "penhasco" (*cliff workbench*) foi avaliado no navegador e descartado conscientemente por fragilidade de alinhamento responsivo por coordenadas sobre imagem de fundo e por diluir o impacto direto no produto bancário.
- Devolução da Landing Page oficial do banco para `/` (mantendo o favicon vetorial do Olho em `src/app/icon.svg`), introdução da `QaUtilityBar` fixa no topo e criação do `StudyHubDrawer` (`QA // Study Hub`) com 7 módulos (`01`–`07`), checklist de estudos persistido em `localStorage` (`greias-lab-study-tracks-v1`), reações dinâmicas de `07 LAB COMMS` e exportação direta da **Postman Collection (`.json`)** com todas as 13 rotas REST.

### Etapa C (C1, C2, C3) — Constelação de Perseu em SVG, SEO/OG, Vercel e Métricas
- **Bloco C1 (Visual vetorial puro):** abandono de imagens raster anexadas em favor de SVG vetorial puro (`ConstellationBackdrop` fixo em `z-0` e `GreiasCardVisual`), alinhado à Constelação de Perseu da IAU / Sky & Telescope com traços ultrafinos falhados.
- **Bloco C2 (404, SEO técnico e Open Graph):** criação da página `404` editorial (`src/app/not-found.tsx`), `sitemap.ts`, `robots.ts` (bloqueando `/api/`) e `opengraph-image.tsx` (`1200×630` PNG). Superado o bug conhecido do Next.js `14.2.18` no Windows com `ImageResponse` (`ERR_INVALID_URL` em `noto-sans-v27-latin-regular.ttf`) aplicando `export const runtime = "edge"`.
- **Bloco C3 (Deploy no Vercel e Baseline de Qualidade):**
  - Publicação contínua em [`https://greias-fintech-qa.vercel.app`](https://greias-fintech-qa.vercel.app), registrando a limitação real do armazenamento em memória `globalThis` ser efêmero entre *cold starts*/instâncias serverless (ao contrário de `npm.cmd run dev` local).
  - Validação manual cross-device/locale em desktop e dois celulares (EN e PT-BR).
  - **Baseline apurado em produção no Chrome DevTools e Lighthouse:** Network com `19` requests, `281 kB` transferidos, `715 kB` de recursos, Finish `1.51 s`, `DOMContentLoaded` `439 ms`, Load `987 ms`; Lighthouse com **Performance `100`**, **Accessibility `95`** e **Best Practices `100`**.

### Ajustes Finais Pós-Etapa C — Rodapé Editorial, Constelação Completa e Documentação
- Criação do `SiteFooter` minimalista (`© 2026 Gréias Lab` · `No single look is enough.` · `GitHub`), carregando o itálico real da `Playfair Display` e calibrando tokens `silver` / `stone` para preservar contraste WCAG AA acima de `5.8:1` sobre `#0A0A0A`.
- Ajuste astronômico no `ConstellationBackdrop` e no `GreiasCardVisual` para restaurar as duas estrelas do braço esquerdo de Perseu (`μ Per` e `λ Per`) e suas guias falhadas na proporção exata do mapa da IAU.
- Atualização completa da documentação oficial (`README.md`, `QA_PLAYBOOK.md`, `docs/TEST_CATALOG.md`, `docs/STUDY_LOG.md`) espelhando o estado real entregue.

## Horizonte Futuro (Ainda não implementado)
- Execução sistemática de suíte de testes de API no **Postman** utilizando a coleção das 13 rotas exportada pelo `StudyHubDrawer`.
- Planejamento e implementação de suíte automatizada **E2E e de API com Playwright**, aproveitando os atributos `data-testid` já distribuídos pelas telas e fluxos críticos.
- Investigação opcional dos pontos finais de acessibilidade (de `95` para `100` no Lighthouse) e evolução contínua como peça autoral de portfólio em QA.