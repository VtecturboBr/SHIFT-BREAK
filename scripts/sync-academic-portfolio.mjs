import { cpSync, copyFileSync, writeFileSync } from 'node:fs';
for (const folder of ['assets', 'css', 'js'])
  cpSync(`public/portfolio-original/${folder}`, `docs/${folder}`, {
    recursive: true,
  });
copyFileSync('public/portfolio-original/index.html', 'docs/index.html');
writeFileSync('docs/.nojekyll', '');
console.log(
  'Static academic portfolio synced to docs/; no bundler or workflow required to serve it.',
);
