const paths: Record<string, string> = {
  minimize: 'M5 12h14',
  maximize: 'M5 5h14v14H5z',
  close: 'm6 6 12 12 M18 6 6 18',
  home: 'm3 10 9-7 9 7v11H3z M9 21v-8h6v8',
  monitor: 'M3 4h18v13H3z M8 21h8 M12 17v4',
  notes: 'M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h5',
  system: 'M12 11v6 M12 7v1 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  explorer: 'M3 7V4h7l2 3h9v14H3z',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3a8 6 0 0 1 16 0v3',
  projects: 'M3 7h18v14H3z M8 7V3h8v4 M3 12h18 M10 12v3h4v-3',
  gallery: 'M3 3h18v18H3z m0 14 6-6 4 4 3-3 5 5 M16 7h1',
  contact: 'M3 5h18v14H3z m0 0 9 7 9-7',
  games:
    'M7 7h10c3 0 4 4 4 9 0 4-4 2-6 0H9c-2 2-6 4-6 0 0-5 1-9 4-9 M6 11h6 M9 8v6 M16 11h1 M18 14h1',
};

export function appIcon(id: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('app-icon');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', paths[id] ?? paths.system!);
  svg.append(path);
  return svg;
}

export function searchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}
