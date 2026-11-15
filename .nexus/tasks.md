# Tarefas executáveis

- [x] Correções da auditoria do mapa: afastar retornos e eliminar invasões do terreno; alinhar colisão/barreiras, proteger câmera, padronizar placas, melhorar túneis e continuidade espacial. Evidência: 20 unitários, 15 e2e, cinco smokes de produção e capturas antes/depois em `docs/audits/DRIFT-MAP.md`. Branch `fix/touge-map`, sem merge na main.

- [x] Reuso solicitado pelo proprietário: substituir o protótipo DRIFT.exe pelo código de initial JOJO.zip, retirar combate/espíritos/poderes e adaptar pista, veículos, IA, áudio e corrida finita ao REDLINE. Fonte e decisões em docs/REUSED-TOUGE.md. Validar 15 unitários, regressão Chromium e produção antes do checkpoint.

- [x] T01 — Fundação modular Three.js/TypeScript/Vite, estados, assets, erros, diagnósticos; evidência: npm run check e 1 e2e Chromium passaram; screenshot real em docs/evidence/01-foundation.png.
- [x] T02 — Quarto físico, câmera sentada, mouse look limitado e sensibilidade; evidência: check com 2 unitários, 2 e2e Chromium e screenshots reais revisados em docs/evidence/02-*.png.
- [x] T03 — UI projetada no monitor, entrada/saída, cliques, resize/oclusão e prova de quadro final; evidência: check com 6 unitários, 6 e2e Chromium, screenshots e ADR-001.

- [x] T04 — OS Core: desktop, registro de apps, múltiplas janelas com foco/arraste/minimizar/maximizar/fechar, menu, taskbar, relógio e notificações. Evidência: check com 7 unitários, 7 e2e Chromium e screenshot real revisado.

- [x] T05 — Portfólio/arquivos: schema central, VFS, explorador, viewers, projetos, galeria, contato e currículo condicional, modo 2D acessível sem WebGL. Evidência: 9 unitários, 10 e2e e build/check; screenshots revisados; dados pessoais pendentes autorizados pelo proprietário.

- [x] T06 — Biblioteca de jogos, lançamento lazy, pausa/restart/saída, ownership de input e descarte; SIGNAL.exe com vitória/derrota. Evidência: 11 unitários, 13 e2e, build/check, audit sem vulnerabilidades e screenshot real revisado. Mesmo canvas e nenhuma navegação ao sair.

- [x] T07a — REDLINE: decidir apresentação 3D (imersiva temporária ou target no monitor), preservar RoomWorld/OS ao suspender, estabelecer contrato de GameSession e validar launch/return antes de implementar pista completa. Referência ADR-002.
- [x] T07b — Física arcade testável de aceleração/freio/esterço/drift, pista curta com elevação/curvas/limites, carro/rival, efeitos, HUD, pontuação/chegada/retry e acesso via DRIFT.exe. Depende de T07a. Gates: domínio determinístico e percurso jogável no browser sem regressões do MVP.

08–14 continuam obrigatórios e devem ser decompostos na ordem da especificação após 07. Apps complementares (terminal/settings/música/achievements) ainda pendentes; não confundir o MVP com ALEF//OS/SHIFT//BREAK 1.0 completo.

Evidência 07: 14 unitários e 14 e2e Chromium passaram; screenshot real revisado. Próxima tarefa: T08 — decompor BREAKPOINT, preservando renderer/retorno do quarto e regressões.
