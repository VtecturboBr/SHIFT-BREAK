# Preencher conteúdo profissional

Editar `src/content/portfolio.ts`. Todos os apps do monitor e o portfólio acessível leem esse mesmo objeto. Arquivos virtuais são derivados em `content/filesystem.ts`; o gerenciador de janelas não precisa mudar para acrescentar projetos.

- `profile`: nome público, apresentação e habilidades confirmadas. Valores ausentes devem continuar null/lista vazia, conforme o proprietário autorizou.
- `projects`: id estável, título, descrição factual, estado, tecnologias, imagens reais e links HTTPS do repositório/demo. O projeto SHIFT//BREAK é um protótipo, sem alegação de jogos concluídos.
- `gallery`: capturas/imagens autorizadas com texto alternativo. Copiar assets para `public/media/` e usar o caminho correspondente. Não usar links de tracking nem material sem licença.
- `contacts`: rótulo e URL HTTPS ou mailto explícitos. Endereços inválidos são omitidos da navegação.
- `resume`: manter null até existir um PDF real em `public/media/`. Então configurar url e título. O explorador só cria resume.pdf se estiver configurado; não gerar currículo fictício.

O arquivo `public/media/room-prototype.png` é uma captura real do incremento 02, produzida neste projeto. A descrição identifica seu estado provisório. A identidade pública do usuário Git e o e-mail de configuração local não são fontes de conteúdo.

Validar `npm run check` e `npm run test:e2e` depois de editar. Conferir links e download real do currículo antes de publicar. A publicação faz parte do incremento 14 e não foi realizada.
