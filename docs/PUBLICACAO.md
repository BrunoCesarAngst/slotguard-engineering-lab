# Rotina de divulgação e vídeos do SlotGuard

Decisão de Bruno em 9 de novembro de 2026. Esta é a rotina padrão para as
próximas etapas, inclusive quando o trabalho for retomado em outro chat.

## YouTube como publicação principal

1. Preparar e revisar o vídeo, a narração em português, as legendas e os fatos.
2. Publicar primeiro no canal **um cidadão — @mbcangst**
   (`UCDvmkutgPHo_yekz1RV078Q`). Conferir o canal antes de cada envio.
3. Confirmar publicação pública, reprodução e resultado das verificações do YouTube.
4. Incluir o vídeo na playlist do SlotGuard e ligar a etapa anterior à nova.
5. Publicar textos próprios para LinkedIn, X e Facebook, usando o link do YouTube.
   No Instagram, preparar uma chamada com capa e direcionamento para um local
   clicável, como link do perfil ou sticker de link em Story, conforme disponível.
   Um URL escrito na legenda não deve ser tratado como um link clicável.
6. Atualizar o artigo no site, incorporando o vídeo do YouTube e oferecendo um
   link direto como alternativa. Manter o GitHub como fonte do site.
7. Registrar URLs, canal, etapa, data e comprovação do resultado, sem duplicar posts.

**Não enviar o MP4 diretamente para cada rede como rotina.** Um envio nativo
será uma exceção solicitada por Bruno para uma campanha ou necessidade concreta.
Não apagar nem substituir automaticamente as publicações nativas já realizadas.
Guardar os arquivos originais localmente como cópia de segurança.

O YouTube centraliza a hospedagem, a sequência e a atualização dos links.
Não presumir que um link externo terá o mesmo destaque de um vídeo nativo em
cada rede. Adaptar a apresentação ao destino sem prometer alcance ou engajamento.

## Série atual e limites dos links

- Etapa 1: https://www.youtube.com/shorts/_W2k61MHA3A
- Etapa 2: https://www.youtube.com/shorts/-9y3wLWDu0U
- Playlist: https://www.youtube.com/playlist?list=PLZA_RnF0KFIw
- Site: https://brunoangst.com.br/blog/
- Demonstração: https://slotguard-zf3f.onrender.com/

O estado observado mais recentemente dos recursos avançados foi **em análise**.
Reconsultar antes de afirmar que foram liberados. Links em descrições e
comentários de Shorts não são clicáveis, mesmo após a verificação. Usar playlist,
links do perfil e, quando liberado, o recurso de vídeo relacionado. Vídeos
horizontais convencionais podem servir como apresentação principal no futuro;
Shorts podem funcionar como chamadas para essa apresentação.

Referências oficiais:
- https://support.google.com/youtube/answer/13748639?hl=pt-BR
- https://support.google.com/youtube/answer/14075157?hl=pt-BR

## Quando uma etapa merece divulgação

Ao concluir uma entrega, o assistente deve avaliar e propor um marco de divulgação
quando houver uma mudança compreensível para quem usa o produto, evidência
demonstrável, verificações aprovadas e limites conhecidos. Exemplos: persistência
que sobrevive à recarga; cancelamento com agenda atualizada; proteção demonstrada
contra reservas concorrentes. Um ajuste interno ou aumento isolado da contagem
de testes não obriga a produzir um novo vídeo.

Antes da produção, registrar: o problema, o antes/depois, o commit de referência,
os testes realmente executados, a demonstração, as limitações e o próximo passo.
As contagens 43 e 114 são registros históricos, não valores para copiar para novas
etapas. Não converter planos em funcionalidades entregues.

Automatizar a preparação após um marco revisado; não publicar a cada commit.
Esta rotina orienta a execução quando houver pedido de divulgação. Ela não cria
um agendamento, não monitora o repositório sozinha e não autoriza posts futuros
sem um pedido aplicável. Um pedido explícito de publicação dispensa nova
confirmação do mesmo escopo.

## Produção e dependências

O produtor versionado fica em [`../video/`](../video/README.md). Há scripts de narração,
legendas, prévias, renderização e verificação técnica. O comando unificado e
suas limitações estão no README daquele projeto.

A imagem Docker do produtor reúne Node, Python, FFmpeg, Chromium e bibliotecas
de voz. O contêiner da aplicação continua separado. Os modelos oficiais são
baixados com SHA-256 conferido durante o build, sem entrar no Git. A narração e
a renderização rodam sem rede, com cache de voz e resultados em `video/output/`.
Dados de login não entram na imagem. Use `bash video/gerar.sh --gerar` na raiz.

O workflow manual **SlotGuard Videos** gera os vídeos no GitHub Actions, com
cache de camadas Docker e artefatos mantidos por sete dias. Escolher modo e
versão em Actions → Run workflow. Avaliar duração e cotas reais antes de
prometer custo zero. Não renderizar vídeos no serviço Render da demonstração.

**Ainda não implementado:** gatilho editorial automático por marco.
A geração atual precisa de Docker/Compose e assets aprovados; não descobre ou narra uma
nova funcionalidade automaticamente. As cenas atuais são específicas das
etapas 1 e 2 e precisam ser adaptadas para uma etapa nova.

O diretório irmão antigo `slotguard-video` foi preservado como arquivo local.
A fonte para novas alterações é `video/`, junto do SlotGuard. O contexto Docker
exclui ambientes e modelos da máquina; eles são instalados dentro da imagem.
Consulte `video/README.md` para os modos, resultados e limites da validação.

## Registro e revisão

O registro histórico local de publicações foi preservado em
`../../slotguard-video/output/publicacao/status.json`. Novos registros e
comprovantes podem ficar em `video/output/publicacao/`. Eles não devem ser a
única documentação, pois `output/` é ignorado pelo Git.
Registrar os links canônicos nesta documentação quando houver uma nova etapa.
Não incluir credenciais, documentos de identidade ou códigos de autenticação.

A validação automática não substitui assistir às prévias e conferir a voz,
legibilidade, enquadramento e correspondência entre narração e demonstração.
