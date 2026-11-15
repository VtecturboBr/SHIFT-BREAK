# Akagiri Loop — Retorno da Garganta

Implementação do plano aprovado: uma volta completa em um circuito fechado, preservando o traçado original de Akagiri Pass. Branch `feat/akagiri-loop`, base `96ac167`. Sem merge na main, push ou publicação.

## Percurso entregue

| Setor                 | Distância acumulada | Característica                                            |
| --------------------- | ------------------: | --------------------------------------------------------- |
| Akagiri Pass original |            0–3200 m | Traçado preservado, três grampos e dois túneis            |
| Boca da Garganta      |         3200–3540 m | Descida curta entre paredões de rocha                     |
| Escada dos Oito       |         3540–4915 m | Oito grampos alternados de 150 m, com ligações de 25 m    |
| Coroa da Barragem     |         4915–5385 m | Passagem elevada, apoios, reservatório e comportas        |
| Vertedouro Seco       |         5385–5985 m | Seis mudanças de direção num canal de concreto em descida |
| Galeria das Comportas |         5985–6335 m | Subida semiaberta com pilares, vigas e cobertura parcial  |
| Cornija do Reencontro |      6335–6871,40 m | Curvas de reconexão e alinhamento com o início            |

O comprimento efetivo ficou em **6871,398 m**, em vez de forçar os 6800 m estimados no plano. O perfil tem aproximadamente **181,17 m de subida e de descida acumuladas**, altitudes entre −4 e 148 nas unidades do mundo, inclinação máxima de aproximadamente 10% e raio mínimo de 23,89 m. A folga mínima medida entre trechos separados por pelo menos 120 m de percurso é de 57,72 m, considerando a vizinhança circular da emenda.

As ligações geométricas usam integração suave de curvatura e segmentos quínticos no fechamento. O perfil de altitude usa rampas suaves de inclinação, sem criar saltos ou modificar globalmente a aceleração em subidas. A pista permanece com 6 m de largura. Não há cruzamentos de estradas sobrepostos em alturas diferentes.

## Corrida e compatibilidade

- A linha compartilhada fica em `s = 34 m`; o grid continua em 18/26 m. A primeira passagem inicia a volta. A chegada exige progresso acumulado de `track.length + track.startLine`, cerca de 6905,40 m. Passar pelo antigo final de 3200 m não encerra a corrida.
- O sentido inverso reflete a parametrização ao redor da mesma linha física: `wrap(2 * startLine - s)`. Curvas e inclinações trocam sinal; o fechamento não teleporta os carros.
- O limite de tentativa é 600 segundos. O resultado preserva a distinção entre completar o circuito e superar o rival. Um rival que termina antes desacelera por até 70 m e deixa de participar de impactos e vácuo na chegada.
- Reinício preserva a direção escolhida, limpa a visão traseira e descarta os trechos/terreno anteriores. Sair mantém o quarto e o OS sem reload.
- Drift, turbo, trajetória orientada, acompanhamento em drift, vácuo visual, rodas corrigidas, câmeras e recuperação do rival foram preservados.

## Contratos e arquitetura

`touge/world/loop-track.js` é o circuito ativo; `track.js` continua como fonte de referência do trecho original e das constantes físicas.

- `length`: comprimento medido; `startLine`: posição da faixa; `closed`: identificação da pista periódica.
- `sample`, `section`, `curvature`, `grade`, `elevation`: consultas periódicas, inclusive para distâncias negativas ou maiores que uma volta.
- `wrap(s)`: normalização da posição. `localGap(from, to)`: separação local com sinal, usada em contato, vácuo e acompanhamento na emenda.
- Progresso dos veículos continua acumulado; recuperação e resultado usam a diferença de progresso na corrida, não apenas proximidade no mundo.
- `TougeSimulation.finishDistance` deriva do circuito. A exportação `FINISH` representa o percurso padrão para compatibilidade com integrações/testes.
- Terreno, índice espacial e dados físicos do percurso são reutilizados por semente; o sentido inverso consulta o mesmo mundo. O streaming usa IDs canônicos e carrega ambos os lados da emenda sem instâncias duplicadas.

Na Escada dos Oito, uma placa anuncia a sequência, seguida de chevrons por grampo. Isso evita uma placa de direção contrária durante cada curva anterior. A barragem usa terreno rebaixado fora do pavimento, apoios e água estática; o vertedouro e a galeria têm paredes/coberturas próprias. Materiais são procedurais, sem novas dependências, reflexos de água em tempo real ou luz dinâmica por luminária.

## Evidências e validação

- `npm run check`: typecheck, lint, formatação, **49 testes unitários** e build aprovados.
- `npm run test:e2e`: **18 testes aprovados**, incluindo voltas automáticas completas renderizadas nos dois sentidos, inspeção de 13 posições por sentido, espaço livre no pavimento, câmera, emenda e descarte no reinício.
- A malha de terreno é testada por interpolação dos triângulos efetivos em toda a largura do pavimento, a cada 2 m. Nenhuma invasão foi detectada.
- Testes de continuidade verificam posição, direção, inclinação e curvatura nas duas ligações; testes de proximidade cobrem vácuo/contato na emenda e a chegada com rival já finalizado.
- `npm run test:production`: **cinco testes aprovados**, incluindo DRIFT.exe, importação lazy, retorno ao OS, arquivos e fallback sem WebGL.

Capturas reais do navegador, com veículos posicionados para inspeção visual: [garganta](evidence/loop/3400.png), [grampos](evidence/loop/3615.png), [barragem](evidence/loop/5020.png), [comportas](evidence/loop/5280.png), [vertedouro](evidence/loop/5500.png), [galeria](evidence/loop/6140.png), [reencontro](evidence/loop/6800.png), [linha compartilhada](evidence/loop/34.png). Há também capturas do [vertedouro inverso](evidence/loop/reverse-5500.png) e da [galeria inversa](evidence/loop/reverse-6140.png).

As voltas completas foram controladas automaticamente pela física real e pelo controlador de direção, com renderização periódica durante o percurso; não representam playtest humano. Playtest prolongado em GPU física e outros navegadores permanece pendente. A arte continua procedural e o aviso de bundle Three.js acima de 500 kB permanece conhecido. Não se trata da conclusão dos incrementos 08–14.
