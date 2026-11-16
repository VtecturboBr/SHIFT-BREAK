import {
  safeAsset,
  safeLink,
  type PortfolioContent,
  type PortfolioImage,
  type Project,
} from './portfolio';

export function text(tag: string, value: string, className = ''): HTMLElement {
  const node = document.createElement(tag);
  node.textContent = value;
  node.className = className;
  return node;
}

export function externalLink(
  label: string,
  value: string,
  contact = false,
): HTMLElement {
  const url = safeLink(value, contact);
  if (!url) return text('span', `${label}: endereço não configurado.`);
  const link = document.createElement('a');
  link.textContent = label;
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

export function imageView(image: PortfolioImage): HTMLElement {
  const figure = document.createElement('figure');
  figure.className = 'portfolio-image';
  const src = safeAsset(image.src);
  if (!src) {
    figure.append(text('p', 'Imagem indisponível: caminho inválido.'));
    return figure;
  }
  const img = document.createElement('img');
  img.src = src;
  img.alt = image.alt;
  img.loading = 'lazy';
  img.onerror = () => {
    figure.replaceChildren(text('p', 'A imagem não pôde ser carregada.'));
  };
  figure.append(img, text('figcaption', image.title));
  return figure;
}

export function projectView(project: Project): HTMLElement {
  const article = document.createElement('article');
  article.className = 'project-card';
  article.append(
    text('p', project.status, 'eyebrow'),
    text('h2', project.title),
    text('p', project.summary),
    text('p', `Tecnologias do projeto: ${project.technologies.join(' · ')}`),
  );
  const links = document.createElement('nav');
  links.setAttribute('aria-label', `Links de ${project.title}`);
  if (project.repository)
    links.append(externalLink('Repositório', project.repository));
  if (project.demo) links.append(externalLink('Demonstração', project.demo));
  article.append(links);
  if (project.period) article.append(text('p', project.period));
  if (project.contributions?.length) {
    article.append(text('h3', 'Minha contribuição'));
    for (const contribution of project.contributions)
      article.append(text('p', contribution));
  }
  if (project.deliveries)
    links.append(externalLink('Entregas por sprint', project.deliveries));
  if (project.video)
    links.append(externalLink('Vídeo da ABP no YouTube', project.video));
  for (const image of project.images) article.append(imageView(image));
  return article;
}

export function contactView(content: PortfolioContent): HTMLElement {
  const root = document.createElement('section');
  root.className = 'content-app';
  root.append(text('h2', 'Contato'));
  if (!content.contacts.length)
    root.append(
      text('p', 'Redes profissionais ainda não fornecidas pelo autor.'),
    );
  for (const contact of content.contacts)
    root.append(externalLink(contact.label, contact.url, true));
  root.append(text('h3', 'Currículo'));
  const resume = content.resume && safeAsset(content.resume.url);
  if (resume && content.resume) {
    const link = document.createElement('a');
    link.href = resume;
    link.textContent = content.resume.title;
    link.download = 'resume.pdf';
    root.append(link);
  } else root.append(text('p', 'Currículo PDF ainda não fornecido.'));
  return root;
}

export function projectsView(content: PortfolioContent): HTMLElement {
  const root = text('div', '', 'content-app');
  for (const category of ['Acadêmicos', 'Pessoais', 'Profissionais']) {
    root.append(text('h2', category));
    const projects = content.projects.filter((p) => p.category === category);
    if (!projects.length)
      root.append(text('p', 'Nenhum projeto cadastrado nesta categoria.'));
    for (const project of projects) root.append(projectView(project));
  }
  return root;
}

export function overviewView(content: PortfolioContent): HTMLElement {
  const root = document.createElement('section');
  root.className = 'content-app';
  root.append(
    text(
      'p',
      content.profile.name
        ? 'PORTFÓLIO · APRESENTAÇÃO'
        : 'PORTFÓLIO · CONTEÚDO EM PREPARAÇÃO',
      'eyebrow',
    ),
    text('h2', content.profile.name ?? 'Identidade pública a informar'),
    text(
      'p',
      content.profile.about ??
        'A apresentação profissional será exibida quando for fornecida pelo autor.',
    ),
    text('h3', 'Habilidades'),
  );
  if (content.profile.photo) {
    const photo = imageView(content.profile.photo);
    photo.classList.add('profile-photo');
    root.prepend(photo);
  }
  root.append(
    text(
      'p',
      content.profile.skills.length
        ? content.profile.skills.join(' · ')
        : 'Habilidades profissionais ainda não confirmadas pelo autor.',
    ),
  );
  const details = document.createElement('dl');
  for (const [label, value] of [
    ['Formação', content.profile.education],
    ['Área de atuação', content.profile.focus],
  ]) {
    details.append(
      text('dt', String(label)),
      text('dd', value == null ? 'A informar pelo autor' : String(value)),
    );
  }
  root.append(details);
  const academic = document.createElement('a');
  academic.href = `${import.meta.env.BASE_URL}portfolio-original/index.html`;
  academic.textContent = 'Portfólio acadêmico completo';
  academic.target = '_blank';
  academic.rel = 'noopener noreferrer';
  root.append(academic);
  if (content.profile.audio) {
    const src = safeAsset(content.profile.audio.src);
    if (src) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      audio.src = src;
      audio.setAttribute('aria-label', content.profile.audio.title);
      root.append(
        text('h3', 'Trilha opcional'),
        text('p', content.profile.audio.title),
        audio,
      );
    }
  }
  return root;
}
