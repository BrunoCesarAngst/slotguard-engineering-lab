import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import scripts from './completos.json';

export const stages=scripts;
const C={ink:'#1c2019',paper:'#f3f1e9',lime:'#d4ff46',muted:'#73796b',line:'#1c201928',red:'#bb5748',green:'#528c35'};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const font='Manrope, sans-serif';
const appear=(f:number,d=0)=>spring({frame:f-d,fps:30,config:{damping:24,stiffness:115,mass:.8}});
type Scene=(typeof scripts)[number]['scenes'][number];

const Small=({children}:React.PropsWithChildren)=><div style={{fontSize:26,lineHeight:1.45,color:C.muted}}>{children}</div>;
const Card=({children,dark=false,style={}}:React.PropsWithChildren<{dark?:boolean;style?:React.CSSProperties}>)=><div style={{borderRadius:22,padding:32,border:`1px solid ${C.line}`,background:dark?C.ink:'#ffffff87',color:dark?C.paper:C.ink,...style}}>{children}</div>;
const Badge=({children,color=C.lime}:React.PropsWithChildren<{color?:string}>)=><span style={{display:'inline-block',background:color,color:C.ink,fontWeight:800,fontSize:25,padding:'13px 23px',borderRadius:40,letterSpacing:1}}>{children}</span>;

function Hero({stage,v}:{stage:number;v:boolean}){
 const f=useCurrentFrame();
 if(stage===2)return <div style={{paddingTop:v?24:20}}><div style={{transform:`rotate(${interpolate(f,[0,180],[-2,0],clamp)}deg) translateY(${(1-appear(f,5))*45}px)`,borderRadius:18,overflow:'hidden',boxShadow:'0 25px 70px #1c201923',border:`1px solid ${C.line}`}}><Img src={staticFile('capa.png')} style={{display:'block',width:'100%'}}/></div><div style={{marginTop:36,display:'flex',justifyContent:'space-between',fontSize:29,fontWeight:700}}><span>114 testes</span><span>Interface + API + publicação</span></div></div>;
 return <><div style={{fontWeight:800,fontSize:v?117:102,letterSpacing:-7,lineHeight:1}}>SlotGuard<span style={{color:'#89a329'}}>.</span></div><div style={{fontSize:27,letterSpacing:3,color:C.muted,margin:v?'25px 0 40px':'20px 0 32px'}}>PYTHON / ENGINEERING LAB</div><Card dark><div style={{color:C.lime,fontSize:26,fontWeight:700,letterSpacing:2,marginBottom:26}}>O PRIMEIRO RECORTE</div><div style={{fontSize:v?47:42,fontWeight:700,lineHeight:1.3}}>Intervalos.<br/>Conflitos.<br/>Agendas imutáveis.</div><div style={{height:2,background:'#ffffff30',margin:v?'30px 0':'20px 0'}}/><div style={{fontSize:29,color:'#c8cebf'}}>43 testes · domínio funcional</div></Card></>;
}

function Timeline({adjacent,v}:{adjacent:boolean;v:boolean}){
 const f=useCurrentFrame();
 const width=936;
 const reveal=appear(f,18);
 const color=adjacent?C.lime:'#efb5a9';
 return <div style={{width,position:'relative',height:v?720:570}}>
   <div style={{fontSize:26,color:C.muted,letterSpacing:2}}>VISUALIZAÇÃO DO DOMÍNIO PYTHON</div>
   <div style={{position:'absolute',top:110,left:46,right:46,height:2,background:C.line}}/>
   {['09:00','10:00','11:00'].map((t,i)=><div key={t} style={{position:'absolute',top:55,left:45+i*405,fontSize:29,color:C.muted,transform:'translateX(-40%)'}}>{t}<div style={{height:23,width:2,background:C.line,margin:'12px auto 0'}}/></div>)}
   <div style={{position:'absolute',top:155,left:38,fontSize:25,fontWeight:700}}>RESERVA EXISTENTE</div>
   <div style={{position:'absolute',top:200,left:38,width:406,height:92,background:C.ink,color:C.paper,borderRadius:15,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:700}}>09:00–10:00</div>
   <div style={{position:'absolute',top:325,left:38,fontSize:25,fontWeight:700}}>SOLICITAÇÃO</div>
   <div style={{position:'absolute',top:370,left:adjacent?444:241,width:406*reveal,height:92,background:color,borderRadius:15,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:700,whiteSpace:'nowrap'}}>{adjacent?'10:00–11:00':'09:30–10:30'}</div>
   <div style={{position:'absolute',top:510,left:38,right:38,opacity:interpolate(f,[35,50],[0,1],clamp)}}><div style={{fontSize:41,fontWeight:800,color:adjacent?C.green:C.red}}>{adjacent?'✓ Consecutivos: permitido':'× Sobreposição: rejeitada'}</div><div style={{fontSize:26,color:C.muted,marginTop:15}}>{adjacent?'O intervalo inclui o início e exclui o fim.':'O novo intervalo ocupa parte de um horário reservado.'}</div></div>
 </div>;
}

function Models({v}:{v:boolean}){return <>
 <Card dark><div style={{color:C.lime,fontSize:25,fontWeight:800,letterSpacing:2,marginBottom:24}}>UM TRECHO DO MODELO</div><pre style={{margin:0,fontFamily:'monospace',fontSize:v?30:31,lineHeight:1.6,whiteSpace:'pre-wrap'}}><span style={{color:'#d4ff46'}}>@dataclass(frozen=True, slots=True)</span>{'\nclass Intervalo:\n    inicio: int\n    fim: int'}</pre></Card>
 <div style={{fontSize:v?47:45,fontWeight:800,letterSpacing:-1,marginTop:42}}>0 ≤ início &lt; fim ≤ 1440</div><div style={{marginTop:28}}><Small>Minutos desde a meia-noite.<br/>Duração positiva. Um único dia.</Small></div>
 </>;}

function Immutable(){const f=useCurrentFrame();return <>
 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:25}}>
  <Card><div style={{fontSize:25,fontWeight:800,color:C.muted,letterSpacing:1}}>AGENDA ORIGINAL</div><div style={{fontSize:37,marginTop:35,fontWeight:700}}>09:00–10:00</div><div style={{fontSize:27,color:C.muted,marginTop:35}}>1 reserva</div></Card>
  <Card style={{background:'#e9f6c4',transform:`translateY(${(1-appear(f,15))*50}px)`,opacity:interpolate(f,[10,25],[0,1],clamp)}}><div style={{fontSize:25,fontWeight:800,letterSpacing:1}}>NOVA AGENDA</div><div style={{fontSize:37,marginTop:35,fontWeight:700}}>09:00–10:00<br/><span style={{color:C.green}}>10:00–11:00</span></div><div style={{fontSize:27,color:C.muted,marginTop:35}}>2 reservas</div></Card>
 </div><Card dark style={{marginTop:35}}><div style={{fontSize:38,fontWeight:700,lineHeight:1.3}}>agendar(...) → nova Agenda</div><div style={{fontSize:28,color:'#c8cebf',marginTop:25}}>A anterior permanece intacta.</div></Card><div style={{marginTop:28}}><Small>Em conflito: HorarioIndisponivelError.</Small></div>
 </>;}

function Tdd(){const f=useCurrentFrame();return <div style={{display:'grid',gap:23}}>{[['01','Escrever o teste','Observar a falha esperada.','#efb5a9'],['02','Implementar','Atender ao próximo comportamento.',C.lime],['03','Revisar','Verificar e melhorar a construção.','#e3e5dc']].map(([n,t,d,c],i)=><Card key={n} style={{display:'flex',alignItems:'center',gap:25,transform:`translateX(${(1-appear(f,i*8))*60}px)`}}><div style={{background:c,borderRadius:50,fontSize:34,fontWeight:800,padding:'20px 24px'}}>{n}</div><div><div style={{fontSize:38,fontWeight:800}}>{t}</div><div style={{fontSize:27,color:C.muted,marginTop:8}}>{d}</div></div></Card>)}</div>;}

function Tests({stage,v}:{stage:number;v:boolean}){
 const f=useCurrentFrame();
 const total=stage===1?43:114;
 return <><div style={{display:'flex',alignItems:'baseline',gap:30}}><div style={{fontSize:v?220:200,fontWeight:800,letterSpacing:-12,lineHeight:1,transform:`scale(${.94+.06*appear(f)})`}}>{total}</div><div style={{fontSize:31,fontWeight:800,lineHeight:1.3}}>TESTES<br/>AUTOMATIZADOS</div></div>
 {stage===1?<><Card dark style={{marginTop:35,fontFamily:'monospace',fontSize:32,lineHeight:1.7}}><div style={{color:'#c8cebf'}}>$ python -m pytest -q</div><div style={{color:C.lime}}>43 passed</div></Card><div style={{marginTop:32,fontSize:34,fontWeight:700}}>Exemplos + propriedades</div><div style={{marginTop:16}}><Small>pytest · Hypothesis<br/>Validações, fronteiras e imutabilidade.</Small></div></>:
 <><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22,marginTop:35}}>{[['54','Python'],['17','Cliente TypeScript'],['38','Interface'],['5','Integração real']].map(([n,t])=><Card key={t} style={{padding:'23px 27px'}}><span style={{fontSize:49,fontWeight:800}}>{n}</span><div style={{fontSize:26,color:C.muted,marginTop:5}}>{t}</div></Card>)}</div><div style={{fontSize:26,color:C.muted,marginTop:25}}>Checkpoint publicado · 9 de novembro de 2026</div></>}
 </>;
}

function Architecture({v}:{v:boolean}){
 const f=useCurrentFrame();
 return <div style={{display:'grid',gap:23}}>{[['01','TypeScript','Entrada, interação e apresentação.'],['02','FastAPI','Contrato HTTP e validação.'],['03','Domínio Python','Disponibilidade e agendamento.']].map(([n,t,d],i)=><Card key={n} dark={i===2} style={{display:'flex',alignItems:'center',gap:26,transform:`translateY(${(1-appear(f,i*10))*35}px)`}}><span style={{color:i===2?C.lime:C.muted,fontSize:34,fontWeight:800}}>{n}</span><div><div style={{fontSize:39,fontWeight:800}}>{t}</div><div style={{fontSize:27,color:i===2?'#c8cebf':C.muted,marginTop:8}}>{d}</div></div></Card>)}</div>;
}

function Screenshot({kind,v}:{kind:string;v:boolean}){
 const f=useCurrentFrame();
 const h=v?663:470;
 const name=kind==='availability'?'consulta':kind==='conflict'?'conflito':'reserva';
 const status=kind==='availability'?'200 · Horário disponível':kind==='conflict'?'409 · Agenda preservada':'201 · Agenda atualizada';
 return <div><div style={{border:`1px solid ${C.line}`,borderRadius:22,overflow:'hidden',boxShadow:'0 20px 60px #1c20191a',background:'white'}}><div style={{background:'#e8e8e0',padding:'20px 24px',fontSize:24,color:'#5a6254'}}>● ● ● <span style={{marginLeft:20}}>SlotGuard · API real em execução local</span></div><div style={{height:h,overflow:'hidden',position:'relative'}}>
 {kind==='reserve'&&f<180?<Sequence durationInFrames={180}><OffthreadVideo muted src={staticFile('reserva-real.mp4')} style={{width:'100%',display:'block'}}/></Sequence>:<Img src={staticFile(`full/${name}.png`)} style={{display:'block',width:'100%',transform:`scale(${interpolate(f,[0,250],[1,1.018],clamp)})`,transformOrigin:'top left'}}/>}
 </div></div><div style={{fontSize:30,fontWeight:700,color:kind==='conflict'?C.red:C.green,marginTop:27}}>● {kind==='reserve'&&f<65?'Enviando a solicitação…':status}</div></div>;
}

function Ux(){return <div style={{display:'grid',gap:24}}><Card dark><div style={{fontSize:25,fontWeight:800,color:C.lime,letterSpacing:1}}>DURANTE A RESERVA</div><div style={{fontSize:39,fontWeight:700,lineHeight:1.3,marginTop:20}}>Campos e dois botões<br/>bloqueados até a conclusão.</div></Card><Card><div style={{fontSize:25,fontWeight:800,color:C.muted,letterSpacing:1}}>AO EDITAR OS HORÁRIOS</div><div style={{fontSize:37,fontWeight:700,lineHeight:1.35,marginTop:18}}>Mensagem anterior limpa.<br/>Resposta antiga descartada.</div></Card><Small>Comportamentos cobertos pelos testes da interface.</Small></div>;}

function Deploy(){const f=useCurrentFrame();return <><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}><Card><div style={{fontSize:25,color:C.muted,fontWeight:800}}>CONSTRUÇÃO</div><div style={{fontSize:43,fontWeight:800,marginTop:24}}>Node + Vite</div><div style={{fontSize:27,color:C.muted,marginTop:15}}>Compila a interface.</div></Card><Card><div style={{fontSize:25,color:C.muted,fontWeight:800}}>EXECUÇÃO</div><div style={{fontSize:43,fontWeight:800,marginTop:24}}>Python</div><div style={{fontSize:27,color:C.muted,marginTop:15}}>Entrega interface e API.</div></Card></div><Card dark style={{marginTop:27,transform:`translateY(${(1-appear(f,12))*30}px)`}}><div style={{fontSize:43,fontWeight:800,color:C.lime}}>Uma imagem Docker.</div><div style={{fontSize:31,lineHeight:1.5,marginTop:22}}>CI no Linux → contêiner em execução<br/>→ publicação no Render Free</div></Card><div style={{marginTop:28}}><Small>Configuração versionada. Dois workflows de qualidade.</Small></div></>;}

function Limits({stage,v}:{stage:number;v:boolean}){
 const entries=stage===1?[
  ['IMPLEMENTADO','Domínio Python','Modelos, validação e regras de reserva.',true],
  ['PRÓXIMAS CAMADAS','Interface e API','Ainda não existiam neste registro.',false],
  ['DESAFIOS FUTUROS','Persistência e concorrência','O núcleo trabalhava em memória.',false],
 ]:[
  ['VERSÃO ATUAL','Agenda em memória','Recarregar restaura o estado inicial.',true],
  ['AINDA NÃO IMPLEMENTADO','Persistência e concorrência','PostgreSQL no Neon está planejado.',false],
  ['RENDER FREE','Demonstração de baixo tráfego','Primeiro acesso pode levar cerca de um minuto.',false],
 ];
 return <div style={{display:'grid',gap:22}}>{entries.map(([label,title,desc,done])=><Card key={String(title)} dark={Boolean(done)} style={{padding:v?29:23}}><div style={{fontSize:23,letterSpacing:1,fontWeight:800,color:done?C.lime:C.muted}}>{label}</div><div style={{fontSize:v?36:33,fontWeight:800,marginTop:v?16:12}}>{title}</div><div style={{fontSize:v?26:25,color:done?'#c8cebf':C.muted,marginTop:v?12:9}}>{desc}</div></Card>)}</div>;
}

function Closing({stage}:{stage:number}){return <><Card dark style={{padding:40}}><div style={{fontSize:25,fontWeight:800,letterSpacing:2,color:C.lime}}>{stage===1?'ARTIGO + CÓDIGO ↗':'ARTIGO + DEMONSTRAÇÃO ↗'}</div><div style={{fontSize:44,fontWeight:800,lineHeight:1.25,marginTop:34}}>brunoangst.com.br/blog</div><div style={{fontSize:29,color:'#c8cebf',marginTop:26,lineHeight:1.5}}>{stage===1?'Registro 01 · o primeiro núcleo Python':'Registro 02 · a demonstração pública'}</div></Card>{stage===2?<div style={{fontSize:29,marginTop:36,color:C.muted}}>Demo: slotguard-zf3f.onrender.com</div>:<div style={{fontSize:28,marginTop:36,color:C.muted}}>Código aberto · SlotGuard Engineering Lab</div>}<div style={{borderTop:`2px solid ${C.line}`,marginTop:40,paddingTop:28,fontSize:34,fontWeight:700,lineHeight:1.5}}>Aprender construindo.<br/>Compartilhar as decisões.<br/>Continuar evoluindo.</div></>;}

function Graphic({scene,stage,v}:{scene:Scene;stage:number;v:boolean}){
 switch(scene.kind){
  case 'intro':return <Hero stage={stage} v={v}/>;
  case 'overlap':return <Timeline adjacent={false} v={v}/>;
  case 'adjacent':return <Timeline adjacent v={v}/>;
  case 'models':return <Models v={v}/>;
  case 'immutable':return <Immutable/>;
  case 'tdd':return <Tdd/>;
  case 'tests1':case 'tests2':return <Tests stage={stage} v={v}/>;
  case 'architecture':return <Architecture v={v}/>;
  case 'availability':case 'reserve':case 'conflict':return <Screenshot kind={scene.kind} v={v}/>;
  case 'ux':return <Ux/>;
  case 'deploy':return <Deploy/>;
  case 'limits1':case 'limits2':return <Limits stage={stage} v={v}/>;
  case 'closing':return <Closing stage={stage}/>;
  default:throw new Error(`Cena desconhecida: ${scene.kind}`);
 }
}

function SceneView({scene,stage,v,index,total}:{scene:Scene;stage:number;v:boolean;index:number;total:number}){
 const f=useCurrentFrame();
 const leave=interpolate(f,[scene.durationInFrames-7,scene.durationInFrames],[1,0],clamp);
 return <AbsoluteFill style={{opacity:interpolate(f,[0,8],[0,1],clamp)*leave,transform:`translateY(${(1-appear(f))*25}px)`}}>
  <div style={{position:'absolute',top:v?220:182,left:v?72:90,width:v?936:660}}>
   <Badge>{scene.label}</Badge>
   <h1 style={{fontSize:v?77:70,fontWeight:800,lineHeight:v?1.1:1.08,letterSpacing:-3.7,whiteSpace:'pre-line',marginTop:40,marginBottom:0}}>{scene.title}</h1>
   {!v?<div style={{borderTop:`2px solid ${C.line}`,marginTop:34,paddingTop:20,fontSize:24,color:C.muted,lineHeight:1.5}}>SLOTGUARD / ENGINEERING LAB<br/>{stage===1?'O primeiro núcleo Python.':'Da regra de negócio à aplicação publicada.'}</div>:null}
  </div>
  <div data-graphic style={{position:'absolute',left:v?72:840,top:v?650:205,width:v?936:980,height:v?805:620}}><Graphic scene={scene} stage={stage} v={v}/></div>
  <div style={{position:'absolute',left:v?72:90,top:v?1495:758,fontSize:23,letterSpacing:1.5,color:C.muted,fontWeight:700}}>{String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')} · {stage===1?'REGISTRO HISTÓRICO DA PRIMEIRA ETAPA':'CHECKPOINT PUBLICADO DA SEGUNDA ETAPA'}</div>
 </AbsoluteFill>;
}

export function FullVideo({stage}:{stage:number}){
 const data=scripts.find(x=>x.stage===stage)!;
 const f=useCurrentFrame();
 const {width,height}=useVideoConfig();
 const v=height>width;
 const cap=data.captions.find(x=>f/30>=x.start&&f/30<x.end);
 return <AbsoluteFill style={{background:C.paper,color:C.ink,fontFamily:font}}>
  <style>{`@font-face{font-family:Manrope;src:url('${staticFile('Manrope.ttf')}') format('truetype');font-weight:200 800}*{box-sizing:border-box}`}</style>
  <AbsoluteFill style={{backgroundImage:'radial-gradient(#1c201909 1px,transparent 1px)',backgroundSize:'14px 14px'}}/>
  <div style={{position:'absolute',top:v?100:62,left:v?72:90,right:v?72:90,display:'flex',justifyContent:'space-between',fontSize:23,fontWeight:800,letterSpacing:2}}><span>BRUNO CÉSAR ANGST</span><span>DIÁRIO / 0{stage}</span></div>
  <div style={{position:'absolute',top:v?162:124,left:v?72:90,right:v?72:90,height:3,background:C.line}}><div style={{height:3,width:`${f/(data.durationInFrames-1)*100}%`,background:C.ink}}/></div>
  {data.scenes.map((scene,index)=><Sequence key={index} from={scene.startFrame} durationInFrames={scene.durationInFrames}><SceneView scene={scene} stage={stage} v={v} index={index} total={data.scenes.length}/></Sequence>)}
  {cap?<div data-caption style={{position:'absolute',left:v?72:180,right:v?72:180,bottom:v?195:105,height:v?155:128,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px 30px',borderRadius:20,background:C.ink,color:C.paper,fontSize:v?37:35,fontWeight:600,lineHeight:1.35,textAlign:'center',whiteSpace:'pre-line'}}>{cap.text}</div>:null}
  <div style={{position:'absolute',left:v?72:90,right:v?72:90,bottom:v?126:43,display:'flex',justifyContent:'space-between',fontSize:22,color:C.muted}}><span>REGISTRO 0{stage} · {data.date}</span><span>SOFTWARE EM CONSTRUÇÃO</span></div>
  <Audio src={staticFile(`full/narracao-etapa${stage}.wav`)}/>
 </AbsoluteFill>;
}
