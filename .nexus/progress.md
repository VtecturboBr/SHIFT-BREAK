# Progresso

Correção atual na branch `fix/touge-map`: retornos sem cruzamentos, terreno livre do pavimento em 8005 amostras, limites de colisão alinhados aos rails e ao drift, câmera protegida, sinalização e túneis melhorados, streaming espacial. Check/20 unitários, 15 e2e e cinco smokes de produção passaram. Auditoria/evidências em `docs/audits/DRIFT-MAP.md`. Sem merge/push/deploy. Próximo incremento continua 08; playtest humano e GPU física pendentes.

0.7.1: DRIFT.exe substituído pelo touge do proprietário, sem combate espiritual. Branch feat/07-reuse-touge. 15 unitários e checks passaram; resultados finais de browser/produção em docs/PROGRESS.md. Próximo: 08. Sem merge/push/deploy.

## Checkpoint atual — Akagiri Loop

Branch feat/akagiri-loop: plano do circuito implementado. Check/49 unitários/build, 18 e2e e cinco testes de produção passaram após retomada da interrupção. Detalhes em docs/AKAGIRI_LOOP.md e docs/PROGRESS.md. Sem merge/push/deploy. Playtest humano/GPU física pendentes. Próximo incremento principal continua 08.

## Checkpoint atual — rampas, ultrapassagem e noite

Branch fix/grade-overtakes-night-lights, base 0c6e2a0. Rampas afetam orientação e velocidade, rival prepara e conclui novas ultrapassagens, ambos têm luz de freio, noite mais escura e faróis do jogador alternáveis por L/botão. Check com 52 unitários/build aprovado; 18 cenários de navegador cobertos pela suíte e reexecução da integração/mapa; cinco testes do build de produção aprovados. Evidências e resultados detalhados em docs/PROGRESS.md. Sem merge/push/deploy; calibração humana em GPU física pendente.
