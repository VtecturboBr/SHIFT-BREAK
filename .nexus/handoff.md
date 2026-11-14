# Retomada — 0.7.1

Branch atual feat/07-reuse-touge, base feat/07-redline. O proprietário pediu reutilizar initial JOJO.zip no lugar do DRIFT.exe e remover batalhas de espíritos samurais. A implementação ativa agora usa pista, carros, física/drift, IA, mundo e áudio do arquivo, sem copiar .git, dependências, builds ou scripts executáveis. Fonte/hash em docs/REUSED-TOUGE.md.

Não há mais o DrivingModel de 720 m. TougeSimulation integra os ES modules originais selecionados em src/games/redline/touge. TypeScript allowJs/checkJs=false permite preservar esse código; lint e testes continuam aplicados. Três grampos, dois túneis, pista 3,2 km. Sem Combat, makeSpirit, diretor de duelo, poderes, colapso espiritual ou rounds infinitos. Partida finita: completar descida, preservar carro e pontuar drift; rival serve de referência de desempenho e para na chegada.

O quarto e o OS ainda usam suspend/resume no mesmo renderer/loop. Corrida limita DPR a 0,7 em software e 1,5 em hardware; passo máximo 0,08 apenas neste World. Pausa/contagem/ready renderizam sob demanda. Áudio procedural só começa por ação do usuário e seu AudioContext fecha ao sair. Eventos, sprites, pontos, texturas e instâncias também são descartados. Não reinstalar dependências com Vite rodando.

Validação corrente: npm run check passou com 15 unitários incluindo percurso completo na física reaproveitada, drift sem recompensa duplicada, limites, countdown/pausa e derrota. Browser isolado validou duas sessões e notas preservadas; consultar docs/PROGRESS.md para resultado final da regressão/produção e screenshot.

Dados pessoais permanecem pendentes por escolha do proprietário. Sem push/merge na main ou deploy. Próximo incremento do roadmap continua 08 BREAKPOINT; não reintroduzir batalhas espirituais no DRIFT.exe. 09–14, FLOW, campanha, áudio musical final, arte final, cross-browser e GPU física continuam pendentes.

Checkpoint final: check/15 unitários, 14 e2e de regressão e cinco smokes de produção passaram. Screenshot real 07-reused-touge.png revisado. F/J não ativam combate, mute e retorno ao OS foram exercitados no build estático.
