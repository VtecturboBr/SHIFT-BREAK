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
