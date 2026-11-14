# Retomada

Reabrir git status, .nexus/tasks.md e docs/PROGRESS.md. Incrementos 01–06 concluídos em seis branches locais empilhadas; branch mais recente feat/06-game-launcher contém todo o MVP. Remoto começou vazio, sem main com commits; não houve merge/push/deploy. Não integrar main sem autorização.

Checks: 11 unitários, 13 e2e Chromium, typecheck/lint/format/build e npm audit passaram. Screenshots em docs/evidence. SIGNAL.exe é só o teste 2D do launcher; nenhum dos três jogos 3D ou campanha foi declarado pronto. Dados pessoais/contatos/CV ficam pendentes por escolha explícita do proprietário, centralizados em src/content/portfolio.ts.

Validação final: npm ci limpo e npm run check passaram. npm run test:production passou com quatro smokes sobre o build estático. Prévia local iniciada em http://127.0.0.1:4174/; se o processo já tiver terminado, executar npm run preview -- --port 4174 --strictPort. Não é publicação externa.

Próxima ação única: T07a em branch feat/07-redline — escolher renderer/apresentação e validar ida/volta de um módulo 3D preservando RoomWorld/OS, conforme ADR-002. Engine.setWorld atualmente descarta a cena anterior, portanto não usá-lo para suspender o quarto sem adaptar ciclo de vida.

Arquitetura: loop único Engine → RoomWorld → MonitorSurface → GameHost; room renderiza sob demanda, futuros objetos animados devem invalidar needsRender. Monitor DOM por homografia invertível, UV/raycast e oclusão conservadora de cinco amostras (ADR-001); exige máscara antes de objetos móveis/exploração livre. Captura técnica de frame não é a revelação do incremento 12.

Pendências preservadas: 07 REDLINE, 08 BREAKPOINT, 09 OVERDRIVE, 10 campanha, 11 FLOW/áudio/resultados, 12 revelação, 13 exploração/arte/iluminação, 14 cross-browser/otimização/conteúdo/publicação. Terminal, settings, música e achievements também ainda não implementados. Sem medir FPS de GPU física ou alegar arte final.
