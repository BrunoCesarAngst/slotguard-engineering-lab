import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderMedia} from '@remotion/renderer';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {availableParallelism, cpus, totalmem} from 'node:os';
import {performance} from 'node:perf_hooks';
import path from 'node:path';
import {renderSettings} from './render-settings.mjs';

const stages = JSON.parse(await readFile('src/completos.json', 'utf8'));
const directory = 'output/benchmark';
await mkdir(directory, {recursive: true});
const cases = [
  {id: 'Etapa1Vertical', stage: 1, scene: 0, label: 'animacao'},
  {id: 'Etapa2Vertical', stage: 2, scene: 3, label: 'reserva-com-video'},
  {id: 'Etapa2Horizontal', stage: 2, scene: 4, label: 'conflito'},
];
const report = {
  status: 'running', baseline: 3, candidates: [1, 2, 3, 4], rounds: 2,
  frameCount: 90, settings: renderSettings,
  environment: {platform: process.platform, arch: process.arch,
    cpu: cpus()[0]?.model, logicalCpus: availableParallelism(), memoryBytes: totalmem()},
  samples: [],
};
const save = () => writeFile('output/benchmark.json', JSON.stringify(report, null, 2) + '\n');
await save();
const serveUrl = await bundle({entryPoint: path.resolve('src/index.tsx'), enableCaching: false});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const browser = await openBrowser('chrome', {browserExecutable});
try {
  for (const test of cases) {
    const stage = stages.find(stage => stage.stage === test.stage);
    const first = stage.scenes[test.scene].startFrame + 30;
    const composition = await selectComposition({serveUrl, id: test.id, browserExecutable, puppeteerInstance: browser});
    const common = {serveUrl, composition, browserExecutable, puppeteerInstance: browser, ...renderSettings};
    // Aquecer fontes, capturas e decodificador antes de medir cada cenário.
    await renderMedia({...common, concurrency: 3, frameRange: [first, first + 14],
      outputLocation: `${directory}/warmup-${test.label}.mp4`});
    for (const [round, order] of [[3, 1, 4, 2], [2, 4, 1, 3]].entries()) {
      for (const concurrency of order) {
        const file = `${test.label}-r${round + 1}-c${concurrency}.mp4`;
        const started = performance.now();
        await renderMedia({...common, concurrency, frameRange: [first, first + 89],
          outputLocation: `${directory}/${file}`});
        const elapsedMs = performance.now() - started;
        report.samples.push({case: test.label, composition: test.id, round: round + 1,
          concurrency, frameRange: [first, first + 89], elapsedMs, file});
        await save();
        console.log(`Benchmark ${test.label}, rodada ${round + 1}, concurrency=${concurrency}: ${(elapsedMs / 1000).toFixed(2)}s`);
      }
    }
  }
  report.status = 'rendered';
  await save();
} finally {
  await browser.close({silent: true});
}
