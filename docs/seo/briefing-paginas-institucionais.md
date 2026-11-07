# Briefing: páginas institucionais da Igreja Evangélica Congregacional Conjunto Esperança

Três páginas novas: **Quem somos**, **Visite-nos** e **Pregações**. Hoje essas informações são seções da página inicial. Cada página abaixo responde perguntas reais que as pessoas fazem (no Google e em assistentes de IA) e precisa de dados que **só a igreja tem**.

**Regra de ouro:** nada de dado inventado. Tudo marcado com **[PREENCHER]** depende de você. Se não souber, deixe a pergunta de fora, em vez de chutar.

Palavras-chave abaixo são hipóteses de intenção, não volumes medidos. Confirme no Search Console (aba Desempenho) e no Planejador de Palavras-chave antes de priorizar.

---

## 1. Quem somos

- **URL:** `/quem-somos/`
- **Tipo:** institucional (entidade). **Intenção:** informacional, "quem é essa igreja?"
- **Palavra principal (hipótese):** igreja congregacional em Fortaleza. **Secundárias:** igreja evangélica congregacional Conjunto Esperança, o que é uma igreja congregacional.
- **Autor:** a liderança da igreja (nome do pastor ou conselho).
- **Já existe URL para essa intenção?** Não. Só há a seção "Quem somos" na home. A seção da home vira um resumo com link "Saiba mais".
- **Title (≤ 60 car.):** `Quem somos · Conjunto Esperança` (completar com "Igreja Congregacional em Fortaleza" se couber)
- **Meta description (120-155 car.):** `Conheça a história, o que a Igreja Evangélica Congregacional Conjunto Esperança crê e quem a lidera, em Fortaleza (CE).`
- **H1:** Quem somos

| H2 (pergunta real) | Resposta direta | Dado que só vocês têm |
|---|---|---|
| Quem é a Igreja Conjunto Esperança? | 1-2 frases: igreja evangélica congregacional, em qual bairro, desde quando | Ano de fundação **[PREENCHER]**, como começou **[PREENCHER]** |
| No que a igreja crê? | Lista curta das convicções (Escrituras, Trindade, salvação pela graça, etc.) | Confissão ou declaração de fé adotada **[PREENCHER]**: usar as palavras da própria igreja |
| O que significa ser congregacional? | 2-3 frases sobre governo da igreja local | Como funciona na prática (assembleia, conselho, membresia) **[PREENCHER]** |
| Quem lidera a igreja? | Nome, função e breve apresentação de cada líder | Pr. Elder Pinto e demais **[PREENCHER nomes, funções, formação]**, foto com autorização |
| Como é a vida da igreja além do culto? | Grupos, escola bíblica, ações sociais | Atividades reais, com dia e horário **[PREENCHER]** |
| Como falar com a igreja? | Telefone, Instagram, YouTube, endereço | Já estão no site; repetir os mesmos dados |

- **Links internos de entrada:** home (seção Quem somos), rodapé, menu. **Saída:** Visite-nos, Pregações, Texto-base.
- **Dados estruturados:** `AboutPage` + `BreadcrumbList`; reaproveitar a entidade `Church` (`@id` da home); `Person` para o pastor só com `url`/`sameAs` reais.
- **Conversão:** "Visite-nos no próximo domingo" → página 2.

---

## 2. Visite-nos

- **URL:** `/visite-nos/`
- **Tipo:** local. **Intenção:** local/transacional, "onde fica, que horas, o que esperar".
- **Palavra principal (hipótese):** igreja evangélica em Fortaleza / culto domingo Fortaleza / igreja no Conjunto Esperança. **Secundárias:** horário de culto Conjunto Esperança, como chegar.
- **Já existe URL?** Só a seção "Venha nos visitar" da home. Manter na home um resumo (horário + mapa) com link para a página completa.
- **Title:** `Visite-nos: horários e endereço · Conjunto Esperança`
- **Meta description:** `Culto aos domingos, das 10h às 12h, na R. 104, 227, Conjunto Esperança, Fortaleza (CE). Veja como chegar e o que esperar da primeira visita.`
- **H1:** Visite a Igreja Conjunto Esperança

| H2 (pergunta real) | Resposta direta | Dado que só vocês têm |
|---|---|---|
| Qual o horário dos cultos? | Domingo 10h-12h (culto de celebração). Quarta: culto de doutrina | Horário de quarta **[PREENCHER quando confirmado]**; outros horários **[PREENCHER]** |
| Onde fica? Como chegar? | Endereço completo + mapa | Pontos de referência, linhas de ônibus, estacionamento **[PREENCHER]** |
| Como é o culto? O que esperar na primeira visita? | Duração, estilo de música, pregação, crianças | Descrição real do culto **[PREENCHER]** |
| Como devo me vestir? Preciso me inscrever? | Resposta curta e acolhedora | **[PREENCHER]** |
| Tem programação para crianças e jovens? | Sim/não, horários, faixas etárias | **[PREENCHER]** |
| Dá para assistir online? | Link para YouTube e `/videos/` | Já existe a integração de transmissão |
| Acessibilidade | Rampa, banheiros, lugares reservados | **[PREENCHER]**, só o que existir de fato |

- **Fotos:** usar as da fachada e do santuário que o site já tem (origem em `PHOTO_SOURCES.md`). Ideal: acrescentar uma foto da entrada, com autorização.
- **Dados estruturados:** `WebPage` + `BreadcrumbList`; a entidade `Church` já tem endereço, coordenadas e horário de domingo. Se houver evento recorrente confirmado, `Event`. **Não** marcar avaliações.
- **Fora do site (importante para busca local):** o Perfil da Empresa no Google deve ter nome, endereço, telefone e horários **idênticos** a esta página. Atualizar o horário de quarta nos dois lugares ao mesmo tempo.
- **Conversão:** clique em "Como chegar" (Google Maps) e no telefone/WhatsApp. Medir como evento no GTM.

---

## 3. Pregações

- **URL:** `/pregacoes/` (índice) e `/pregacoes/serie-ou-titulo/` (uma por mensagem, ou por série)
- **Tipo:** conteúdo (hub + artigos). **Intenção:** informacional, "pregação sobre [passagem/tema]".
- **Palavras (hipóteses):** pregação sobre [livro/tema], estudo de [passagem], série "Uma igreja fiel em uma cultura contrária" (títulos que já estão nos vídeos).
- **Já existe URL?** `/videos/` lista os vídeos, mas só com título. **Não duplicar**: a página de pregação adiciona o que o vídeo não tem (texto), e `/videos/` continua sendo a listagem.
- **Autor:** Pr. Elder Pinto (ou o pregador de cada mensagem), em campo de autor real.

Estrutura de **cada página de mensagem** (só crie para mensagens que tenham o texto):

| Bloco | Conteúdo | Dado que só vocês têm |
|---|---|---|
| H1 | Título da pregação + passagem | Título e texto-base reais |
| Resumo em 3-5 frases | Resposta direta: "o que esta mensagem ensina" | Resumo feito ou aprovado pelo pregador **[PREENCHER]** |
| Esboço em tópicos | H2 por ponto da mensagem, com versículos | Esboço do pregador |
| Vídeo incorporado | O mesmo do YouTube, com `VideoObject` | Já existe no site |
| Passagem lida | Link para o capítulo em `/biblia/` | Já existe no site |
| Perguntas para reflexão em grupo | 3-5 perguntas | **[PREENCHER]** |

- **Regras:** só publicar mensagem com texto ou esboço de verdade (não transcrição automática sem revisão). **Nada de página em massa**: uma página por mensagem com conteúdo próprio, ou por série; se não houver texto, o vídeo fica só em `/videos/`.
- **Publicação:** começar com 3 a 5 mensagens e manter ritmo (por exemplo, uma por semana, junto com o devocional).
- **Dados estruturados:** `Article` (como os devocionais) + `VideoObject` + `BreadcrumbList`. Use `atualizado:` se corrigir o texto.
- **Links internos:** cada mensagem liga à passagem em `/biblia/`, ao devocional relacionado (se houver) e ao hub; o hub liga a todas.

---

## Ordem sugerida
1. **Visite-nos** (maior impacto local, menos conteúdo novo; fechar horário de quarta antes)
2. **Quem somos** (depende de história e convicções escritas pela liderança)
3. **Pregações** (depois que o ritmo de publicação estiver definido)

## O que preciso de você para escrever as páginas
- [ ] Ano e história de fundação; breve declaração de fé (nas palavras da igreja)
- [ ] Nomes, funções e fotos autorizadas da liderança
- [ ] Horário confirmado do culto de quarta e demais atividades
- [ ] Como chegar (referências, ônibus, estacionamento) e o que esperar do culto
- [ ] Programação infantil/jovens e acessibilidade (se houver)
- [ ] Esboços ou textos das 3-5 primeiras pregações

## Antes de publicar cada página
- [ ] Title/description conferidos (`lint_meta.py`) e página auditada (`audit_page.py`)
- [ ] Nenhum dado, depoimento ou estatística inventado
- [ ] Links de entrada adicionados (menu, rodapé, home)
- [ ] Entrar no `sitemap-paginas.xml` com `lastmod` real
- [ ] Pedir indexação no Search Console; Perfil da Empresa no Google com os mesmos dados
