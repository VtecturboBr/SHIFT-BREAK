# ADR 001 — Interface HTML projetada no monitor físico

## Escolha

Usar DOM nativo com uma matriz projetiva `matrix3d` derivada das matrizes do Three.js. Um desktop lógico 1280 × 720 é transformado para o plano físico de 1,36 × 0,765 m e então para coordenadas CSS do viewport. O navegador mantém hit testing, inputs, foco e semântica acessível. Um raycast independente calcula UV para diagnóstico do ponteiro.

Resoluções centralizadas em `src/monitor/display.ts`: desktop 1280 × 720 e textura/capturas 1920 × 1080. Ao usar o computador, a distância considera largura e altura disponíveis, com limites de 94% horizontal e 86% vertical para a superfície interativa. Não altera a posição sentada ao sair. O gerenciador de janelas usa as mesmas dimensões lógicas; SIGNAL mantém sua área de jogo de 960 × 380, centralizada e desenhada com canvas 1920 × 760.

A matriz usa pixels CSS; DPR afeta apenas o renderizador WebGL. Resize atualiza câmera e projeção. Entrada de câmera e interação DOM têm donos distintos: room ou monitor; Escape e botão de saída são sempre recuperáveis. O quarto e as bordas continuam visíveis, sem desktop fullscreen.

## Alternativas avaliadas

- Canvas/texture para todo o OS: profundidade nativa, mas exige reconstruir layout, texto, seleção e acessibilidade/hit testing para cada controle. Custo desnecessário nesta etapa.
- CSS3DRenderer: perspectiva nativa, mas não compartilha depth buffer e a documentação restringe zoom a 100%. A matriz direta usa o viewport CSS real e evita essa dependência. Referência: https://threejs.org/docs/pages/CSS3DRenderer.html.
- DOM sem transformação: rejeitado porque não preserva a perspectiva da tela física.

## Oclusão e limites explícitos

Antes de mostrar a UI, lançar raios ao centro e quatro pontos internos dos cantos. Se outro objeto impedir qualquer amostra ou a tela estiver vista por trás/fora do intervalo de profundidade, ocultar a superfície inteira. É uma estratégia conservadora adequada à câmera sentada e ao cenário estático atual. **Não é oclusão por pixel**: uma obstrução pequena entre as cinco amostras poderia passar despercebida. Antes da exploração livre do incremento 13, substituir por máscara de profundidade ou recorte de cobertura; não adicionar objetos móveis diante da tela sem isso.

## Quadro final

`Engine.captureFrame` renderiza a cena ativa em um render target 16:9, lê RGBA e produz uma DataTexture. O target é descartado e o aspect/target anterior são restaurados em finally. O diagnóstico exibe esse quadro no monitor físico, escondendo a UI até Restaurar interface. Não usa screenshot falso nem preserveDrawingBuffer permanente.

Esta prova valida a transferência de um quadro 3D, **não implementa** a cinemática do incremento 12, áudio espacial ou minimização. A leitura GPU é síncrona e ocorre uma vez por captura, não a cada frame. Se a medição futura indicar pausa perceptível, migrar para target compartilhado ou cópia GPU.

## Verificação

Unitários com viewport desktop, compacto e retrato: coordenadas DOM correspondem ao raycast; oclusão e visão traseira ocultam a UI. E2E testa cliques e edição reais, DPR 1/2, resize e saída sem vazamento para a câmera. Zoom do navegador e outros engines ainda precisam da matriz manual de QA.
