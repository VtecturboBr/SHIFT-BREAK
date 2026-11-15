# Atualização: vácuo e rival adaptado

Branch atual: feat/drafting-rival-racecraft, base fix/rival-passing-space (946f4ef). Rival abre uma lateral nas retas, conserva mais velocidade no drift e recebe recuperação gradual após ser ultrapassado, mantendo margem de acompanhamento com frenagem de segurança. Vácuo carrega em 1,5 s ao seguir alinhado de 5 a 42 m atrás e decai ao sair da esteira. Indicadores em RedlineWorld/redline.css; regras em TougeSimulation, Vehicle e driveAI. Detalhes em docs/PROGRESS.md.

Validação: 34 unitários/build, dois testes de corrida/mapa no navegador e cinco smokes de produção aprovados. Novo tests/unit/race-assist.test.ts cobre ultrapassagem sem contato e recuperação com jogador parando. Playtest humano prolongado/GPU física pendentes. Sem merge/push/deploy. Próximo incremento maior continua 08; fechar a pista em loop foi adiado explicitamente.

Desde o histórico abaixo também foram entregues drift encerrado ao soltar Espaço, mini-turbo, velocidades/aceleração recalibradas, velocímetro/carga, quatro câmeras por C, HUD ampliado e sentido inverso. Preservar essas funcionalidades e os dados pessoais pendentes.

## Histórico do checkpoint anterior

# Retomada — correções do mapa DRIFT.exe

Branch atual `fix/touge-map`, base `feat/07-reuse-touge` (3a46e34). O pedido atual foi corrigir os problemas da auditoria do mapa. Alterações e comparações antes/depois em `docs/audits/DRIFT-MAP.md`; evidências originais preservadas em `map-evidence/` e dez capturas novas em `map-fixed-evidence/`.

Traçado de 3,2 km com três grampos e dois túneis preservado, com retornos afastados em planta e sem cruzamentos. Zero invasões do terreno em 8005 amostras da malha real (antes 1020); margem mínima medida de 1,36 m abaixo do pavimento. `render/terrain.js` contém a geometria de produção testável.

Rails dos dois lados. `roadEdge(slip)` usa a face interna do rail e o envelope girado do carro, inclusive na correção de colisão entre carros. Centro reto limitado a ±2,32 m. Raycast restringe a câmera desejada e interpolada contra terreno/muros/túneis/portais; não é solver de colisão 3D do carro. Placas 150 m antes dos grampos, chevrons e Reta final após 3100 m. Túneis mais legíveis por emissão ambiente e guias, sem luz por lâmpada. Streaming combina distância de percurso e proximidade em planta (160/192 m).

Validação final: `npm run check` passou com 20 unitários; `npm run test:e2e` passou com 15 testes Chromium (2,1 min); `npm run test:production` passou com cinco testes (55,1 s). Inspeção de dez posições e 180 estados da câmera perto das barreiras, com interpolação ativa. A primeira rodada e2e sofreu reload de desenvolvimento durante uma edição; repetição com arquivos estáveis passou integralmente. Screenshots foram revisados visualmente. O teste de simulação completa a corrida com entradas determinísticas; não equivale a playtest humano completo.

O código do touge continua vindo de `initial JOJO.zip`, sem combate/espíritos/poderes/rounds infinitos. Fonte/hash em `docs/REUSED-TOUGE.md`. Um renderer/loop, suspend/resume do quarto, OS/notas preservados, áudio procedural fechado ao sair. Não reinstalar dependências enquanto Vite estiver usando o binding nativo; não deixar servidores de teste rodando nem encerrar servidores do usuário.

Dados pessoais permanecem pendentes por escolha do proprietário. Sem push, merge na main ou deploy. Próximo incremento do roadmap continua 08 BREAKPOINT; 08–14, FLOW, campanha, arte/áudio finais, cross-browser e GPU física continuam pendentes. O aviso de bundle Three.js >500 kB permanece. Calibrar dirigibilidade por playtest humano antes de considerar polimento final.
