# BUG-GRE-003 — Máscara de CVV duplicada ao revelar e ocultar credenciais do cartão

- **Status:** `FIXED / VERIFIED`
- **Severidade:** Média (defeito visual / inconsistência na exibição de dado sensível fictício)
- **Descoberto em:** Teste funcional manual na aba `02 Smart Card`

## Ambiente
- Rota: `/workspace?module=card`
- Módulo: `02 Smart Card Control` (`GreiasCardVisual`)

## Passos para Reproduzir
1. Acessar `/workspace?module=card`.
2. Observar o campo `CVV` exibido no cartão.
3. Clicar em **Reveal Credentials**.
4. Clicar novamente em **Hide Credentials**.

## Comportamento Esperado
- Estado oculto: exibir exatamente 3 marcadores (`CVV •••`).
- Estado revelado: exibir exatamente os 3 dígitos do CVV (`CVV 842`).

## Comportamento Observado
- Ao revelar credenciais, o cartão exibia os 3 marcadores junto com os 3 dígitos (`••• 842`).
- Ao clicar para ocultar novamente, o cartão passava a exibir 6 marcadores (`••••••`).

## Causa Raiz
Duplicação do marcador fixo `•••` adjacente à expressão dinâmica `{revealedCvv ?? "•••"}` no slot de CVV do componente `src/components/GreiasCardVisual.tsx` durante a integração local do Bloco 3.

## Correção Aplicada e Verificação
- Removido o marcador redundante no slot `data-testid="card-cvv-display"`, mantendo apenas `{revealedCvv ?? "•••"}`.
- Re-testado alternando entre **Reveal Credentials** e **Hide Credentials**: alternância validada corretamente entre `CVV •••` e `CVV 842`.