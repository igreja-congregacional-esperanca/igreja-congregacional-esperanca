# Igreja Congregacional · Conjunto Esperança

Site para produção na Vercel, com página estática em `index.html` e uma função serverless em `api/youtube.js`. Não há etapa de build: selecione **Other** como framework preset e deixe Build Command e Output Directory sem configuração.

A identidade verde/grafite, o logótipo, os ícones acessíveis do Instagram e YouTube e a galeria com cinco fotos da igreja estão integrados. No telemóvel, as fotos passam num carrossel horizontal com deslize, controlos anterior/próxima e indicador de posição; em ecrãs maiores, a apresentação é em grelha. As fotos vieram da categoria **Do proprietário** da ficha da igreja no Google Maps, com ligação de crédito na página e detalhes em `PHOTO_SOURCES.md`.

A página inicial mostra seis vídeos recentes do canal, com miniaturas, títulos e datas. A navegação também tem uma página **Vídeos**. A função consulta o feed público do YouTube sem precisar de Supabase ou de chave de API. Quando identifica uma transmissão ativa, mostra o destaque **Estamos ao vivo!** e um botão para assistir.

A deteção de live funciona sem chave através da página pública `/live` do canal e, opcionalmente, pode usar `YOUTUBE_API_KEY` da YouTube Data API. A chave, se usada, deve ficar apenas nas variáveis de ambiente da Vercel, nunca no repositório. Veja `YOUTUBE_INTEGRATION.md` para detalhes, fontes e configuração.

O conteúdo de Mateus 11.28 aparece numa secção própria como **Texto-base da igreja**, separado dos devocionais. A faixa verde animada mostra os horários de domingo e quarta-feira; o horário de quarta-feira está marcado como **a confirmar**.

## Ficheiros principais

- `index.html` — site, estilos e renderização no navegador.
- `api/youtube.js` — feed de vídeos recentes e estado de transmissão ao vivo.
- `assets/` — logótipo/fotos da igreja; a galeria usa cinco imagens WebP.
- `YOUTUBE_INTEGRATION.md` — canal, referências e configuração da integração.
- `PHOTO_SOURCES.md` — origem e referências das fotografias.

As fotos e imagens do YouTube são carregadas a partir das URLs públicas dos respetivos serviços. O Google Fonts também é carregado externamente.
