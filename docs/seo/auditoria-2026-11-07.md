# Auditoria de SEO e GEO: 07/11/2026

Feita com a skill `seo-geo-elevenskill` (scripts `check_robots`, `audit_page`, `validate_sitemap`, `crawl_site`) sobre https://www.iecesperanca.com.br/ e revisão do código deste repositório.

## Situação
SEO técnico em bom estado, sem bloqueios de rastreio ou indexação.

- `robots.txt` libera tudo e declara o sitemap; redirects http/sem www chegam ao `https://www` em uma etapa; HSTS ativo; 404 verdadeiro.
- Home: `lang="pt-BR"`, canonical, title (~566 px), description (147 car.), um H1, 583 palavras no HTML do servidor, JSON-LD `Church` + `WebSite`.
- 250 páginas rastreadas, todas 200 (rastreio limitado a 250; o sitemap tem 1.267 URLs, quase todas da Bíblia). TTFB 0,23 s.

## Achados e situação

| # | Prioridade | Achado | Situação |
|---|---|---|---|
| 1 | Alta (risco) | 97% do sitemap é Bíblia (1.255 URLs, ortografia de 1911, texto igual ao de muitos sites) | Pendente: ver no Search Console quantos capítulos estão indexados; se poucos, `noindex` nos capítulos (ver README, seção Bíblia) |
| 2 | Média | Poucas páginas próprias da igreja (Quem somos, Contato e Comunidade são seções da home) | Briefing em `docs/seo/briefing-paginas-institucionais.md`; depende de conteúdo da igreja |
| 3 | Média | GTM (`GTM-W6Z4KDJ8`) adicionado em 07/11 | Pendente: medir Core Web Vitals reais depois do deploy |
| 4 | Baixa | `dateModified` igual a `datePublished` em todo devocional | Feito: campo opcional `atualizado:` |
| 5 | Baixa | Sem `llms.txt` | Feito: gerado pelo `build.js` |
| 6 | Baixa | Autor do `Article` sem página própria | Pendente: ligar à página do pastor quando existir (Quem somos) |
| 7 | Pendência | Culto de quarta "a confirmar" | Incluir em `CHURCH.hours` e `eventos.json` quando confirmado |
| 8 | Decisão | Todos os robôs de treino de IA estão liberados | Decisão da igreja |

`lastmod` ausente nos capítulos da Bíblia e a divisão do sitemap são intencionais (ver README) e não são problema.

## Não coberto
Dados do Search Console e de Core Web Vitals, backlinks e menções, Perfil da Empresa no Google, validação do JSON-LD em ferramenta de rich results, rastreio completo além de 250 páginas.

## Verificar depois da publicação
- `/llms.txt` responde 200.
- Indexação dos capítulos da Bíblia no Search Console.
- Core Web Vitals reais (por causa do GTM).
- Nova auditoria 2 a 4 semanas depois de publicar mudanças.
