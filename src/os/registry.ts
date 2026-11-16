export interface AppDefinition {
  id: string;
  title: string;
  symbol: string;
  description: string;
  wide?: boolean;
  category?: 'Portfólio' | 'Experiências' | 'Ferramentas';
  initialSize?: { width: number; height: number };
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
      initialSize: { width: 560, height: 400 },
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
          '<p class="eyebrow">ALEF//OS</p><h2>Um espaço para conhecer e explorar.</h2><p>O portfólio de Alef Gabriel de Oliveira, dentro de um computador no quarto. Conheça os projetos, explore os arquivos ou experimente os jogos.</p><h3>Como navegar</h3><p>Use Início para voltar à apresentação sem fechar suas janelas. Aplicativos reúne todas as áreas. Minimize e restaure pela barra inferior; pressione Esc para voltar ao quarto.</p><p>Os jogos disponíveis são protótipos jogáveis. Outros títulos continuam em desenvolvimento.</p>';
        return content;
      },
    },
  ];
}
