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
| 03 · 0.3.0 | Concluído e validado                          |
| 04 · 0.4.0 | Concluído e validado                          |
| 05–14      | Pendentes, escopo preservado na especificação |

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

## Incremento 03 — Interactive Monitor

- HTML real projetado na tela física, cliques e edição de texto nativos, coordenadas UV, câmera reversível, foco e isolamento room/monitor. Entrada por botão, E ou clique no objeto. Escape e botão de saída; contador e texto preservados.
- Prova de captura: cena diagnóstica renderizada em target 16:9, transferida ao monitor como DataTexture e UI restaurável. É a viabilidade técnica, não a cinemática do incremento 12.
- `npm run check`: typecheck, lint, format, 6 testes unitários e build passaram.
- `npm run test:e2e`: 6 testes Chromium passaram em 2 minutos, incluindo DPR 1/2, resize, cliques/teclado reais, entrada interrompida, captura de quadro e regressão do quarto.
- Screenshots reais revisados: `docs/evidence/03-monitor.png`, `03-monitor-dpr2.png` e `03-frame.png`.
- Auditoria e refinamento: matriz CSS singular impedia hit testing apesar de desenhar corretamente; preservada base Z invertível e acrescido teste. Novo input interferiu em seletor genérico de sensibilidade; seletor específico e proteção contra NaN corrigiram a regressão. Métrica FPS agora usa tempo real separado do dt limitado da simulação.
- ADR-001 registra alternativas, projeção, captura e limites. Oclusão conservadora por cinco raios; precisa de máscara antes de objetos móveis/exploração livre. Zoom e engines além de Chromium ainda não validados.
- Performance: capturas no Chromium com renderização por software mostram 4–8 fps com trace/DPR 1–2. Não representa GPU física e não atende ainda à meta de otimização final. Sem números de performance de produção inventados.
- SHA256 da especificação local e original são idênticos. Próximo incremento: 04, OS Core.

## Incremento 04 — OS Core

- Desktop original, ícones, registro de apps, menu, taskbar, relógio local e notificações dispensáveis.
- Janelas independentes: foco/empilhamento, arraste por coordenadas projetadas, mover por teclado, minimizar/restaurar, maximizar/restaurar e fechar. Layout limitado à tela útil; minimizar preserva conteúdo.
- Apps reais de diagnóstico do monitor, notas temporárias e informações da versão. O diagnóstico anterior continua testável como app.
- `npm run check`: typecheck, lint, format, 7 testes unitários e build passaram.
- `npm run test:e2e`: 7 testes Chromium passaram (2,8 min), incluindo múltiplas janelas e todas as regressões dos incrementos 01–03.
- Screenshot real revisado em `docs/evidence/04-desktop.png`.
- Auditoria: listeners por janela são abortados ao fechar; timers e eventos globais descartados junto do desktop. Arraste é cancelado na saída, blur e visibilitychange. Conteúdo usa textContent ou templates internos estáticos.
- Limites anteriores de oclusão, software rendering e bundle permanecem explícitos. Dados profissionais, arquivos e fallback acessível são o próximo incremento (05); jogos continuam 06–12.
