# Decisões

- 14/11/2026: TypeScript sem framework e Three.js/Vite. A UI DOM permite acessibilidade e minimiza dependências. Camadas separadas para domínio, engine e aplicação.
- Um único animation loop, com pausa em aba oculta e dt limitado. Recursos são descartados na troca de cena e no HMR.
- Room Prototype: geometria original em escala métrica; controles por arraste/teclado para funcionar mesmo com pointer lock negado. Câmera sentada limitada e redução de movimento aplicada.
- Assets futuros por GLTFLoader/TextureLoader com mensagens de falha. Arte inicial é geometria original; não há arquivos de terceiros.
- Não publicar automaticamente. Branches locais empilhadas conservam incrementos revisáveis sem criar/alterar main.
- Monitor: homografia DOM baseada na câmera e hit testing nativo, com matriz invertível; UV por raycast para diagnóstico. Oclusão conservadora por amostragem e captura única de render target, conforme docs/ADR-001-MONITOR.md.
- OS Core: modelo de janelas independente do DOM, apps registrados sem acoplar conteúdo ao gerenciador. Arraste usa inversa da projeção e limites lógicos, não deltas de pixels da viewport. Controladores de eventos por janela e timer de relógio pertencem ao desktop.
- Incremento 05: proprietário confirmou que identidade, apresentação, habilidades, projetos pessoais e contatos devem permanecer claramente pendentes por enquanto. Não bloquear a estrutura nem inferir fatos; centralizar em src/content/portfolio.ts para preenchimento posterior. Apenas o próprio projeto tem dados verificáveis e captura real cadastrados.
- Quarto estático sob demanda: renderer só redesenha em mudança de câmera, viewport ou cena; loop de domínio/DOM continua único. Métrica conta frames realmente desenhados e mostra idle. Isso resolveu gargalo no teste DPR 2 sem elevar timeout.
- Incremento 06: SIGNAL.exe 2D é a menor prova completa de jogo/launcher, com vitória/derrota, pausa, restart e retorno. Não substitui os gêneros 3D. Sessões compartilham o loop principal e descartam seus recursos; ADR-002 orienta o próximo módulo 3D.
- Override restrito de minimatch para versão corrigida no tooling TypeScript ESLint; lint executado para validar compatibilidade. Remover quando o pacote pai atualizar sua dependência. Referência: https://github.com/advisories/GHSA-g3hv-75wg-m249.

- 07: REDLINE usa apresentação imersiva temporária e suspensão do quarto, sem segundo renderer/loop; física arcade por distância/lateral testável. Ver ADR-003.
