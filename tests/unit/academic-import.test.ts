import { it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { portfolio, safeLink } from '../../src/content/portfolio';
import { createFilesystem, resolveFile } from '../../src/content/filesystem';

it('imports the public identity and detailed ABP contributions without inventing missing personal information', () => {
  expect(portfolio.profile.name).toBe('Alef Gabriel de Oliveira');
  expect(portfolio.profile.skills).toContain('HTML5');
  expect(portfolio.profile.about).not.toMatch(/2º semestre|09\/02\/2026/);
  const abp = portfolio.projects.find((p) => p.id === 'scrum-dungeon')!;
  expect(abp.period).toBe('1DSM — 1º semestre de 2026');
  expect(abp.contributions?.join(' ')).toContain(
    'Sprint 3: fui responsável pelo nível 2',
  );
  expect(abp.video).toBe('https://www.youtube.com/watch?v=iSikcW3CIZE');
  expect(portfolio.contacts).toHaveLength(2);
  for (const contact of portfolio.contacts)
    expect(safeLink(contact.url, true)).toBeTruthy();
  expect(safeLink('mailto:person@example.test', true)).toBeNull();
  expect(
    resolveFile(createFilesystem(portfolio), [
      'projects',
      'scrum-dungeon',
      'README.md',
    ]),
  ).toMatchObject({ content: expect.stringContaining('Sprint 2:') });
});
it('keeps the corrected static edition self contained, synced and free from automatic audio playback', () => {
  for (const root of ['public/portfolio-original', 'docs']) {
    const html = readFileSync(`${root}/index.html`, 'utf8'),
      js = readFileSync(`${root}/js/index.js`, 'utf8');
    expect(html).not.toMatch(/\bautoplay\b|2º semestre|09\/02\/2026/);
    expect(html).toContain('1º Sem. 2026');
    expect(js).not.toContain('inicioAutomatico');
    expect(js).not.toMatch(/\nreproduzir\(\);/);
    expect(js).not.toContain("['pointerdown', 'keydown']");
    for (const match of html.matchAll(
      /(?:src|href)="((?:assets|css|js)\/[^"]+)"/g,
    ))
      expect(existsSync(`${root}/${match[1]}`)).toBe(true);
  }
  for (const file of ['index.html', 'js/index.js', 'css/index.css'])
    expect(readFileSync(`docs/${file}`)).toEqual(
      readFileSync(`public/portfolio-original/${file}`),
    );
});
