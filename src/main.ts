import './style.css';
import './monitor/monitor.css';
import './os/os.css';
import { Application } from './app/Application';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing');
const app = new Application(root);
app.start();
if (import.meta.hot) import.meta.hot.dispose(() => app.dispose());
