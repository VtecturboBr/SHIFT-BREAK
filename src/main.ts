import './style.css';
import './monitor/monitor.css';
import './os/os.css';
import './content/content.css';
import './games/games.css';
import './games/redline/redline.css';
import type { Application } from './app/Application';
import { accessiblePortfolio } from './ui/AccessiblePortfolio';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing');
let app: Application | undefined;
let disposed = false;

if (new URLSearchParams(window.location.search).get('view') === 'portfolio') {
  accessiblePortfolio(root);
} else {
  root.innerHTML =
    '<p class="boot-status" role="status">Carregando o quarto 3D…</p>';
  void import('./app/Application')
    .then(({ Application }) => {
      if (disposed) return;
      app = new Application(root);
      app.start();
    })
    .catch((error: unknown) => {
      console.error(error);
      if (!disposed)
        accessiblePortfolio(
          root,
          'Não foi possível carregar o ambiente 3D. O portfólio continua disponível para leitura.',
        );
    });
}
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposed = true;
    app?.dispose();
  });
