# Retomada — Akagiri Loop implementado

Branch atual fix/drift-race-audit, base d0379eb. Usuário pediu corrigir problemas da auditoria: IA passa jogador lento/parado em retas, conserva faixa durante passagem, permite drift em recuperação; segundo lugar é derrota; colisão orientada e resposta lateral projetada; tandem sem salto brusco; freio exige soltar/reapertar para ré; HUD 10 Hz e vetores da câmera reutilizados. Check/57 unitários/build aprovado. Resultados finais e limites em docs/PROGRESS.md. Preservar rampas, luzes, L, quatro câmeras, B, drift/turbo/vácuo e retorno ao OS. Extras opcionais da auditoria não foram incluídos. Sem merge/push/deploy.

Entrega anterior do loop: o usuário aprovou fechar o circuito, escolheu uma volta completa e pediu concluir após interrupção por limite do plano. Código, testes e capturas foram preservados; a retomada confirmou check/49 unitários/build, 18 e2e e cinco testes de produção e finalizou documentação/commit 0c6e2a0.

O circuito ativo está em src/games/redline/touge/world/loop-track.js; track.js é a referência do trecho original e das constantes físicas. return-route.js acrescenta 3671,398 m, totalizando 6871,398 m. Oito grampos novos, barragem, vertedouro, galeria e reencontro. Arquitetura, medidas e evidências em docs/AKAGIRI_LOOP.md.

LoopTrack oferece length/startLine/closed/wrap/localGap e amostragem periódica. Progresso dos carros é acumulado; física e render consultam a posição local. Faixa compartilhada em 34 m; completar exige length + 34. Inverso usa a mesma faixa. Tempo máximo 600 s. Rival finalizado desacelera por até 70 m e não bloqueia a chegada. Streaming mantém IDs canônicos e carrega ambos os lados da emenda. Dados de geometria são reutilizados por semente; o terreno físico é o mesmo nos dois sentidos.

Preservar: drift termina ao soltar Espaço, trajetória segue levemente a orientação e termina em reta após 0,75 s; turbo por drift; acompanhamento sem impacto quando ambos estão em drift; vácuo mais fraco e vento somente durante uso; rival abre passagem, tem recuperação forte porém mantém distância, largada extra reduzida a dois segundos; rodas corrigidas; quatro câmeras por C; perseguição próxima; B/ botão para visão traseira; velocímetro ampliado. Mesmo renderer/loop e retorno ao quarto/OS com notas preservadas.

Capturas em docs/evidence/loop/ são inspeção por posicionamento. Voltas completas foram automatizadas com física real e renderização periódica; não afirmar playtest humano. Calibração prolongada em GPU física e outros navegadores permanece pendente, assim como o aviso de bundle Three.js >500 kB. Não reinstalar dependências com Vite usando o binding nativo; parar apenas servidores de teste próprios.

Sem merge na main, push ou deploy. Dados pessoais permanecem pendentes por decisão do proprietário. Incrementos 08–14 e campanha ainda obrigatórios; próximo principal é 08 BREAKPOINT. O fechamento do loop não está mais adiado: foi entregue nesta branch.
