# Integração do portfólio acadêmico

Branch `feat/integrate-academic-portfolio`, base `4dd0269`.

Fonte fornecida pelo proprietário: [portfólio publicado](https://fatec-jacarei-dsm-portfolio.github.io/ra2581392613033/) e [repositório institucional](https://github.com/fatec-jacarei-dsm-portfolio/ra2581392613033). O [registro da importação](academic-source.json) identifica blobs e recursos originais. Esta entrega é local; não altera o repositório institucional remoto ou o site publicado.

## Conteúdo no ALEF//OS

- Nome, foto, apresentação, objetivos, formação noturna na FATEC Jacareí, turma de ingresso, conhecimentos e redes profissionais vieram do portfólio do proprietário.
- Projetos separados em Acadêmicos, Pessoais e Profissionais; a categoria profissional fica explicitamente sem projetos cadastrados. Scrum Dungeon, V-Tec Motors e LIN0 foram integrados ao lado de SHIFT//BREAK.
- Scrum Dungeon preserva ABP/1DSM/1º semestre de 2026, contribuição individual por sprint, equipe, tecnologias, repositório, entregas e vídeo do YouTube. No OS e modo acessível, o vídeo é um link explícito; a edição original preserva também o embed.
- Apresentação, Projetos, Contato, Arquivos e modo acessível usam o conteúdo compartilhado. O README virtual da ABP inclui contribuições, período e links.
- Foto e imagens selecionadas são locais em `public/media/academic/`. A trilha opcional tem controles nativos, sem autoplay, e pausa ao sair do monitor. O áudio do jogo não foi substituído.
- Contatos limitados a GitHub/LinkedIn, sem e-mail ou telefone. Idade e localização não são exibidas. PDF e períodos/contribuições detalhadas dos projetos pessoais não foram inventados; essas informações não constavam detalhadas na fonte.

## Correções do professor

1. Removido `autoplay` do elemento de áudio.
2. Removidas também a tentativa de reprodução no carregamento e a reprodução disparada pelo primeiro clique/tecla fora do player. Analisador sonoro inicia a partir do evento de reprodução manual. Navegar entre páginas não inicia música.
3. Removida a indicação transitória de “2º semestre” da apresentação/formação e o ano decorativo do cabeçalho. A data exata de ingresso foi substituída pela turma de ingresso.
4. Mantidos turma de ingresso e período histórico da ABP: identificam registros acadêmicos e são exigidos pelas orientações, não afirmam qual semestre o aluno está cursando atualmente.

## Edição estática institucional

`public/portfolio-original/` contém a edição original corrigida, com HTML, CSS, JavaScript e todos os seus recursos locais. Ela abre em `portfolio-original/index.html` no servidor do projeto e pelo link “Portfólio acadêmico completo” na apresentação do OS.

`docs/index.html`, `docs/css/`, `docs/js/`, `docs/assets/` e `docs/.nojekyll` formam uma cópia pronta para hospedagem estática. Foram testados diretamente por HTTP, sem Vite, transpilação ou empacotamento. Após editar a edição original, sincronizar com:

```sh
node scripts/sync-academic-portfolio.mjs
```

Esse comando é uma conveniência de desenvolvimento; não é necessário executá-lo no servidor institucional, pois os arquivos já estão presentes. Os demais documentos de desenvolvimento em `docs/` não são dependências da página.

O template institucional importado está em `docs/README-INSTITUCIONAL.md`, com nome, curso, turma e endereço oficial. Ao preparar a entrega no repositório institucional, esse conteúdo deve ocupar o README da raiz. Links de vídeos de avaliação 2DSM/4DSM/6DSM permanecem com os estados da fonte; o vídeo da ABP não foi apresentado como se fosse o pitch individual de avaliação.

O quarto 3D continua usando TypeScript/Vite no projeto de desenvolvimento. Esta etapa integra o conteúdo e oferece a edição estática acadêmica; não converte toda a experiência 3D para execução sem build. Nenhuma configuração de Pages, branch remota ou publicação foi alterada. Aceitação acadêmica final depende da avaliação institucional.

## Verificação e procedência

Check de tipos/lint/formatação, 67 testes unitários e build aprovados. Testes verificam áudio inicialmente parado, navegação sem disparo sonoro, play/pause explícitos, dados e imagem reais, contribuição por sprint, links e edição institucional servida diretamente de `docs/`. Testes de bytes garantem sincronia de HTML/JS/CSS entre as duas cópias e existência dos recursos locais.

Os arquivos visuais e a música são os do portfólio fornecido, com créditos preservados; não foram reclassificados como CC0. O manifesto de áudio CC0 do DRIFT.exe continua separado. A galeria anterior do projeto foi preservada. Evidências e resultados finais em `docs/PROGRESS.md`.
