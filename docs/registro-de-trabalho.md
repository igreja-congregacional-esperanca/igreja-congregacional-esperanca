# Registro de trabalho: o que foi feito e o que ficou

Documento vivo. **Atualize a cada sessão de trabalho** (ver `CLAUDE.md`): mova itens de "Pendente" para "Feito", acrescente uma entrada no "Histórico" e atualize a data abaixo.

**Última atualização:** 09/11/2026

---

## Estado atual do site

- **Produção:** https://www.iecesperanca.com.br, projeto Vercel `igreja-congregacional-conjunto-esperanca`.
- **`main`:** contém tudo o que está no ar (PRs #13, #14, #15 mesclados), exceto o PR #16 (ver Pendente).
- **Deploy automático (Git → Vercel):** **voltou a funcionar** para o site em 09/11/2026 (link recriado às 18:28 UTC; um push de branch gerou deploy). Ainda **não confirmado em produção**: confirmar no próximo push na `main`.
- **Link-bio:** https://linkbio.iecesperanca.com.br, repositório `igreja-congregacional-esperanca/Llink-bio` (dois "L"), projeto Vercel `linkbio`. Está no ar com o commit `94b22cf` (publicado manualmente). **Deploy automático ainda quebrado** (ver Pendente).
- **`main` protegida** pelo ruleset "Proteger main" (restringe criação, atualização, exclusão e force push). Bypass: papel **Repository admin**. Mesclar PRs só funciona com esse bypass.

## Feito

### SEO e GEO
- Auditoria completa em 07/11/2026: ver `docs/seo/auditoria-2026-11-07.md`.
- Meta de verificação do Bing Webmaster Tools (`msvalidate.01`) no `<head>` e GTM (`GTM-W6Z4KDJ8`): no ar. **Não remover a meta do Bing.**
- Campo opcional `atualizado: AAAA-MM-DD` nos devocionais (vira `dateModified` e `lastmod`) — PR #13.
- `llms.txt` gerado no build — PR #13.
- Culto de doutrina de quarta-feira às 19h30 (eventos, faixa verde, JSON-LD com término 21h00 **estimado**) — PR #14.
- RSS dos devocionais (`/feed.xml`), busca nos devocionais (`/busca.json`) e botões de calendário (`/agenda/*.ics` + Google Agenda) — PR #15.
- Briefing das páginas Quem somos, Visite-nos e Pregações: `docs/seo/briefing-paginas-institucionais.md` (aguarda conteúdo da igreja).
- Bing Webmaster Tools: site verificado (09/11/2026).
- Search Console: exportações de cobertura analisadas (ver Histórico).

### Infraestrutura
- Ruleset da `main`: bypass para Repository admin adicionado (09/11/2026), o que destravou as mesclagens.
- Link Git do projeto do site na Vercel recriado (09/11/2026).

## Pendente

| Prioridade | Item | Quem | Observação |
|---|---|---|---|
| Alta | **Mesclar o PR #16** (llms.txt com horários vindos de `eventos.json`, inclui quarta-feira) | Dono do repo | Produção ainda tem o texto antigo ("Culto aos domingos") |
| Alta | **Reconectar o Git do link-bio**: GitHub > Settings > Applications > Vercel > Configure, incluir `Llink-bio`; depois Vercel > projeto `linkbio` > Settings > Git > Disconnect/Connect | Dono | Teste de deploy via Git falhou com `git_info_fail` em 09/11. A sessão do Claude só tem leitura no `Llink-bio` |
| Alta | **Revogar os tokens da Vercel colados em conversas** (07, 08 e 09/11) | Dono | Vercel > Settings > Tokens. Nunca gravar tokens em arquivos do repositório |
| Média | Pedir indexação, em Inspeção de URL do Search Console, de `/videos/` e dos 5 devocionais ("Detectada, mas não indexada") | Dono | Rastreio nunca ocorreu até 09/11 |
| Média | Divulgar o site para ganhar links: bio do Instagram, canal do YouTube, Perfil da Empresa no Google, link-bio apontando para `/devocionais/` e `/videos/` | Dono | |
| Média | **Decisão sobre os 1.189 capítulos da Bíblia (`noindex`?)** | Dono + Claude | Falta exportar do Search Console: relatório Páginas (total de indexadas e "Rastreada, mas não indexada"). Ver README, seção Bíblia |
| Média | Enviar `sitemap.xml` ao Bing e ao Search Console | Dono | |
| Média | Escrever as páginas Quem somos, Visite-nos e Pregações | Dono (conteúdo) + Claude | Ver o briefing. Nada inventado: dados marcados [PREENCHER] |
| Média | Perfil da Empresa no Google e Bing Places com os mesmos nome, endereço, telefone e horários do site | Dono | Incluir quarta 19h30 |
| Baixa | Implementar IndexNow (chave gerada no build e `.txt` na raiz) | Claude | Não precisa de token |
| Baixa | Medir Core Web Vitals reais depois do GTM | Dono | Search Console > Experiência |
| Baixa | Confirmar o horário de término do culto de quarta (hoje 21:00 é estimativa) | Dono | `CHURCH.hours` no `build.js` |
| Baixa | Página do pastor para ligar ao autor do `Article` (`sameAs`) | Dono + Claude | |
| Baixa | Apagar a branch `diag/vercel-4e80634` | Dono | Foi criada só para diagnóstico |
| Decisão | Política de IA: hoje todos os robôs de treino estão liberados no `robots.txt` | Dono | |

## Como publicar manualmente (se o deploy automático falhar)

Precisa de um token novo da Vercel, **só como variável de ambiente, nunca em arquivo**. Os IDs abaixo não são segredos.

```bash
# a partir de uma cópia limpa do commit (git archive), sem a pasta public/
VERCEL_TOKEN=<token> \
VERCEL_ORG_ID=team_KiRHXTgYE2tRGJqd3Ezjz09Q \
VERCEL_PROJECT_ID=prj_kdKBgDU8RqfhHGfuKTSbIejDa7oG \
npx vercel@latest deploy --prod --yes
```

Para o link-bio, troque o projeto por `VERCEL_PROJECT_ID=prj_VV0zX9sjjalCYWIZ8kXsVrbenNSZ`.
Depois confira: `curl -s https://www.iecesperanca.com.br/ | grep msvalidate` deve mostrar a meta dentro do `<head>`.

## Histórico

### 09/11/2026
- Mescladas na `main`: #14 (quarta 19h30), #13 (atualizado + llms.txt + docs) e #15 (RSS, busca, calendário; conflito em `content/eventos.json` resolvido mantendo o bloco `agenda`).
- Deploy manual de produção do site com o conteúdo dos 3 PRs; depois a `main` ficou idêntica a ele.
- Link-bio publicado manualmente no commit `94b22cf` (visual novo).
- Aberto o PR #16 (`llms.txt` com horários dos cultos de `eventos.json`). Aguarda mesclagem.
- Search Console, exportações de cobertura de 09/11: 6 páginas "Detectada, mas não indexada" (5 devocionais + `/videos/`, nunca rastreadas) e 1 "Página com redirecionamento" (`https://iecesperanca.com.br/`, esperado: redireciona para o `www`). Sem erros graves.
- Criados `docs/registro-de-trabalho.md` e `CLAUDE.md`.

### 07 e 08/11/2026
- Auditoria de SEO/GEO, meta do Bing e GTM publicados, diagnóstico da integração Vercel–GitHub (a Vercel parou de receber pushes depois das 17:35 UTC de 07/11) e deploys manuais como contorno.
- Ruleset "Proteger main" criado em 08/11 (sem bypass), o que bloqueou todas as mesclagens até 09/11.
