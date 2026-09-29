# Regras atuais — protótipo 0.2.0

Este é o resumo das regras executadas pelo servidor. A fonte dos valores é `lib/catalog.ts`; a validação da montagem fica em `lib/draft.ts`, e as regras da partida em `lib/chess.ts` e `server/ChessRoom.ts`. Os valores abaixo formam um primeiro conjunto jogável, não uma afirmação de equilíbrio.

## Preparação e orçamento

- Cada jogador começa com a formação tradicional de um lado do tabuleiro: 39 pontos de material e 12 moedas temporárias. Peões podem ser reposicionados, melhorados, substituídos ou sacrificados.
- Valores de material: peão 1; cavalo e bispo 3; torre 5; dama 9. O Rei é obrigatório na casa inicial, vale 0 para o orçamento e não pode ser recrutado, movido, melhorado nem sacrificado.
- Material ativo não pode ultrapassar 39. O jogador pode trocar ou sacrificar outras peças para obter moedas: uma peça removida devolve seu valor de material e o preço das melhorias nela equipadas; depois, a nova peça ou melhoria é cobrada.
- Cada peça não-Rei pode ocupar uma casa vazia da metade própria, dentro de quatro fileiras: brancas 1–4; pretas 8–5. Fileiras avançadas são 3–4 para brancas e 6–5 para pretas; cada peça ali custa 2 pontos de Poder. Isso inclui peões. O Rei fica em e1/e8.
- Reposicionar preserva a identidade e as melhorias. O peão só pode avançar duas casas no primeiro lance se continuar na fileira inicial tradicional, sem ter se movido.
- Classes para compatibilidade: peão, cavalo e bispo são peças menores; torre e dama são peças maiores. Uma carta pode servir a uma ou às duas classes. O Rei não recebe habilidades.
- Cada peça tem um espaço de Arma e um de Encantamento. A mesma habilidade pode ser aplicada a várias peças. Feitiços ficam no inventário temporário da preparação, sem ocupar espaço de uma peça; o mesmo feitiço não pode ser comprado duas vezes na sala.
- **Poder total:** `material + preços das melhorias equipadas + preços dos feitiços guardados + 2 × peças avançadas`. Limite: 50. O saldo de moedas não faz parte da soma. Remover ou substituir uma melhoria reembolsa o preço correspondente e recalcula o Poder.
- A atualização paga da loja gasta moedas e não acrescenta Poder. Para conservar o orçamento, a validação registra o total gasto em atualizações: `material + melhorias + feitiços guardados + moedas restantes + gasto em atualizações = 51`.

## Loja aleatória

- A loja tem cinco espaços e é gerada pelo servidor a partir de 16 cartas. A composição inicial inclui pelo menos uma Arma compatível com peças menores, uma com peças maiores, um Encantamento e um Feitiço; o quinto espaço é sorteado do restante.
- Os jogadores recebem a mesma loja inicial. A compra repõe apenas o espaço do comprador; a reposição é privada e não oferece nenhuma das cinco cartas que já estão visíveis para esse jogador.
- Atualizar troca as cinco cartas pessoais. O preço é 1 moeda na primeira vez e aumenta em uma moeda a cada atualização (`1, 2, 3…`). A reposição também evita as ofertas visíveis e os Feitiços que o jogador já comprou.
- Não há estoque compartilhado entre jogadores, compras com dinheiro real, saldo persistente ou melhorias permanentes. Uma sala nova reinicia a economia.

## Classes, categorias e catálogo atual

Armas adicionam opções ao movimento normal. Movimentos sem captura não ameaçam o Rei; capturas adicionais ameaçam casas e contam para xeque, mate e roque. “Frente” e “trás” são relativos à cor da peça. Qualquer lance continua obrigado a deixar o próprio Rei seguro.

| Carta | Tipo / raridade | Classe | Custo | Efeito |
|---|---|---|---:|---|
| Passo lateral | Arma · comum | Menor | 3 | Move uma casa para o lado, sem capturar. |
| Retirada | Arma · incomum | Menor | 2 | Move uma casa para trás, sem capturar; não recupera o avanço inicial de duas casas. |
| Retaguarda | Arma · comum | Menor | 4 | Captura uma casa na diagonal para trás. |
| Lança | Arma · incomum | Menor | 5 | Captura uma casa diretamente à frente. |
| Passo firme | Arma · comum | Menor | 4 | Além do salto do cavalo, move uma casa ortogonal sem capturar. |
| Golpe curto | Arma · incomum | Menor | 5 | Além do salto do cavalo, captura uma casa na diagonal. |
| Desvio | Arma · comum | Menor | 5 | Move uma casa na horizontal ou vertical, sem capturar. |
| Duelo | Arma · incomum | Menor | 5 | Também captura uma casa na horizontal ou vertical. |
| Passo oblíquo | Arma · comum | Maior | 4 | Move uma casa na diagonal, sem capturar. |
| Flanco | Arma · incomum | Maior | 5 | Também captura uma casa na diagonal. |
| Salto real | Arma · raro | Maior | 7 | Salta exatamente duas casas ortogonais para destino vazio, ignorando a intermediária; conserva ataques normais. |
| Cruzada | Arma · comum | Menor | 5 | Também captura uma casa na horizontal ou vertical. |
| Lâmina diagonal | Arma · comum | Maior | 5 | Também captura uma casa na diagonal. |
| Isca | Encantamento · raro | Menor ou maior | 7 | Quando a peça é capturada, seu dono escolhe uma entre até três melhorias compatíveis geradas e a aplica de graça a uma peça aliada com espaço disponível. |
| Segundo coração | Encantamento · lendário | Menor ou maior | 10 | Cancela a primeira captura: a peça permanece no lugar, o atacante não se move e o turno termina. A próxima captura a remove normalmente. |
| Instante extra | Feitiço · raro | Menor ou maior | 7 | No próprio turno, adiciona 30 segundos uma vez, sem consumir o lance. Só existe para a partida atual. |

As raridades são comum (prata), incomum (azul), raro (ouro) e lendário (âmbar alaranjado). A carta inteira assume essa paleta, com entrada luminosa; raras/lendárias mantêm aura discreta. Os selos de melhoria na peça usam a mesma cor, ficam empilhados na vertical e têm moldura metálica, halo discreto e reflexo lento. Movimento reduzido elimina animações decorativas. Aparência não altera regras nem pausa ações.

Dois exemplos das anotações originais não viraram cartas: o ataque vertical de uma casa já existe para torre e dama no xadrez tradicional; e o Feitiço de aumentar o limite de peças não tem valor/condição definido. O catálogo atual não inclui essas cartas sem efeito ou sem regra fechada. Isca seleciona até três opções compatíveis aleatórias na ativação, para tornar “escolher uma entre três” uma escolha clara; a partida segue determinística depois da escolha.

Ao promover, o peão vira dama, torre, bispo ou cavalo tradicional e perde Arma, Encantamento e vida extra, sem reembolso durante a partida. Rei nunca pode ser capturado.

## Modos, partida e encerramento

- Há partida casual e sala privada com código. Não há ranqueado ou IA adversária nesta etapa.
- As montagens ficam ocultas até os dois jogadores confirmarem. Então há oito segundos de revelação sem relógio, para consultar os exércitos antes de jogar.
- O servidor sorteia as cores e as brancas começam. Cada lado tem 10 minutos, sem acréscimo ou limite separado por lance.
- Roque exige as casas convencionais, Rei e torre não movidos, caminho livre e casas do Rei sem ataque, inclusive por Armas. En passant segue a regra tradicional e só existe imediatamente após um peão andar duas casas.
- Vitórias: xeque-mate, tempo, desistência ou abandono. Empates: acordo, afogamento, material insuficiente reconhecido, reivindicação de repetição tripla ou 50 lances, repetição quíntupla automática ou 75 lances sem captura/movimento de peão. Mate prevalece sobre 75 lances.
- Ao esgotar o tempo, o oponente vence exceto se não tiver material reconhecido para dar mate. A detecção de posições mortas em todas as variantes continua conservadora.
- Desconexão concede até 60 segundos para reconectar e o relógio continua. Abandono durante preparação cancela a sala; durante partida concede vitória ao adversário. Preparação sem conclusão expira após 20 minutos.
- Em Isca, a partida aguarda a escolha do dono antes de aceitar outro lance ou operação de empate; desistir continua permitido. O efeito pode evitar um mate que a captura teria causado.

## Estado do projeto

Salas, compras, cartas, relógios e resultados são temporários e mantidos em memória no servidor. Não há conta, PostgreSQL, ranking, recompensa pós-partida, saldo acumulado nem cosméticos. O histórico de implementação registra a ordem das mudanças; este documento descreve somente as regras atuais.

Uma partida pode chegar a quase 20 minutos somando os dois relógios. Melhor de três permanece adiado até medir duração real, preparação, abandono e interesse em revanche.
