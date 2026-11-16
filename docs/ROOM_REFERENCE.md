# Quarto com marcenaria clara

Branch `feat/room-warm-built-in-bedroom`, base `e163982`.

O vídeo enviado orientou a disposição da bancada, armários, nichos, coleções, computador e cama junto à janela. A imagem orientou a paleta de madeira clara/bege/preto/vermelho, iluminação quente sob as prateleiras e luz vermelha atrás do monitor. O resultado é uma interpretação procedural no estilo 3D do projeto, não uma reprodução fotográfica ou um levantamento das dimensões reais.

## Alterações

- Bancada integrada com armários superiores, portas e puxadores, roupeiro lateral, nichos, livros e console.
- Piso amadeirado, texturas procedurais determinísticas de madeira/tecido/tapete e materiais de metal e vidro.
- Cama com gavetas, colcha vermelha, manta grafite, travesseiros e almofada; estofados com bordas arredondadas.
- Janela com trilho e persianas de alumínio, criado-mudo e luminária, tapete com borda vermelha e quadros automotivos geométricos.
- Gabinete com ventoinhas RGB, teclado iluminado, headset, volante/pedais, miniaturas de carros, motor decorativo, figuras, medalha e plantas pendentes.
- Luz ambiente quente, iluminação direcional pela janela e pontos de luz locais. Uma luz direcional projeta sombras; os pontos adicionais não geram mapas de sombra.

O cenário fica em `src/room/Bedroom.ts`; `RoomWorld` conserva câmera sentada, limites de movimento, transição para o computador e interação. A tela mantém posição `(0, 1.46, -0.965)` e dimensões `1.36 × 0.765`; sua geometria continua separada da decoração. Geometrias de caixas e materiais são compartilhados dentro da cena e descartados pelo ciclo existente. Não foram alterados o renderer, a física dos jogos ou os dados do OS.

## Inspeção visual

- [Visão geral](evidence/room-reference/overview.png)
- [Posição sentada](evidence/room-reference/seated.png)
- [Olhando à direita](evidence/room-reference/right.png)

As capturas de composição usam uma fixture com a camada HTML oculta, exibindo o material de espera do monitor; a interação real do OS é validada separadamente pelos testes existentes de projeção/clique/teclado/redimensionamento e retorno dos jogos. A vista geral é apenas uma câmera de inspeção, sem mudar a câmera inicial do jogador.

Check de tipos/lint/formatação, 65 testes unitários e build aprovados. O teste visual novo verifica os elementos centrais, preservação da posição da tela e limite de chamadas de desenho; as três vistas foram revisadas. Resultados finais de navegador/produção em `docs/PROGRESS.md`.

Calibração prolongada em GPU física e fidelidade fotográfica permanecem fora desta entrega. O aviso conhecido do bundle Three.js acima de 500 kB continua presente. Sem merge na main, push ou deploy.
