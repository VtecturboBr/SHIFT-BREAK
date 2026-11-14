# Checkpoints de desenvolvimento

O remoto iniciou vazio: `main` é apenas o nome configurado como padrão no GitHub, sem commit. Nenhum merge, push, deploy ou PR foi realizado.

| Branch local                | Base                        | Incremento |
| --------------------------- | --------------------------- | ---------- |
| feat/01-project-foundation  | órfã (repositório vazio)    | 01 · 0.1.0 |
| feat/02-room-prototype      | feat/01-project-foundation  | 02 · 0.2.0 |
| feat/03-interactive-monitor | feat/02-room-prototype      | 03 · 0.3.0 |
| feat/04-os-core             | feat/03-interactive-monitor | 04 · 0.4.0 |
| feat/05-portfolio-system    | feat/04-os-core             | 05 · 0.5.0 |
| feat/06-game-launcher       | feat/05-portfolio-system    | 06 · 0.6.0 |

São branches empilhadas; a mais recente contém as anteriores. Comparar cada branch com sua base para revisar apenas seu incremento. Usar `git log --oneline --decorate` para consultar hashes reais. A integração à main depende de autorização do proprietário.

Incremento 07: feat/07-redline, base feat/06-game-launcher, versão 0.7.0. Sem merge/push.

Reuso solicitado: feat/07-reuse-touge, base feat/07-redline, versão 0.7.1. Sem merge/push.
