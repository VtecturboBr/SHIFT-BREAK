# Decisões

- 14/11/2026: TypeScript sem framework e Three.js/Vite. A UI DOM permite acessibilidade e minimiza dependências. Camadas separadas para domínio, engine e aplicação.
- Um único animation loop, com pausa em aba oculta e dt limitado. Recursos são descartados na troca de cena e no HMR.
- Assets futuros por GLTFLoader/TextureLoader com mensagens de falha. Arte inicial é geometria original; não há arquivos de terceiros.
- Não publicar automaticamente. Branches locais empilhadas conservam incrementos revisáveis sem criar/alterar main.
- Override restrito de minimatch para versão corrigida no tooling TypeScript ESLint; lint executado para validar compatibilidade. Remover quando o pacote pai atualizar sua dependência. Referência: https://github.com/advisories/GHSA-g3hv-75wg-m249.
