import { text } from '../../content/views';
import type { AppDefinition } from '../registry';

export function gameLibrary(
  launch: () => void,
  launchRedline: () => void,
): AppDefinition {
  return {
    id: 'games',
    title: 'Biblioteca de jogos',
    symbol: '◉',
    category: 'Experiências',
    description: 'Jogos e experiências',
    wide: true,
    create: () => {
      const root = text('section', '', 'content-app game-library');
      root.append(
        text('p', 'EXPERIÊNCIAS / JOGOS', 'eyebrow'),
        text('h2', 'Escolha sua próxima experiência.'),
      );
      const grid = text('div', '', 'game-grid');
      for (const [title, description, image, run] of [
        [
          'DRIFT.exe',
          'Desafie seu rival no Akagiri Loop. Curvas fechadas, mudanças de elevação e turbo conquistado no drift.',
          'drift-preview.png',
          launchRedline,
        ],
        [
          'SIGNAL.exe',
          'Uma pausa rápida: colete os sinais antes que o tempo termine e desafie sua pontuação.',
          'signal-preview.png',
          launch,
        ],
      ] as const) {
        const card = text('article', '', 'game-card');
        const cover = document.createElement('img');
        cover.className = 'game-cover';
        cover.src = `${import.meta.env.BASE_URL}media/${image}`;
        cover.alt =
          title === 'DRIFT.exe'
            ? 'Corrida noturna no Akagiri Loop'
            : 'Arena do minijogo SIGNAL';
        cover.loading = 'lazy';
        const body = text('div', '', 'game-card-body');
        body.append(
          text('p', 'DISPONÍVEL · PROTÓTIPO JOGÁVEL', 'eyebrow'),
          text('h3', title),
          text('p', description),
        );
        const button = document.createElement('button');
        button.className = 'primary-action';
        button.textContent = `Iniciar ${title}`;
        button.onclick = run;
        body.append(button);
        card.append(cover, body);
        grid.append(card);
      }
      const future = document.createElement('details');
      future.className = 'future-games';
      const summary = document.createElement('summary');
      summary.textContent = 'Em desenvolvimento';
      future.append(summary);
      for (const [name, note] of [
        [
          'SHIFT//BREAK',
          'Uma campanha que conecta corrida, luta e ação em primeira pessoa.',
        ],
        ['FIGHT.exe', 'Combate corpo a corpo na estrada.'],
        ['FPS.exe', 'Ação em primeira pessoa no túnel.'],
      ])
        future.append(text('h3', name!), text('p', note!));
      root.append(grid, future);
      return root;
    },
  };
}
