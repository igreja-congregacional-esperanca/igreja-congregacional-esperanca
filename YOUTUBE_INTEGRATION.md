# Integração do canal YouTube

O canal confirmado é [IEC Conjunto Esperança](https://www.youtube.com/@IECConjuntoEsperan%C3%A7a), ID `UCSQl8zLsF2-LWAIQu01Ua6A`.

A lista de vídeos recentes usa o feed Atom público do próprio YouTube: `https://www.youtube.com/feeds/videos.xml?channel_id=UCSQl8zLsF2-LWAIQu01Ua6A`. O feed consultado contém o ID, o título, a data de publicação e dados da miniatura; não exige chave da Data API. A função `api/youtube.js` seleciona os seis vídeos mais recentes.

A função também verifica a página pública `/live` do canal e sinaliza a transmissão quando o cartão de vídeo indica estado ao vivo. O site consulta `/api/youtube` aproximadamente a cada dois minutos; sem chave, a resposta da função fica em cache na Vercel por 90 segundos. Esta deteção sem chave depende da estrutura pública da página do YouTube e pode precisar de ajuste se o YouTube a alterar.

Como alternativa mais estável, a função aceita a variável de ambiente `YOUTUBE_API_KEY` e consulta a YouTube Data API com `channelId`, `type=video` e `eventType=live`. A chave é opcional, deve ser guardada apenas nas variáveis de ambiente da Vercel e não deve ser commitada no repositório. Quando essa chave está configurada, a cache da resposta passa a 15 minutos para reduzir chamadas à API.

## Fontes consultadas

- [Canal oficial da igreja](https://www.youtube.com/@IECConjuntoEsperan%C3%A7a)
- [Feed Atom público do canal](https://www.youtube.com/feeds/videos.xml?channel_id=UCSQl8zLsF2-LWAIQu01Ua6A)
- [Documentação oficial do método YouTube Data API `search.list`](https://developers.google.com/youtube/data/reference/rest/v3/search/list)
