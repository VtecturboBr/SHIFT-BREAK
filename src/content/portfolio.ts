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

// Only verified project facts. Public author details require owner-supplied content.
export const portfolio: PortfolioContent = {
  profile: {
    name: null,
    age: null,
    location: null,
    education: null,
    focus: null,
    about: null,
    skills: [],
  },
  projects: [
    {
      id: 'shift-break',
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
  contacts: [],
  resume: null,
};

export function safeLink(value: string, contact = false): string | null {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password)
      return url.href;
    if (contact && /^mailto:[^\s?]+@[^\s?]+\.[^\s?]+$/.test(value))
      return value;
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
