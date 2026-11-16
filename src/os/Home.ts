import { portfolio } from '../content/portfolio';
import { text } from '../content/views';
import { appIcon } from './icons';

export function createHome(open: (id: string) => void): HTMLElement {
  const root = text('section', '', 'os-hub');
  root.setAttribute('aria-label', 'Início do ALEF//OS');
  const header = text('header', '', 'home-header');
  header.append(
    text('strong', 'ALEF//OS', 'home-wordmark'),
    text('span', 'PORTFÓLIO & EXPERIÊNCIAS', 'home-caption'),
  );
  const contact = document.createElement('button');
  contact.textContent = 'Contato';
  contact.onclick = () => open('contact');
  header.append(contact);
  const intro = text('div', '', 'home-intro');
  if (portfolio.profile.photo) {
    const photo = document.createElement('img');
    photo.src = portfolio.profile.photo.src;
    photo.alt = portfolio.profile.photo.alt;
    intro.append(photo);
  }
  const identity = text('div', '', 'home-identity');
  identity.append(
    text('p', 'DESENVOLVIMENTO · CRIATIVIDADE · VELOCIDADE', 'eyebrow'),
    text('h1', portfolio.profile.name ?? 'Bem-vindo ao meu espaço.'),
    text(
      'p',
      'Estudante na FATEC Jacareí. Construindo interfaces, explorando ideias e criando experiências para a web.',
    ),
  );
  const about = document.createElement('button');
  about.className = 'text-action';
  about.textContent = 'Apresentação';
  about.onclick = () => open('profile');
  identity.append(about);
  intro.append(identity);
  const cards = text('div', '', 'home-destinations');
  for (const [id, label, title, note, image, action] of [
    [
      'projects',
      'PROJETOS',
      'Ideias que saíram do papel.',
      'Scrum Dungeon, interfaces e experimentos. Conheça os projetos e minha contribuição em cada um.',
      portfolio.projects[0]?.images[0]?.src,
      'Explorar projetos',
    ],
    [
      'games',
      'JOGOS',
      'A próxima curva é sua.',
      'Entre no DRIFT.exe: uma volta pelo Akagiri Loop. Ou faça uma pausa com SIGNAL.exe.',
      `${import.meta.env.BASE_URL}media/drift-preview.png`,
      'Explorar jogos',
    ],
  ]) {
    const card = text('article', '', `home-destination home-${id}`);
    const cover = text('div', '', 'home-cover');
    if (image) {
      const img = document.createElement('img');
      img.src = image;
      img.alt = '';
      cover.append(img);
    }
    cover.append(text('span', label!, 'cover-label'));
    const body = text('div', '', 'home-card-body');
    body.append(text('h2', title!), text('p', note!));
    const button = document.createElement('button');
    button.className = 'primary-action';
    button.append(appIcon(id!), document.createTextNode(action!));
    button.onclick = () => open(id!);
    body.append(button);
    card.append(cover, body);
    cards.append(card);
  }
  const footer = text('footer', '', 'home-footer');
  footer.append(text('span', 'Seu espaço para conhecer, explorar e jogar.'));
  const academic = document.createElement('a');
  academic.textContent = 'Portfólio acadêmico completo';
  academic.href = `${import.meta.env.BASE_URL}portfolio-original/index.html`;
  academic.target = '_blank';
  academic.rel = 'noopener noreferrer';
  footer.append(academic);
  root.append(header, intro, cards, footer);
  return root;
}
