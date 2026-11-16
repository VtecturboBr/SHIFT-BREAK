import { portfolio } from '../content/portfolio';
import {
  contactView,
  overviewView,
  projectsView,
  text,
} from '../content/views';

export function accessiblePortfolio(root: HTMLElement, reason?: string): void {
  root.replaceChildren();
  root.className = 'accessible-portfolio';
  root.dataset.mode = 'portfolio';
  const main = document.createElement('main');
  main.append(
    text('p', 'SHIFT//BREAK × ALEF//OS', 'eyebrow'),
    text('h1', 'Portfólio acessível'),
    text(
      'p',
      reason ??
        'Modo de leitura compatível com dispositivos móveis, teclado e leitores de tela. O quarto 3D é a experiência principal.',
    ),
  );
  const room = document.createElement('a');
  room.href = window.location.pathname;
  room.textContent = 'Entrar no quarto 3D';
  main.append(room);
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Seções do portfólio');
  for (const [id, title] of [
    ['overview', 'Apresentação'],
    ['projects', 'Projetos'],
    ['contact', 'Contato e currículo'],
  ]) {
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = title!;
    nav.append(link);
  }
  main.append(nav);
  const overview = overviewView(portfolio);
  overview.id = 'overview';
  main.append(overview);
  const projects = document.createElement('section');
  projects.id = 'projects';
  projects.append(text('h2', 'Projetos'));
  projects.append(projectsView(portfolio));
  const contact = contactView(portfolio);
  contact.id = 'contact';
  main.append(projects, contact);
  root.append(main);
}
