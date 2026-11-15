# Auditoria do mapa — 14/11/2026

Registro da análise inicial, anterior às correções abaixo. Capturas reais da cena nas distâncias 620, 920, 1550, 2080, 2390 e 3180 m em map-evidence/. As posições foram selecionadas para inspeção, não percorridas por um piloto humano.

## Alta prioridade

1. **Terreno atravessa a pista.** Confirmado visualmente em 2390 m e perto da chegada (3180 m). track.terrainHeight escolhe a estrada mais próxima em X/Z; createTerrain interpola essa altura em uma malha de 8 m. Nas sobreposições do traçado, alterna entre trechos com alturas muito diferentes. Uma varredura de 8005 amostras de pavimento (cada 2 m, cinco posições laterais) encontrou 1020 casos com terreno acima do asfalto em mais de 2 cm, chegando a cerca de 68 m. Isso obstrui a visão; a física não tem colisão com esse terreno, portanto pode permitir atravessar o paredão.

2. **Traçado sobreposto sem tratamento explícito entre níveis.** Exemplos: 416/848 m separados por apenas 0,86 m em planta e 16,6 m de altura; 492/2456 m por 0,36 m e 70,3 m de altura. Sobreposição não é erro por si só, mas exige pontes/túneis ou terreno recortado por nível. nearest() usa só X/Z: em 36 pontos médios da linha central selecionou outro trecho, inclusive 491 m associado a 2456 m. Aumentar subdivisões isoladamente não resolve essa ambiguidade. Preferência: afastar retornos e testar folga espacial; se mantiver sobreposição, modelar a separação vertical e o terreno explicitamente.

## Média prioridade

3. **Barreira física e guard-rail não coincidem.** ROAD_EDGE limita o centro do carro a ±1,95 m para uma pista de 6 m. O rail está em ±3,5 m. Considerando a largura do carro, ainda existe espaço visual até o rail quando a física já corrige posição/aplica dano. Definir se acostamento é dirigível; então alinhar limite, resposta e geometria.

4. **Câmera sem proteção contra cenário.** A câmera segue uma posição fixa atrás/acima do veículo, sem raycast contra terreno/muros. Os paredões vistos perto da chegada podem ocupar também a câmera. Resolver terreno primeiro, depois limitar distância da câmera diante de obstáculos reais.

5. **Sinalização pouco consistente.** Avisos de grampo são gerados por chunks pares, não por cada curva. As placas previstas ficam a 121, 81 e 153 m dos grampos. A 100 km/h, 81 m representam aproximadamente 2,9 s. Posicionar avisos por curva e padronizar antecedência, direção e velocidade sugerida. A etiqueta Reta final cobre 2680–2940 m, mas existe curva entre 2940–3100 m e mais reta até a chegada em 3200 m.

## Melhorias visuais

6. **Iluminação dos túneis.** As capturas de 920/2080 m mostram asfalto legível pelos faróis, mas paredes/teto muito escuros. As luminárias do mundo são meshes emissivas/glows; não iluminam de fato a superfície. Considerar iluminação indireta simples, material mais legível ou luzes locais limitadas, mantendo custo de GPU sob controle.

7. **Continuidade do mundo.** Os trechos rodoviários só existem entre aproximadamente 150 m atrás e 600 m à frente do jogador. Com níveis próximos em planta, um trecho distante em distância de percurso pode ficar ausente apesar de próximo visualmente. Verificar novamente após resolver o traçado; preferir carregamento por proximidade espacial se mantiver sobreposições.

## Ordem recomendada

Terreno/níveis → folga do traçado → limite físico/câmera → sinalização → iluminação e acabamento. Manter capturas de regressão nos três grampos, portais e chegada. Não declarar mapa validado apenas porque a simulação termina uma corrida: o teste de física atual não detecta obstruções visuais.

## Correções implementadas — branch fix/touge-map

- Retornos alternados atravessam a encosta na mesma direção lateral, eliminando cruzamentos em X/Z. Permanecem 3,2 km, três grampos e dois túneis. Na varredura a cada 4 m, pontos separados por pelo menos 90 m de percurso ficaram a no mínimo 63,32 m em planta. Todos os pontos médios da linha central entre 1 e 3199 m resolvem para o próprio trecho.
- A mesma varredura de 8005 pontos agora encontrou **zero invasões do terreno**. A altura da malha triangulada de 8 m, interpolada conforme os índices efetivamente renderizados, ficou pelo menos 1,36 m abaixo do pavimento. `terrain.js` expõe a geometria usada em produção para esse teste; a verificação não usa apenas a função analítica de altura.
- Guard-rails nos dois lados e limite físico calculado pela face interna do rail (3,44 m), largura do carro incluindo espelhos e sua extensão longitudinal quando atravessado no drift. O limite reto do centro passa de 1,95 para 2,32 m. Separação entre carros também respeita o limite dependente de ângulo.
- Raycast encurta a câmera antes do terreno, muros e cascas/portais dos túneis. A posição interpolada recebe a mesma restrição. Mantida a redução de movimento.
- Uma placa por grampo, sempre 150 m antes, com sentido e recomendação de 30 km/h; chevrons acompanham as curvas. A etiqueta Reta final agora começa após a última curva, em 3100 m.
- Material do túnel com emissão ambiente discreta e guias laterais visíveis. Sem novas luzes dinâmicas por luminária.
- Streaming inclui trechos a até 160 m em planta, mesmo distantes ao longo da corrida. Margem de descarte de 192 m reduz criação/descarte repetido. Continua carregando o corredor de percurso à frente e atrás.

## Evidências de regressão

- `tests/unit/touge-map.test.ts`: afastamento dos retornos, nearest sem salto de nível, 8005 amostras da malha real, envelope de colisão em ambos os sentidos de drift, câmera bloqueada/livre e sinalização por curva. O teste anterior de corrida completa com entradas de direção/freio continua ativo.
- `tests/e2e/touge-map.spec.ts`: cena real em dez posições (grampos, túneis, quatro portais e chegada), raycast da câmera e inspeção em movimento junto às duas barreiras. Capturas em `map-fixed-evidence/`. O teste posiciona os veículos para inspeção; não representa playtest humano do percurso.
- Comparação direta do último grampo: [antes](map-evidence/2390.png), [depois](map-fixed-evidence/2390.png). Chegada: [antes](map-evidence/3180.png), [depois](map-fixed-evidence/3180.png). Túnel Shiro: [antes](map-evidence/920.png), [depois](map-fixed-evidence/920.png).

Limites: calibração da dirigibilidade por piloto humano, GPU física e outros browsers continuam pendentes. O terreno permanece uma malha de altura única; qualquer futuro cruzamento de níveis exigirá modelagem explícita e novos testes. As colisões continuam arcade por distância/lateral, sem solver tridimensional de contato com cenário.

Validação final: `npm run check` aprovado com 20 unitários; `npm run test:e2e` aprovado com 15 testes (2,1 min); `npm run test:production` aprovado com cinco testes (55,1 s). As dez capturas posteriores foram revisadas; os testes da câmera também verificam 180 estados em movimento, nas duas laterais, com interpolação ativa.
