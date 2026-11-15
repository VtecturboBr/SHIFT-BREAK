import type { AppDefinition } from '../registry';

export function gameLibrary(
  launch: () => void,
  launchRedline: () => void,
): AppDefinition {
  return {
    id: 'games',
    title: 'Biblioteca de jogos',
    symbol: '◉',
    description: 'Jogos e experiências',
    wide: true,
    create: () => {
      const root = document.createElement('section');
      root.className = 'content-app game-library';
      const heading = document.createElement('h2');
      heading.textContent = 'Sua próxima experiência.';
      root.append(heading);
      const cards = [
        [
          'SIGNAL.exe',
          'Colete sinais antes que o tempo termine. Jogo de teste do launcher.',
          'Disponível · protótipo',
          true,
        ],
        [
          'SHIFT//BREAK',
          'Campanha REDLINE → BREAKPOINT → OVERDRIVE.',
          'Em desenvolvimento · incrementos 10–12',
          false,
        ],
        [
          'DRIFT.exe',
          'Akagiri Loop: 6,9 km de touge, onze grampos, barragem e vertedouro seco. Uma volta completa nos dois sentidos.',
          'Disponível · protótipo REDLINE',
          true,
        ],
        [
          'FIGHT.exe',
          'Combate corpo a corpo na estrada.',
          'Em desenvolvimento · incremento 08',
          false,
        ],
        [
          'FPS.exe',
          'Combate em primeira pessoa no túnel.',
          'Em desenvolvimento · incremento 09',
          false,
        ],
      ] as const;
      for (const [title, description, status, available] of cards) {
        const card = document.createElement('article');
        card.className = 'game-card';
        const cover = document.createElement('div');
        cover.className = 'game-cover';
        cover.textContent = title;
        cover.setAttribute('aria-hidden', 'true');
        const name = document.createElement('h3');
        name.textContent = title;
        const note = document.createElement('p');
        note.textContent = description;
        const state = document.createElement('small');
        state.textContent = status;
        const button = document.createElement('button');
        button.textContent = available
          ? `Iniciar ${title}`
          : 'Indisponível nesta versão';
        button.disabled = !available;
        if (available)
          button.onclick = title === 'DRIFT.exe' ? launchRedline : launch;
        card.append(cover, name, note, state, button);
        root.append(card);
      }
      return root;
    },
  };
}
