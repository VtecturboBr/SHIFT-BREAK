import type { PortfolioContent } from './portfolio';

export type VirtualFile =
  | { kind: 'folder'; name: string; children: VirtualFile[] }
  | { kind: 'text' | 'code'; name: string; content: string }
  | { kind: 'image'; name: string; src: string; alt: string }
  | { kind: 'pdf'; name: string; src: string };

export function createFilesystem(content: PortfolioContent): VirtualFile {
  const { profile } = content;
  const children: VirtualFile[] = [
    {
      kind: 'text',
      name: 'identity.txt',
      content: `Nome público: ${profile.name ?? 'a informar pelo autor'}\nIdade: ${profile.age ?? 'a informar pelo autor'}\nLocalização: ${profile.location ?? 'a informar pelo autor'}\nFormação: ${profile.education ?? 'a informar pelo autor'}\nÁrea de atuação: ${profile.focus ?? 'a informar pelo autor'}`,
    },
    {
      kind: 'text',
      name: 'about_me.md',
      content:
        profile.about ??
        '# Apresentação pendente\n\nO autor ainda não forneceu uma apresentação profissional.',
    },
    {
      kind: 'code',
      name: 'skills.json',
      content: JSON.stringify(
        {
          status: profile.skills.length
            ? 'confirmed'
            : 'awaiting_owner_content',
          skills: profile.skills,
        },
        null,
        2,
      ),
    },
    {
      kind: 'folder',
      name: 'projects',
      children: content.projects.map((project) => ({
        kind: 'folder',
        name: project.id,
        children: [
          {
            kind: 'text',
            name: 'README.md',
            content: `# ${project.title}\n\n${project.summary}\n\nEstado: ${project.status}`,
          },
          {
            kind: 'code',
            name: 'stack.json',
            content: JSON.stringify(
              { technologies: project.technologies },
              null,
              2,
            ),
          },
          ...project.images.map((image): VirtualFile => ({
            kind: 'image',
            name: `${image.id}.png`,
            src: image.src,
            alt: image.alt,
          })),
        ],
      })),
    },
    {
      kind: 'folder',
      name: 'gallery',
      children: content.gallery.map((image) => ({
        kind: 'image',
        name: `${image.id}.png`,
        src: image.src,
        alt: image.alt,
      })),
    },
  ];
  if (content.resume)
    children.push({ kind: 'pdf', name: 'resume.pdf', src: content.resume.url });
  return { kind: 'folder', name: 'home', children };
}

export function resolveFile(
  root: VirtualFile,
  path: string[],
): VirtualFile | null {
  let current = root;
  for (const name of path) {
    if (current.kind !== 'folder') return null;
    const next = current.children.find((entry) => entry.name === name);
    if (!next) return null;
    current = next;
  }
  return current;
}
