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

- [x] LOOP-01 — Preservar os 3,2 km originais, construir retorno e fechar posição/direção/curvatura/inclinação. Verificado por testes da geometria periódica, raio, folga e malha de terreno.
- [x] LOOP-02 — Uma volta completa, faixa compartilhada aos 34 m, sentido inverso, progressão acumulada e margem local na emenda. Verificados fim de corrida, proximidade/contato/vácuo e rival já finalizado.
- [x] LOOP-03 — Streaming circular, cenário da garganta/barragem/vertedouro/galeria, materiais procedurais e descarte. Inspeção visual dos dois sentidos e teste de recursos após reinício.
- [x] LOOP-04 — Regressão e entrega: check/49 unitários/build, 18 e2e e cinco smokes de produção aprovados. docs/AKAGIRI_LOOP.md e docs/evidence/loop/. Branch feat/akagiri-loop; sem merge na main. Playtest humano/GPU física explicitamente pendentes.

- [x] NIGHT-01 — Rampas: normal do pavimento orienta o carro inclusive no drift; gravidade e distância sobre a superfície entram na física; marcas de pneus acompanham a inclinação.
- [x] NIGHT-02 — Rival prepara e conclui ultrapassagem após perder a liderança, com faixa oposta, potência residual de recuperação e frenagem ao se aproximar no mesmo corredor. Regressão nos dois sentidos e proteção ao jogador parado.
- [x] NIGHT-03 — Freio luminoso para os dois carros e ambiente noturno com faróis alternáveis por L/botão, estado acessível e preferência preservada no reinício. Verificações/evidências em docs/PROGRESS.md.

- [x] FEEL-01 — Compartilhar critérios de turbo entre recompensa, HUD e efeitos; preservar dois níveis e balanceamento; ciano/dourado, avisos únicos, partículas reutilizáveis e escapamento.
- [x] FEEL-02 — Molas visuais da carroceria e quatro rodas, sem mudança de aderência, com limites, pausa/reset e movimento reduzido.
- [x] FEEL-03 — Áudio híbrido local CC0, motor espacial do rival, ambientes nos dois sentidos, controles persistentes, fallback e descarte durante carregamento. Manifesto e detalhes em docs/RACE_FEEL.md.

- [x] ROOM-VISUAL-01 — Interpretar o quarto de referência com marcenaria clara, cama vermelha/grafite, janela/persiana e decoração automotiva, preservando a tela física e o OS. Três vistas inspecionadas e documentadas em docs/ROOM_REFERENCE.md.
