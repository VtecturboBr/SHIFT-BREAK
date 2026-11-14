import { describe, expect, it } from 'vitest';
import { createFilesystem, resolveFile } from '../../src/content/filesystem';
import { portfolio, safeAsset, safeLink } from '../../src/content/portfolio';

describe('verified content and virtual filesystem', () => {
  it('navigates folders without traversal and omits unprovided résumé', () => {
    const fs = createFilesystem(portfolio);
    expect(resolveFile(fs, ['skills.json'])).toMatchObject({ kind: 'code' });
    expect(
      resolveFile(fs, ['projects', 'shift-break', 'README.md']),
    ).toMatchObject({ kind: 'text' });
    expect(resolveFile(fs, ['resume.pdf'])).toBeNull();
    expect(resolveFile(fs, ['..', 'identity.txt'])).toBeNull();
    expect(resolveFile(fs, ['skills.json', 'nested'])).toBeNull();
    expect(resolveFile(fs, ['identity.txt'])).toMatchObject({
      content: expect.stringContaining('a informar pelo autor'),
    });
    const configured = createFilesystem({
      ...portfolio,
      resume: { url: './media/owner-supplied.pdf', title: 'Currículo real' },
    });
    expect(resolveFile(configured, ['resume.pdf'])).toMatchObject({
      kind: 'pdf',
    });
  });
  it('allows intentional links and local assets while rejecting executable or misleading addresses', () => {
    expect(safeLink('https://github.com/VtecturboBr/SHIFT-BREAK')).toContain(
      'github.com',
    );
    for (const value of [
      'javascript:alert(1)',
      'data:text/html,hello',
      '//evil.test',
      'https://user:pass@evil.test',
      'ftp://example.test',
    ])
      expect(safeLink(value)).toBeNull();
    expect(safeLink('mailto:owner@example.test', true)).toBe(
      'mailto:owner@example.test',
    );
    expect(safeLink('mailto:owner@example.test?body=hidden', true)).toBeNull();
    expect(safeAsset('./media/photo.png')).toBe('./media/photo.png');
    expect(safeAsset('/media/../secret')).toBeNull();
    expect(safeAsset('https://tracking.example.test/x')).toBeNull();
  });
});
