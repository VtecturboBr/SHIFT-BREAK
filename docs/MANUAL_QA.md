# QA manual reproduzível

Executar `npm ci` e `npm run dev`. Usar os botões de diagnóstico para comparar regressões de renderização. Os screenshots em evidence são capturas reais do Chromium; não representam uma medição de GPU de produção.

## Fundação e quarto

1. Abrir o endereço local e confirmar mesa, monitor, teclado e iluminação.
2. Arrastar para ambos os lados e para cima/baixo: rotação limitada e sem inversão da câmera.
3. Alterar sensibilidade e repetir o gesto. Centralizar câmera e testar setas com o canvas em foco; Home centraliza.
4. Clicar Olhar livre; Escape libera o cursor. Se o navegador negar pointer lock, arraste e teclado continuam disponíveis.
5. Trocar de aba durante um arraste e retornar: nenhum arraste deve ficar preso.
6. Olhar à esquerda: confirmar abertura de janela e geometria externa, sem atravessar paredes.
7. Alternar cenas de diagnóstico várias vezes e voltar ao quarto sem reload.
8. Redimensionar a janela; renderização deve preencher o viewport sem distorcer proporções.
9. Ativar redução de movimento no sistema; câmera deve responder sem suavização animada.

Pointer lock concedido/negado, troca real de aba e navegação em GPUs físicas precisam de validação humana. A suíte automatiza gestos, teclado, centralização, descarte e screenshots no Chromium.

## Monitor e quadro final (protótipo técnico)

1. Clicar diretamente na tela física, usar E ou Usar computador. Monitor deve se aproximar mantendo moldura, mesa e quarto perceptíveis.
2. Clicar Pulso de teste, Zerar e editar Mensagem: cliques e teclado devem afetar apenas a UI.
3. Usar Tab/Shift+Tab para controles e Escape para sair. Contador e texto continuam ao retornar.
4. Redimensionar em interação e repetir cliques. Testar zoom 80/125/150%, escalas de sistema e DPR de diferentes monitores.
5. Sair durante a aproximação, alternar de aba e voltar. Câmera não deve capturar movimento enquanto a UI está ativa.
6. Em Diagnóstico, clicar Capturar quadro no monitor. A imagem 3D deve aparecer congelada na tela física, com moldura e quarto ao redor. Restaurar interface recupera os controles.
7. Olhar para longe: UI deve acompanhar o plano e sumir quando ocultada. A oclusão é conservadora por cinco amostras, conforme ADR-001; a exploração livre exigirá máscara de profundidade.

Este protótipo não é a cinemática final. Jogos, áudio e ALEF//OS completo seguem nos incrementos posteriores.

## Núcleo do ALEF//OS

1. Entrar no monitor e abrir Notas pelo ícone. Editar texto; minimizar e restaurar pela taskbar mantém o conteúdo.
2. Abrir Sobre o sistema pelo menu. Clicar entre janelas: borda e empilhamento indicam foco.
3. Arrastar pelo título até os limites da tela: janela inteira permanece acessível e não move a câmera.
4. Focar o título com Tab e mover com setas. Maximizar ocupa a área útil sem cobrir a taskbar; restaurar recupera posição/tamanho.
5. Fechar remove a janela e a taskbar correspondente; o foco retorna à próxima janela ou ao menu.
6. Confirmar relógio local e dispensar uma notificação com o botão próprio.
7. Sair do monitor durante um arraste, retornar e mover o mouse: arraste não fica preso. Repetir troca de cenas para verificar regressão e descarte de timers/listeners.
