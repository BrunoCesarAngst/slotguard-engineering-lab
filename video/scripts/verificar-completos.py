"""Validação técnica dos arquivos entregues; não substitui a avaliação da voz."""
import json, re, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
stages=json.loads((ROOT/'src/completos.json').read_text())
report=[]
smoke='--smoke' in sys.argv
only=next((arg.split('=',1)[1] for arg in sys.argv if arg.startswith('--only=')),None)
for stage in stages:
    for fmt,dimensions in [('vertical',(1080,1920)),('horizontal',(1920,1080))]:
        if only and only != f'Etapa{stage["stage"]}{fmt.title()}':
            continue
        duration=2 if smoke else stage['duration']
        frames=60 if smoke else stage['durationInFrames']
        file=ROOT/f'output/slotguard-etapa-{stage["stage"]}-{fmt}{"-smoke" if smoke else ""}.mp4'
        data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels','-of','json',str(file)]))
        video=next(s for s in data['streams'] if s['codec_type']=='video')
        audio=next(s for s in data['streams'] if s['codec_type']=='audio')
        assert video['codec_name']=='h264' and audio['codec_name']=='aac'
        assert (video['width'],video['height'])==dimensions
        assert int(video['nb_frames'])==frames
        assert video['r_frame_rate']=='30/1'
        assert audio['channels']==2 and audio['sample_rate']=='48000'
        assert abs(float(data['format']['duration'])-duration)<.1
        subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True)
        volume=subprocess.run(['ffmpeg','-hide_banner','-i',str(file),'-vn','-af','volumedetect','-f','null','-'],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True).stderr
        peak=float(re.search(r'max_volume: ([-\d.]+) dB',volume)[1])
        assert -60<peak<=-.5, f'Áudio ausente ou saturado: {peak}'
        for cap in stage['captions']:
            assert 0<=cap['start']<cap['end']<=stage['duration']
            assert len(cap['text'].splitlines())<=2
        report.append({'file':file.name,'probe':data,'audioPeakDb':peak,'captionCount':len(stage['captions']),'decode':'ok','sourceEvidence':f'evidencias-etapa{stage["stage"]}.json'})
        print(f'OK: {file.name}, {duration:.2f}s, {dimensions[0]}×{dimensions[1]}, pico {peak} dB',flush=True)
assert report, 'Nenhum vídeo selecionado para verificação'
(ROOT/f'output/verificacao-{"smoke" if smoke else "completos"}{"-"+only if only else ""}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
