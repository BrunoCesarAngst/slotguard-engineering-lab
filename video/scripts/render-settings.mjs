// Mesmas opções na produção e na comparação: só concurrency pode variar.
export const renderSettings = {codec: 'h264', audioCodec: 'aac', pixelFormat: 'yuv420p', crf: 18};
const configured = process.env.SLOTGUARD_RENDER_CONCURRENCY ?? '3';
if (!/^[1-8]$/.test(configured)) {
  throw new Error('SLOTGUARD_RENDER_CONCURRENCY deve ser um inteiro de 1 a 8.');
}
// O workflow pode usar um valor medido; outras máquinas mantêm o padrão local.
export const renderConcurrency = Number(configured);
