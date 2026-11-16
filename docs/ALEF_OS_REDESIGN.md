# ALEF//OS — portfólio e experiências

## Ajuste solicitado: wallpaper e Central

A entrada agora mostra somente o wallpaper fornecido pelo autor (`public/media/desktop-wallpaper.png`), copiado integralmente, sem edição. A barra inferior mantém seus estilos, dimensões e controles. Início minimiza as janelas e retorna ao wallpaper. A página anterior permanece integralmente no aplicativo **Central ALEF//OS**, acessível por **ALEF// Aplicativos → Portfólio**, além dos acessos individuais já existentes. Central usa as mesmas funções de abertura do desktop e preserva seu estado ao minimizar. A projeção e a moldura não mudaram.

Check, 74 testes unitários e 14 testes de integração aprovados. Capturas revisadas: `docs/evidence/os-redesign/wallpaper-desktop.png` e `central-app.png`. O modo acadêmico estático permanece intacto. GPU física não verificada.

## Redesign anterior e correções

Correção posterior da moldura: plano interativo e bordas físicas compartilham `SCREEN` em `src/monitor/display.ts`. Quatro bordas delimitam a tela na mesma profundidade, sem receber sombras que confundam a área útil. A carcaça traseira permanece para as vistas laterais. Captura revisada: `docs/evidence/os-redesign/monitor-bezel-fixed.png`. Check/74 unitários/build e sete testes de quarto, projeção, resize, cliques e navegação aprovados. GPU física não verificada.

Direção escolhida pelo autor: portfólio dentro de um OS, janelas guiadas, visual grafite/branco/vermelho e destaque equivalente para projetos e jogos.

## Entrada e navegação

A tela inicial permanece atrás das janelas, com identidade, apresentação, contato e dois cartões principais. Projetos e biblioteca abrem com um clique; apresentação e contato também. A edição acadêmica continua disponível por link local.

Aplicativos reúne Portfólio, Experiências e Ferramentas. A busca normaliza acentos e caixa, consulta nome/descrição e informa resultados vazios. Abrir o menu reinicia a busca. Esc fecha o menu antes de sair do computador; fora do menu, Esc mantém o comportamento existente de voltar ao quarto.

Início minimiza todas as janelas sem destruí-las. A barra restaura uma janela por vez; abrir um app existente mantém sua navegação e conteúdo. Fechar Notas ou recarregar ainda descarta seu texto, como o aviso informa. Não há persistência nova ou servidor.

Diagnóstico do monitor fica em Ferramentas → Avançado. `?debug=1` habilita as ferramentas externas de renderização/captura. O modo normal esconde coordenadas, estatísticas e textos de implementação. Os controles externos se recolhem durante o uso do computador; saída e modo de leitura permanecem fora da área das janelas.

## Aplicativos e apresentação

- Projetos: cartões, filtros somente para categorias existentes e detalhe na mesma janela. Voltar mantém o filtro e devolve o foco ao cartão. Contribuições, sprints, tecnologias e links originais permanecem no detalhe.
- Jogos: DRIFT.exe e SIGNAL.exe disponíveis primeiro. Campanha, FIGHT.exe e FPS.exe ficam em uma seção recolhida de desenvolvimento, sem promessas de disponibilidade ou números de incrementos.
- Perfil: foto, formação e habilidades em lista; áudio manual preservado. Contato mantém os links reais e o currículo explicitamente pendente.
- Arquivos: ícones SVG locais, breadcrumb nomeado e foco recuperado após navegar. Sobre o sistema descreve os controles e o estado real.
- Modo de leitura: mantém todos os detalhes visíveis, sem exigir abertura de cartões ou WebGL. Compartilha conteúdo, habilidades e cores com o OS. A edição acadêmica estática em `docs/index.html` e `public/portfolio-original` não foi redesenhada.

## Contratos e limites

`AppDefinition` aceita categoria opcional (Ferramentas como padrão) e tamanho inicial opcional. IDs e factories existentes permanecem compatíveis. A tela inicial recebe o callback de abertura do desktop; jogos reutilizam os lançadores existentes.

Desktop lógico de 1280 × 720, barra de 56 px e área útil de 1280 × 664. Janelas comuns usam 760 × 520, amplas 1040 × 584 e Notas 560 × 400. Novas janelas são centralizadas com deslocamento limitado; todas respeitam a área útil. Maximizar/restaurar continua preservando geometria.

SVGs são definidos localmente. As capas são capturas reais existentes: `drift-preview.png` deriva de `docs/evidence/race-feel/turbo-perfect.png`; `signal-preview.png` deriva de `docs/evidence/06-signal.png`. Não há imagens remotas ou dependências novas. O preview antigo do SIGNAL mostra o jogo no quarto da época, sem alterar o jogo atual.

Transições de interface usam 150 ms e são desabilitadas com movimento reduzido. Sem filtros de desfoque, animações contínuas, novos renderizadores ou alterações nas regras dos jogos. A tela inicial fica inerte e visualmente atenuada quando há janelas visíveis.

## Verificação

Testes de navegação verificam 1280 × 720 / DPR 1 e 900 × 650 / DPR 2, carregamento de imagens, ausência de diagnóstico inicial, busca, filtros, detalhes, foco, restauração e limites da tela. Também medem contraste de textos/botões representativos da entrada (mínimo 4,5:1), visibilidade integral do botão de jogo e separação entre a saída e a barra inferior.

A suíte existente cobre notas, arraste/teclado, maximização, projeção, captura diagnóstica, áudio manual, modo de leitura de 390 px, cópia acadêmica estática e os dois jogos. Casos de redesign também integram a suíte de produção. Evidências visuais em `docs/evidence/os-redesign/`.

Os testes automatizados usam Chromium/SwiftShader; não equivalem à validação em GPU física, outros navegadores ou uma auditoria completa com leitor de tela. A legibilidade projetada depende do viewport; o modo de leitura permanece disponível para telas pequenas.
