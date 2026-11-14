# SHIFT//BREAK × ALEF//OS

Portfólio 3D em desenvolvimento, seguindo os 14 incrementos de [SPECIFICATION.md](SPECIFICATION.md).

```sh
npm ci
npm run dev
```

Abra o endereço local exibido pelo Vite. Node 22.12+.

O MVP **0.6.0 (incrementos 01–06)** tem quarto físico, câmera, monitor HTML interativo, janelas, arquivos/viewers, projetos e biblioteca com SIGNAL.exe jogável. Identidade, habilidades, contatos e currículo ficam claramente pendentes, conforme escolha do proprietário. Os três jogos 3D, a campanha e os incrementos 07–14 ainda não foram implementados.

Use E, clique na tela ou Usar computador; Escape retorna ao quarto. No menu ALEF//, abra Biblioteca de jogos → Iniciar SIGNAL.exe. Colete oito sinais em vinte segundos; Escape pausa, R reinicia, Sair do jogo retorna ao OS sem reload. Portfólio acessível abre `?view=portfolio`, inclusive sem WebGL. Diagnóstico → Capturar quadro no monitor demonstra a transferência de uma imagem 3D, sem representar a cinemática final.

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:production
npm run preview
```

O build estático é gerado em `dist/`. Veja [progresso](docs/PROGRESS.md) e [plano](docs/IMPLEMENTATION_PLAN.md). Não há publicação nem merge na main.

Conteúdo: [guia](docs/CONTENT_GUIDE.md). Git: [branches empilhadas](docs/BRANCHES.md). Retomada: [.nexus/handoff.md](.nexus/handoff.md). Testes manuais e limitações: [QA](docs/MANUAL_QA.md), [monitor](docs/ADR-001-MONITOR.md), [jogos](docs/ADR-002-GAME-LIFECYCLE.md).
