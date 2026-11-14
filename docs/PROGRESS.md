# Progresso real

## Inventário inicial — 14/11/2026

- Remoto público VtecturboBr/SHIFT-BREAK vazio; clone local na pasta de trabalho.
- Sem baseline anterior. Node 24.21.0, npm 11.19.0.
- Primeiro incremento pendente: 01. Nenhuma versão concluída ainda.
- Especificação original preservada integralmente em SPECIFICATION.md.

## Estado dos incrementos

| Incremento | Estado                                        |
| ---------- | --------------------------------------------- |
| 01 · 0.1.0 | Concluído e validado                          |
| 02 · 0.2.0 | Concluído e validado                          |
| 03–14      | Pendentes, escopo preservado na especificação |

## Incremento 01 — Project Foundation

- Three.js 0.187, TypeScript 6, Vite 8; módulos app/core/graphics separados.
- Dois estados de diagnóstico, sem reload, com descarte das cenas; ciclo único e ajuste de DPR/resize.
- GLTFLoader/TextureLoader preparados, erros recuperáveis e tratamento de perda de contexto.
- `npm run check`: typecheck, lint, formatação, 1 teste unitário e build passaram.
- `npm run test:e2e`: 1 teste Chromium passou; alternância de cenas, canvas e diagnóstico reais, sem pageerror.
- Screenshot real revisado: `docs/evidence/01-foundation.png`.
- `npm audit`: 0 vulnerabilidades após override específico de minimatch 11.0.8 no tooling TypeScript ESLint. Reinstalar o pacote pai resolveu lock antigo que npm install/update preservavam.
- Limite: bundle inicial de Three.js gera aviso de 500 kB no Vite (537 kB, 134 kB gzip). Sem jogo/assets pesados ainda. Otimizar conforme os módulos forem acrescentados, sem mascarar o aviso.
- Não há dados profissionais, arte final ou gameplay nesta versão. Próximo incremento: 02.

## Incremento 02 — Room Prototype

- Quarto procedural original: chão, paredes, teto, janela aberta com exterior, mesa, cadeira, monitor físico, teclado, mouse, gabinete, estante/livros e luminária.
- Câmera sentada: arraste, setas/Home, pointer lock opcional com recuperação, limites de yaw/pitch e sensibilidade ajustável. Redução de movimento respeitada.
- Auditoria corrigiu tipo de material, API de sombras removida e descarte dos render targets de sombra.
- `npm run check`: typecheck, lint, format, 2 testes unitários e build passaram.
- `npm run test:e2e`: 2 testes Chromium passaram, incluindo regressão da fundação e gestos/teclado/troca de cenas.
- Screenshots reais revisados: `docs/evidence/02-room.png` e `02-window.png`.
- Uma execução excedeu 30s com 16 comandos de teclado em dois navegadores software simultâneos. A suíte agora usa 1 worker, timeout de 60s e gesto de mouse equivalente; os comportamentos e asserts foram preservados.
- Limites: arte geométrica provisória, sem caminhar e sem interação no monitor nesta versão. Pointer lock físico e outros navegadores ainda não verificados; checklist em MANUAL_QA.md. Próximo: 03.
