# BUG-GRE-001 — `NotFoundError: removeChild` ao alternar Pix e Wire com tradução do navegador ativa

- **Status:** `FIXED / VERIFIED`
- **Severidade:** Alta (quebra a tela com erro não tratado em tempo de execução)
- **Descoberto em:** Teste exploratório manual com tradução de página do Google Chrome ativa

## Ambiente
- Navegador: Google Chrome (Windows) com tradução da página (EN → PT-BR) ativada manualmente
- Rota: `/workspace?module=transfers`

## Passos para Reproduzir
1. Acessar `/workspace?module=transfers`.
2. Ativar a tradução da página no Google Chrome (Inglês → Português).
3. Alternar entre **Pix Transfer** e **Wire Transfer** (`transferência bancária`).

## Comportamento Esperado
A interface deve alternar entre os formulários de Pix e Wire normalmente, sem lançar exceções de DOM.

## Comportamento Observado
O aplicativo quebrava de forma intermitente exibindo overlay de erro não tratado:
`NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`

## Causa Raiz
O tradutor do Chrome envolve nós de texto diretamente com tags `<font>`, alterando a árvore do DOM fora do controle do React. Como os formulários de Pix e Wire usavam a mesma tag `<form>` na mesma posição sem atributo `key` distinto — além de trechos com nós de texto condicionais sem um `<span>` encapsulador — o React tentava remover nós de texto antigos que já haviam sido movidos pelo tradutor.

## Correção Aplicada e Verificação
- Adicionadas `key` explícitas (`receipt-view`, `pix-form`, `wire-form`) e encapsulamento de textos dinâmicos em `<span>` em `src/components/InstantTransfersPanel.tsx` e `src/components/ChaosMonkeyDrawer.tsx`.
- Optou-se intencionalmente por **não** bloquear a tradução com `translate="no"` no `<html>`, preservando a possibilidade de testar resiliência de tradução em QA.
- Re-testado com tradução ligada e desligada alternando Pix ↔ Wire: erro eliminado.