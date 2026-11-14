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
