# Retomada — 0.7.0

Branch feat/07-redline, empilhada sobre feat/06-game-launcher. Incremento 07 implementado como protótipo jogável. Nenhum push/merge/deploy autorizado ou realizado; não integrar main.

REDLINE: circuito procedural de 720 m, carro/rival, física arcade em passos fixos, aceleração/freio/esterço/drift, pontuação, limites/colisões/dano, vitória/derrota, pausa e restart. Arte e efeitos provisórios. Sem campanha/FLOW/áudio final. Teclas e controles no HUD.

Engine.suspendWorld/resumeWorld preservam RoomWorld, DOM do OS e mesmo canvas, usando um só loop. RoomWorld.setSuspended bloqueia input e esconde o monitor durante apresentação imersiva temporária. dispose também libera o mundo suspenso. Import lazy tem cancelamento e invalidação por mudança de modo. Ver ADR-003-REDLINE.md.

Validação: npm run check com 14 unitários e build passou; npm run test:e2e com 14 testes passou (1,5 min). Teste de domínio completa a pista; navegador valida duas sessões, condução, pausa/restart, mesmo canvas e notas preservadas. Screenshot real em docs/evidence/07-redline.png. Consultar PROGRESS.md para smoke de produção final. Não confundir trajetória automatizada do domínio com playtest humano completo.

Próxima ação: especificar e implementar 08 BREAKPOINT em nova branch, mantendo o retorno ao quarto e a regressão do REDLINE. 09–14 e apps complementares continuam pendentes. Dados pessoais permanecem explicitamente pendentes, conforme escolha do proprietário. Quarto/arte/oclusão por amostragem, GPU física e cross-browser ainda sem validação final.
