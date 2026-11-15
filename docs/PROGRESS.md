# Progresso real

## Inventário inicial — 14/11/2026

- Remoto público VtecturboBr/SHIFT-BREAK vazio; clone local na pasta de trabalho.
- Sem baseline anterior. Node 24.21.0, npm 11.19.0.
- Primeiro incremento pendente: 01. Nenhuma versão concluída ainda.
- Especificação original preservada integralmente em SPECIFICATION.md.

## Estado dos incrementos

| Incremento | Estado                                                               |
| ---------- | -------------------------------------------------------------------- |
| 01 · 0.1.0 | Concluído e validado                                                 |
| 02 · 0.2.0 | Concluído e validado                                                 |
| 03 · 0.3.0 | Concluído e validado                                                 |
| 04 · 0.4.0 | Concluído e validado                                                 |
| 05 · 0.5.0 | Concluído e validado; dados do autor pendentes por escolha explícita |
| 06 · 0.6.0 | Concluído e validado · MVP técnico                                   |
| 07 · 0.7.0 | Protótipo REDLINE implementado e validado                            |
| 08–14      | Pendentes                                                            |

## Incremento 01 — Project Foundation

- Three.js 0.187, TypeScript 6, Vite 8; módulos app/core/graphics separados.
- Dois estados de diagnóstico, sem reload, com descarte das cenas; ciclo único e ajuste de DPR/resize.
- GLTFLoader/TextureLoader preparados, erros recuperáveis e tratamento de perda de contexto.
- `npm run check`: typecheck, lint, formatação, 1 teste unitário e build passaram.
- `npm run test:e2e`: 1 teste Chromium passou; alternância de cenas, canvas e diagnóstico reais, sem pageerror.
- Screenshot real revisado: `docs/evidence/01-foundation.png`.
- `npm audit`: 0 vulnerabilidades após override específico de minimatch 11.0.8 no tooling TypeScript ESLint. Reinstalar o pacote pai resolveu lock antigo que npm install/update preservavam.
- Limite: bundle inicial de Three.js gera aviso de 500 kB no Vite (537 kB, 134 kB gzip). Sem jogo/assets pesados ainda. Otimizar conforme os módulos forem acrescentados, sem mascarar o aviso.
- Não há dados profissionais, arte final ou gameplay nesta versão. Próximo incremento: 02.

## Incremento 02 — Room Prototype

- Quarto procedural original: chão, paredes, teto, janela aberta com exterior, mesa, cadeira, monitor físico, teclado, mouse, gabinete, estante/livros e luminária.
- Câmera sentada: arraste, setas/Home, pointer lock opcional com recuperação, limites de yaw/pitch e sensibilidade ajustável. Redução de movimento respeitada.
- Auditoria corrigiu tipo de material, API de sombras removida e descarte dos render targets de sombra.
- `npm run check`: typecheck, lint, format, 2 testes unitários e build passaram.
- `npm run test:e2e`: 2 testes Chromium passaram, incluindo regressão da fundação e gestos/teclado/troca de cenas.
- Screenshots reais revisados: `docs/evidence/02-room.png` e `02-window.png`.
- Uma execução excedeu 30s com 16 comandos de teclado em dois navegadores software simultâneos. A suíte agora usa 1 worker, timeout de 60s e gesto de mouse equivalente; os comportamentos e asserts foram preservados.
- Limites: arte geométrica provisória, sem caminhar e sem interação no monitor nesta versão. Pointer lock físico e outros navegadores ainda não verificados; checklist em MANUAL_QA.md. Próximo: 03.

## Incremento 03 — Interactive Monitor

- HTML real projetado na tela física, cliques e edição de texto nativos, coordenadas UV, câmera reversível, foco e isolamento room/monitor. Entrada por botão, E ou clique no objeto. Escape e botão de saída; contador e texto preservados.
- Prova de captura: cena diagnóstica renderizada em target 16:9, transferida ao monitor como DataTexture e UI restaurável. É a viabilidade técnica, não a cinemática do incremento 12.
- `npm run check`: typecheck, lint, format, 6 testes unitários e build passaram.
- `npm run test:e2e`: 6 testes Chromium passaram em 2 minutos, incluindo DPR 1/2, resize, cliques/teclado reais, entrada interrompida, captura de quadro e regressão do quarto.
- Screenshots reais revisados: `docs/evidence/03-monitor.png`, `03-monitor-dpr2.png` e `03-frame.png`.
- Auditoria e refinamento: matriz CSS singular impedia hit testing apesar de desenhar corretamente; preservada base Z invertível e acrescido teste. Novo input interferiu em seletor genérico de sensibilidade; seletor específico e proteção contra NaN corrigiram a regressão. Métrica FPS agora usa tempo real separado do dt limitado da simulação.
- ADR-001 registra alternativas, projeção, captura e limites. Oclusão conservadora por cinco raios; precisa de máscara antes de objetos móveis/exploração livre. Zoom e engines além de Chromium ainda não validados.
- Performance: capturas no Chromium com renderização por software mostram 4–8 fps com trace/DPR 1–2. Não representa GPU física e não atende ainda à meta de otimização final. Sem números de performance de produção inventados.
- SHA256 da especificação local e original são idênticos. Próximo incremento: 04, OS Core.

## Incremento 04 — OS Core

- Desktop original, ícones, registro de apps, menu, taskbar, relógio local e notificações dispensáveis.
- Janelas independentes: foco/empilhamento, arraste por coordenadas projetadas, mover por teclado, minimizar/restaurar, maximizar/restaurar e fechar. Layout limitado à tela útil; minimizar preserva conteúdo.
- Apps reais de diagnóstico do monitor, notas temporárias e informações da versão. O diagnóstico anterior continua testável como app.
- `npm run check`: typecheck, lint, format, 7 testes unitários e build passaram.
- `npm run test:e2e`: 7 testes Chromium passaram (2,8 min), incluindo múltiplas janelas e todas as regressões dos incrementos 01–03.
- Screenshot real revisado em `docs/evidence/04-desktop.png`.
- Auditoria: listeners por janela são abortados ao fechar; timers e eventos globais descartados junto do desktop. Arraste é cancelado na saída, blur e visibilitychange. Conteúdo usa textContent ou templates internos estáticos.
- Limites anteriores de oclusão, software rendering e bundle permanecem explícitos. Dados profissionais, arquivos e fallback acessível são o próximo incremento (05); jogos continuam 06–12.

## Incremento 05 — Portfolio System

- Schema central de identidade, apresentação, habilidades, projetos, imagens, contatos e currículo. Proprietário confirmou deixar dados pessoais claramente pendentes para preencher depois.
- VFS readonly: identity.txt, about_me.md, skills.json, projects/ e gallery/. Explorador com pastas/breadcrumbs e viewers de texto/código/imagem; resume.pdf e leitor PDF só existem quando configurado um asset real.
- Apps de Apresentação, Projetos, Galeria e Contato. Apenas o próprio projeto foi cadastrado com fatos verificados e captura real; sem links de contato ou currículo inventados.
- Modo 2D acessível em `?view=portfolio`, móvel e independente de WebGL. Erro de WebGL/carregamento abre o mesmo conteúdo. Bundle inicial de leitura ~7,3 kB JS; ambiente 3D carregado separadamente (~569 kB, ainda com aviso do Vite).
- `npm run check`: typecheck, lint, format, 9 unitários e build passaram. `npm run test:e2e`: 10 testes Chromium passaram em 35,2s, incluindo arquivos/imagens, mobile 390px, WebGL ausente e todas as regressões anteriores.
- Refinamento de performance motivado por um timeout em DPR 2: o quarto estático agora só redesenha ao mover câmera, redimensionar ou trocar conteúdo da cena. A interface DOM e o loop de atualização continuam ativos. O teste comprova que editar/navegar no OS não cria frames WebGL extras. Diagnóstico conta frames reais e identifica idle. A suíte anterior levou 3,6 min e falhou no teardown; após a correção passou em 35,2s, sem aumentar o timeout.
- Screenshots reais revisados: `docs/evidence/05-files.png` e `05-accessible.png`. Erros de console no cenário de WebGL bloqueado são intencionais; fallback passou.
- Limites: currículo real e links pessoais não fornecidos, portanto visualização/download PDF não foram validados com documento do autor. Outros browsers, GPU física, zoom e oclusão por pixel continuam pendentes. Próximo: 06 Game Launcher.

## Incremento 06 — Game Launcher / MVP 0.6.0

- Biblioteca com capas originais em CSS, títulos, descrições e estados honestos. SIGNAL.exe disponível; SHIFT//BREAK, DRIFT.exe, FIGHT.exe e FPS.exe ainda indisponíveis até 07–12.
- SIGNAL.exe é uma prova jogável 2D original: oito sinais em vinte segundos, entradas de mouse/teclado, vitória, derrota, pausa, reinício e saída. Não é apresentado como um dos três jogos 3D.
- GameHost com import lazy (~5,2 kB), isolamento do desktop via inert, ownership de entrada, cancelamento seguro de import tardio, descarte de listeners/canvas e restauração de foco/janelas. Atualização pelo loop único do quarto; sem RAF paralelo.
- Sair do computador, blur ou aba oculta pausa a sessão. Fechar retorna ao mesmo OS e canvas do quarto, sem navegação/reload. Resultado mantém foco para atalhos e ações acessíveis.
- `npm run check`: typecheck, lint, format, 11 unitários e build passaram.
- `npm run test:e2e`: 13 testes Chromium passaram (1,1 min), cobrindo vitória/derrota/retry, saída temporária ao quarto, cancelamento de loading, mesmo canvas sem reload, e todas as regressões anteriores.
- `npm audit` e `npm audit --omit=dev`: zero vulnerabilidades.
- Instalação limpa `npm ci` passou; `npm run check` repetido após a instalação passou. `npm run test:production`: quatro smokes no bundle estático passaram (6s), cobrindo imports lazy, jogo, arquivos/imagens, leitura móvel e fallback WebGL.
- Prévia local de produção iniciada em `http://127.0.0.1:4174/` (não é deploy público).
- Screenshot real revisado: `docs/evidence/06-signal.png`. ADR-002 documenta o ciclo e os cuidados para o futuro renderer 3D de REDLINE.
- **Este é o MVP 01–06, não a versão 1.0.** Permanecem 07–14: três jogos 3D, FLOW, campanha contínua, áudio, revelação, exploração/polimento e publicação. Apps complementares exigidos pela especificação (terminal, settings, música e achievements) também permanecem na entrega futura, sem rótulo de concluídos.
- Conteúdo pessoal segue pendente por autorização explícita. Limites de oclusão por amostragem, arte provisória, validação multi-browser/GPU e aviso do bundle 3D continuam abertos. Não houve publicação nem merge.

## Incremento 07 — REDLINE 0.7.0

- DRIFT.exe disponível na biblioteca: pista procedural de 720 m, descida/curvas, asfalto de baixa rugosidade, neblina, montanhas, árvores, guard-rails, carro e rival, faróis e bloqueio final.
- Física arcade independente do renderer, passos fixos 1/120 s, aceleração/freio/esterço/drift, pontuação por movimento, colisões com cooldown/dano, chegada, derrota por dano/tempo e restart. Pools de fumaça e marcas limitados.
- Apresentação imersiva temporária; suspend/resume preserva mundo do quarto, OS, notas e mesmo renderer/canvas. Input exclusivo, pausa em blur/aba oculta, limpeza de teclas e descarte na saída. Loading lazy cancelável e invalidado se o modo mudar.
- npm run check: tipos/lint/formatação, 14 unitários e build passaram. npm run test:e2e: 14 testes passaram em 1,5 min, incluindo duas execuções do jogo com teclas reais e retorno sem perda de notas. Screenshot real revisado em docs/evidence/07-redline.png.
- Modelo de teste completa o percurso com controle determinístico e cobre drift/colisão/derrota/pausa/restart. Não foi realizado playtest humano completo da pista nem aferição de GPU física. A pontuação ainda não é o FLOW da campanha.
- Arte e efeitos são provisórios, sem áudio final nem cinemática de transição para luta. Arquitetura e limites em ADR-003-REDLINE.md. Próximo incremento: 08 BREAKPOINT. Dados pessoais seguem pendentes por escolha do proprietário.

- Smoke de produção: npm run test:production passou com cinco testes (31,6s), incluindo REDLINE, renderer preservado, arquivos e fallback. Sem servidor deixado rodando ou reinstalação de dependências.

## Reuso solicitado — 0.7.1

- Fonte: initial JOJO.zip do proprietário; pista de 3,2 km, modelos/rodas, texturas, streaming de trechos, IA, física/drift e áudio sintetizado reaproveitados. Arquivo original intacto; .git, node_modules, builds, executáveis, HUD/diretor/combate antigos não importados. Manifesto e SHA-256 em REUSED-TOUGE.md.
- Removidos modelos/animações dos espíritos, zonas de duelo, ataques/poderes, dano espiritual e rounds infinitos. Corrida agora termina ao concluir a descida, destruir o carro ou atingir limite de 240 s. A vitória significa concluir a descida; a posição em relação ao rival é informada no resultado.
- Substituídos o modelo de 720 m e seus testes pelos módulos reais reutilizados; 15 unitários passaram, inclusive percurso completo, drift/cooldown, física de colisão, countdown/pausa e derrota. Typecheck, lint, formatação e build passaram.
- Primeiro teste expôs countdown lento na GPU por software. Reuso da estratégia de DPR reduzido e passo 0,08 específico da corrida, mais render sob demanda fora de movimento, fez o teste isolado passar em 22,2 s (sem aumentar timeout). Cena real inspecionada.
- Adaptação usa o mesmo renderer e o retorno ao quarto/OS. Áudio inicia por clique, mute disponível e AudioContext é fechado na saída; descarte ampliado para sprites, pontos e instâncias da cena original. Não há música comercial.
- Ainda faltam playtest humano completo e aferição de GPU física/cross-browser. Roteiro 08–14 e dados pessoais pendentes permanecem.

- Validação final do reuso: npm run check passou com 15 unitários; npm run test:e2e passou com 14 testes (1,5 min); npm run test:production passou com cinco testes (52,6 s). O smoke novo também confirma que F/J não ativam combate e que mute funciona. Captura real revisada: docs/evidence/07-reused-touge.png. Sem servidores permanentes iniciados, push ou merge.

## Correções do mapa — fix/touge-map

- Corrigidos os cruzamentos dos retornos que tornavam a altura do terreno ambígua. Preservados 3,2 km, três grampos e dois túneis. Varredura de 8005 pontos da malha efetiva: zero invasões, contra 1020 antes; altura máxima relativa agora −1,36 m. Teste de afastamento/nearest evita regressão do traçado.
- Rails dos dois lados e limite pelo envelope girado do carro, incluindo espelhos; aplicado também à separação dos veículos. Câmera restringida por raycast contra terreno, muros e túneis/portais, antes e depois da interpolação.
- Avisos 150 m antes de cada grampo, velocidade sugerida explícita, chevrons e nome da reta final corrigido. Túneis legíveis sem novas luzes dinâmicas; streaming inclui trechos próximos em planta e margem de descarte.
- `npm run check`: tipos, lint, formatação, 20 unitários e build passaram. `npm run test:e2e`: 15 testes passaram (2,1 min). `npm run test:production`: cinco testes passaram (55,1 s), incluindo duas sessões DRIFT.exe e preservação de notas/OS. Uma rodada preliminar foi interrompida por reload do Vite durante edição; repetição estável integralmente aprovada.
- Dez capturas reais revisadas; teste também inspeciona 180 estados da câmera nas laterais com interpolação ativa. Relatório e comparação antes/depois em [audits/DRIFT-MAP.md](audits/DRIFT-MAP.md). Inspeção por posicionamento, sem afirmar playtest humano completo.
- Sem novas dependências, push, merge ou deploy. Pendentes calibração por piloto humano, GPU física e outros browsers; aviso de bundle >500 kB permanece. Próximo incremento do roadmap: 08.

## Rival, câmera e sentido inverso

- Branch feat/rival-camera-reverse: rival busca 70 m/s nas retas, com frenagem antecipada e limite por curvatura. Câmera segue o traçado atrás do carro e antecipa curvas conforme a velocidade, preservando raycast e redução de movimento.
- Botão Sentido: normal/inverso reinicia na direção escolhida; restart mantém essa escolha. Inverso percorre a mesma estrada de volta com elevação, curvatura, placas e chegada adaptadas.
- Check/26 unitários e build passaram; corrida/retorno ao OS e mapa passaram no navegador. Comparação matemática dos traçados a cada 20 m e simulação completa nos dois sentidos. Inspeção de 13 posições por sentido e câmera nas laterais. Evidências: evidence/07-reverse-hairpin.png e evidence/07-reverse-finish.png.
- Sem merge na main. Playtest humano completo e calibração em GPU física pendentes.

## Câmeras selecionáveis e HUD ampliado

- Branch feat/race-camera-options: quatro vistas (Perseguição, Próxima, Capô, Alta), alternadas por C ou botão no cabeçalho, sem reiniciar a corrida. A seleção permanece no restart. Proteção contra cenário mantida.
- Velocímetro ampliado para até 330 px, afastado das bordas e acima das instruções; tamanhos adaptados para telas estreitas/baixas. Cabeçalho quebra linha quando necessário.
- Check com 26 unitários e build passou; testes de corrida/retorno ao OS e render das quatro câmeras passaram. Teste de corrida verifica teclado e botão durante movimento. Uma rodada inicial excedeu 60 s ao repetir todas as trocas em duas sessões; cobertura das quatro vistas ficou no teste de mapa e a integração foi reduzida sem aumentar timeout.
- Capturas revisadas: evidence/07-camera-hud.png e evidence/07-camera-hood.png. Playtest humano prolongado e GPU física pendentes. Sem merge na main.

## Rival com drift e ritmo aumentado

- Branch feat/rival-drifting: alvo de reta aumentado de 70 para 78 m/s, chegando a 90 m/s com turbo. Limite por curvatura aumentado de coeficiente 10,5 para 14, preservando antecipação/frenagem.
- IA inicia drift em curvas adequadas, controla posição lateral e solta o freio de mão ao carregar o turbo ou sair da curva. Usa as mesmas regras de qualificação, cooldown e impulso do jogador. Fumaça e marcas de pneus agora atendem ambos os carros, compartilhando pools limitados.
- Check com 27 unitários e build aprovado; corrida/retorno ao OS passou no navegador. Teste do rival completa os dois sentidos em menos de 135 s, com pelo menos três drifts pontuados, turbo e integridade acima de 75%. Testes de velocidade confirmam aceleração acima do ritmo antigo em reta e curva.
- Sem merge na main. Calibração de dificuldade por playtest humano prolongado continua pendente.

## Espaço previsível para ultrapassagem

- Branch fix/rival-passing-space: nas retas, o rival alterna suavemente entre alvos de faixa a ±1,55 m em ciclo de 24 s. Comando lateral limitado a 0,4 m/s e sem a oscilação curta anterior nesses trechos.
- Quando o jogador está lado a lado em outra faixa, o rival mantém posição lateral para não fechar a ultrapassagem. Trajetória de curvas/drift, frenagem e aceleração preservadas.
- Check com 28 unitários e build passou. Teste de 40 s verifica deslocamento lento, alcance das duas faixas e manutenção de posição ao lado do jogador; regressão do rival completa ambos os sentidos com drift/turbo. Playtest manual desta mudança não realizado. Sem merge na main.

## Vácuo, passagem e recuperação do rival

- Branch feat/drafting-rival-racecraft: rival larga deslocado para uma faixa e escolhe uma lateral ao detectar o jogador se aproximando nas retas, mantendo o lado até a ultrapassagem. O deslocamento para abrir passagem é mais rápido que a oscilação anterior; o espaço foi testado com ultrapassagem real sem dano.
- Vácuo do jogador: alinhamento lateral inferior a 0,9 m, entre 5 e 42 m atrás do rival, direção semelhante, velocidade acima de 15 m/s e acelerador ativo sem freio/drift. Carga completa em 1,5 s; acrescenta até 6 m/s de limite e 6 m/s² de aceleração. Ao sair da esteira, decai por aproximadamente 0,83 s para permitir puxar para a outra faixa. HUD ciano mostra carga, estado ativo e impulso residual.
- Ritmo de curva do rival aumentado (coeficiente de 14 para 26), mantendo drift e turbo reais. Ainda freia quando excede o limite seguro da curva. Percursos completos nos dois sentidos e drifts pontuados continuam passando nos testes.
- Ao ficar atrás, rival recebe recuperação gradual se a distância exceder 24 m. Ajuda cai perto do jogador; controle busca margem de 24 m, com frenagem de segurança e cancelamento de turbo perto dessa margem. Não teleporta, nem usa a recuperação para forçar ultrapassagem. HUD informa recuperação/manutenção de distância.
- Check com 34 unitários e build aprovado; dois testes de corrida/mapa no navegador e cinco smokes de produção aprovados. Testes cobrem vácuo válido/inválido, carga/decadência, limite extra, ultrapassagem sem contato, recuperação com jogador freando até parar, pausa/reset e regressão dos dois sentidos.
- evidence/07-drafting-gameplay.png é captura do jogo integrado; evidence/07-drafting-hud.png demonstra carga em estado fixado na fixture de inspeção visual, sem representar uma corrida humana. Ambas revisadas. Calibração por playtest humano prolongado/GPU física continua pendente. Sem merge na main.

## Recuperação reforçada, perseguição próxima e visão traseira

- Branch fix/recovery-chase-rear-view: recuperação do rival aumenta até +28 m/s de limite e +20 m/s² de aceleração (antes +10/+8), com potência total a 54 m de distância em vez de 74 m. Limite de curva cresce gradualmente durante recuperação. Margem-alvo de 24 m, corte de boost perto do jogador e frenagem de segurança preservados.
- Perseguição com distância nominal de 7,5 m e altura de 3,4 m. Suavização do deslocamento relativo ao carro evita acumular atraso de posição em alta velocidade. Não é uma reprodução exata de Forza; mantém as quatro câmeras e proteção contra cenário.
- Segurar B olha para trás; soltar restaura a vista escolhida. Botão Olhar para trás [B] alterna a visão, com aria-pressed. Pausa/blur/restart limpam a visão traseira.
- Check com 35 unitários e build passou; testes de mapa/câmeras/visão traseira e corrida/retorno ao OS passaram no navegador. Teste novo reduz vantagem inicial de 160 m para menos de 100 m em 20 s contra jogador em movimento no percurso real; frenagem com jogador parando continua validada. Câmera acompanha deslocamento a 78 m/s sem ultrapassar 9 m de afastamento horizontal.
- Capturas reais revisadas: evidence/07-close-chase.png e evidence/07-rear-view.png. Playtest humano prolongado/GPU física permanecem pendentes. Sem merge na main.

## Vento na esteira e nova calibração de velocidade

- Branch feat/wind-wake-and-race-tuning: aceleração normal reduzida de 13 para 10 m/s²; limite normal de 78 para 88 m/s (aproximadamente 317 km/h), turbo até 100 m/s e vácuo adicionando até 6 m/s. Resistência ajustada para que a velocidade final seja atingível com aceleração mais lenta. Velocímetro atualizado para escala até 420 km/h.
- Corrigido sinal visual de esterço das rodas dianteiras fora do drift; contrasterço durante drift preservado. Teste inspeciona as rotações do modelo no browser.
- Recuperação do rival aumentada para até +44 m/s de limite e +32 m/s² de aceleração extra, com potência total a 44 m; margem de acompanhamento, corte próximo e frenagem de segurança preservados. Largada tem aceleração extra decrescente por cinco segundos após GO, sem movimento durante countdown.
- Removidos painel, barra e mensagens de vácuo do HUD. WindWake renderiza 28 rastros claros na estrada atrás de quem está liderando, intensificados quando o jogador aproveita o vácuo. Troca para o novo líder após ultrapassagem, para quando ele fica lento e reduz animação com preferência de movimento reduzido. Recursos pertencem à cena e são descartados ao sair.
- Check/build e 37 unitários aprovados, incluindo posição da esteira atrás de cada líder e largada; testes de corrida e mapa/efeitos/rodas no navegador passaram. Captura em evidence/07-wind-wake.png é inspeção visual de estado fixado no navegador. Playtest humano prolongado/GPU física pendentes. Sem merge na main.

## Drift com trajetória e acompanhamento em dupla

- Branch feat/drift-trajectory-and-tandem: rival admite mais velocidade enquanto o drift está ativo (coeficiente de curva 36 em vez de 26), mantendo frenagem para excesso de velocidade e controle lateral compensado.
- Drift transfere uma pequena parcela do movimento para a direção em que o carro aponta, com projeção longitudinal correspondente. Após 0,75 s sem curvatura suficiente, encerra o drift; manter Espaço pressionado não reinicia o drift nem cria turbo em reta.
- Com ambos em drift no mesmo corredor, o carro traseiro reduz velocidade para acompanhar, perde turbo e recebe separação mínima de 5,5 m em vez de impacto/lateralização. Serve para jogador e rival; colisões de parede e impactos fora dessa condição continuam ativos. Recuperação do rival não interfere na distância curta específica do drift em dupla.
- Vácuo reduzido de +6 para +2,5 m/s de limite e de aceleração; vento só renderiza quando sim.drafting está ativo, sem exibir efeito durante carga residual ou simples liderança. Impulso de largada reduzido de pico +12 por cinco segundos para +5 por dois segundos, com decaimento.
- Check com 41 unitários e build passou; mapa/câmeras/vento e corrida/retorno ao OS passaram no navegador. Uma rodada de integração excedeu 60 s; repetição a 1280x720 para GPU por software manteve todas as ações e passou em 51,2 s, sem aumentar timeout. Testes cobrem rumo no drift, fim em reta, velocidade do rival em drift, ordem invertida no acompanhamento, preservação de dano normal e visibilidade do vento somente em uso.
- Playtest humano prolongado/GPU física permanecem pendentes. Sem merge na main.
