import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {mkdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {renderSettings, renderConcurrency} from './render-settings.mjs';
const stages=JSON.parse(await readFile('src/completos.json','utf8'));
const preview=process.argv.includes('--preview');
const only=process.argv.find(x=>x.startsWith('--only='))?.split('=')[1];
const smoke=process.argv.includes('--smoke');
const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE;
console.log(`Renderização com ${renderConcurrency} quadros simultâneos; H.264/AAC, CRF 18.`);
// node_modules é somente leitura; cada execução já usa um diretório temporário.
const serveUrl=await bundle({entryPoint:path.resolve('src/index.tsx'),enableCaching:false});
const browser=await openBrowser('chrome',{browserExecutable});
try {
for(const stage of stages){
 for(const format of ['Vertical','Horizontal']){
  const id=`Etapa${stage.stage}${format}`;
  if(only&&id!==only)continue;
  const dir=`output/completos/etapa-${stage.stage}-${format.toLowerCase()}`;
  await mkdir(dir,{recursive:true});
  const composition=await selectComposition({serveUrl,id,browserExecutable,puppeteerInstance:browser});
  for(let i=0;i<stage.scenes.length;i++){
   const scene=stage.scenes[i];
   const frame=scene.startFrame+Math.floor(scene.durationInFrames*.55);
   await renderStill({serveUrl,composition,frame,browserExecutable,puppeteerInstance:browser,output:`${dir}/cena-${String(i+1).padStart(2,'0')}.jpg`,imageFormat:'jpeg',jpegQuality:88});
  }
  console.log(`${id}: ${stage.scenes.length} prévias prontas, ${stage.duration.toFixed(1)} segundos.`);
  if(!preview){
   let last=-1;
   const outputLocation=`output/slotguard-etapa-${stage.stage}-${format.toLowerCase()}${smoke?'-smoke':''}.mp4`;
   await renderMedia({serveUrl,composition,outputLocation,browserExecutable,puppeteerInstance:browser,...(smoke?{frameRange:[0,59]}:{}),...renderSettings,concurrency:renderConcurrency,onProgress:({progress})=>{const p=Math.floor(progress*10);if(p!==last){last=p;console.log(`${id}: ${p*10}%`);}}});
   console.log(`${id}: vídeo concluído.`);
  }
 }
}
} finally { await browser.close({silent:true}); }
