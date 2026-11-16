# Preencher conteúdo profissional

Editar `src/content/portfolio.ts`. Todos os apps do monitor e o portfólio acessível leem esse mesmo objeto. Arquivos virtuais são derivados em `content/filesystem.ts`; o gerenciador de janelas não precisa mudar para acrescentar projetos.

- `profile`: nome público, apresentação e habilidades confirmadas. Valores ausentes devem continuar null/lista vazia, conforme o proprietário autorizou.
- `projects`: id estável, título, descrição factual, estado, tecnologias, imagens reais e links HTTPS do repositório/demo. O projeto SHIFT//BREAK é um protótipo, sem alegação de jogos concluídos.
- `gallery`: capturas/imagens autorizadas com texto alternativo. Copiar assets para `public/media/` e usar o caminho correspondente. Não usar links de tracking nem material sem licença.
- `contacts`: somente redes profissionais GitHub e LinkedIn com HTTPS, conforme a orientação institucional. Não adicionar e-mail, telefone ou outros dados pessoais. Endereços inválidos são omitidos da navegação.
- `resume`: manter null até existir um PDF real em `public/media/`. Então configurar url e título. O explorador só cria resume.pdf se estiver configurado; não gerar currículo fictício.

O arquivo `public/media/room-prototype.png` é uma captura real do incremento 02, produzida neste projeto. A descrição identifica seu estado provisório. A identidade pública do usuário Git e o e-mail de configuração local não são fontes de conteúdo.

Nome, foto, formação, habilidades, redes profissionais e projetos foram fornecidos pelo proprietário por meio do portfólio institucional. Procedência em `PORTFOLIO_IMPORT.md`. `category`, `period`, `contributions`, `video` e `deliveries` preservam a organização acadêmica e as contribuições da ABP. Semestre de projeto e turma de ingresso são históricos; não substituir por afirmações de semestre atual. Conteúdos ainda não presentes na fonte, como PDF e períodos dos projetos pessoais, não devem ser inventados.

Validar `npm run check` e `npm run test:e2e` depois de editar. Conferir links e download real do currículo antes de publicar. A publicação faz parte do incremento 14 e não foi realizada.
