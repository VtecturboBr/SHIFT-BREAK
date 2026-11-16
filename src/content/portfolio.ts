export interface PortfolioImage {
  id: string;
  title: string;
  src: string;
  alt: string;
}
export interface Project {
  id: string;
  title: string;
  summary: string;
  status: string;
  technologies: string[];
  images: PortfolioImage[];
  repository?: string;
  demo?: string;
  category?: 'Acadêmicos' | 'Pessoais' | 'Profissionais';
  period?: string;
  contributions?: string[];
  video?: string;
  deliveries?: string;
}
export interface PortfolioContent {
  profile: {
    name: string | null;
    age: number | null;
    location: string | null;
    education: string | null;
    focus: string | null;
    about: string | null;
    skills: string[];
    photo?: PortfolioImage;
    audio?: { src: string; title: string };
  };
  projects: Project[];
  gallery: PortfolioImage[];
  contacts: { label: string; url: string }[];
  resume: { url: string; title: string } | null;
}

const room: PortfolioImage = {
  id: 'room-prototype',
  title: 'Quarto · protótipo 3D',
  src: `${import.meta.env.BASE_URL}media/room-prototype.png`,
  alt: 'Captura real do protótipo: mesa, monitor físico, teclado e estante, com iluminação quente e vermelha.',
};

// Owner-supplied academic portfolio; provenance is recorded in docs/PORTFOLIO_IMPORT.md.
export const portfolio: PortfolioContent = {
  profile: {
    name: 'Alef Gabriel de Oliveira',
    age: null,
    location: null,
    education:
      'Desenvolvimento de Software Multiplataforma — FATEC Jacareí. Curso superior de tecnologia, noturno. Turma de ingresso: 1º semestre de 2026.',
    focus: 'Desenvolvimento front-end, tecnologia e experiências digitais',
    about:
      'Sou estudante de Desenvolvimento de Software Multiplataforma na FATEC Jacareí, com interesse em front-end, tecnologia e experiências digitais. Busco uma oportunidade para aplicar e desenvolver meus conhecimentos em HTML, CSS, JavaScript e Scrum, contribuir com projetos e adquirir experiência profissional. Tenho disponibilidade para estágio e jovem aprendiz.',
    skills: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'TypeScript',
      'React',
      'Python',
      'Git e GitHub',
      'Docker',
      'Scrum',
      'Lógica de programação',
    ],
    photo: {
      id: 'alef',
      title: 'Alef Gabriel de Oliveira',
      src: `${import.meta.env.BASE_URL}media/academic/alef.jpeg`,
      alt: 'Retrato de Alef Gabriel de Oliveira',
    },
    audio: {
      src: `${import.meta.env.BASE_URL}media/academic/faint-8bit.mp3`,
      title: 'Faint — tributo 8-bit a Linkin Park, por 8 Bit Universe',
    },
  },
  projects: [
    {
      id: 'scrum-dungeon',
      title: 'Scrum Dungeon',
      category: 'Acadêmicos',
      period: '1DSM — 1º semestre de 2026',
      summary:
        'RPG educativo com cinco níveis, desafios e conquistas para aprender Scrum, desenvolvido pela equipe Octopus Code.',
      status: 'Projeto integrador — ABP',
      technologies: [
        'HTML',
        'CSS',
        'JavaScript',
        'Node.js',
        'Express',
        'EJS',
        'PostgreSQL',
        'Git',
        'Figma',
      ],
      contributions: [
        'Atuei como desenvolvedor da equipe Octopus Code no projeto integrador.',
        'Sprint 1: elaborei o diagrama de caso de uso e participei dos diagramas de classes com Igor e de sequência com Vitor.',
        'Sprint 2: trabalhei com Renan e Thiago no sistema, na tela e no resultado do questionário; também participei da tela de emissão de certificado com Patricia.',
        'Sprint 3: fui responsável pelo nível 2, incluindo história e desafio.',
      ],
      repository: 'https://github.com/octopusCode26/scrum-dungeon',
      deliveries:
        'https://github.com/octopusCode26/scrum-dungeon/tree/main/docs/sprints',
      video: 'https://www.youtube.com/watch?v=iSikcW3CIZE',
      images: [
        {
          id: 'scrum-dungeon',
          title: 'Scrum Dungeon — Octopus Code',
          src: `${import.meta.env.BASE_URL}media/academic/scrum-dungeon.png`,
          alt: 'Identidade visual do Scrum Dungeon',
        },
      ],
    },
    {
      id: 'vtec-motors',
      title: 'V-Tec Motors',
      category: 'Pessoais',
      status: 'Interface web',
      summary:
        'Vitrine digital para os clássicos da Honda, com imagens em destaque, carrossel interativo e navegação entre modelos.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      repository:
        'https://github.com/VtecturboBr/Projeto---concessionaria-de-carros-honda',
      images: [
        {
          id: 'vtec-demo',
          title: 'Demonstração do V-Tec Motors',
          src: `${import.meta.env.BASE_URL}media/academic/vtec-demo.gif`,
          alt: 'Carrossel de carros Honda do V-Tec Motors',
        },
      ],
    },
    {
      id: 'lin0',
      title: 'LIN0',
      category: 'Pessoais',
      status: 'Protótipo em desenvolvimento',
      summary:
        'Hero shooter em primeira pessoa no navegador, com personagens, habilidades, baralhos personalizados, partidas locais com bots e campo de treinamento. O modo online ainda não está implementado.',
      technologies: ['TypeScript', 'Three.js', 'Vite'],
      repository: 'https://github.com/VtecturboBr/LIN0---Web-Hero-Shooter-Game',
      images: [
        {
          id: 'lin0-map',
          title: 'Distrito Shōtō — LIN0',
          src: `${import.meta.env.BASE_URL}media/academic/lin0-map.jpg`,
          alt: 'Cenário urbano 3D com prédios, ruas e ponto de captura do LIN0',
        },
      ],
    },
    {
      id: 'shift-break',
      category: 'Pessoais',
      title: 'SHIFT//BREAK × ALEF//OS',
      summary:
        'Portfólio 3D em desenvolvimento: quarto, computador interativo e gerenciador de janelas. REDLINE disponível em protótipo; luta, FPS e campanha seguem em desenvolvimento.',
      status: 'Protótipo em desenvolvimento',
      technologies: ['Three.js', 'TypeScript', 'Vite'],
      images: [room],
      repository: 'https://github.com/VtecturboBr/SHIFT-BREAK',
    },
  ],
  gallery: [room],
  contacts: [
    { label: 'GitHub — VtecturboBr', url: 'https://github.com/VtecturboBr' },
    {
      label: 'LinkedIn — Alef Gabriel de Oliveira',
      url: 'https://www.linkedin.com/in/alef-gabriel-oliveira-9bb742346',
    },
  ],
  resume: null,
};

export function safeLink(value: string, contact = false): string | null {
  try {
    const url = new URL(value);
    if (
      contact &&
      !['github.com', 'linkedin.com', 'www.linkedin.com'].includes(url.hostname)
    )
      return null;
    if (url.protocol === 'https:' && !url.username && !url.password)
      return url.href;
  } catch {
    /* Invalid content is omitted from rendered links. */
  }
  return null;
}

export function safeAsset(value: string): string | null {
  if (
    /^(?:\.\/|\/)?media\/[a-zA-Z0-9_./-]+$/.test(value) &&
    !value.includes('..')
  )
    return value;
  return null;
}
