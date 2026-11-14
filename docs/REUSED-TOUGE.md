# Reuso do projeto do proprietário

Fonte: `initial JOJO.zip`, fornecido pelo proprietário nesta conversa. SHA-256: `BE65F3DC44E428D5BB6CF6CDAAD0ACBEC85A8DBFCABA33FC8034FD4B51E011AF`.

Somente módulos de código selecionados foram importados para `src/games/redline/touge/`: pista, matemática, veículo/drift, IA, modelos de carros, geometria/texturas/mundo e áudio sintetizado. A pasta `.git`, dependências, builds, executáveis e scripts de inicialização do arquivo não foram importados nem executados. O ZIP original permanece intacto.

## Preservado

- Estrada de Akagiri Pass com 3,2 km, três grampos, dois túneis, terreno, céu, árvores, muros, sinalização e geração/descarte de trechos.
- Modelos detalhados dos carros, faróis, rodas e contraesterço, física arcade, drift qualificado por curva e IA de perseguição/ultrapassagem.
- Texturas procedurais e sintetizador de motor/vento/derrapagem/impactos, com mute e fechamento de AudioContext ao sair.

## Removido/adaptado

- Não foram importados combate, animações/modelos de espíritos, diretor de duelos, poderes/maldições, controles de ataque e HUD espiritual. O método de dano espiritual e as zonas de duelo foram removidos dos módulos reutilizados.
- A disputa infinita de líder/perseguidor foi substituída por uma corrida finita: concluir a descida, preservar o carro e melhorar a pontuação. O rival é uma referência de desempenho. Derrota ocorre por destruição do carro ou limite de tempo, nunca por colapso espiritual.
- A antiga sincronia foi reduzida a bônus de condução com cooldown, sem poderes de combate e sem anunciar o FLOW compartilhado da futura campanha.
- HUD, resultados e ajuda pertencem a REDLINE/DRIFT.exe. Sair volta ao quarto e ao OS, sem reload. O renderer, loop e ciclo de suspensão são os do projeto atual; o renderer/composer e o RAF originais não foram copiados.
- O código JavaScript original selecionado foi mantido como ES modules, formatado e verificado por lint/testes; o adaptador e a simulação de integração são TypeScript. `allowJs` habilita essa interoperabilidade sem converter o projeto antigo inteiro.

Artefatos anteriores do protótipo de 720 m continuam apenas no histórico e nas evidências antigas. A implementação ativa e os testes usam os módulos reaproveitados de 3,2 km.

Ainda requer playtest humano completo e aferição em GPU física. A trilha musical e as transições de campanha permanecem para os incrementos posteriores; não foi acrescentada música comercial.
