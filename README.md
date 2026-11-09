# Igreja Evangélica Congregacional Conjunto Esperança

Site para produção na Vercel: páginas HTML estáticas geradas por `node build.js` (sem framework nem dependências) e uma função serverless em `api/youtube.js`. O `vercel.json` já define o build (`node build.js`) e a saída (`public/`); em **Framework Preset** use **Other**. Defina a variável `SITE_URL` na Vercel (em produção: `https://www.iecesperanca.com.br`, com `www`, porque o domínio sem `www` redireciona para ele) para gerar `sitemap.xml`, links canônicos, dados estruturados e a imagem de compartilhamento. Veja a seção **SEO** abaixo.

A identidade verde/grafite, o logotipo, os ícones acessíveis do Instagram e YouTube e a galeria com cinco fotos da igreja estão integrados. No celular, as fotos passam num carrossel horizontal com rolagem, controles anterior/próxima e indicador de posição; em telas maiores, aparecem em grade. As fotos vieram da categoria **Do proprietário** da ficha da igreja no Google Maps; veja `PHOTO_SOURCES.md`.

A página inicial e a seção **Vídeos** mostram imediatamente seis prévias guardadas na página; em segundo plano, a lista consulta o feed para buscar novidades. Assim, miniaturas, títulos e botões de reprodução aparecem sem esperar pelo endpoint. Cada gravação e cada transmissão detectada podem ser reproduzidas no player incorporado após a pessoa tocar em **Reproduzir**; o player não inicia automaticamente. Também há ligações para abrir o conteúdo no YouTube.

A lista de vídeos é consultada a cada 30 minutos e o estado da transmissão a cada 5 minutos (a cada 90 segundos nos horários de culto: domingo 8h–13h e quarta-feira 18h–22h, horário de Fortaleza). As consultas pausam com a aba em segundo plano. Sem chave API, a cache da Vercel da transmissão é de 90 segundos. Assim, novos vídeos e o estado ao vivo costumam atualizar em cerca de 2–4 minutos depois de o YouTube os publicar/propagar, podendo a própria propagação do YouTube acrescentar atraso. Não é instantâneo nem exige editar o site. Não precisa de Supabase. Veja `YOUTUBE_INTEGRATION.md` para detalhes e configuração opcional da API.

O conteúdo de Mateus 11.28 aparece numa seção própria como **Texto-base da igreja**, separado dos devocionais. A faixa verde animada mostra os horários de domingo e quarta-feira; o culto de doutrina de quarta-feira é às 19h30.

## Como publicar um novo devocional

1. No GitHub, crie um arquivo em `content/devocionais/` chamado `AAAA-MM-DD-titulo-em-minusculas.md` (a parte depois da data vira o endereço: `/devocionais/titulo-em-minusculas/`).
2. Copie o cabeçalho de um devocional existente (`titulo`, `categoria`, `autor`, `data`, `referencia` entre linhas `---`). Se corrigir o texto de um devocional já publicado, acrescente `atualizado: AAAA-MM-DD` (data real da edição); ela vira `dateModified` e `lastmod` e escreva os parágrafos separados por uma linha em branco.
3. Salve (commit). A Vercel gera as páginas sozinha. Para testar localmente: `node build.js` e abra `public/`.

## Arquivos principais

- `build.js` — gera as páginas em `public/` (início, texto-base, devocionais, vídeos, eventos, Bíblia, 404, sitemap e robots), incluindo as meta tags e os dados estruturados (JSON-LD). Também gera `feed.xml` (RSS), `busca.json` (índice da busca) e `agenda/*.ics` (calendário).
- `content/` — textos: `devocionais/*.md`, `texto-base.json`, `eventos.json` (com o campo opcional `agenda`, veja abaixo) e `videos.json` (prévias dos vídeos).
- `content/biblia/` — texto da Bíblia (Almeida Revista e Corrigida, edição de 1911, domínio público); veja `content/biblia/LEIA-ME.md` para origem e cuidados. O `build.js` gera uma página por capítulo em `/biblia/<livro>/<capítulo>/`.
- `src/` — `style.css`, `app.js` (menu, filtro, carrossel e YouTube), cabeçalho e rodapé.
- `api/youtube.js` — feed de vídeos recentes e estado de transmissão ao vivo.
- `assets/` — fotos da igreja em WebP (480/800 px; nomes com a largura, cache imutável).
- `og-image.jpg`, `favicon.ico`, `apple-touch-icon.png` — imagem de compartilhamento (1200×630) e ícones quadrados, na raiz; o `build.js` os copia para `public/`.
- `vercel.json` — build e cabeçalhos de cache.
- `YOUTUBE_INTEGRATION.md` — funcionamento, referências e configuração da integração.
- `PHOTO_SOURCES.md` — origem e referências das fotografias.

## Recursos do site

- **Busca nos devocionais** (`/devocionais/`): caixa de busca que ignora acentos e maiúsculas, exige todos os termos digitados e procura no título, categoria, autor, referência e texto. Combina com o filtro de categoria. O índice `busca.json` é gerado no build e só é baixado quando a pessoa começa a digitar; sem JavaScript a caixa não aparece e a lista continua completa. Nada a configurar: um novo devocional entra na busca sozinho.
- **RSS** (`/feed.xml`): os 20 devocionais mais recentes, gerado a cada build (precisa de `SITE_URL`, porque o RSS exige endereços absolutos). Há um link na página de devocionais e a indicação automática no `<head>` para leitores de feed.
- **Adicionar ao calendário:** eventos de `content/eventos.json` com o campo `agenda` ganham o botão **Google Agenda** (o botão "Apple / Outlook (.ics)" foi removido em 09/11/2026; os arquivos `.ics` ainda são gerados em `/agenda/`, mas sem link na página), na página de eventos e na seção "Venha nos visitar" da página inicial. Não há integração com o Google: o botão é um link que abre a agenda já preenchida, e o `.ics` é um arquivo padrão gerado em `/agenda/<id>.ics`. Exemplo:

  ```json
  { "dia": "Quarta-feira", "titulo": "Culto de doutrina", "detalhe": "19h30 · R. 104, 227",
    "agenda": { "id": "culto-doutrina", "byday": "WE", "inicio": "19:30", "fim": "21:00" } }
  ```

  `byday` usa `SU, MO, TU, WE, TH, FR, SA`; o evento é semanal e recorrente. Os horários são de Fortaleza (UTC-3, sem horário de verão) e o primeiro evento cai na próxima ocorrência a partir do build. Eventos sem `agenda` (como a conferência, ainda sem data) ficam sem botão. O horário de término é só para o calendário; mantenha-o coerente com o culto.
- **Bíblia** em `/biblia/`, **vídeos** e **transmissão ao vivo** do YouTube, **texto-base** e **galeria**: veja as seções abaixo e `YOUTUBE_INTEGRATION.md`.

## SEO

- **Nome oficial:** "Igreja Evangélica Congregacional Conjunto Esperança" (igual ao logo e à fachada), definido em `BRAND` no topo do `build.js`. "Igreja Congregacional Conjunto Esperança" (nome que ainda consta na ficha do Google Maps) fica só como `alternateName` nos dados estruturados.
- **Dados da igreja (`CHURCH` no `build.js`):** endereço, telefone, coordenadas e horário do culto de domingo alimentam o JSON-LD `Church` da página inicial. Mantenha-os iguais ao rodapé (`src/footer.html`), a `content/eventos.json` e à ficha do Google Maps. O culto de quarta-feira (19h30) também consta ali; o término (21h00) é uma estimativa.
- **Sem `SITE_URL` não há:** link canônico, JSON-LD, `og:image`, `twitter:card` nem `sitemap.xml`. O valor deve ser exatamente o endereço publicado (`https://www.iecesperanca.com.br`).
- **Títulos:** o ideal é até 60 caracteres, que é onde o Google costuma cortar. Páginas internas usam o sufixo curto `SHORT_BRAND` ("Conjunto Esperança"); só a página inicial leva o nome completo (63 caracteres). Descrições até 155 caracteres, cortadas sem partir palavra (`clip`).
- **Dados estruturados:** `Church` + `WebSite` na página inicial, `BreadcrumbList` em todas as páginas internas e `Article` em cada devocional (o autor sai do campo `autor`, sem o "Pr.")), `VideoObject` para cada vídeo em `/videos/` e `areaServed` (Fortaleza) no `Church`.
- **Imagens:** `og-image.jpg` (fachada + logo) e os ícones foram gerados a partir de `logo-igreja.webp`, `logo-simbolo.webp` e da foto da fachada; se o logo mudar, refaça-os. Depois de trocar a imagem de compartilhamento, o WhatsApp e as redes podem demorar a atualizar por causa do cache.
- **Sitemap:** `sitemap.xml` é um índice que aponta para `sitemap-paginas.xml` (site) e `sitemap-biblia.xml` (livros e capítulos), para acompanhar a indexação de cada grupo no Search Console. Envie só o `sitemap.xml`. `lastmod` só aparece onde há data real (devocionais, texto-base, vídeos e as páginas de listagem). Não use a data do build, senão o Google passa a ignorar o campo.
- **llms.txt:** gerado pelo `build.js` (com `SITE_URL`) a partir de `CHURCH`, `BRAND` e dos devocionais; não precisa de edição manual.
- **404:** `public/404.html` é gerado pelo `build.js`, com `noindex` e fora do sitemap.
- **Bíblia:** os 1.189 capítulos estão indexáveis. É conteúdo em domínio público presente em muitos sites, então vale acompanhar no Search Console se essas páginas são de fato indexadas; se não forem, avalie marcar os capítulos como `noindex` e manter indexados só `/biblia/` e as páginas dos livros.
- **Fora do código:** o nome, o endereço e o telefone da ficha do Google Maps (Perfil da Empresa) devem ser idênticos aos do site, e o site deve estar verificado no Google Search Console com o `sitemap.xml` enviado.

## Bíblia no site

A seção `/biblia/` traz a Bíblia inteira (1.189 capítulos), com busca de passagem (ex.: "João 3.16"). A referência bíblica de cada devocional (campo `referencia`) liga direto ao versículo no leitor. O texto é a edição de 1911 de Almeida, em domínio público, e **não** a ARC atual da Sociedade Bíblica do Brasil, que tem direitos reservados; cada capítulo traz um link para a ARC atual, para comparação.
