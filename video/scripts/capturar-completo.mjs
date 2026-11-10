import {chromium} from 'playwright';
import {ensureBrowser} from '@remotion/renderer';
import {writeFile,mkdir} from 'node:fs/promises';
import {setTimeout as pause} from 'node:timers/promises';
const url='http://127.0.0.1:8012/';
await mkdir('public/full',{recursive:true});
const binary=await ensureBrowser();
const browser=await chromium.launch({executablePath:binary.path});
const context=await browser.newContext({viewport:{width:600,height:430},deviceScaleFactor:2,locale:'pt-BR'});
const page=await context.newPage();
const evidence=[];
async function action(label,button,path,status,message){
 const pending=page.waitForResponse(r=>new URL(r.url()).pathname===path&&r.request().method()==='POST');
 await page.getByRole('button',{name:button,exact:true}).click();
 const response=await pending;
 if(response.status()!==status) throw new Error(`Esperado ${status}, recebido ${response.status()}`);
 await page.getByText(message,{exact:true}).waitFor();
 await pause(120);
 await page.screenshot({path:`public/full/${label}.png`});
 const agenda=await page.locator('#app li').allTextContents();
 evidence.push({label,status:response.status(),request:response.request().postDataJSON(),response:await response.json(),agenda});
}
try{
 await page.goto(url);
 await page.getByRole('button',{name:'Reservar horário',exact:true}).waitFor();
 await page.screenshot({path:'public/full/inicial.png'});
 await action('consulta','Consultar disponibilidade','/disponibilidade',200,'Horário disponível');
 await action('reserva','Reservar horário','/reservas',201,'Horário reservado');
 await action('conflito','Reservar horário','/reservas',409,'Horário indisponível.');
 await page.getByLabel('Fim',{exact:true}).fill('10:00');
 await action('invalida','Reservar horário','/reservas',422,'Intervalo inválido.');
 for(const item of evidence.filter(x=>x.label!=='consulta')){
   if(JSON.stringify(item.agenda)!==JSON.stringify(['09:00–10:00','10:00–11:00'])) throw new Error('A agenda não foi preservada.');
 }
 await page.reload();
 await page.getByRole('button',{name:'Reservar horário',exact:true}).waitFor();
 const reloaded=await page.locator('#app li').allTextContents();
 if(JSON.stringify(reloaded)!==JSON.stringify(['09:00–10:00'])) throw new Error('Recarga não restaurou o estado inicial');
 await page.screenshot({path:'public/full/recarregada.png'});
 await writeFile('output/evidencias-etapa2.json',JSON.stringify({url,recordedAt:new Date().toISOString(),requests:evidence,reloaded},null,2));
 console.log('Capturas reais conferidas: consulta 200, reserva 201, conflito 409, validação 422 e recarga.');
}finally{await context.close();await browser.close();}
