# Igreja Congregacional · Conjunto Esperança

Site estático preparado para produção na Vercel. A entrada é `index.html`, sem processo de build; selecione **Other** como framework preset e deixe Build Command e Output Directory sem configuração.

A identidade verde/grafite, o logótipo e os ícones acessíveis do Instagram e YouTube estão integrados. A página inicial inclui uma galeria responsiva com fotos do santuário e da fachada, obtidas na categoria **Do proprietário** da ficha da igreja no Google Maps. A própria galeria apresenta um crédito com ligação à ficha.

O conteúdo de Mateus 11.28 aparece numa secção própria como **Texto-base da igreja**, separado dos devocionais. A faixa verde animada mostra os horários de domingo e quarta-feira; o horário de quarta-feira está marcado como **a confirmar**.

## Ficheiros principais

- `index.html` — página e conteúdo do site.
- `assets/santuario-google-maps.webp` — interior do santuário.
- `assets/fachada-google-maps.webp` — fachada da igreja.
- `PHOTO_SOURCES.md` — ficha de origem e referências das fotografias.

As imagens da galeria são servidas por URLs públicas de CDN para funcionarem também no deployment atual da Vercel. O Google Fonts é carregado externamente.
