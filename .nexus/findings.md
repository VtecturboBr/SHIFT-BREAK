# Evidências e limites

FATO: repositório remoto vazio, confirmado pelo clone e metadados GitHub.
FATO: conteúdo profissional e mídia licenciada não foram fornecidos.
FATO: quarto e cenas de diagnóstico validados no Chromium por software; screenshots inspecionados. Não há medição de desempenho em GPU física nem teste cross-browser ainda.
DECISÃO: placeholders explícitos; não usar dados do git config como identidade pública.
RISCO: projeção HTML não compartilha automaticamente o depth buffer WebGL; validar oclusão antes de declarar incremento 03 completo.
RESULTADO: projeção e cliques reais validados. Oclusão conservadora por cinco raios; limite e evolução descritos no ADR-001. Quadro 3D capturado e visto no monitor físico.
RESULTADO: OS Core com múltiplas janelas validado no monitor; arraste e teclado não alteram câmera; minimizar preserva texto. Próximo risco é a apresentação de conteúdo real e fallback sem WebGL.
RESULTADO: VFS, conteúdo central e fallback móvel/WebGL ausente validados. Dados pessoais aguardam preenchimento conforme decisão explícita do proprietário. Quarto sob demanda removeu gargalo de renderização contínua no OS; testes comprovam ausência de redraw extra.
RESULTADO: ciclo do launcher validado com jogo de teste real, incluindo vitória, timeout/derrota, pause/retry, saída temporária, cancelamento lazy e retorno ao mesmo canvas sem reload. Todos os 13 e2e passaram. O primeiro jogo 3D permanece pendente.

- 07: ida/volta preservou canvas e notas em duas sessões reais no Chromium. Modelo completou pista; arte provisória e playtest humano/GPU/cross-browser pendentes.

- ZIP contém um projeto Three.js/Vite com código procedural, além de .git/dependências/builds excluídos da importação. Cena reaproveitada verificada no Chromium. Ajuste de DPR em software e render sob demanda resolveu lentidão em countdown/pausa nos testes isolados, sem elevar timeout.
