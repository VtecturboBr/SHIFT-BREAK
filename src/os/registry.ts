export interface AppDefinition {
  id: string;
  title: string;
  symbol: string;
  description: string;
  wide?: boolean;
  create: () => HTMLElement;
}

export function coreApps(diagnostic: HTMLElement): AppDefinition[] {
  return [
    {
      id: 'monitor',
      title: 'Diagnóstico do monitor',
      symbol: '◈',
      description: 'Validar cliques e coordenadas',
      wide: true,
      create: () => diagnostic,
    },
    {
      id: 'notes',
      title: 'Notas',
      symbol: '▤',
      description: 'Um espaço para experimentar',
      create: () => {
        const content = document.createElement('div');
        content.className = 'notes-app';
        const label = document.createElement('label');
        label.textContent = 'Suas notas nesta sessão';
        const textarea = document.createElement('textarea');
        textarea.setAttribute('aria-label', 'Suas notas nesta sessão');
        textarea.placeholder =
          'Escreva, minimize e retorne. O conteúdo continua aqui.';
        const note = document.createElement('p');
        note.textContent =
          'Notas temporárias. Fechar esta janela ou recarregar descarta o texto.';
        content.append(label, textarea, note);
        return content;
      },
    },
    {
      id: 'system',
      title: 'Sobre o sistema',
      symbol: '⌘',
      description: 'Estado de desenvolvimento',
      create: () => {
        const content = document.createElement('div');
        content.className = 'system-app';
        content.innerHTML =
          '<p class="eyebrow">ALEF//OS · 0.5.0</p><h2>Um sistema dentro do mundo.</h2><p>Núcleo do desktop em desenvolvimento. Janelas, foco e controles funcionam no monitor físico.</p><p>Portfólio e arquivos disponíveis. Identidade, habilidades e contatos aguardam os dados do autor; jogos seguem o roadmap.</p>';
        return content;
      },
    },
  ];
}
