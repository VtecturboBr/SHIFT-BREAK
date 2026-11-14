# Evidências e limites

FATO: repositório remoto vazio, confirmado pelo clone e metadados GitHub.
FATO: conteúdo profissional e mídia licenciada não foram fornecidos.
FATO: quarto e cenas de diagnóstico validados no Chromium por software; screenshots inspecionados. Não há medição de desempenho em GPU física nem teste cross-browser ainda.
DECISÃO: placeholders explícitos; não usar dados do git config como identidade pública.
RISCO: projeção HTML não compartilha automaticamente o depth buffer WebGL; validar oclusão antes de declarar incremento 03 completo.
RESULTADO: projeção e cliques reais validados. Oclusão conservadora por cinco raios; limite e evolução descritos no ADR-001. Quadro 3D capturado e visto no monitor físico.
