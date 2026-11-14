# SHIFT//BREAK × ALEF//OS

Portfólio 3D em desenvolvimento, seguindo os 14 incrementos de [SPECIFICATION.md](SPECIFICATION.md).

```sh
npm ci
npm run dev
```

Abra o endereço local exibido pelo Vite. Node 22.12+.

O protótipo técnico 0.3 tem quarto físico, câmera por arraste/setas e monitor HTML interativo. Use E, clique na tela ou Usar computador; Escape retorna ao quarto. Diagnóstico → Capturar quadro no monitor demonstra a transferência de uma imagem 3D. A campanha, os jogos e o portfólio profissional continuam pendentes.

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

O build estático é gerado em `dist/`. Veja [progresso](docs/PROGRESS.md) e [plano](docs/IMPLEMENTATION_PLAN.md). Não há publicação nem merge na main.
