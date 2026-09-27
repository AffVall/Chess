# Regras atuais — protótipo 0.1.0

Este documento substitui os pontos conflitantes da proposta inicial. A implementação foi autorizada pelo usuário após as correções sobre peões, dinheiro inicial, loja aleatória e relógio.

## Decisões confirmadas pelo usuário

- Peões participam da montagem, podem ser sacrificados e receber melhorias.
- Cada jogador começa com dinheiro para escolher as melhorias que quer comprar.
- A loja é aleatória e deve ter bastante variedade.
- Relógio de 10 minutos por jogador, sem acréscimo por lance.
- Melhorias não persistem entre partidas.
- Melhor de três é uma possibilidade para o futuro, com atenção à duração e ao caráter casual. Não implementar séries agora.

## Parâmetros iniciais escolhidos para tornar a primeira etapa jogável

Esses valores são hipóteses de teste e não uma afirmação de equilíbrio.

- Começar com o exército tradicional (39 pontos) e 12 moedas.
- **Material e dinheiro são recursos separados.** O material ativo nunca passa de 39. Melhorias custam moedas e não ocupam pontos de material. Isso substitui a fórmula antiga que juntava os dois custos.
- O valor de uma peça é tanto seu custo de recrutamento quanto seu valor de sacrifício: peão 1, cavalo/bispo 3, torre 5, dama 9. Rei é obrigatório e não pode ser comprado, melhorado, sacrificado ou movido durante a preparação.
- Trocar ou sacrificar uma peça equipada reembolsa também o preço da melhoria. Remover ou trocar melhoria reembolsa a anterior. Recomprar custa o mesmo que o reembolso; não gera dinheiro.
- Invariante verificável: material ativo + moedas gastas nas melhorias atualmente equipadas + saldo = 51. Ao começar outra partida, tudo recomeça; não há inventário ou saldo persistente.
- As 15 casas iniciais, exceto a casa do Rei, aceitam qualquer tipo de peça não-Rei, inclusive substituir um peão por uma dama se houver orçamento. Casas podem ficar vazias. Ainda não há posicionamento fora das duas fileiras iniciais.
- Peão colocado na fileira de trás move normalmente uma casa por vez. O avanço de duas casas só existe na fileira tradicional de peões, antes do primeiro movimento. Recuar não restaura esse direito.
- O servidor sorteia oito das onze melhorias, incluindo ao menos três para peões e uma para cada outro tipo de peça. Ofertas iguais para os dois lados, sem novos sorteios dentro da sala, sem esgotar estoque entre jogadores. Uma melhoria por peça, sem limite de cópias entre peças distintas.
- Os exércitos ficam privados até ambos confirmarem. Então há oito segundos de revelação, com consulta a todas as habilidades, antes de começar o relógio.
- Se as duas montagens produzirem uma posição inicial com algum Rei em xeque, ambas voltam a editar e recebem uma indicação para proteger a coluna do Rei. A partida não começa em estado inválido.

## Catálogo inicial

Todos os efeitos são passivos: adicionam opções ao movimento normal, cada jogada consome um turno, não há aleatoriedade durante a partida, cooldown ou carga. A jogada precisa deixar o próprio Rei seguro. Efeitos de movimento sem captura não criam ameaças adicionais. Efeitos de captura criam ameaças e entram no cálculo de xeque, mate e roque. “Frente” e “trás” são relativos à cor da peça.

| Habilidade | Peça | Moedas | Efeito adicional |
|---|---|---:|---|
| Passo lateral | Peão | 3 | Move uma casa para um dos lados, sem captura. |
| Retirada | Peão | 2 | Move uma casa para trás, sem captura; não recupera avanço inicial. |
| Retaguarda | Peão | 4 | Captura uma casa na diagonal para trás. |
| Lança | Peão | 5 | Captura uma casa diretamente à frente. |
| Passo firme | Cavalo | 4 | Move uma casa ortogonal, sem captura. |
| Golpe curto | Cavalo | 5 | Captura uma casa diagonal. |
| Desvio | Bispo | 5 | Move uma casa ortogonal, sem captura; permite trocar de cor de casa. |
| Duelo | Bispo | 5 | Captura uma casa ortogonal. |
| Passo oblíquo | Torre | 4 | Move uma casa diagonal, sem captura. |
| Flanco | Torre | 5 | Captura uma casa diagonal. |
| Salto real | Dama | 7 | Salta exatamente duas casas ortogonais para destino vazio, ignorando a casa intermediária. Após mover, mantém seus ataques normais. |

Na promoção, a melhoria do peão é removida e ele se torna dama, torre, bispo ou cavalo tradicional, à escolha do jogador. Não há reembolso durante a partida. Melhorias não concedem invulnerabilidade, segunda vida ou movimento extra do Rei nesta etapa.

## Partida, relógio e encerramento

- Brancas começam; o servidor sorteia as cores. Ambos têm 600.000 ms; não há incremento, delay ou limite adicional por lance.
- Roque exige Rei/torre nas casas convencionais e ainda não movidos, caminho livre e casas do Rei sem ameaça, inclusive ameaças de melhorias. Um roque não remove a melhoria da torre.
- En passant mantém a regra tradicional: apenas imediatamente após avanço de duas casas. Capturas extras de habilidades não ganham en passant.
- Vitória por mate, desistência, tempo ou abandono. Reis nunca são capturados.
- Empate por acordo, afogamento e material insuficiente reconhecido. A análise de material é conservadora na presença de habilidades: não declarar empate usando apenas uma tabela do xadrez clássico.
- Reivindicações de repetição tripla/50 lances são aceitas no turno do reclamante quando já atingidas. Não há ainda reivindicação baseada em um lance anunciado antes de jogá-lo. Repetição quíntupla e 75 lances são automáticas, com mate tendo precedência.
- A identidade da posição considera movimentos/ataques das habilidades, direitos de roque, direito efetivo de en passant, avanço inicial dos peões e lado a jogar. Relógios e IDs internos de peças não contam como diferença posicional.
- Por tempo, vence o adversário, exceto se tiver só Rei ou a posição tiver material insuficiente reconhecido. Detecção completa de toda posição morta de uma variante permanece uma limitação do protótipo.
- Desconexão dá até 60 segundos para reconectar; relógio segue. Abandono durante montagem cancela a preparação; durante revelação/partida concede vitória ao adversário. Resultado final é imutável.
- Uma sala sem concluir preparação expira após 20 minutos. A duração ideal da preparação ainda será medida e ajustada.

## O que esta entrega implementa

Uma etapa vertical jogável com interface, preparação, sala privada, pareamento casual, motor autoritativo, relógios e reconexão. Catálogo, estado e resultados das salas estão na memória do servidor. O nome Gambito é provisório.

Contas, PostgreSQL, persistência de eventos/resultados, recuperação após queda do processo, ranqueado, matchmaking por nível, recompensa pós-partida e painel de balanceamento serão implementados nas próximas etapas. A proposta antiga de moedas cosméticas não foi adotada automaticamente. Esta versão usa apenas moedas temporárias de preparação.

## Questão de duração a acompanhar

10+0 pode consumir quase 20 minutos por partida, além da montagem. Uma série de três pode aproximar-se de uma hora. Antes de adotar melhor de três, medir preparação, duração real, abandono e desejo de revanche; comparar alternativas como relógio menor opcional, duas rodadas com cores alternadas ou manutenção de uma formação por uma sessão curta. Nenhuma série é obrigatória agora.
