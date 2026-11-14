# ADR 002 — Prova de execução de jogos no monitor

## Incremento 06

SIGNAL.exe é um jogo de teste 2D original, não uma substituição dos três jogos 3D obrigatórios. O objetivo desta etapa é validar carregamento, execução, pausa, reinício, vitória/derrota, descarte e retorno ao OS. A biblioteca identifica honestamente SHIFT//BREAK, DRIFT.exe, FIGHT.exe e FPS.exe como indisponíveis até os respectivos incrementos.

GameHost carrega SignalGame por import dinâmico, guarda o foco e torna o desktop inerte enquanto a sessão ocupa a superfície do monitor. O quarto e a moldura continuam visíveis. A sessão recebe update(dt) pelo único loop de Engine → RoomWorld → MonitorSurface; não cria requestAnimationFrame próprio nem renderizador 3D adicional.

Escape é consumido pela sessão para pausar; R reinicia. Sair do computador pausa o jogo antes de devolver a câmera. Blur/aba oculta pausam sem retomada automática. Sair do jogo restaura as janelas e o foco de origem, preservando o mesmo canvas/renderer do quarto.

Fechar aborta listeners, libera o canvas 2D e remove a camada da sessão. Um contador de geração impede que import tardio reabra uma sessão cancelada. O código do módulo permanece no cache normal do navegador; os objetos e recursos de sessão são descartados, sem alegar descarregamento do cache de módulos.

## Próximo passo

REDLINE precisa de um renderer de gameplay 3D e lógica de física independente. Escolher apresentação temporária imersiva ou render target no monitor; se houver troca de World ativo, preservar o RoomWorld e o OS suspensos, pois setWorld hoje descarta a cena anterior. Não acrescentar um segundo loop independente. Registrar a decisão e validar ida/volta antes de construir a pista inteira.

Os limites de arte, áudio licenciado, FLOW, campanha, revelação final e exploração física continuam nas etapas 07–14. O protótipo de captura do incremento 03 não é a revelação cinematográfica.
