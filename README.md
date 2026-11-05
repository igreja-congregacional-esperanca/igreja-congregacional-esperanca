# Igreja Congregacional · Conjunto Esperança

Site para produção na Vercel: páginas HTML estáticas geradas por `node build.js` (sem framework nem dependências) e uma função serverless em `api/youtube.js`. O `vercel.json` já define o build (`node build.js`) e a saída (`public/`); em **Framework Preset** use **Other**. Defina a variável `SITE_URL` (ex.: `https://seudominio.com.br`) na Vercel para gerar `sitemap.xml`, links canônicos e a imagem de compartilhamento.

A identidade verde/grafite, o logotipo, os ícones acessíveis do Instagram e YouTube e a galeria com cinco fotos da igreja estão integrados. No celular, as fotos passam num carrossel horizontal com rolagem, controles anterior/próxima e indicador de posição; em telas maiores, aparecem em grade. As fotos vieram da categoria **Do proprietário** da ficha da igreja no Google Maps; veja `PHOTO_SOURCES.md`.

A página inicial e a seção **Vídeos** mostram imediatamente seis prévias guardadas na página; em segundo plano, a lista consulta o feed para buscar novidades. Assim, miniaturas, títulos e botões de reprodução aparecem sem esperar pelo endpoint. Cada gravação e cada transmissão detectada podem ser reproduzidas no player incorporado após a pessoa tocar em **Reproduzir**; o player não inicia automaticamente. Também há ligações para abrir o conteúdo no YouTube.

A lista de vídeos é consultada a cada 30 minutos e o estado da transmissão a cada 5 minutos (a cada 90 segundos nos horários de culto: domingo 8h–13h e quarta-feira 18h–22h, horário de Fortaleza). As consultas pausam com a aba em segundo plano. Sem chave API, a cache da Vercel da transmissão é de 90 segundos. Assim, novos vídeos e o estado ao vivo costumam atualizar em cerca de 2–4 minutos depois de o YouTube os publicar/propagar, podendo a própria propagação do YouTube acrescentar atraso. Não é instantâneo nem exige editar o site. Não precisa de Supabase. Veja `YOUTUBE_INTEGRATION.md` para detalhes e configuração opcional da API.

O conteúdo de Mateus 11.28 aparece numa seção própria como **Texto-base da igreja**, separado dos devocionais. A faixa verde animada mostra os horários de domingo e quarta-feira; o horário de quarta-feira está marcado como **a confirmar**.

## Como publicar um novo devocional

1. No GitHub, crie um arquivo em `content/devocionais/` chamado `AAAA-MM-DD-titulo-em-minusculas.md` (a parte depois da data vira o endereço: `/devocionais/titulo-em-minusculas/`).
2. Copie o cabeçalho de um devocional existente (`titulo`, `categoria`, `autor`, `data`, `referencia` entre linhas `---`) e escreva os parágrafos separados por uma linha em branco.
3. Salve (commit). A Vercel gera as páginas sozinha. Para testar localmente: `node build.js` e abra `public/`.

## Arquivos principais

- `build.js` — gera as páginas em `public/` (início, texto-base, devocionais, vídeos, eventos, sitemap e robots).
- `content/` — textos: `devocionais/*.md`, `texto-base.json`, `eventos.json` e `videos.json` (prévias dos vídeos).
- `src/` — `style.css`, `app.js` (menu, filtro, carrossel e YouTube), cabeçalho e rodapé.
- `api/youtube.js` — feed de vídeos recentes e estado de transmissão ao vivo.
- `assets/` — fotos da igreja em WebP (480/800 px; nomes com a largura, cache imutável).
- `vercel.json` — build e cabeçalhos de cache.
- `YOUTUBE_INTEGRATION.md` — funcionamento, referências e configuração da integração.
- `PHOTO_SOURCES.md` — origem e referências das fotografias.
