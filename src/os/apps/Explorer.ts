import { createFilesystem, resolveFile } from '../../content/filesystem';
import { portfolio, safeAsset } from '../../content/portfolio';
import { imageView, text } from '../../content/views';
import { appIcon } from '../icons';

export function createExplorer(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'content-app explorer-app';
  const filesystem = createFilesystem(portfolio);
  let path: string[] = [];
  const focusPath = () =>
    root
      .querySelector<HTMLElement>(
        '.text-viewer, .code-viewer, .file-path button:last-child',
      )
      ?.focus({ preventScroll: true });
  const render = () => {
    root.replaceChildren();
    const nav = document.createElement('nav');
    nav.className = 'file-path';
    nav.setAttribute('aria-label', 'Caminho do arquivo');
    const home = document.createElement('button');
    home.textContent = 'home';
    home.onclick = () => {
      path = [];
      render();
      focusPath();
    };
    nav.append(home);
    path.forEach((part, index) => {
      const button = document.createElement('button');
      button.textContent = `/ ${part}`;
      button.onclick = () => {
        path = path.slice(0, index + 1);
        render();
        focusPath();
      };
      nav.append(button);
    });
    root.append(nav);
    if (path.length) {
      const back = document.createElement('button');
      back.textContent = 'Voltar à pasta';
      back.onclick = () => {
        path.pop();
        render();
        focusPath();
      };
      root.append(back);
    }
    const file = resolveFile(filesystem, path);
    if (!file) {
      root.append(text('p', 'Arquivo não encontrado. Volte à pasta home.'));
      return;
    }
    if (file.kind === 'folder') {
      const list = document.createElement('div');
      list.className = 'file-list';
      for (const item of file.children) {
        const button = document.createElement('button');
        button.textContent = `${item.kind === 'folder' ? '▸ ' : ''}${item.name}`;
        button.prepend(
          appIcon(
            item.kind === 'folder'
              ? 'explorer'
              : item.kind === 'image'
                ? 'gallery'
                : 'notes',
          ),
        );
        button.onclick = () => {
          path.push(item.name);
          render();
          focusPath();
        };
        list.append(button);
      }
      root.append(list);
      if (!path.length && !portfolio.resume)
        root.append(
          text(
            'p',
            'resume.pdf: aguardando o currículo real do autor.',
            'empty-state',
          ),
        );
    } else if (file.kind === 'text' || file.kind === 'code') {
      const pre = document.createElement('pre');
      pre.className = file.kind === 'code' ? 'code-viewer' : 'text-viewer';
      pre.tabIndex = 0;
      pre.setAttribute('aria-label', file.name);
      pre.textContent = file.content;
      root.append(pre);
    } else if (file.kind === 'image')
      root.append(
        imageView({
          id: file.name,
          title: file.name,
          src: file.src,
          alt: file.alt,
        }),
      );
    else if (file.kind === 'pdf') {
      const src = safeAsset(file.src);
      if (!src) {
        root.append(text('p', 'PDF indisponível.'));
        return;
      }
      const object = document.createElement('object');
      object.data = src;
      object.type = 'application/pdf';
      object.setAttribute('aria-label', 'Currículo PDF');
      object.className = 'pdf-viewer';
      const link = document.createElement('a');
      link.href = src;
      link.textContent = 'Abrir currículo PDF';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      object.append(link);
      root.append(object);
    }
  };
  render();
  return root;
}
