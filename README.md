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

## REDLINE — Akagiri Loop

O DRIFT.exe preserva os 3,2 km do touge original do proprietário e acrescenta o Retorno da Garganta, formando um circuito de **6,87 km**. Há oito novos grampos consecutivos, barragem, vertedouro seco e galeria semiaberta. Uma volta completa, nos sentidos normal e inverso, com largada e chegada na mesma linha. O limite é de dez minutos; sair preserva quarto e OS. Combate espiritual continua removido. Veja [circuito, arquitetura e evidências](docs/AKAGIRI_LOOP.md) e [procedência do reuso](docs/REUSED-TOUGE.md).

Biblioteca de jogos → Iniciar DRIFT.exe. W/↑ acelera, S/↓ freia, A/D ou setas esterçam, Espaço segura o drift e soltar concede o turbo quando qualificado. C alterna quatro câmeras; segurar B olha para trás, e o botão alterna a visão. M controla áudio, ESC pausa e R reinicia. Trocar o sentido reinicia a corrida. Arte e calibração seguem em protótipo; 08–14 e a campanha permanecem pendentes.
