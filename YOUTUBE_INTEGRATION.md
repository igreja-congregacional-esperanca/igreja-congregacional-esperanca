# Integração do canal YouTube

O canal confirmado é [IEC Conjunto Esperança](https://www.youtube.com/@IECConjuntoEsperan%C3%A7a), ID `UCSQl8zLsF2-LWAIQu01Ua6A`.

A lista de vídeos recentes usa o feed Atom público do próprio YouTube: `https://www.youtube.com/feeds/videos.xml?channel_id=UCSQl8zLsF2-LWAIQu01Ua6A`. O feed fornece o ID, título e data de publicação; a função `api/youtube.js` seleciona os seis vídeos mais recentes, sem precisar de Supabase nem de chave da Data API.

Cada vídeo gravado pode ser reproduzido dentro do site: a pessoa carrega em **Reproduzir** e o player YouTube incorporado abre no lugar da miniatura. O player não arranca sozinho ao abrir a página. Há também um link para abrir o vídeo diretamente no YouTube.

Quando o endpoint identifica uma transmissão ativa na página pública `/live` do canal, a secção **Estamos ao vivo!** mostra a miniatura e permite reproduzi-la dentro do site. As transmissões precisam de permitir incorporação no YouTube; caso contrário, o link para abrir no YouTube continua disponível.

A página consulta o endpoint aproximadamente a cada dois minutos. Sem uma chave API, a resposta fica em cache pela Vercel por 90 segundos; na prática, um novo vídeo ou alteração de estado costuma aparecer em cerca de 2–4 minutos depois de o YouTube os publicar/propagar. A propagação do próprio YouTube pode acrescentar atraso. A lista e o estado renovam-se automaticamente, sem edição manual, mas não são instantâneos.

A deteção de live funciona sem chave através da página pública `/live`. Opcionalmente, a função aceita `YOUTUBE_API_KEY` e consulta a YouTube Data API com `channelId`, `type=video` e `eventType=live`. A chave deve ficar apenas nas variáveis de ambiente da Vercel, nunca no repositório. Quando essa chave está configurada, a cache passa a 15 minutos para reduzir chamadas à API.

## Fontes consultadas

- [Canal oficial da igreja](https://www.youtube.com/@IECConjuntoEsperan%C3%A7a)
- [Feed Atom público do canal](https://www.youtube.com/feeds/videos.xml?channel_id=UCSQl8zLsF2-LWAIQu01Ua6A)
- [Documentação oficial do método YouTube Data API `search.list`](https://developers.google.com/youtube/data/reference/rest/v3/search/list)
