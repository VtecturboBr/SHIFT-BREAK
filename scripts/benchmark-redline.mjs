import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const [
  baseline,
  candidate,
  output = 'test-results/race-feel-performance.json',
] = process.argv.slice(2);
if (!baseline || !candidate)
  throw new Error(
    'Usage: node scripts/benchmark-redline.mjs BASELINE_URL CANDIDATE_URL [OUTPUT]',
  );
const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader'],
});
const runs = [];
try {
  for (let round = 0; round < 3; round++) {
    for (const [name, url] of [
      ['baseline', baseline],
      ['candidate', candidate],
    ]) {
      const page = await browser.newPage({
        viewport: { width: 960, height: 640 },
      });
      await page.route('**/benchmark-feel', (route) =>
        route.fulfill({ contentType: 'text/html', body: '<body></body>' }),
      );
      await page.goto(`${url}/benchmark-feel`);
      const result = await page.evaluate(async () => {
        const path = '/src/games/redline/RedlineWorld.ts',
          threePath = '/node_modules/three/build/three.module.js';
        const { RedlineWorld } = await import(path),
          THREE = await import(threePath);
        const world = new RedlineWorld(document.body, () => {}, true);
        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setSize(960, 640);
        renderer.setPixelRatio(0.5);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        world.camera.aspect = 1.5;
        world.camera.updateProjectionMatrix();
        world.model.phase = 'running';
        world.model.update = () => {};
        world.model.player.speed = 60;
        world.model.rival.speed = 62;
        world.model.player.lane = 0;
        world.model.rival.lane = -1.5;
        const times = [];
        for (let frame = -12; frame < 30; frame++) {
          world.model.player.s = 1050 + Math.max(0, frame) * 0.75;
          world.model.rival.s = world.model.player.s + 24;
          const start = performance.now();
          world.update(1 / 60);
          renderer.render(world.scene, world.camera);
          renderer.getContext().finish();
          if (frame >= 0) times.push(performance.now() - start);
        }
        times.sort((a, b) => a - b);
        const result = {
          medianMs: times[15],
          p95Ms: times[28],
          meanMs: times.reduce((a, b) => a + b, 0) / times.length,
          calls: renderer.info.render.calls,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          programs: renderer.info.programs.length,
        };
        world.dispose();
        renderer.dispose();
        return result;
      });
      runs.push({ name, round, ...result });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
const summarize = (name) => {
  const rows = runs.filter((row) => row.name === name);
  return Object.fromEntries(
    [
      'medianMs',
      'p95Ms',
      'meanMs',
      'calls',
      'geometries',
      'textures',
      'programs',
    ].map((key) => [
      key,
      rows.reduce((sum, row) => sum + row[key], 0) / rows.length,
    ]),
  );
};
const report = {
  baselineCommit: '691b975',
  method:
    'Chromium SwiftShader; 960x640 DPR 0.5; no audio context; fixed course positions; physics disabled equally; visual update + synchronous GPU completion; 12 warmup + 30 frames per run; 3 alternating rounds. Not a physical GPU FPS benchmark.',
  baseline: summarize('baseline'),
  candidate: summarize('candidate'),
  runs,
};
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify({ baseline: report.baseline, candidate: report.candidate }),
);
