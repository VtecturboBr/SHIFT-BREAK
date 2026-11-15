# Turbo, suspensão e áudio ambiental

Implementação na branch `feat/turbo-suspension-environment-audio`, baseada em `691b975`. Sem merge na main, push ou deploy.

## Turbo

A avaliação de disponibilidade é compartilhada pela recompensa, porcentagem, HUD e efeitos. Normal preserva +5 m/s e 1,3 s; perfeito preserva +8 m/s e 2,2 s. Os requisitos de tempo, giro, pontuação, margem lateral e cooldown não foram reduzidos. A porcentagem continua indicando progresso até o perfeito; um turbo normal pode estar pronto antes de 100%.

Normal usa ciano, perfeito usa dourado, ambos com nome textual e instrução para soltar Espaço. Partículas reutilizam um buffer de 72 pontos por carro, sem novas luzes dinâmicas. Escapamentos brilham durante o impulso; sprites ficam invisíveis fora dele. O rival também apresenta esses efeitos. Avisos sonoros de carga são exclusivos do jogador, uma vez por nível em cada drift. A liberação do rival é atenuada pela distância.

Movimento reduzido limita cada emissor a quatro pontos e elimina pulsação. Colisão/cancelamento/reinício removem a apresentação de disponibilidade. Duração e nível do impulso aparecem no velocímetro.

## Suspensão visual

O grupo principal continua alinhado à normal do pavimento. A carroceria recebe molas de inclinação, rolagem e altura; as rodas ficam em pivôs separados, preservando giro e esterço. Quatro amostras da pista consideram posição e orientação do carro, inclusive no drift.

Limites: rodas ±8 cm, carroceria ±4 cm, inclinação longitudinal ±2,5° e rolagem ±3°. Molas a 2,5 Hz, amortecimento 0,85, integração em subpassos de até 1/60 s e entrada limitada a 0,1 s. Pausa congela o estado; reinício/reposicionamento o reinicializa. Movimento reduzido conserva o ajuste das rodas ao terreno e remove oscilações secundárias.

Nenhum desses valores altera `s`, faixa, velocidade, colisão ou aderência. A câmera continua seguindo a trajetória, não a oscilação da carroceria. Não é suspensão física com contato independente, saltos ou transferência de aderência.

## Áudio híbrido

Quatro WAVs locais, mono PCM16 a 24 kHz, somam 695.216 bytes. O carregamento e a decodificação acontecem uma vez por sessão após interação; falhas individuais mantêm síntese disponível e não bloqueiam a corrida. Gravações entram progressivamente na mixagem.

| Camada      | Origem CC0 e preparação                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Motor baixo | [engine_idle_loop_1.wav — RichieMcMullen](https://freesound.org/people/RichieMcMullen/sounds/386793/), trecho do preview HQ                                      |
| Motor alto  | Mesmo material, preparado com pitch 1,6; não é uma gravação separada em alta rotação                                                                             |
| Pneus       | [tire_skid_01 — loganzsound](https://freesound.org/people/loganzsound/sounds/774264/), gravação de pneu de bicicleta no concreto, adaptada à apresentação arcade |
| Vento       | [wind1 — Luke.RUSTLTD](https://opengameart.org/content/wind1), arquivo de vento sintetizado em PureData                                                          |

O [manifesto](../public/audio/redline/manifest.json) registra origem, endereço do arquivo, licença, alterações, tamanho e SHA-256 de cada recurso. Preparação: corte, conversão mono/24 kHz/PCM16, normalização para -24 LUFS e crossfade circular de 80 ms. Gravações de pneus sob CC-BY encontradas durante a pesquisa não foram incluídas.

O motor mistura loops baixo/alto e síntese complementar com velocidade, aceleração observada e turbo. O rival possui voz própria, panorama relativo à câmera e atenuação até 100 m. Pneus e vento usam canais separados. Túneis têm reverberação forte, galeria intermediária, vertedouro reflexões curtas e barragem vento reforçado. Os ambientes usam metadados da pista e funcionam no sentido inverso. Transições atingem aproximadamente 95% do alvo em 0,6 s.

Uma resposta impulsiva local e um barramento compartilhado evitam criar reverberação por objeto. Compressor limita picos. Motores, pneus/efeitos e ambiente têm volumes separados, inicialmente 75%, 70% e 55%. M e o botão de silenciar continuam globais. Preferências usam armazenamento local com fallback em memória. Abrir a mixagem pausa a corrida; os sliders aceitam teclado, incluindo M e Escape.

Pausa reduz loops e interrompe efeitos transitórios; reinício limpa a cauda de reverberação. Saída aborta requisições, impede que decodificações tardias criem fontes, encerra osciladores/loops e fecha o contexto. Não há serviços pagos, hotlinks durante o jogo ou dependências novas de execução.

## Evidências e limites

- 65 testes unitários cobrem disponibilidade/recompensa/cooldown/bordas, avisos únicos, molas e limites nos dois sentidos, pausa/reset, preservação física, ambientes inversos, panorama, preferências e manifesto dos WAVs.
- Testes de navegador verificam HUD/efeitos, movimento reduzido, sliders por teclado, gravações reais decodificadas, fallback, saída e cancelamento durante carregamento. Renderização offline produz WAVs de trecho aberto, túnel e turbo, com energia de cauda maior no túnel e sem clipping.
- Capturas são estados fixados para inspeção: [normal](evidence/race-feel/turbo-normal.png), [perfeito](evidence/race-feel/turbo-perfect.png), [liberação](evidence/race-feel/turbo-release.png), [frenagem na rampa](evidence/race-feel/suspension-braking.png) e [mixagem](evidence/race-feel/audio-mix.png).
- Exemplos renderizados: [aberto](evidence/race-feel/open.wav), [túnel](evidence/race-feel/tunnel.wav), [turbo](evidence/race-feel/turbo.wav). A emissão contínua é reduzida após 1,2 s para expor a reverberação. São evidências sintéticas do grafo real, não gravações de uma corrida humana.
- [Comparação visual](evidence/race-feel/performance.json) contra `691b975`: Chromium/SwiftShader, 960×640, DPR 0,5, sem contexto de áudio, física desativada igualmente e posições fixadas. Três rodadas alternadas, 12 quadros de aquecimento e 30 medidos. Mediana média 12,60 → 12,03 ms, P95 médio 20,03 → 18,00 ms; 339 draws, 150 geometrias, nove texturas e 16 programas em ambos, com turbo inativo. Diferenças pequenas não demonstram ganho de FPS nem cobrem custo sonoro ou emissão máxima de partículas.
- Comparação reproduzível: servir a revisão anterior e a candidata em portas distintas e executar `node scripts/benchmark-redline.mjs URL_ANTERIOR URL_NOVA CAMINHO_JSON`.

Escuta humana, calibração prolongada em GPU física e outros navegadores permanecem pendentes. O aviso conhecido de bundle Three.js acima de 500 kB permanece. Não foram adicionados terceiro nível de turbo, aderência variável, chuva, música ou suspensão física completa.
