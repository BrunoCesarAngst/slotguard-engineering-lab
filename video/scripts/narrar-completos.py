"""Gera as duas faixas e as legendas com tempos derivados dos áudios reais."""
import hashlib, json, math, subprocess, textwrap
from pathlib import Path
import numpy as np
import onnxruntime as ort
import soundfile as sf

from kokoro_onnx import Kokoro

ROOT=Path(__file__).resolve().parent.parent
RATE=48000
VOICE='pm_alex'
SPEED=.96
# Espaço para respirar entre ideias e para observar a tela entre cenas.
SCENE_LEAD=.65
PHRASE_PAUSE=.72
SCENE_TAIL=.85

class SessaoCompativel:
    def __init__(self,path):
        self._model_path=str(path)
        self.session=ort.InferenceSession(str(path),providers=['CPUExecutionProvider'])
    def get_inputs(self): return self.session.get_inputs()
    def run(self,names,inputs):
        if any(x.name=='speed' and x.type=='tensor(float)' for x in self.get_inputs()):
            inputs={**inputs,'speed':np.array([SPEED],dtype=np.float32)}
        return self.session.run(names,inputs)

def stamp(seconds,separator=','):
    ms=round(seconds*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{separator}{ms%1000:03}'

kokoro=Kokoro.from_session(SessaoCompativel(ROOT/'models/kokoro-v1.0.onnx'),str(ROOT/'models/voices-v1.0.bin'))
stages=json.loads((ROOT/'roteiros-completos.json').read_text())
for stage in stages:
    number=stage['stage']
    cache=ROOT/f'output/vozes-etapa{number}'
    cache.mkdir(exist_ok=True)
    cursor=0
    all_caps=[]
    clips=[]
    for i,scene in enumerate(stage['scenes']):
        scene['startFrame']=cursor
        local=SCENE_LEAD
        timing=[]
        for j,text in enumerate(scene['captions']):
            spoken=text.replace('SlotGuard','Slot Guard').replace('Python','Páiton').replace('API','á pê i')
            digest=hashlib.sha256((spoken+VOICE+str(SPEED)).encode()).hexdigest()[:12]
            raw=cache/f'{i:02}-{j:02}-{digest}.wav'
            path=cache/f'{i:02}-{j:02}-{digest}-ritmo.wav'
            # A transcrição preserva a grafia do projeto; apenas a entrada fonética é adaptada.
            if not raw.exists():
                samples,sr=kokoro.create(spoken,voice=VOICE,speed=SPEED,lang='pt-br')
                sf.write(raw,samples,sr)
            subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-ar',str(RATE),str(path)],check=True)
            samples,sr=sf.read(path,dtype='float32')
            duration=len(samples)/sr
            start=cursor/30+local
            wrapped='\n'.join(textwrap.wrap(text,width=43,break_long_words=False,break_on_hyphens=False))
            if len(wrapped.splitlines())>2:
                raise RuntimeError(f'Legenda longa demais: {text}')
            cap={'text':wrapped,'start':start,'end':start+duration+.12,'spoken':spoken}
            all_caps.append(cap)
            timing.append(cap)
            clips.append((start,samples))
            local+=duration+PHRASE_PAUSE
        seconds=max(scene['minDuration'],local-PHRASE_PAUSE+SCENE_TAIL)
        scene['durationInFrames']=math.ceil(seconds*30)
        scene['captions']=timing
        cursor+=scene['durationInFrames']
        print(f'Etapa {number} / cena {i+1}: {seconds:.1f}s',flush=True)
    stage['durationInFrames']=cursor
    stage['duration']=cursor/30
    stage['voice']=VOICE
    stage['pacing']={'speed':SPEED,'sceneLead':SCENE_LEAD,'phrasePause':PHRASE_PAUSE,'sceneTail':SCENE_TAIL}
    stage['captions']=all_caps
    mix=np.zeros(math.ceil(cursor/30*RATE),dtype=np.float32)
    for start,samples in clips:
        offset=round(start*RATE)
        mix[offset:offset+len(samples)]+=samples
    mix*=.8/max(float(np.max(np.abs(mix))),.001)
    raw_audio=cache/'montagem.wav'
    sf.write(raw_audio,np.column_stack([mix,mix]),RATE,subtype='PCM_16')
    dest=ROOT/f'public/full/narracao-etapa{number}.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw_audio),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar',str(RATE),str(dest)],check=True)
    srt=[];vtt=['WEBVTT\n']
    for i,cap in enumerate(all_caps,1):
        srt.append(f'{i}\n{stamp(cap["start"])} --> {stamp(cap["end"])}\n{cap["text"]}\n')
        vtt.append(f'{i}\n{stamp(cap["start"],".")} --> {stamp(cap["end"],".")}\n{cap["text"]}\n')
    (ROOT/f'output/slotguard-etapa-{number}.srt').write_text('\n'.join(srt))
    (ROOT/f'output/slotguard-etapa-{number}.vtt').write_text('\n'.join(vtt))
(ROOT/'src/completos.json').write_text(json.dumps(stages,ensure_ascii=False,indent=2))
print('Faixas e legendas prontas.',flush=True)
