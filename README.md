# SHIFT//BREAK × ALEF//OS

Portfólio 3D em desenvolvimento, seguindo os 14 incrementos de [SPECIFICATION.md](SPECIFICATION.md).

```sh
npm ci
npm run dev
```

Abra o endereço local exibido pelo Vite. Node 22.12+.

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

O build estático é gerado em `dist/`. Veja [progresso](docs/PROGRESS.md) e [plano](docs/IMPLEMENTATION_PLAN.md). Não há publicação nem merge na main.
