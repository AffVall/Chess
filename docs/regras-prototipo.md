# Regras atuais — protótipo 0.4.1

Este é o resumo das regras executadas pelo servidor. Orçamentos ficam em `lib/catalog.ts`, habilidades em `lib/abilities.ts` e danos em `lib/combat.ts`; a validação da montagem fica em `lib/draft.ts`, e as regras da partida em `lib/chess.ts` e `server/ChessRoom.ts`. Os valores abaixo formam um primeiro conjunto jogável, não uma afirmação de equilíbrio.

## Preparação e orçamento

- Cada jogador começa com a formação tradicional de um lado do tabuleiro: 39 pontos de material e 12 moedas temporárias. Peões podem ser reposicionados, melhorados, substituídos ou sacrificados.
- O painel do jogador exibe **Vida 1.200** e **Tempo 05:00** como valores iniciais. Feitiços podem aumentar esses valores. Durante a partida, capturas reduzem a vida do dono da peça; vida zero ou relógio esgotado causam derrota.
- Na preparação, clique seleciona/desmarca; arrastar reposiciona em uma casa vazia permitida. Pelo teclado: Espaço levanta, setas escolhem a casa e Enter solta; Escape cancela. Na partida, seleção seguida de clique no destino continua disponível.
- Na bandeja inferior, uma casa vazia selecionada recebe a peça comprada; uma casa ocupada troca sua peça pela comprada. O preço líquido considera o reembolso da peça anterior e das melhorias removidas. A escolha da carta antes da peça permite equipar diretamente ao clicar no alvo iluminado; isso é uma compra explícita, não um movimento.
- Valores de material: peão 1; cavalo e bispo 3; torre 5; dama 9. Durante a preparação, o Rei é obrigatório na casa inicial, vale 0 para o orçamento e não pode ser recrutado, movido, melhorado nem sacrificado.
- Vender peça sem melhoria é imediato, por clique ou arraste até o botão Vender peça. Se tiver Arma ou Encantamento, abre confirmação com as melhorias e o reembolso total. Cancelar mantém a peça. Venda só existe na preparação e não causa dano à vida.
- Material ativo não pode ultrapassar 39. O jogador pode trocar ou sacrificar outras peças para obter moedas: uma peça removida devolve seu valor de material e o preço das melhorias nela equipadas; depois, a nova peça ou melhoria é cobrada.
- Cada peça não-Rei pode ocupar uma casa vazia da metade própria, dentro de quatro fileiras: brancas 1–4; pretas 8–5. Fileiras avançadas são 3–4 para brancas e 6–5 para pretas; cada peça ali custa 2 pontos de Poder. Isso inclui peões. O Rei fica em e1/e8.
- Reposicionar preserva a identidade e as melhorias. O peão só pode avançar duas casas no primeiro lance se continuar na fileira inicial tradicional, sem ter se movido.
- Classes para compatibilidade: peão, cavalo e bispo são peças menores; torre e dama são peças maiores. Uma carta pode servir a uma ou às duas classes. O Rei não recebe habilidades.
- Cada peça tem um espaço de Arma e um de Encantamento. A mesma habilidade pode ser aplicada a várias peças. Feitiços ficam no inventário temporário da preparação, sem ocupar espaço de uma peça; o mesmo feitiço não pode ser comprado duas vezes na sala.
- Feitiços preparados são resolvidos pelo servidor na transição para a revelação. Instante extra soma 60 segundos ao relógio inicial; a interface já mostra 06:00 na preparação. Reserva de tempo soma 120 segundos e Ampulheta real soma 180. Reconectar não reaplica o bônus, e comandos de ativação manual são rejeitados.
- **Poder total:** `material + preços das melhorias equipadas + preços dos feitiços guardados + 2 × peças avançadas`. Limite: 50. O saldo de moedas não faz parte da soma. Remover ou substituir uma melhoria reembolsa o preço correspondente e recalcula o Poder.
- A atualização paga da loja gasta moedas e não acrescenta Poder. Para conservar o orçamento, a validação registra o total gasto em atualizações: `material + melhorias + feitiços guardados + moedas restantes + gasto em atualizações = 51`.

## Loja aleatória

- A loja tem cinco espaços e é gerada pelo servidor a partir de 21 cartas. A composição inicial inclui pelo menos uma Arma compatível com peças menores, uma com peças maiores, um Encantamento e um Feitiço; o quinto espaço é sorteado do restante.
- Os jogadores recebem a mesma loja inicial. A compra repõe apenas o espaço do comprador; a reposição é privada e não oferece nenhuma das cinco cartas que já estão visíveis para esse jogador.
- Atualizar troca as cinco cartas pessoais. O preço é 1 moeda na primeira vez e aumenta em uma moeda a cada atualização (`1, 2, 3…`). A reposição também evita as ofertas visíveis e os Feitiços que o jogador já comprou.
- Não há estoque compartilhado entre jogadores, compras com dinheiro real, saldo persistente ou melhorias permanentes. Uma sala nova reinicia a economia.

## Classes, categorias e catálogo atual

Armas adicionam opções ao movimento normal. “Frente” e “trás” são relativos à cor da peça. Capturas adicionais podem capturar o Rei. Não existe obrigação de protegê-lo nem vitória por xeque-mate; o aviso visual de ameaça é informativo.

| Carta | Tipo / raridade | Classe | Custo | Efeito |
|---|---|---|---:|---|
| Passo lateral | Arma · comum | Menor | 3 | Move uma casa para o lado, sem capturar. |
| Retirada | Arma · incomum | Menor | 2 | Move uma casa para trás, sem capturar; não recupera o avanço inicial de duas casas. |
| Retaguarda | Arma · comum | Menor | 4 | Captura uma casa na diagonal para trás. |
| Lança | Arma · incomum | Menor | 5 | Captura uma casa diretamente à frente. |
| Passo firme | Arma · comum | Menor | 4 | Move uma casa ortogonal sem capturar. |
| Golpe curto | Arma · incomum | Menor | 5 | Captura uma casa na diagonal. |
| Desvio | Arma · comum | Menor | 5 | Move uma casa na horizontal ou vertical, sem capturar. |
| Duelo | Arma · incomum | Menor | 5 | Também captura uma casa na horizontal ou vertical. |
| Passo oblíquo | Arma · comum | Maior | 4 | Move uma casa na diagonal, sem capturar. |
| Flanco | Arma · incomum | Maior | 5 | Também captura uma casa na diagonal. |
| Salto real | Arma · raro | Maior | 7 | Salta exatamente duas casas ortogonais para destino vazio, ignorando a intermediária; conserva ataques normais. |
| Cruzada | Arma · comum | Menor | 5 | Também captura uma casa na horizontal ou vertical. |
| Lâmina diagonal | Arma · comum | Maior | 5 | Também captura uma casa na diagonal. |
| Isca | Encantamento · raro | Menor ou maior | 7 | Quando a peça é capturada, seu dono escolhe uma entre até três melhorias compatíveis geradas e a aplica de graça a uma peça aliada com espaço disponível. |
| Segundo coração | Encantamento · lendário | Menor ou maior | 10 | Cancela a primeira captura: a peça permanece no lugar, o atacante não se move e o turno termina. A próxima captura a remove normalmente. |
| Instante extra | Feitiço · incomum | Jogador | 3 | +1 minuto de tempo inicial. |
| Reserva de tempo | Feitiço · raro | Jogador | 5 | +2 minutos de tempo inicial. |
| Ampulheta real | Feitiço · lendário | Jogador | 8 | +3 minutos de tempo inicial. |
| Vitalidade | Feitiço · incomum | Jogador | 3 | +200 de vida inicial. |
| Vigor maior | Feitiço · raro | Jogador | 5 | +400 de vida inicial. |
| Vigor real | Feitiço · lendário | Jogador | 8 | +600 de vida inicial. |

As raridades são comum (prata), incomum (azul), raro (ouro) e lendário (âmbar alaranjado). A carta inteira assume essa paleta, com entrada luminosa; raras/lendárias mantêm aura discreta. Os selos de melhoria na peça usam a mesma cor, ficam empilhados na vertical e têm moldura metálica, halo discreto e reflexo lento. Movimento reduzido elimina animações decorativas. Aparência não altera regras nem pausa ações.

Dois exemplos das anotações originais não viraram cartas: o ataque vertical de uma casa já existe para torre e dama no xadrez tradicional; e o Feitiço de aumentar o limite de peças não tem valor/condição definido. O catálogo atual não inclui essas cartas sem efeito ou sem regra fechada. Isca seleciona até três opções compatíveis aleatórias na ativação, para tornar “escolher uma entre três” uma escolha clara; a partida segue determinística depois da escolha.

Ao promover, o peão vira dama, torre, bispo ou cavalo tradicional e perde Arma, Encantamento e vida extra, sem reembolso durante a partida. O Rei pode ser capturado e a partida continua se seu dono ainda tiver vida.

## Vida e dano

| Peça capturada | Dano ao dono |
| --- | ---: |
| Peão | 50 |
| Cavalo / bispo | 150 |
| Torre | 250 |
| Dama | 500 |
| Rei | 1.000 |

- Vida base: 1.200. Feitiços diferentes acumulam (+1.200 com as três cartas de vida), cada ID só pode ser comprado uma vez. Os bônus entram na prévia da preparação e são inicializados uma única vez na revelação. Reconectar não cura nem reaplica bônus.
- Dano depende da peça perdida, não da atacante, da raridade ou de seu custo de compra. Captura en passant causa 50; uma peça promovida causa o valor de sua classe atual quando capturada.
- Segundo coração cancela a primeira captura e não causa dano nessa defesa. A segunda captura causa dano normal.
- Vida fica limitada a zero no mínimo. Captura fatal encerra antes de Isca ou qualquer empate automático. Não há dano de relógio nem comparação de material no encerramento por tempo.
- O jogador pode deixar o Rei ameaçado e continuar após perdê-lo. O Rei continua movendo uma casa, e peças podem atravessar situações que seriam cravadas no xadrez clássico.

## Modos, partida e encerramento

- Há partida casual e sala privada com código. Não há ranqueado ou IA adversária nesta etapa.
- As montagens ficam ocultas até os dois jogadores confirmarem. Então há oito segundos de revelação sem relógio, para consultar os exércitos antes de jogar.
- O servidor sorteia as cores e as brancas começam. Cada lado tem 5 minutos de base, sem acréscimo ou limite separado por lance.
- Roque exige as casas convencionais, Rei e torre não movidos, caminho livre; casas ameaçadas não impedem o roque nesta variante. En passant segue a regra tradicional e só existe imediatamente após um peão andar duas casas.
- Vitórias: vida esgotada, tempo, desistência ou abandono. Empates: acordo, ambos sem movimentos, reivindicação de repetição tripla ou 50 lances, repetição quíntupla automática ou 75 lances sem captura/movimento de peão. Vida esgotada prevalece sobre esses empates.
- Sem movimentos no próprio turno, o servidor libera Passar turno. O relógio corre até o comando chegar; passar voluntariamente com jogadas disponíveis é proibido. Se ambos não puderem mover, a sala encerra em empate. Isso também cobre jogadores sem peças que ainda conservam vida.
- Ao esgotar o tempo, o oponente vence sempre, independentemente de vida ou material. O servidor confere o relógio antes de processar jogadas; uma captura enviada depois do tempo não salva o jogador.
- Desconexão concede até 60 segundos para reconectar e o relógio continua. Abandono durante preparação cancela a sala; durante partida concede vitória ao adversário. Preparação sem conclusão expira após 20 minutos.
- Em Isca, a partida aguarda a escolha do dono antes de aceitar outro lance ou operação de empate; desistir continua permitido. A captura já desconta vida antes da escolha. Se for fatal, Isca não abre; a escolha também não pode ser usada após o relógio acabar.

## Estado do projeto

Salas, compras, cartas, relógios e resultados são temporários e mantidos em memória no servidor. Não há conta, PostgreSQL, ranking, recompensa pós-partida, saldo acumulado nem cosméticos. O histórico de implementação registra a ordem das mudanças; este documento descreve somente as regras atuais.

Uma partida pode chegar a quase 10 minutos somando os dois relógios base, além dos bônus preparados. Melhor de três permanece adiado até medir duração real, preparação, abandono e interesse em revanche.

Os três feitiços de tempo juntos somam seis minutos, chegando a 11 minutos por jogador. Os três de vida chegam a 2.400 de vida inicial. Cada conjunto custa 16 moedas e continua sujeito ao orçamento/Poder, exigindo reorganizar o exército para comprar todos. Esses valores são provisórios para balanceamento.
