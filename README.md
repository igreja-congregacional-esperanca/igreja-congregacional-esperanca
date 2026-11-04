# Igreja Congregacional · Conjunto Esperança

Site para produção na Vercel, com página estática em `index.html` e uma função serverless em `api/youtube.js`. Não há etapa de build: selecione **Other** como framework preset e deixe Build Command e Output Directory sem configuração.

A identidade verde/grafite, o logótipo, os ícones acessíveis do Instagram e YouTube e a galeria de fotos do santuário e da fachada estão integrados. As fotos vieram da categoria **Do proprietário** da ficha da igreja no Google Maps; a página inclui o crédito e a ligação para a ficha.

A página inicial mostra seis vídeos recentes do canal, com miniaturas, títulos e datas. A navegação também tem uma página **Vídeos**. A função consulta o feed público do YouTube sem precisar de Supabase ou de chave de API. Quando identifica uma transmissão ativa, mostra o destaque **Estamos ao vivo!** e um botão para assistir.

A deteção de live funciona sem chave através da página pública `/live` do canal e, opcionalmente, pode usar `YOUTUBE_API_KEY` da YouTube Data API. A chave, se usada, deve ficar apenas nas variáveis de ambiente da Vercel, nunca no repositório. Veja [YOUTUBE_INTEGRATION.md](YOUTUBE_INTEGRATION.md) para detalhes, fontes e comportamento de cache.

O conteúdo de Mateus 11.28 aparece numa secção própria como **Texto-base da igreja**, separado dos devocionais. A faixa verde animada mostra os horários de domingo e quarta-feira; o horário de quarta-feira está marcado como **a confirmar**.

## Ficheiros principais

- `index.html` — site, estilos e renderização no navegador.
- `api/youtube.js` — feed de vídeos recentes e estado de transmissão ao vivo.
- `assets/santuario-google-maps.webp` e `assets/fachada-google-maps.webp` — fotos da igreja.
- `YOUTUBE_INTEGRATION.md` — canal, referências e configuração da integração.
- `PHOTO_SOURCES.md` — origem e referências das fotografias.

As fotos da galeria e as imagens do YouTube são carregadas a partir das URLs públicas dos respetivos serviços. O Google Fonts também é carregado externamente.
