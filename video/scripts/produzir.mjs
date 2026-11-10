// Produção local: nunca envia arquivos nem publica em serviços externos.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cp, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modes = new Set(['--check', '--plan', '--preview', '--gerar', '--smoke', '--benchmark']);
const args = process.argv.slice(2);
const only = args[1]?.match(/^--only=(Etapa[12](?:Vertical|Horizontal))$/)?.[1];
if (!modes.has(args[0]) || args.length > 2 || (args.length === 2 && (!only || args[0] === '--benchmark'))) {
  console.error('Use --check, --plan, --preview, --gerar, --smoke ou --benchmark, seguido opcionalmente de --only=Etapa2Horizontal.');
  process.exit(2);
}
const mode = args[0];
const python = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const steps = args[0] === '--benchmark' ? [
  [python, ['scripts/narrar-completos.py']],
  [process.execPath, ['scripts/benchmark.mjs']],
  [python, ['scripts/verificar-benchmark.py']],
] : [
  [python, ['scripts/narrar-completos.py']],
  [process.execPath, ['scripts/render-completos.mjs', ...(mode === '--preview' ? ['--preview'] : []), ...(mode === '--smoke' ? ['--smoke'] : []), ...(only ? [`--only=${only}`] : [])]],
  ...(mode === '--preview' ? [] : [[python, ['scripts/verificar-completos.py', ...(mode === '--smoke' ? ['--smoke'] : []), ...(only ? [`--only=${only}`] : [])]]]),
];
if (mode === '--plan') {
  console.log('Geração completa: narração → legendas → prévias → MP4 → verificação técnica.');
  for (const [command, params] of steps) console.log([command, ...params].join(' '));
  console.log('Não inclui novas capturas, testes da aplicação, revisão editorial ou publicação.');
  process.exit(0);
}

const problems = [];
function check(command, params, label) {
  const result = spawnSync(command, params, {cwd: root, encoding: 'utf8'});
  if (result.error || result.status !== 0) problems.push(`${label}: ${result.error?.message ?? result.stderr.trim()}`);
}
if (Number(process.versions.node.split('.')[0]) !== 22) problems.push('Use Node 22, versão de referência deste projeto.');
check('ffmpeg', ['-version'], 'FFmpeg');
check('ffprobe', ['-version'], 'FFprobe');
check(python, ['-c', 'import sys, kokoro_onnx, onnxruntime, numpy, soundfile; assert sys.version_info[:2] == (3, 12), "Use Python 3.12"'], 'Python e bibliotecas de voz');
const requirements = (await readFile(path.join(root, 'requirements.txt'), 'utf8')).trim().split(/\r?\n/);
for (const line of requirements.filter(line => line && !line.startsWith('#'))) {
  const [name, version] = line.split('==');
  check(python, ['-c', 'import importlib.metadata, sys; actual=importlib.metadata.version(sys.argv[1]); assert actual == sys.argv[2], f"{sys.argv[1]}: instalado {actual}, esperado {sys.argv[2]}"', name, version], name);
}
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
for (const [name, expected] of Object.entries(pkg.dependencies)) {
  try {
    const installed = JSON.parse(await readFile(path.join(root, 'node_modules', name, 'package.json'), 'utf8'));
    if (installed.version !== expected) problems.push(`${name}: execute npm ci para usar ${expected}.`);
  } catch { problems.push(`${name}: ausente; execute npm ci.`); }
}
const assets = ['models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin',
  'public/Manrope.ttf', 'public/capa.png', 'public/reserva-real.mp4',
  ...['inicial', 'consulta', 'reserva', 'conflito', 'invalida', 'recarregada'].map(name => `public/full/${name}.png`)];
for (const file of assets) {
  try { if (!(await stat(path.join(root, file))).isFile()) problems.push(`Asset inválido: ${file}`); }
  catch { problems.push(`Asset ausente: ${file}. Veja o preparo no README.`); }
}
const scripts = JSON.parse(await readFile(path.join(root, 'roteiros-completos.json'), 'utf8'));
if (JSON.stringify(scripts.map(stage => stage.stage).sort()) !== '[1,2]') {
  problems.push('As cenas são específicas das etapas 1 e 2. Adapte e revise o renderizador antes de gerar uma etapa nova.');
}
if (problems.length) {
  console.error(problems.map(problem => `- ${problem}`).join('\n'));
  process.exit(1);
}
console.log('Ambiente e assets conferidos. O navegador de renderização será conferido na execução.');
if (mode === '--check') process.exit(0);

const runDir = path.join(root, 'output/runs', new Date().toISOString().replaceAll(':', '-'));
await mkdir(runDir, {recursive: true});
// Preservar os materiais anteriores antes de scripts que sobrescrevem saídas.
const previous = ['src/completos.json', ...[1, 2].flatMap(stage => [
  `public/full/narracao-etapa${stage}.wav`, `output/slotguard-etapa-${stage}.srt`,
  `output/slotguard-etapa-${stage}.vtt`, ...['vertical', 'horizontal'].map(format => `output/slotguard-etapa-${stage}-${format}.mp4`),
])];
for (const file of previous) {
  try {
    await stat(path.join(root, file));
  } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  const dest = path.join(runDir, 'antes', file);
  await mkdir(path.dirname(dest), {recursive: true});
  await cp(path.join(root, file), dest);
}
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const report = {mode, only: only ?? null, platform: process.platform, arch: process.arch, node: process.version, startedAt: new Date().toISOString(), status: 'running',
  scriptSha256: sha256(await readFile(path.join(root, 'roteiros-completos.json'))), steps: []};
const saveReport = () => writeFile(path.join(runDir, 'producao.json'), JSON.stringify(report, null, 2) + '\n');
await saveReport();
for (const [command, params] of steps) {
  console.log(`Executando ${params.join(' ')}`);
  const result = spawnSync(command, params, {cwd: root, stdio: 'inherit'});
  report.steps.push({command: path.basename(command), args: params, exitCode: result.status, error: result.error?.message});
  if (result.error || result.status !== 0) {
    report.status = 'failed';
    await saveReport();
    console.error(`Produção interrompida. Materiais anteriores e relatório: ${runDir}`);
    process.exit(1);
  }
}
report.status = mode === '--preview' ? 'preview_ready' : mode === '--smoke' ? 'smoke_validated' : 'technically_validated';
report.finishedAt = new Date().toISOString();
report.requiresVisualAndVoiceReview = true;
await saveReport();
console.log(`Produção concluída; revise voz e prévias antes da divulgação. Relatório: ${runDir}`);
