"""Reconfere o checkpoint da etapa 2 e preserva os resultados usados nos vídeos."""
import json, os, re, socket, subprocess, time, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
APP=ROOT.parent
PY=APP/'python/.venv/bin/python'
OUT=ROOT/'output/evidencias-testes'
OUT.mkdir(exist_ok=True)
with socket.socket() as sock:
    if sock.connect_ex(('127.0.0.1',8000))==0:
        raise RuntimeError('Porta 8000 já ocupada. Nenhum serviço existente será encerrado.')
with (OUT/'api.log').open('w') as log:
    server=subprocess.Popen([str(PY),'-m','uvicorn','api:app','--host','127.0.0.1','--port','8000'],cwd=APP/'python',stdout=log,stderr=log)
    try:
        for _ in range(60):
            try:
                with urllib.request.urlopen('http://127.0.0.1:8000/openapi.json',timeout=1): break
            except OSError: time.sleep(.1)
        checks=[('python',[str(PY),'-m','pytest','-q'],APP/'python',54),('cliente',['npm','test'],APP/'typescript',17),('interface',['npm','run','test:ui'],APP/'typescript',38),('integracao',['npm','run','test:integration'],APP/'typescript',5)]
        result={}
        for name,args,cwd,count in checks:
            proc=subprocess.run(args,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,env={**os.environ,'NO_COLOR':'1','FORCE_COLOR':'0'})
            text=re.sub(r'\x1b\[[0-9;]*m','',proc.stdout)
            (OUT/f'{name}.txt').write_text(text)
            if proc.returncode or not re.search(rf'\b{count}\s+passed\b',text):
                raise RuntimeError(f'Falha ou contagem diferente em {name}:\n{text}')
            result[name]=count
            print(f'{name}: {count} testes aprovados',flush=True)
        result['total']=sum(result.values())
        result['commit']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=APP,text=True).strip()
        (ROOT/'output/testes-etapa2.json').write_text(json.dumps(result,indent=2))
    finally:
        server.terminate()
        server.wait(timeout=10)
