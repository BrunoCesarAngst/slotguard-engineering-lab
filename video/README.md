# Produtor de vídeos do SlotGuard

Fonte versionada dos vídeos das etapas 1 e 2: roteiro, composição, voz masculina
sintética em português, pausas, legendas e capturas históricas. O produtor é
separado do Docker da aplicação e não precisa de uma API em execução para
renderizar as capturas aprovadas incluídas neste diretório.

## Usar em outra máquina

É necessário apenas o repositório e um Docker em execução com Docker Compose
(Docker Desktop, OrbStack ou Docker Engine com Compose). Não é necessário
instalar Node, Python, FFmpeg, navegador ou modelos no computador.

Na raiz do SlotGuard, em um terminal Bash (no Windows, usar WSL):

```bash
bash video/gerar.sh --check
bash video/gerar.sh --preview
bash video/gerar.sh --gerar
```

- `--check`: confere ferramentas, versões e assets dentro do contêiner.
- `--preview`: gera narração, SRT, VTT e as 38 prévias, sem renderizar os MP4.
- `--gerar`: produz e verifica os quatro vídeos completos.
- `--smoke`: produz quatro amostras de 2 segundos e as verifica; não equivale
  à validação dos vídeos completos. Os arquivos têm sufixo `-smoke`.
- `--plan`: mostra os passos, sem executar a produção.
- `--benchmark`: compara 1, 2, 3 e 4 quadros simultâneos em três trechos de
  três segundos, com aquecimento e duas rodadas em ordem invertida. Mantém
  Full HD, 30 fps e os mesmos ajustes de imagem/áudio da produção. Não aceita
  `--only`; usa animação, reserva com vídeo e conflito, nos dois formatos.
  Salva amostras em `output/benchmark/` e tempos/ambiente em `benchmark.json`.
  Confere decodificação, resolução, duração, áudio idêntico ao baseline 3 e
  similaridade visual SSIM >= 0,9999. Recomenda mudar somente se houver ganho
  médio >= 5% e melhora em ambas as rodadas; não altera o padrão automaticamente.

Para renderizar apenas um vídeo:

```bash
bash video/gerar.sh --gerar --only=Etapa2Horizontal
```

As opções são `Etapa1Vertical`, `Etapa1Horizontal`, `Etapa2Vertical` e
`Etapa2Horizontal`. A narração ainda prepara as duas etapas para manter os dados
de tempo consistentes; a seleção limita a renderização e a verificação.

A primeira execução baixa as imagens, dependências e cerca de 354 MB de pesos.
Precisa de internet e espaço para a imagem Docker. As execuções seguintes
reutilizam as camadas e o cache de voz em `output/`. O Compose desativa a rede
do contêiner durante a geração (`network_mode: none`): pesos, voz, fontes e
capturas já estão na imagem. O build e eventuais atualizações ainda precisam
de rede; a síntese e a renderização usam apenas recursos locais.

## Resultados e preservação

Os arquivos ficam em `video/output/`, fora do Git:

- `slotguard-etapa-1-vertical.mp4` e `slotguard-etapa-2-vertical.mp4` — 1080×1920;
- `slotguard-etapa-1-horizontal.mp4` e `slotguard-etapa-2-horizontal.mp4` — 1920×1080;
- `slotguard-etapa-1.srt`, `slotguard-etapa-2.srt` e respectivas versões VTT;
- `completos/` — uma prévia por cena e formato;
- `verificacao-completos.json` — inspeção e decodificação dos vídeos;
- `runs/<data>/producao.json` — passos, resultado e identificação do roteiro;
- `runs/<data>/antes/` — cópia dos arquivos anteriores antes da sobrescrita.

O script cria a pasta de saída e usa o seu UID/GID no contêiner para evitar
arquivos de root no Linux. Somente essa pasta é montada: o código do repositório
não é modificado pela geração. Os áudios e `src/completos.json` derivados ficam
em uma área temporária no contêiner. O diretório irmão antigo `slotguard-video`
foi preservado, inclusive seus vídeos e registros locais de publicação.

Para outro diretório de saída, defina `SLOTGUARD_VIDEO_OUTPUT` como caminho
absoluto antes de chamar o script. O modo completo verifica H.264/AAC, resolução,
30 fps, quantidade de quadros, duração, estéreo 48 kHz, pico de áudio, legendas
e decodificação integral. Assistir e ouvir o material continua necessário.

## Dependências e integridade

- Node 22.21.1 e Python 3.12.14, com versões das imagens declaradas no Dockerfile.
- Dependências Node em `package-lock.json`, instaladas com `npm ci`.
- Dependências Python diretas em `requirements.txt` e conjunto completo de
  versões em `requirements.lock`, instalado e conferido com `pip check`.
- FFmpeg, Chromium, eSpeak NG e bibliotecas de áudio instalados no Debian.
- Modelos oficiais do Kokoro em `modelos.json`, baixados durante o build e
  conferidos por SHA-256. Divergência interrompe a construção.
- Fonte Manrope local, com licença em `public/Manrope-OFL.txt`.

O Chromium do Debian evita depender de um navegador macOS ou do download de um
Chrome Headless Shell para outra arquitetura. A imagem usa CPU, sem GPU nem API
de voz paga. Tags das imagens e pacotes Debian ainda podem receber atualizações;
as versões declaradas não prometem que o MP4 será idêntico byte a byte.

Referências: [Docker com Remotion](https://www.remotion.dev/docs/docker),
[modelos oficiais](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1).

## Conteúdo e licenças

As capturas em `public/` ilustram a etapa 2 no commit
`f0b47c4bf83918b3b8f42b27adb74cc271a99311`. A primeira etapa foi conferida no
commit `de827f945a6317bae2bd38217140dad504d96ac0`. Os metadados em `evidencias/`
registram os resultados históricos: 43 e 114 testes, respectivamente. A geração
não reexecuta os testes da aplicação nem faz novas reservas. Para uma etapa
nova, atualizar roteiro, evidências e cenas antes de anunciar funcionalidades.

Voz Kokoro `pm_alex`, velocidade 0,96 e pausas entre ideias. Não é clonagem do
timbre do autor. Kokoro-82M: Apache 2.0; kokoro-onnx: MIT; Manrope: SIL OFL.
Remotion tem [condições próprias de licença](https://www.remotion.dev/docs/license),
não uma licença livre irrestrita. Não há música de terceiros.

## Publicação e próximos incrementos

Siga [a rotina de divulgação](../docs/PUBLICACAO.md): YouTube primeiro em
**@mbcangst**, seguido por links/incorporações no site e nas redes. Estes comandos
não publicam conteúdo nem contêm credenciais.

O piloto antigo continua preservado fora do repositório; este produtor registra
as composições completas. Renovar capturas exige preparar e executar a aplicação
separadamente. O gatilho editorial automático por marco ainda não foi implementado.

### Gerar pelo GitHub Actions

No repositório, abra **Actions → SlotGuard Videos → Run workflow**. Escolha:

- `completos`: renderiza e verifica os vídeos integrais (padrão);
- `previas`: prepara voz, legendas e quadros de revisão;
- `smoke`: produz e verifica amostras de dois segundos;
- `benchmark`: compara o processamento paralelo; usar a seleção `todos`;
- uma versão específica ou `todos` para as quatro combinações.

O workflow é somente manual, executa em Linux AMD64 e constrói o Docker com
cache de camadas. A produção usa rede desativada, sem dependências ou arquivos
do computador de Bruno. Há limite de 60 minutos e uma execução por branch de
cada vez. As cotas e políticas da conta GitHub continuam aplicáveis.

Ao terminar, abra **Artifacts** na execução e baixe o pacote. Ele inclui MP4,
SRT/VTT, prévias, log e relatórios; ficam de fora modelos, WAV de cache e cópias
anteriores. A retenção é de **sete dias**: salve os arquivos necessários antes
de expirarem. No benchmark, as amostras e o relatório duram **um dia** para
limitar armazenamento. Em caso de erro, os arquivos disponíveis também são enviados
para diagnóstico, e isso não transforma a execução em sucesso.

O workflow não publica a imagem em um registry nem envia vídeos ao YouTube.
Uma nova etapa ainda exige roteiro e evidências revisados no repositório.

## Validação realizada

Em 9 de novembro de 2026, foram construídas as imagens Linux ARM64 e AMD64
sem copiar ambientes ou pesos do Mac. Em ARM64, os quatro vídeos completos
foram gerados e decodificados integralmente: etapa 1 com 87,93 s e etapa 2 com
106,87 s, nas duas resoluções. O pico de áudio ficou em −1,5 dB.

Também passou uma amostra horizontal de 2 segundos em cada arquitetura. O teste
AMD64 ocorreu sob emulação no OrbStack, não em uma segunda máquina física.
A configuração final sem cache de bundle foi reconferida pela amostra ARM64.
Os testes rodaram sem rede durante síntese e renderização. A imagem ocupa
aproximadamente 3 GB descomprimida; reserve espaço adicional para cache e saídas.

O [resumo versionado da validação](evidencias/docker-validacao.json) registra
arquiteturas, arquivos e hashes. Os relatórios completos ficam em `output/`.
