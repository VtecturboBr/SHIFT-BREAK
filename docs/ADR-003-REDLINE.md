# REDLINE — renderer e física

O incremento 07 usa apresentação imersiva temporária, permitida pela especificação. Engine.suspendWorld guarda o RoomWorld sem descartá-lo; resumeWorld descarta apenas a corrida e restaura o mesmo renderer/canvas e as janelas do OS. O loop continua único. dispose também libera a cena suspensa em erro/perda de contexto.

O quarto fica inerte durante a corrida; a superfície DOM é escondida e os handlers do jogo pertencem a um AbortController descartado na saída. Teclas são limpas na pausa, blur, ocultação da aba e restart. Import lazy é cancelável, com verificação da versão do modo para não reabrir após sair/retornar durante o loading.

A pista original tem 720 m de descida, curvas contínuas, montanhas, árvores, guard-rails e bloqueio após a chegada. Carro e rival são geometria procedural provisória. O rival avança a velocidade limitada na mesma pista. Materiais de baixa rugosidade, neblina e faróis compõem o protótipo noturno. Não há assets ou trilha de terceiros.

DrivingModel é independente de Three.js. Passos fixos de 1/120 s, aceleração/freio, resposta lateral com aderência/drift e inércia de curva; colisões limitam deslocamento, reduzem velocidade e danificam o carro com cooldown. Pontuação exige movimento lateral, velocidade e drift fora do cooldown. Vitória na chegada; derrota por dano ou limite de tempo; restart limpa estado. O controle é arcade por distância/lateral em uma estrada autorada, não uma simulação automotiva livre.

Efeitos usam pools limitados de fumaça/marcas; geometrias, materiais, luzes, HUD e listeners são liberados ao sair. A integração com FLOW e campanha continua em 10–11. Arte/animações definitivas e áudio estão nas etapas posteriores. Não há suporte touch anunciado para dirigir; o caminho acessível do portfólio permanece disponível.

Validação: modelo com trajetória de teste completa, drift, colisões/derrota, pausa/restart e equivalência de passos. Browser verifica duas sessões com entradas reais, mesmo canvas e notas preservadas. Concluir percurso no teste de domínio não equivale a playtest humano de toda a pista, nem a medição de GPU física.
