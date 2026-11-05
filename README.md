# Igreja Congregacional · Conjunto Esperança

Site para produção na Vercel, com página estática em `index.html` e uma função serverless em `api/youtube.js`. Não há etapa de build: selecione **Other** como framework preset e deixe Build Command e Output Directory sem configuração.

A identidade verde/grafite, o logotipo, os ícones acessíveis do Instagram e YouTube e a galeria com cinco fotos da igreja estão integrados. No celular, as fotos passam num carrossel horizontal com rolagem, controles anterior/próxima e indicador de posição; em telas maiores, aparecem em grade. As fotos vieram da categoria **Do proprietário** da ficha da igreja no Google Maps; veja `PHOTO_SOURCES.md`.

A página inicial e a secção **Vídeos** mostram imediatamente seis prévias guardadas na página; em segundo plano, a lista consulta o feed para buscar novidades. Assim, miniaturas, títulos e botões de reprodução aparecem sem esperar pelo endpoint. Cada gravação e cada transmissão detectada podem ser reproduzidas no player incorporado após a pessoa tocar em **Reproduzir**; o player não inicia automaticamente. Também há ligações para abrir o conteúdo no YouTube.

A lista de vídeos é consultada a cada 30 minutos e o estado da transmissão a cada 5 minutos (a cada 90 segundos nos horários de culto: domingo 8h–13h e quarta-feira 18h–22h, horário de Fortaleza). As consultas pausam com a aba em segundo plano. Sem chave API, a cache da Vercel da transmissão é de 90 segundos. Assim, novos vídeos e o estado ao vivo costumam atualizar em cerca de 2–4 minutos depois de o YouTube os publicar/propagar, podendo a própria propagação do YouTube acrescentar atraso. Não é instantâneo nem exige editar o site. Não precisa de Supabase. Veja `YOUTUBE_INTEGRATION.md` para detalhes e configuração opcional da API.

O conteúdo de Mateus 11.28 aparece numa secção própria como **Texto-base da igreja**, separado dos devocionais. A faixa verde animada mostra os horários de domingo e quarta-feira; o horário de quarta-feira está marcado como **a confirmar**.

## Arquivos principais

- `index.html` — site, estilos e renderização no navegador.
- `api/youtube.js` — feed de vídeos recentes e estado de transmissão ao vivo.
- `assets/` — fotos da igreja em WebP (480/800 px; nomes com a largura, cache imutável).
- `vercel.json` — cabeçalhos de cache dos arquivos estáticos.
- `YOUTUBE_INTEGRATION.md` — funcionamento, referências e configuração da integração.
- `PHOTO_SOURCES.md` — origem e referências das fotografias.
