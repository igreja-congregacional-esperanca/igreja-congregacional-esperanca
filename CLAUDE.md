# Instruções para o Claude neste repositório

Site da Igreja Evangélica Congregacional Conjunto Esperança, gerado por `node build.js` e publicado na Vercel. Leia o `README.md` para a estrutura do projeto.

## Documentação: sempre atualizar

Ao terminar qualquer trabalho neste repositório (código, conteúdo, SEO, infraestrutura), **antes de encerrar**:

1. Atualize `docs/registro-de-trabalho.md`:
   - mova para "Feito" o que foi concluído e tire da tabela "Pendente";
   - acrescente o que ficou pendente (com quem depende);
   - adicione uma entrada com a data no "Histórico";
   - atualize a data de "Última atualização" e o "Estado atual do site".
2. Se a mudança alterar SEO, dados da igreja (horários, endereço), build ou deploy, atualize também o `README.md` (seção SEO ou Arquivos principais) e os documentos em `docs/seo/`.
3. Inclua a atualização da documentação **no mesmo PR** da mudança.

## Regras do projeto

- **Nada de dados inventados**: horários, endereço, telefone, nomes, depoimentos, avaliações. O que faltar vira pendência para a igreja.
- **Segredos nunca entram no repositório, nos documentos nem em mensagens de commit**: tokens da Vercel, chaves de API (Bing, IndexNow) e senhas. Use variáveis de ambiente. Se um token for colado numa conversa, avise para revogá-lo.
- **Não remover** `<meta name="msvalidate.01" ...>` do `<head>` (verificação do Bing) nem o GTM.
- Horários e dados da igreja devem bater entre `CHURCH` (`build.js`), `content/eventos.json`, `src/footer.html`, `src/top.html` e a ficha do Google Maps.
- A `main` é protegida pelo ruleset "Proteger main": mudanças entram por pull request. Não altere o ruleset sem o dono pedir.
- Publicação em produção: o deploy automático Git → Vercel foi restaurado em 09/11/2026 para o site. Se falhar, siga "Como publicar manualmente" em `docs/registro-de-trabalho.md`.
- O link-bio fica em outro repositório (`Llink-bio`) e outro projeto da Vercel.
