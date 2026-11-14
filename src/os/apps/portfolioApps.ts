import { portfolio } from '../../content/portfolio';
import {
  contactView,
  imageView,
  overviewView,
  projectView,
  text,
} from '../../content/views';
import type { AppDefinition } from '../registry';
import { createExplorer } from './Explorer';

export const portfolioApps: AppDefinition[] = [
  {
    id: 'explorer',
    title: 'Arquivos',
    symbol: '▱',
    description: 'Explorar pastas e arquivos',
    wide: true,
    create: createExplorer,
  },
  {
    id: 'profile',
    title: 'Apresentação',
    symbol: '◎',
    description: 'Identidade e habilidades',
    create: () => overviewView(portfolio),
  },
  {
    id: 'projects',
    title: 'Projetos',
    symbol: '◇',
    description: 'Trabalhos e tecnologias',
    wide: true,
    create: () => {
      const root = text('div', '', 'content-app');
      for (const project of portfolio.projects)
        root.append(projectView(project));
      return root;
    },
  },
  {
    id: 'gallery',
    title: 'Galeria',
    symbol: '▧',
    description: 'Capturas reais e trabalhos visuais',
    wide: true,
    create: () => {
      const root = text('div', '', 'content-app');
      root.append(text('h2', 'Galeria'));
      for (const image of portfolio.gallery) root.append(imageView(image));
      return root;
    },
  },
  {
    id: 'contact',
    title: 'Contato',
    symbol: '@',
    description: 'Links profissionais e currículo',
    create: () => contactView(portfolio),
  },
];
