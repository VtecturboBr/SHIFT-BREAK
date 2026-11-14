# SHIFT//BREAK × ALEF//OS

Portfólio 3D em desenvolvimento, seguindo os 14 incrementos de [SPECIFICATION.md](SPECIFICATION.md).

```sh
npm ci
npm run dev
```

Abra o endereço local exibido pelo Vite. Node 22.12+.

A versão **0.7.1 (incrementos 01–07)** tem quarto físico, câmera, monitor HTML interativo, janelas, arquivos/viewers, projetos e biblioteca com SIGNAL.exe e REDLINE jogáveis. Identidade, habilidades, contatos e currículo ficam claramente pendentes, conforme escolha do proprietário. Luta, FPS, campanha e incrementos 08–14 continuam pendentes.

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

## REDLINE 0.7.0

Atualização 0.7.1: o DRIFT.exe agora reaproveita o projeto antigo de touge do proprietário. São 3,2 km de Akagiri Pass com carros/rodas animadas, três grampos, dois túneis e áudio sintetizado (M para silenciar). Combate espiritual, samurais, poderes e rounds infinitos foram removidos. A corrida termina na chegada ou por dano/tempo; sair preserva quarto e OS. Procedência e alterações: [REUSED-TOUGE.md](docs/REUSED-TOUGE.md).

Incremento 07 disponível em protótipo: Biblioteca de jogos → Iniciar DRIFT.exe. W/↑ acelera, S/↓ freia, A/D ou setas esterça, Espaço drift, ESC pausa e R reinicia. Sair da corrida restaura o quarto e o OS preservados. Ver docs/ADR-003-REDLINE.md. A arte é provisória; 08–14 e a campanha permanecem pendentes.
