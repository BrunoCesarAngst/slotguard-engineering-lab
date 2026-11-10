"""Comparação técnica dos mesmos 90 quadros; não substitui revisão editorial."""
import json
import re
import subprocess
from pathlib import Path

root = Path('output')
report = json.loads((root / 'benchmark.json').read_text())
assert len(report['samples']) == 24, 'Benchmark incompleto'

def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True)

audio_hashes = {}
for sample in report['samples']:
    file = root / 'benchmark' / sample['file']
    probe = json.loads(run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(file)]).stdout)
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    audio = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
    dimensions = (1080, 1920) if sample['composition'].endswith('Vertical') else (1920, 1080)
    assert (video['width'], video['height']) == dimensions
    assert video['codec_name'] == 'h264' and video['r_frame_rate'] == '30/1'
    assert int(video['nb_frames']) == 90 and abs(float(probe['format']['duration']) - 3) < .1
    assert audio['codec_name'] == 'aac' and audio['channels'] == 2 and audio['sample_rate'] == '48000'
    run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(file), '-f', 'null', '-'])
    audio_hashes[sample['file']] = run(['ffmpeg', '-v', 'error', '-i', str(file), '-map', '0:a:0', '-c:a', 'pcm_s16le', '-f', 'hash', '-hash', 'sha256', '-']).stdout.strip()

for sample in report['samples']:
    baseline = next(s for s in report['samples'] if s['case'] == sample['case'] and s['round'] == sample['round'] and s['concurrency'] == 3)
    assert audio_hashes[sample['file']] == audio_hashes[baseline['file']], 'Áudio divergente'
    if sample == baseline:
        ssim = 1.0
    else:
        result = run(['ffmpeg', '-hide_banner', '-i', str(root / 'benchmark' / sample['file']), '-i', str(root / 'benchmark' / baseline['file']), '-filter_complex', '[0:v][1:v]ssim', '-an', '-f', 'null', '-'])
        ssim = float(re.findall(r'All:([\d.]+)', result.stderr)[-1])
    sample['quality'] = {'decode': 'ok', 'audioMatchesBaseline': True, 'ssim': ssim}
    assert ssim >= .9999, f'Imagem divergente: {sample["file"]}: {ssim}'

totals = {c: [sum(s['elapsedMs'] for s in report['samples'] if s['concurrency'] == c and s['round'] == r) for r in (1, 2)] for c in report['candidates']}
averages = {c: sum(times) / 2 for c, times in totals.items()}
fastest = min(averages, key=averages.get)
gain = 1 - averages[fastest] / averages[3]
# Exigir ganho em ambas as rodadas e margem de 5% para não promover ruído.
selected = fastest if gain >= .05 and all(a < b for a, b in zip(totals[fastest], totals[3])) else 3
report.update(status='technically_validated', roundTotalsMs=totals, averageTotalsMs=averages,
              selectedConcurrency=selected, measuredGain=1 - averages[selected] / averages[3],
              selectionRule='>=5% de ganho médio e melhor nas duas rodadas; senão manter 3')
(root / 'benchmark.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: report[key] for key in ['environment', 'averageTotalsMs', 'selectedConcurrency', 'measuredGain']}, ensure_ascii=False, indent=2))
