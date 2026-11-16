# Drift e recuperação do rival

O comando de drift agora tolera até 250 ms entre pressionar Espaço e atingir direção/velocidade suficientes. O buffer expira, é cancelado ao soltar e é consumido ao começar: manter a tecla pressionada não reinicia automaticamente um drift encerrado. Soltar Espaço continua encerrando o drift imediatamente.

O turbo físico deixou de depender do cooldown de pontuação ou da seção já pontuada. Um novo drift válido pode gerar impulso no mesmo trecho; pontos continuam protegidos por cooldown e por seção. Mantidos os tempos de 1,2 s e 3 s, os critérios de curva, velocidade e segurança. A faixa próxima à borda ainda impede turbo perfeito, mas não zera a indicação de um turbo normal já carregado.

Rival: assistência de largada decai em 3 s (antes 2 s), com aceleração adicional máxima 8 (antes 5). Recuperação mantém os critérios de distância, corredor livre e frenagem de segurança; aceleração adicional máxima passa de 32 para 42 e aumento máximo de velocidade de 44 para 56 m/s, compartilhado pela física e pelo alvo da IA. O carro do jogador não recebeu aumento de potência.

Regressões: input antecipado, expiração e rearmamento; turbo repetido sem repetir pontos; prontidão/HUD/bordas; largada após contagem e término da assistência; testes existentes de ultrapassagem segura. Quatro testes Chromium de corrida, turbo, suspensão e áudio passaram. Avaliação subjetiva de dirigibilidade em hardware físico permanece pendente.
