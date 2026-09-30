# Direção de design — Salão de Obsidiana

**Projeto:** Gambito, nome provisório.  
**Versão deste documento:** 2.0 · 29/09/2026.
**Entrega:** direção visual e de interação revisada a partir do protótipo.
**Estado:** D1–D7 estão implementadas em código.

- A revisão 1.4 empilha os selos das peças e acrescenta moldura metálica e reflexo lento.
- As revisões 1.5 e 1.6 reorganizam a hierarquia das cartas, compartilham o ícone de arma, mantêm dicas contextuais estáveis e permitem desmarcar a peça selecionada.
- A revisão 1.7 coloca o tabuleiro numa aba lateral sobre a loja, com expansão sob o cursor.
- A revisão 1.8 segue o esboço: loja à esquerda, painel do jogador à direita, dinheiro destacado e aba do tabuleiro sobre a área da loja.
- A revisão 1.9 acrescenta miniatura ampliada da peça selecionada com seus selos, ações de planejamento junto ao tabuleiro expandido e filtro de ofertas compatíveis.
- A revisão 2.0 refina loja, retrato e painel expandido, unifica raridades e acrescenta Vida/Tempo e feitiços automáticos.
- Cosméticos continuam adiados.

## Índice

1. [Como usar este documento](#1-como-usar-este-documento)
2. [Conceito artístico](#2-conceito-artístico)
3. [O que veio do usuário e o que precisa de regra](#3-o-que-veio-do-usuário-e-o-que-precisa-de-regra)
4. [Sistema visual](#4-sistema-visual)
5. [Tabuleiro e peças](#5-tabuleiro-e-peças)
6. [Preparação, pontuação e posicionamento](#6-preparação-pontuação-e-posicionamento)
7. [Cartas e mercado](#7-cartas-e-mercado)
8. [Telas e layouts](#8-telas-e-layouts)
9. [Movimento e animações](#9-movimento-e-animações)
10. [Cosméticos futuros](#10-cosméticos-futuros)
11. [Acessibilidade e interação](#11-acessibilidade-e-interação)
12. [Inventário de componentes e assets](#12-inventário-de-componentes-e-assets)
13. [Implementação e próximas etapas](#13-implementação-e-próximas-etapas)
14. [Decisões ainda em aberto](#14-decisões-ainda-em-aberto)
15. [Hierarquia e leitura das cartas de melhoria](#15-hierarquia-e-leitura-das-cartas-de-melhoria)
16. [Preparação com loja e painel do jogador](#16-preparação-com-loja-e-painel-do-jogador)
17. [Revisão da loja, retrato e planejamento — versão 2.0](#17-revisão-da-loja-retrato-e-planejamento--versão-20)
18. [Referências e registro desta entrega](#18-referências-e-registro-desta-entrega)

## 1. Como usar este documento

Este guia é a referência visual para a interface atual e para as próximas etapas. As decisões de aparência, composição, tipografia, materiais e movimento abaixo devem ser seguidas como um conjunto. Evitar substituir a direção por um painel genérico de cartões ou por uma simples troca de verde para cinza.

Ordem de referência:

1. Pedidos atuais do usuário: aparência grandiosa, tabuleiro preto e branco, documentação, cosméticos futuramente equipáveis e obtidos jogando; não implementar cosméticos agora. A solicitação atual autoriza verificar bugs e testar esta revisão.
2. Este documento: decisões de design e sequência da futura implementação visual.
3. [nextmoves.md](nextmoves.md): anotações originais do usuário sobre pontuação, classes, raridades e loja; decisões abertas e desvios do MVP estão identificados abaixo.
4. [regras-prototipo.md](regras-prototipo.md): regras que o servidor executa no protótipo 0.4.1.
5. [implementacao.md](implementacao.md): histórico e limites do trabalho realizado.
6. [historico.md](historico.md): registro cronológico do trabalho, etapa a etapa (seções 11–28).

**Distinção essencial para executar:** há um redesenho aplicável ao jogo atual e há interfaces previstas para regras futuras. Só mostrar comandos, valores, raridades e efeitos reais que o servidor consegue fornecer e validar. Não simular funcionalidades futuras dentro da partida para fazer a tela parecer completa.

### Resumo para começar

| Decisão | Direção fechada |
|---|---|
| Universo visual | Salão monumental de pedra negra; um tabuleiro elevado como objeto central; luz lateral branca e detalhes metálicos discretos. |
| Tabuleiro | Cinza-carvão `#373B43` e porcelana `#F5F5F3`; acabamento liso, peças com contorno e estados sobrepostos legíveis. |
| Peças | Silhuetas clássicas, porcelana branca e obsidiana negra; SVG com relevo leve, contornos contrastantes e base legível. |
| Tipografia | Cormorant Garamond para títulos; Manrope para interface, regras e números. |
| Cores auxiliares | Prata como estrutura e ouro envelhecido nas ações; melhorias usam prata, azul, dourado e âmbar conforme a raridade. |
| Tela inicial | Uma composição cênica com peças monumentais, título curto e acesso direto ao jogo. |
| Preparação | Tabuleiro dominante, quatro fileiras próprias, pontuação de material e Poder, peças reposicionáveis, e loja de cinco ofertas com raridade/categoria visíveis. |
| Partida | Tabuleiro frontal, relógios próximos aos jogadores, efeitos curtos e informações acessíveis por seleção. |
| Animações | Responder à ação; raras e lendárias têm revelações próprias; selos equipados têm um reflexo lento e discreto, sem deslocamento durante a partida. |
| Personalização | Preparar separação visual entre aparência e regra. Inventário, desbloqueios e recompensas ficam adiados. |

### Revisão 1.1: decisões com maior impacto

| Decisão refinada | Aplicação | Por quê |
|---|---|---|
| Concentrar a grandiosidade | Pedestal em três patamares e portal escalonado na entrada; moldura discreta durante o jogo. | Escala e geometria dão identidade sem disputar atenção com as casas. |
| Diminuir ornamentação de interface | Uma ação principal por área; remover frases/legendas que repetem o título; reservar molduras fortes ao tabuleiro. | A composição ganha hierarquia e as decisões ficam mais rápidas. |
| Preservar contexto no celular | Seleção fica numa faixa compacta; detalhes abrem por pedido; mercado lembra a peça e a oferta escolhidas. | Consultar uma peça não deve esconder o tabuleiro nem interromper a comparação. |
| Explicar a troca antes da compra | Mostrar efeito atual, novo efeito, reembolso, preço e saldo previsto junto da ação. | O jogador entende o que perde e o que ganha sem fazer contas de cabeça. |
| Separar os sinais de jogo | Seleção nos cantos, último lance em filete, xeque em borda interna e foco externo. | Estados simultâneos continuam distinguíveis nas duas cores de casa. |
| Celebrar sem atrasar | Uma cerimônia por oferta nova; compra recebe confirmação curta; nenhum efeito bloqueia ação. | Raras e lendárias mantêm personalidade sem tornar a preparação cansativa. |
| Preparar cosméticos legíveis | Aparência neutra local futura e marcadores funcionais fora da decoração. | Personalização não prejudica reconhecimento de peças, habilidades ou tempo. |

Esta revisão orienta os refinamentos do protótipo. A lista de aplicação na seção 13 distingue ajustes de interface de funcionalidades que ainda dependem de regras; o registro abaixo dela descreve o que foi aplicado.

## 2. Conceito artístico

### O gesto visual que identifica o jogo

Um **tabuleiro sobre um pedestal de obsidiana em três patamares**, cercado por um portal escalonado incompleto. O portal usa dois montantes largos e três recuos no topo; a assimetria vem da luz lateral e das peças, não de controles inclinados. Aparece na composição inicial e, em versão mínima, na moldura de revelação. O corte diagonal do topo do bispo inspira apenas o símbolo e pequenos recortes de cartas, preservando a silhueta monumental do pedestal.

“Babilônico” será traduzido em escala, profundidade, iluminação e cerimônia. A arquitetura terá degraus e volumes monolíticos, sem exigir uma representação histórica da Babilônia. As peças continuam imediatamente reconhecíveis como xadrez.

Três intensidades do mesmo mundo:

- **Entrada:** monumental. Um bispo branco e uma torre negra ampliados atrás do tabuleiro; portal escalonado, sombra longa e luz rasante. Uma única entrada coreografada.
- **Preparação:** tátil. A pessoa escolhe peças e cartas como objetos de uma coleção sobre uma mesa de pedra. A loja é uma fileira de ofertas, com posição estável.
- **Partida:** concentrada. A arquitetura recua; ficam tabuleiro, peças, relógios e informação. A decisão precisa ser legível antes de qualquer espetáculo.

### Composição e materiais

- Fundo predominantemente preto. Relevos nos painéis usam variação tonal pequena e uma linha superior de luz.
- Mármore apenas na moldura/pedestal, por traços vetoriais muito discretos. O interior das casas fica liso.
- Metal em pequenos filetes, selos de raridade e ações selecionadas. Ouro nunca cobre toda a interface.
- Profundidade por sobreposição, borda dupla e sombra localizada. Evitar vidro desfocado sobre o tabuleiro.
- Tipografia alinhada à esquerda nas áreas funcionais. Resultado e revelação podem centralizar uma frase curta.
- Cada tela tem um protagonista: cenário inicial; tabuleiro na preparação; tabuleiro e relógio na partida.
- Na entrada, a cena ocupa a maior área, mas o formulário tem a ação mais evidente. Durante a partida, cabeçalho e títulos recuam para deixar tabuleiro e relógios no primeiro campo de visão.
- Reservar acabamento material ao pedestal, às peças e às cartas. Ficha, histórico e ajuda usam superfícies simples; não transformar cada bloco de texto em um objeto com brilho e sombra.
- Nada de partículas contínuas, neblina passando sobre casas, cursores personalizados, tilt seguindo o mouse ou tremor de câmera.

### Revisão da direção contra o pedido

A primeira proposta substituiu o verde e creme por pedra, porcelana e metal. A revisão concentra a arquitetura no portal/pedestal, reduz legendas decorativas repetidas e aproxima alvo, efeito e custo da compra. O caráter do jogo vem dos objetos de xadrez e da montagem do exército. Tipografia cerimonial e dourado apoiam essa identidade sem dominar os controles.

## 3. O que veio do usuário e o que precisa de regra

### 3.1 Decisões expressas incorporadas ao design

- Peões podem receber melhorias e ser sacrificados.
- A preparação dispõe de dinheiro; a loja é aleatória e deve oferecer variedade.
- Material tem limite de 39 pontos. A versão de MVP usa Poder total com teto 50, combinando material, custo de melhorias e avanço.
- Peças podem ocupar a terceira e a quarta fileiras a partir do próprio lado, com custo de 2 pontos de habilidade por peça nessas fileiras.
- Habilidades terão compatibilidade por grupos, tipos e raridades.
- Tipos citados: **Arma**, **Encantamento** e **Feitiço**.
- Raridades: **Comum**, **Incomum**, **Raro**, **Lendário**. Raras e lendárias precisam de animação especial.
- A loja tem **cinco ofertas**; comprar substitui aquela posição para quem comprou. Atualizar a loja começa custando 1 e encarece a cada tentativa.
- Partidas únicas de 10 minutos por jogador, sem incremento. Melhor de três continua em estudo.
- Futuramente haverá cosméticos equipáveis, conquistados jogando na conta. Não criar essa funcionalidade agora.

### 3.2 Padrões de regra adotados para o MVP

As decisões práticas adotadas para implementar nextmoves ficam visíveis ao jogador e são validadas pelo servidor:

| Tema | Regra aplicada |
|---|---|
| Poder total | **P = M + U + 2A**, com material **M ≤ 39**, poder **P ≤ 50**, melhorias/feitiços adquiridos **U**, e quantidade de peças avançadas **A**. O custo de atualizar a loja não entra em U. Uma melhoria removida deixa de contar e reembolsa seu preço; feitiço comprado conta até ao usar. |
| Classes | Peão, cavalo e bispo pertencem às **peças menores**; torre e dama às **peças maiores**. Rei não recebe melhorias. Uma carta pode aceitar as duas classes. |
| Equipamentos | Cada peça tem um espaço de Arma e um espaço de Encantamento, permitindo combinar tipos distintos. Substituir uma carta devolve o preço da carta anterior do mesmo espaço. |
| Avanço | Brancas podem usar as fileiras 1–4, com fileiras 3–4 custando 2 pontos de poder por peça. Pretas podem usar 8–5, com fileiras 6–5 custando 2. O Rei continua em e1/e8. Reposicionar mantém identidade; peão só conserva o avanço inicial de duas casas se estiver na fileira tradicional de partida. |
| Loja | Cinco cartas por jogador. Os dois começam com a mesma seleção; uma compra substitui aquele espaço apenas na loja do comprador. A composição inicial garante armas para as duas classes e inclui Encantamentos e Feitiços. Atualizar substitui toda a loja e custa 1, 2, 3… moedas por tentativa; esse gasto não é reembolsado nem entra no Poder total. |
| Feitiço implementado | **Instante extra** custa 7 moedas e concede 30 segundos uma vez, no turno do jogador, sem consumir o lance. O feitiço é adquirido na loja e não passa entre partidas. |
| Encantamentos implementados | **Isca** (Raro) abre escolha de uma entre até três melhorias grátis para uma peça aliada elegível quando a peça encantada é capturada. **Segundo coração** (Lendário) cancela uma captura uma vez; o atacante não se move e o turno termina. |
| Capturas de arma | Efeitos de arma **adicionam** movimentos/capturas às regras normais. Movimentos sem captura não ameaçam o Rei. Promoção remove os espaços de melhorias do peão. |
| Renovação de ofertas | O servidor exclui as cinco ofertas visíveis ao gerar uma substituição/atualização. Feitiços já comprados não reaparecem para o mesmo jogador nessa sala. |

As peças avançadas contam 2 cada mesmo que sejam peões. O exemplo 15 material + 20 moedas em melhorias resulta em 35 Poder, sem avanço. A versão de regras atual usa limite fixo de 50; o valor pode ser ajustado depois de partidas de balanceamento.

O cartão de Feitiço vertical descrito em nextmoves não foi incluído: torre e dama já capturam uma casa vertical adjacente pelas regras tradicionais, então a carta, tal como escrita, não teria efeito. O catálogo também não oferece o exemplo de aumentar o limite de peças porque a proposta não define custo nem momento de ativação. “Instante extra” implementa o exemplo explícito de adicionar tempo. Isca sorteia até três opções elegíveis quando dispara; a escolha do jogador é explícita e a partida aguarda sua resolução.

### 3.3 Escopo implementado nesta etapa

A sala mantém o orçamento de 39 pontos de material e 12 moedas iniciais, com cinco cartas de loja, Poder total máximo 50, classes de peças, raridades, Arma + Encantamento por peça e feitiços temporários. A loja inicial é a mesma para os dois lados e cada reposição posterior é privada.

A preparação permite mover as peças nas quatro fileiras próprias, inclusive entrar/sair da zona avançada. O servidor confirma material, ouro, Poder, classe e posições antes de aceitar cada alteração. As regras de partida continuam autoritativas no servidor.

## 4. Sistema visual

### 4.1 Paleta

As seis cores centrais:

| Token sugerido | Cor | Aplicação |
|---|---|---|
| `--color-void` | `#08090B` | Fundo principal, profundidade do cenário. |
| `--color-stone` | `#191C22` | Painéis e corpos das cartas. |
| `--color-board-black` | `#373B43` | Casas escuras em cinza-carvão, com contraste claro sobre a porcelana. |
| `--color-board-white` | `#F5F5F3` | Casas brancas e superfícies de porcelana. |
| `--color-silver` | `#B8C2CE` | Texto secundário, filetes e indicadores neutros. |
| `--color-gold` | `#D8B777` | Ação principal e destaque cerimonial. |

Tokens funcionais:

| Token | Cor | Uso |
|---|---|---|
| `--color-surface-raised` | `#252A33` | Popover, hover discreto, conteúdo acima de painel. |
| `--color-text` | `#F5F5F3` | Texto principal. |
| `--color-text-muted` | `#B8C2CE` | Ajuda, legendas, dados secundários. |
| `--color-line` | `#424A58` | Borda decorativa/divisória; não usar como única identificação de controle. |
| `--color-control-edge` | `#8895A8` | Limite visível de entradas e controles secundários. |
| `--loot-ink` / comum | `#D8DEE7` | Prata em cartas e marcadores comuns. |
| `--loot-ink` / incomum | `#A6D0FF` | Azul em cartas e marcadores incomuns. |
| `--loot-ink` / raro | `#F2D789` | Ouro em cartas e marcadores raros. |
| `--loot-ink` / lendário | `#FFBD86` | Âmbar alaranjado em cartas e marcadores lendários. |
| `--color-success` | `#94CCB1` | Confirmação e estado pronto, acompanhados de texto/ícone. |
| `--color-danger` | `#FF9696` | Erro, xeque e ação destrutiva. |
| `--color-focus` | `#B5D5FF` | Foco de teclado. |

Usar as cores semânticas como texto sobre fundo escuro ou como borda/ícone. Sobre superfícies claras, usar texto `--color-void`. Texto sobre dourado também é escuro. Não usar texto branco sobre dourado nem prata sobre casa branca.

As cores são especificação, não laudo de contraste já medido. Na futura etapa de verificação, exigir contraste de texto de pelo menos 4,5:1, texto grande de 3:1 e indicadores funcionais de 3:1; ajustar tokens mantendo a direção.

O dourado preenchido identifica a ação principal da área. Moedas, seleção e raridade usam formatos diferentes: moeda com valor, cantos da casa e selo com nome da raridade. Compatibilidade reforça a borda na própria cor da carta. Verde identifica confirmação; vermelho fica reservado a xeque, erro e ação destrutiva. Marcadores de melhoria são pequenos selos quadrados de cantos suavizados, com fundo grafite, moldura metálica dupla, símbolo SVG e halo na cor da raridade. Ficam empilhados no canto superior direito, com 2 px entre eles, inclusive sobre casas claras. A largura acompanha a casa entre 11 e 18 px.

### 4.2 Tipografia

- **Cormorant Garamond**, pesos 500/600: título inicial, títulos de tela e resultado. Proporção alta, cortes elegantes, sem usar itálico colorido para destacar uma palavra.
- **Manrope**, pesos 400/500/600/700: todo o restante, incluindo cartas e relógios. Números tabulares no relógio e nos orçamentos.
- A implementação atual usa `next/font` para gerar arquivos auto-hospedados de Cormorant Garamond e Manrope. Manter essa escolha; se a compilação precisar funcionar offline, empacotar WOFF2 com licença e origem registradas. Reservar espaço com fallback para não deslocar tabuleiro/controles quando carregarem.
- Fallbacks: Georgia para títulos; sistema sans-serif para interface. A aplicação continua utilizável sem as fontes de marca.

| Elemento | Desktop | Celular | Peso / entrelinha |
|---|---|---|---|
| Título inicial | 80 px, máximo 2–3 linhas | 44 px | 500 / 0,98 |
| Título de tela | 40 px | 30 px | 600 / 1,1 |
| Título de painel funcional | 20 px | 18 px | 600 / 1,2, sans |
| Nome de carta | 18 px | 17 px | 700 / 1,2, sans |
| Texto de regra | 15 px | 15 px | 400 / 1,5 |
| Botão / campo | 15 / 16 px | 15 / 16 px | 600 / 1,3 |
| Metadado | 12 px | 12 px | 500 / 1,4 |
| Relógio | 32 px | 26 px | 700 / 1,0, tabular |

Evitar textos de regra menores que 14 px. Metadados podem ocupar duas linhas; não truncar preço, compatibilidade ou condição de uso. Labels em caixa normal: “Poder total”, “Suas moedas”.

Nome de melhoria, custo e ação têm prioridade sobre tipo/raridade. Títulos de painel funcional usam Manrope 18–20 px; Cormorant fica nos títulos de tela e resultado. Na partida, título de tela é opcional e não ultrapassa 24 px. Evitar uma legenda acima de cada título: “Peça selecionada” só acrescenta informação se o título não identificar a peça. Substituir “inspector” por **ficha da peça** em textos voltados ao jogador. Usar **Ouro disponível**, **moedas**, **melhoria** e **sacrificar** consistentemente.

### 4.3 Geometria e espaço

- Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Conteúdo funcional até 1440 px de largura; cena inicial pode ultrapassar essa largura apenas como decoração sem receber eventos.
- Margens: 32 px em telas amplas, 24 px em tablet, 12 px em celular.
- Botões: altura mínima 48 px. Ícones isolados: área de toque 44 × 44 px; símbolo 20–24 px.
- Botões e campos: raio 6 px. Painéis: raio 12 px. Cartas: raio 10 px com recorte decorativo de 8 px no canto superior direito, sem cortar conteúdo/foco.
- Não repetir contorno dourado em todos os elementos. Painel neutro usa uma borda só; a moldura do tabuleiro tem borda externa, filete e rebaixo.
- Sombra de objeto principal: `0 24px 64px rgba(0,0,0,.45)`. Carta elevada: `0 8px 24px rgba(0,0,0,.3)`.
- Camadas: cenário 0; conteúdo 10; peças em deslocamento 20, dentro do tabuleiro; controles fixos 30; popover 40; backdrop 50; diálogo 60; notificações 70. Cenário e efeitos nunca recebem eventos de ponteiro.

## 5. Tabuleiro e peças

### 5.1 Tabuleiro funcional

- Visão ortogonal, quadrada, sem perspectiva durante preparação, revelação e partida.
- Casas exatamente 1:1, todas do mesmo tamanho. `a1` escura. A orientação segue o lado do jogador; nunca girar automaticamente durante a partida.
- Casas escuras em `#373B43`, casas claras em `#F5F5F3`. Nenhum gradiente por casa. Moldura escura com filete prata; detalhe dourado apenas nos quatro cantos externos.
- Coordenadas na moldura, fora do centro útil das casas. Números e letras se mantêm legíveis com o tabuleiro invertido.
- Borda total: 16 px em desktop, 8 px no celular, incluindo coordenadas. A sombra fica fora dessa medida.
- Em partida desktop: dimensionar pela largura **e** pela altura disponível, reservando cerca de 230 px para cabeçalho, duas barras de jogador e controles. Limitar o lado a 680 px. Evitar tabuleiro de 680 px em uma janela baixa que esconda o próprio relógio.
- Em celular: tabuleiro usa toda a largura interna. Em 320 px, reduzir margens para 8 px e moldura para 4 px; cada casa ficará menor que 44 px. Compensar com toque em duas etapas, seleção persistente e ações externas grandes; não sobrepor áreas de toque entre casas.

### 5.2 Identidade das peças

Manter SVG como formato. Criar uma família visual consistente de seis silhuetas, em `viewBox` comum de 64 × 64. O conjunto atual pode servir de esboço, mas precisa ganhar base, acabamento e proporções uniformes.

| Peça | Característica indispensável |
|---|---|
| Peão | Cabeça redonda, pescoço curto e base clara. |
| Cavalo | Perfil equino inequívoco; olho e focinho visíveis em tamanho pequeno. |
| Bispo | Cabeça alongada com corte diagonal aberto. |
| Torre | Coroa com ameias e corpo vertical estável. |
| Dama | Coroa com pontas e corpo mais alto que o bispo. |
| Rei | Cruz e coroa distinta da dama. |

- Peças ocupam cerca de 80% da casa, com alinhamento pela base. Peões podem ter 68% de altura, reis/damas até 84%.
- Brancas: corpo branco, lado sombreado prata, contorno escuro. Pretas: corpo negro, plano lateral grafite, contorno externo prata claro e contorno interno escuro.
- Todas as silhuetas precisam se separar de **ambas** as cores do tabuleiro. A sombra não é o único recurso de separação.
- No máximo três planos de preenchimento e um brilho estreito por peça. Evitar texturas miúdas que desapareçam no celular.
- Base oval sutil estabiliza o objeto; sombra curta não invade a casa vizinha.
- Segundo coração usa marcador `♥` enquanto a defesa estiver disponível; após o impacto, o marcador some. A raridade não substitui esse estado funcional.
- Ícones de habilidade ficam em um canto da casa, com fundo sólido contrastante, sem encobrir a silhueta. Até dois selos ficam em coluna: Arma acima, Encantamento abaixo quando ambos estão equipados; detalhes ficam no inspector.
- SVGs decorativos usam `aria-hidden`; a casa interativa descreve posição, peça, lado, melhoria e estado.

### 5.3 Estados do tabuleiro

| Estado | Tratamento |
|---|---|
| Selecionada | Quatro cantos dourados com contorno escuro/claro adaptado ao fundo. Nunca preencher a casa inteira de dourado. |
| Destino vazio | Disco central pequeno com dupla borda preta/branca. |
| Captura possível | Quatro marcas de captura nas bordas, sem cobrir a peça alvo. |
| Último lance | Linha interna fina nos dois quadrados, menos forte que a seleção. |
| Xeque | Moldura interna vermelha de 3 px, ícone de alerta e texto “Xeque” junto ao turno. Cor das casas permanece. |
| Ação pendente | Origem selecionada permanece; indicador discreto de envio fora da peça. |
| Ação rejeitada | Estado confirmado do servidor, mensagem explicativa; sem chacoalhar tabuleiro. |
| Foco de teclado | Contorno externo bicolor; prioridade visual acima da seleção. |
| Casa fora da preparação | Tratamento neutro e ícone/legenda de restrição; não esconder as coordenadas. |

**Coexistência:** último lance usa o filete a 1 px da borda; xeque, moldura interna a 4 px; seleção, quatro cantos a 7 px; foco, contorno externo com apoio bicolor. Em casas pequenas, reduzir espessuras mantendo as formas. Marcador de habilidade ocupa o canto superior direito sem esconder coordenadas. Captura possível usa marcas neutras, distintas do vermelho de xeque. Cada estado precisa de sua camada; não reutilizar um único pseudo-elemento que apague o estado anterior. O último lance não aplica banho dourado sobre as casas.

Selecionar peça adversária abre sua ficha, mas nunca aparenta conceder controle sobre ela. Melhorias que alteram ataque precisam ser explicadas por texto e diagrama; não confiar apenas no conjunto de destinos exibido.

## 6. Preparação, pontuação e posicionamento

### 6.1 Fluxo principal

`Entrar na sala → selecionar peça → consultar/equipar melhoria → ajustar exército → revisar → confirmar → aguardar adversário → revelação → partida`.

Tudo que altera o exército ocorre antes da confirmação. A interface mostra o estado confirmado e sinaliza o comando pendente. Botões que gastam recursos ficam bloqueados enquanto uma mutação de preparação aguarda resposta, para evitar compra duplicada.

Também permitir começar pela oferta: `consultar melhoria → escolher peça compatível → conferir custo → equipar`. Escolher oferta ou alvo não compra nada. Manter a oferta identificada enquanto o jogador seleciona no tabuleiro, com “Cancelar seleção da melhoria”. Se a oferta ou a peça deixar de ser válida, cancelar a intenção e explicar o motivo. A confirmação usa a versão atual recebida do servidor.

### 6.2 Orçamento

Apresentar uma régua horizontal com três blocos, não três cartões promocionais:

1. **Material:** `15 / 39` + ícone de peça.
2. **Poder total:** `35 / 50` + ícone de losango dividido.
3. **Ouro disponível:** `8` + moeda.

Ouro é um saldo numérico. Material e Poder usam valores `usado / limite`; a barra de Poder é a principal. Material aparece como régua secundária para deixar clara sua contribuição e evitar sugerir dois orçamentos independentes que podem ser somados. Abrir “Como é calculado” expõe a soma e o teto da versão de regras.

Na compra ou deslocamento, a interface apresenta Material, Poder e Ouro confirmados. O servidor rejeita uma alteração que ultrapasse material 39, ouro disponível ou Poder 50. Uma prévia textual `Poder 35 → 39` e `Ouro 8 → 4` é refinamento visual futuro; não sugerir que já existe quando não for exibida.

O teto 50 está ativo. Poder combina material, custo das melhorias/feitiços comprados e custo das peças em fileiras avançadas.

### 6.3 Inspector da peça

Em desktop, fica ao lado do tabuleiro. Conteúdo, nesta ordem:

- Miniatura grande, nome e coordenada: “Peão em e2”.
- Grupo e material: “Peões · 1 ponto”.
- Melhoria equipada, tipo, raridade real e regra completa.
- Ações de recrutar/trocar, remover melhoria e sacrificar, conforme a fase permitir.
- Prévia de custos/reembolso perto da ação correspondente.

Sacrifício tem confirmação compacta **dentro da ficha**, com peça, melhoria perdida, material antes/depois e valor devolvido discriminado. “Confirmar sacrifício” e “Manter peça” ficam separados. No celular, a confirmação ocupa a mesma ficha expandida; não empilhar outro diálogo. O protótipo passou a usar essa confirmação dentro da ficha. Não criar comando de desfazer antes de existir transação reversível no servidor.

No celular, tocar peça atualiza uma faixa compacta abaixo do tabuleiro, sem abrir painel automaticamente. A faixa mostra “Peão em e2”, melhoria atual e “Ver peça”. Essa ação abre a ficha inferior, até 80% da altura dinâmica, com rolagem interna. Fechar preserva seleção e posição do mercado. Não exigir arrastar a peça nem usar toque longo para acessar funções essenciais.

Na troca de melhoria, mostrar “Sai: [efeito atual]” e “Entra: [novo efeito]”, preço, reembolso e saldo previsto. Usar “Equipar em Peão e2 por 4 moedas” na primeira compra e “Trocar melhoria” acompanhado do custo líquido na substituição. Se houver crédito líquido, escrever “Receber 2 moedas”; evitar preço negativo. Valores dependem da regra real de reembolso. A compra ocorre nessa ação explícita, sem um diálogo extra quando a prévia já estiver completa.

### 6.4 Posicionamento avançado implementado

- Casas próprias normais: fileiras 1/2 para brancas, 8/7 para pretas.
- Casas próprias avançadas: fileiras 3/4 para brancas, 6/5 para pretas.
- “Terceira fileira” é relativa ao jogador. As coordenadas continuam as oficiais do tabuleiro.
- A zona avançada recebe marcação discreta e cada peça nela acrescenta 2 ao Poder. O orçamento mostra o custo total; a prévia individual `+2`/`−2` descrita acima permanece refinamento visual.
- Clique/toque na origem e depois no destino é a interação obrigatória. Arrastar pode ser adicionado como alternativa posterior.
- Uma casa contém uma peça. Clicar destino ocupado não troca peças implicitamente. Mostrar “Escolha uma casa vazia”.
- Movimento mantém ID, melhoria e seleção da peça. Não implementar reposicionamento como sacrificar/recrutar: isso teria efeitos indevidos sobre custo e loja.
- Durante edição, não mostrar posição privada do adversário. O preview usa apenas o próprio exército.
- Se a formação conjunta for inválida na confirmação, explicar o problema e retornar à edição conforme resposta do servidor. Não revelar peças adversárias antecipadamente por mensagens de erro detalhadas.

## 7. Cartas e mercado

### 7.1 Anatomia da carta

Cada oferta usa esta ordem, com área de ação fixa no rodapé:

```text
┌ Golpe diagonal               4 moedas ┐
│ Arma                 ◇ Raro           │
│ Peões, menores                        │
│          [diagrama 5 × 5]              │
│ Adiciona captura de uma casa           │
│ na diagonal.                          │
│                                       │
│ Durante a partida                     │
│ [Ver regra completa]                  │
│ Alvo: Peão em e2                       │
│ [Equipar por 4 moedas]                 │
└───────────────────────────────────────┘
```

O exemplo mostra **hierarquia**, não uma habilidade nova aprovada: nome, preço, raridade e grupos devem vir do catálogo. Não preencher cartas finais com conteúdo fictício. Texto completo acessível sem hover.

- Cabeçalho informa nome e preço; a linha seguinte traz tipo e raridade real com símbolo/nome, seguida da compatibilidade. O leitor encontra primeiro o que está comparando e quanto custa.
- Diagrama representa efeito, não uma ilustração genérica de espada. A mesma linguagem visual vale no inspector.
- Corpo responde: o que muda, quando funciona, quais restrições existem.
- Rodapé: alvo selecionado, prévia da troca quando necessária e ação com custo. Condição de sacrifício, quando existir, é uma linha explícita acima do botão. Detalhes longos podem expandir a ficha; o efeito principal e suas restrições decisivas permanecem visíveis na carta.
- Carta não gira para revelar a regra; verso escondido prejudica comparação.
- Altura mínima 300 px em desktop; crescer para acomodar texto, sem truncar regra. A fileira alinha os rodapés pela carta mais alta.

### 7.2 Tipos e diagramas

| Tipo | Símbolo | Semântica visual |
|---|---|---|
| Arma | Lâmina simples | Modifica movimento/captura; diagrama com origem, destinos e trajetos. |
| Encantamento | Selo circular com centro vazio | Efeito persistente, condição e cargas quando aplicáveis. |
| Feitiço | Faísca de três traços | Uso durante a partida; mostrar o efeito e consumo. No catálogo atual, Instante extra concede 30 segundos uma vez no próprio turno. |

Para armas diagonais, desenhar quatro segmentos diagonais saindo da origem. Para ortogonais, quatro segmentos ortogonais. Não usar as letras `X` e `+` como nome da habilidade. Proposta de nomes legíveis: “Golpe diagonal” e “Golpe ortogonal”, dependentes da finalização do catálogo.

Legenda fixa nos detalhes: círculo vazio = movimento sem captura; alvo com quatro marcas = captura; linha tracejada/arco = salto permitido. O diagrama descreve a habilidade isolada e deve dizer “Efeito adicional” quando somar ao movimento tradicional. Não sugerir casas legais em uma posição concreta sem validação do motor.

Indicar “Frente da peça” no diagrama e usar os deslocamentos relativos definidos pelo catálogo; consultar uma peça adversária não deve inverter o significado de “avançar”. Se uma casa permite movimento e captura, combinar os dois símbolos e explicar ambos na legenda. Distância maior que uma casa não prova salto: desenhar salto somente quando a regra o declarar. Efeitos que não cabem em 5 × 5 usam um diagrama maior ou texto específico, nunca destinos cortados sem explicação.

### 7.3 Raridades

| Raridade | Selo / cor | Material da carta | Movimento especial |
|---|---|---|---|
| Comum | Losango vazado / prata | Grafite com prata no fundo, moldura, título e botão | Passagem de luz ao aparecer. |
| Incomum | Losango vazado / azul | Azul profundo com filetes azul-claro | Passagem de luz ao aparecer. |
| Raro | Losango parcialmente preenchido / ouro | Bronze escuro e ouro, moldura dupla | Entrada luminosa e aura suave em ciclo de 8 s. |
| Lendário | Losango preenchido / âmbar | Fundo cobre/obsidiana, filetes alaranjados | Entrada luminosa, aura em ciclo de 6,5 s e três pequenas brasas junto às bordas. |

Direção solicitada: acabamento inspirado em itens de Diablo 3/4, com intensidade contida e arte vetorial original. Raridade aparece por cor, nome e selo. A luz de entrada dura 720 ms, com 45 ms de intervalo entre espaços; mudanças de seleção e saldo não reiniciam a entrada de uma carta que permanece montada. As auras seguem discretas nas raras/lendárias e pausam com a loja fora da tela ou aba oculta. Movimento reduzido mantém o acabamento estático.

O usuário aprovou o padrão de emblemas: traços finos, geometria de losango/círculo e um símbolo central relacionado ao efeito. Preservar esse padrão em ícones futuros; não criar ilustrações para todas as cartas agora, pois o catálogo será revisado. Isca, Segundo coração e Instante extra recebem emblemas; armas conservam os diagramas funcionais. Marcadores nas peças compartilham a paleta das cartas, com entrada de 280 ms e reflexo de baixa intensidade a cada 6,6 s. O segundo selo entra 80 ms depois do primeiro. Os símbolos permanecem legíveis; a raridade também é descrita em texto acessível. Movimento reduzido mantém apenas o acabamento estático.

### 7.4 Comportamento da loja futura

- **Cinco espaços estáveis.** A loja inicial é igual para os dois; uma compra repõe aquele espaço apenas para o comprador. As demais ofertas mantêm posição, foco e estado.
- Botão “Atualizar loja” informa o preço crescente da próxima atualização: 1, 2, 3… moedas. Após a resposta, mostra o novo preço. Esse gasto é contabilizado e não reembolsado.
- Durante atualização, espaços mantêm altura e exibem o estado pendente. Sem roleta, abertura de pacote ou suspense artificial.
- O servidor escolhe ofertas e raridade, valida saldo, compatibilidade, teto e versão da loja. A animação começa após confirmação; jamais sorteia raridade no cliente.
- Enquanto espera, manter a oferta antiga identificável com texto “Comprando…”. Se falhar, preservar oferta/saldo confirmados e explicar a falha.
- Compra de Arma/Encantamento exige alvo compatível; Feitiços vão para a reserva da partida. Sem alvo, a carta oferece escolher uma peça; nada é comprado automaticamente.
- Cada peça permite uma Arma e um Encantamento. Trocar um espaço mostra a melhoria removida e o preço líquido confirmado pelo servidor.
- “Filtrar Melhorias” vem ligado depois de selecionar uma peça e mostra apenas ofertas aplicáveis. Ao desligar o filtro, mostrar a loja completa, manter destaque nas compatíveis e reduzir levemente a opacidade das incompatíveis. Não reordenar nem eliminar espaços durante compra/reposição.
- Se nenhuma oferta for aplicável, explicar que o filtro pode ser desligado para consultar a loja completa. Não garantir compatibilidade no sorteio sem regra aprovada.
- A composição atual inclui Armas para as duas classes, um Encantamento e um Feitiço; o quinto espaço sorteia do restante. Um Feitiço comprado fica guardado e não é oferecido novamente para o mesmo jogador na sala.

**Reposição:** o sorteio exclui as ofertas visíveis para aquele jogador. Comprar não muda a loja adversária. O MVP não define probabilidades ponderadas por raridade; o catálogo atual é sorteado sem uma tabela de chances explícita.

## 8. Telas e layouts

### 8.1 Entrada e sala

Título: **“A partida começa antes do primeiro lance.”** Subtítulo: “Monte seu exército, escolha suas melhorias e enfrente outro jogador.” Nome Gambito continua marcado como provisório apenas no rodapé discreto.

```text
┌ Marca                                 Regras · Som ┐
│                                                   │
│ A partida começa              portal escalonado   │
│ antes do primeiro lance.      bispo      torre     │
│                               tabuleiro/pedestal  │
│ [Seu apelido____________]                         │
│ [Jogar casual] [Jogar com amigo]                   │
│ Entrar com código                                 │
└───────────────────────────────────────────────────┘
```

- Desktop ≥ 1100 px: texto/entrada com 42% da largura; cena com 58%. Título e formulário alinhados.
- Cena usa SVG/CSS, sem vídeo obrigatório. Perspectiva permitida apenas nesse tabuleiro decorativo, não interativo. Peças grandes podem ultrapassar o pedestal, sem cobrir o formulário.
- Não mostrar opções de ranking ou conta como se funcionassem. “Ranqueado” entra quando implementado.
- “Jogar com amigo” abre criação/entrada com código. Depois de criar, mostrar código, botão copiar e convite; confirmar cópia em texto.
- Estado de espera mantém o usuário na preparação, mostra “Aguardando seu amigo” ou “Buscando adversário” e permite cancelar conforme a sala atual.
- Celular: título, formulário e cena reduzida a até 220 px de altura; a ação principal aparece antes da cena. Não exigir atravessar uma imagem de tela inteira.

Em celular, a ordem funcional é título curto, formulário e cena reduzida; decoração fica abaixo da ação. Os números 39/12 não precisam virar estatísticas de destaque na entrada: o orçamento é explicado na preparação. Exibir “10 minutos por jogador, sem acréscimo” junto dos modos; nos detalhes, informar que os relógios somam até cerca de 20 minutos, além da preparação. Não prometer uma sessão de 10 minutos. Manter “Partida única”; melhor de três permanece uma decisão futura.

### 8.2 Preparação em desktop

```text
┌ Gambito      Preparação → Revelação → Partida     Sala ┐
│ Material 15/39       Poder total 35/50       Ouro 8    │
│                                                        │
│ Adversário: preparando          Peão em e2             │
│ ┌──────────────────────┐        [peça ampliada]        │
│ │                      │        efeito / custos        │
│ │      TABULEIRO       │        recrutar / sacrificar  │
│ │                      │        ajuda da preparação    │
│ └──────────────────────┘                               │
│ Você: montando                                         │
│ Mercado de melhorias             [Atualizar · 1 moeda] │
│ [oferta 1] [oferta 2] [oferta 3] [oferta 4] [oferta 5] │
│                                      [Revisar exército]│
└────────────────────────────────────────────────────────┘
```

- Tabuleiro de 480–640 px, conforme espaço. Inspector ocupa coluna de 300–360 px. Conjunto centralizado, sem expandir inspector para preencher a tela.
- Mercado atravessa a largura útil abaixo. Cinco cartas iguais em largura: `(largura disponível − 4 × 12 px) / 5`. Adotar mínimo de 200 px por carta; quando não couber, usar rolagem horizontal com próximo cartão parcialmente visível.
- A preparação pode rolar verticalmente. Uma faixa contextual acima do mercado repete peça/casa e ouro quando o tabuleiro sai da área visível; “Ver peça” leva à seleção sem apagá-la. O rodapé de ação mantém “Revisar exército” e resumo do orçamento, com espaço reservado para não cobrir cartas.
- Depois de confirmar: painel estável “Exército confirmado”, edição bloqueada; ação “Editar exército” somente enquanto o servidor ainda aceitar cancelar a confirmação. Quando a revelação começou, não oferecer edição.
- Após duas confirmações, abrir revelação sem nova confirmação redundante.

### 8.3 Preparação no celular

- Cabeçalho compacto 56 px, orçamento logo abaixo em três colunas para Material, Poder e Ouro; com texto ampliado, quebra em linhas.
- Tabuleiro em largura total. A faixa da seleção aparece logo abaixo e abre a ficha somente por “Ver peça”. Na partida, tocar uma peça também não abre um painel que encobre casas automaticamente.
- Mercado abaixo, como faixa horizontal. Carta com largura `min(80vw, 300px)`; rolagem com encaixe suave, barra de rolagem disponível e indicação “Oferta 2 de 5”. Não mover automaticamente a faixa após compra. A faixa contextual do mercado mantém alvo e ouro visíveis.
- Não usar carrossel automático, swipe obrigatório ou múltiplas áreas horizontais sobrepostas. Botões anterior/próximo disponíveis quando houver overflow.
- Rodapé fixo “Revisar exército”, incluindo área segura do dispositivo. Reserva de espaço igual à sua altura no conteúdo.
- Ao escolher “Equipar”, caso não haja alvo, recolher a ficha e orientar seleção no tabuleiro; permitir cancelar. A oferta fica identificada até concluir/cancelar.
- Inspector/painel pode ocupar até 80% da altura dinâmica; conteúdo interno rola. Não cobrir o botão fechar nem criar fundo interativo atrás dele.

Com ficha ou diálogo aberto, ocultar o rodapé fixo de revisão e prender o foco no painel. Ao fechar, devolver foco à ação que o abriu. Na seleção de alvo iniciada por uma oferta, recolher a ficha antes de retornar ao tabuleiro; após escolher a peça, restaurar a oferta na mesma posição com a prévia de compra, sem comprar automaticamente. Em telas baixas ou com zoom, o rodapé pode voltar ao fluxo normal para preservar área útil.

### 8.4 Revisão e revelação

Revisão: diálogo com material, poder quando disponível, ouro restante, formação e lista de melhorias por peça. Exibir também regras de perda/reembolso relevantes. Ação principal “Confirmar exército”; secundária “Voltar à montagem”. Avisar se há ouro sobrando sem tratar isso como erro.

Revelação: os dois exércitos aparecem no tabuleiro com uma passagem curta de luz pela moldura. Manter os oito segundos atuais, calculados pelo servidor, até uma decisão de produto alterar essa duração. As animações não adicionam segundos. Durante o restante do tempo é possível consultar as melhorias adversárias. Mostrar “A partida começa em 6 s”.

### 8.5 Partida

```text
┌ Gambito · Casual                              Sala ┐
│ Adversário                         09:42           │
│ ┌─────────────────────────┐   Sua vez              │
│ │                         │   Peça selecionada     │
│ │        TABULEIRO        │   regra / cargas       │
│ │                         │                       │
│ └─────────────────────────┘   Registro de lances   │
│ Você                               08:57           │
│                         Propor empate · Desistir   │
└───────────────────────────────────────────────────┘
```

- Desktop: tabuleiro à esquerda, coluna de informação 280–320 px à direita. Relógio de cada jogador na respectiva barra, junto ao tabuleiro.
- Celular: adversário/relógio, tabuleiro, jogador/relógio, estado do turno; ficha e histórico em painel recolhível abaixo. Nunca fixar uma promoção ou notificação sobre as casas sem interação explícita.
- Indicar o turno com texto “Sua vez” e traço claro na barra ativa. Não pulsar toda a barra a cada segundo.
- Abaixo de 30 s: relógio recebe cor de alerta e ícone; aviso sonoro opcional uma vez. Não piscar nem ampliar/reduzir o relógio.
- Promoção abre quatro opções grandes com nome e peça. Relógio continua conforme servidor; não criar pausa visual que sugira pausa real.
- Empate recebido é um painel compacto com aceitar/recusar. Desistência pede confirmação com consequência explícita.
- Reconexão aparece acima do tabuleiro: “Reconectando. Seu relógio continua.” Prazo só mostra contagem quando houver referência confiável do servidor; não reiniciar 60 s em cada renderização.
- Resultado: tabuleiro final continua visível, com “Vitória”, “Derrota” ou “Empate” e motivo. Entrada de jogadas bloqueada pelo estado final. Ações reais: “Voltar ao início” e, futuramente, “Revanche” apenas se houver suporte.
- Não mostrar XP, ranking ganho, moedas recebidas ou cosmético desbloqueado enquanto esses sistemas não existirem.

O título “É hora de jogar” e a trilha de preparação deixam de ocupar um bloco grande durante a partida. Usar uma linha compacta de modo/fase e apenas uma mensagem de turno junto ao tabuleiro. Mensagem de xeque identifica o lado correto: “Seu Rei está em xeque” ou “Rei adversário em xeque”. Ficha e histórico têm prioridade menor que relógios; instruções genéricas repetidas não ocupam um painel permanente.

### 8.6 Breakpoints

| Largura | Comportamento |
|---|---|
| 320–767 px | Uma coluna; seleção compacta e ficha inferior sob demanda; cartas em faixa horizontal; margens 8–12 px. |
| 768–1099 px | Tabuleiro central; inspector abaixo ou lateral somente se ambos couberem; mercado com rolagem e cartas ≥ 200 px. |
| ≥ 1100 px | Preparação em duas colunas mais mercado; partida em duas colunas. |
| Paisagem baixa, altura < 600 px | Priorizar tabuleiro e relógios; recolher informações; preparação pode rolar. Nunca bloquear orientação do dispositivo. |

Layouts devem aceitar nomes de jogadores longos e zoom de texto. Truncar apelido somente com acesso ao nome completo; nunca truncar uma regra decisiva.

## 9. Movimento e animações

### 9.1 Regras de movimento visual

- A lógica não espera animação. O servidor confirma estado, e a camada visual interpola a mudança.
- Usar principalmente `transform` e `opacity`. Não animar largura/altura do tabuleiro, blur grande ou sombras de dezenas de peças por frame.
- Curva de entrada/deslocamento: `cubic-bezier(.22,1,.36,1)`. Interações pequenas: `cubic-bezier(.2,0,0,1)`. Saídas curtas: `cubic-bezier(.4,0,1,1)`.
- Não usar spring com oscilação em peças: pode sugerir casa errada. A peça chega ao centro exato do destino.
- Novos eventos rápidos devem encerrar a animação anterior e desenhar o estado atual. Não formar uma fila que deixe o jogador vendo um tabuleiro atrasado.
- Redimensionar tela, reconectar ou receber snapshot completo cancela animações de deslocamento em andamento.
- Animar uma transação uma vez. Não repetir brilho de compra ao selecionar a peça ou receber o mesmo estado novamente. Usar identificação de ação/evento quando disponível; não adivinhar compra a partir de mudança de saldo.
- A área clicável acompanha sempre o estado confirmado; uma peça visual em trânsito não cria alvo em outra casa. Confirmação de compra e saldo aparecem juntos, antes de qualquer acabamento decorativo. Se a preparação terminar durante uma cerimônia, encerrar o efeito imediatamente.

### 9.2 Catálogo de animações

| Evento | Movimento | Duração / limite | Movimento reduzido |
|---|---|---|---|
| Primeira entrada | Cenário aparece em opacidade; pedestal sobe 12 px; título já legível | 700 ms total, uma vez por entrada, sem bloquear formulário | Cena estática. |
| Hover de botão | Alteração de preenchimento e borda | 120 ms | Imediato. |
| Pressionar botão | Deslocamento vertical máximo 1 px | 80 ms | Apenas cor. |
| Selecionar peça | Cantos da seleção aparecem | 100 ms | Imediato. |
| Abrir inspector/diálogo | Opacidade e deslocamento de 8 px | 180 ms | Opacidade até 80 ms. |
| Deslocamento normal | Translação direta entre centros | 160–220 ms conforme distância, teto 220 ms | Troca imediata. |
| Salto de cavalo/habilidade | Translação com elevação visual de até 6 px; destino claro | 200 ms | Troca imediata. |
| Captura | Alvo perde opacidade, atacante ocupa destino | 120 ms alvo, 200 ms total | Remoção imediata. |
| Roque | Rei e torre se deslocam juntos | 200 ms | Estado final imediato. |
| En passant | Remover peão capturado em sua casa real; mover atacante | 200 ms | Estado final imediato. |
| Equipar | Selo da carta se dissolve; marcador aparece na peça | 280 ms | Marcador imediato + mensagem. |
| Sacrifício na preparação | Estado e saldo confirmados mudam juntos; cópia decorativa da peça desaparece | 180 ms | Remoção imediata. |
| Entrada de oferta | Passagem diagonal de luz na cor da carta, atrás do conteúdo | 720 ms + até 180 ms de escalonamento | Carta visível sem passagem de luz. |
| Carta rara em repouso | Aura dourada discreta no topo | Ciclo lento de 8 s, sem bloqueio | Aura estática. |
| Carta lendária em repouso | Aura âmbar e três brasas pequenas nas bordas | Aura de 6,5 s; brasas de 7–9 s | Aura estática, sem brasas. |
| Melhoria equipada no tabuleiro | Selos metálicos em coluna; símbolo e halo na cor da raridade | Entrada de 280 ms ao montar o selo; reflexo de 6,6 s sem deslocamento | Acabamento estático, símbolo sempre visível. |
| Revelação dos exércitos | Moldura acende; peças aparecem juntas | 500 ms dentro do prazo do servidor | Aparição imediata. |
| Xeque | Contorno surge uma vez; permanece estático | 160 ms | Contorno imediato. |
| Promoção confirmada | Crossfade peão → nova peça | 200 ms | Troca imediata. |
| Resultado | Filete sob título e iluminação breve da moldura | 500 ms; sem cobrir tabuleiro | Resultado estático. |
| Segundo coração | Marcador de coração some quando a defesa é consumida; atacante fica na origem | O estado muda junto com a resposta autoritativa | Marcador disponível atualizado imediatamente. |

Ataque lendário **não** ganha animação longa a cada lance. Sua identidade permanece no marcador e na ficha; o deslocamento respeita o mesmo teto de 220 ms das outras peças. Efeitos não podem denunciar preparação privada do adversário.

Se uma atualização trouxer várias raras/lendárias, manter a entrada escalonada e contida. Cada lendária tem apenas três pequenas brasas nas bordas, com ciclos lentos; o centro permanece livre para leitura. Todas mantêm selo e acabamento correspondentes.

**Orçamento de atenção:** entrada cênica até 700 ms no total, considerando atrasos; resposta comum até 220 ms; equipamento até 280 ms. As pulsações de raridade podem durar mais, mas não bloqueiam clique nem texto. Em segundo plano, finalizar efeitos pendentes; ao retornar, mostrar o estado atual. Sob movimento reduzido, usar acabamento estático e mensagem textual, sem perder informação ou prolongar espera.

### 9.3 Sincronização e implementação visual futura

O componente atual desenha peças dentro de cada casa e já calcula transição por identidade. Refinamentos devem preservar esse vínculo; uma camada transitória pode representar capturas sem alterar as casas interativas. Não usar o índice da casa como identidade permanente da peça. Ao finalizar/cancelar, eliminar duplicata visual. A implementação inicial não demonstra que todos os eventos do catálogo de animações estejam concluídos.

Preferir CSS e APIs nativas do navegador nesta etapa. Não acrescentar biblioteca de animação ou motor 3D sem uma necessidade que esta especificação não resolva. A correção do estado prevalece quando não há evento suficiente para reconstruir a animação; nesse caso, renderizar diretamente o snapshot.

### 9.4 Som

Direção sonora futura: pedra leve ao mover, toque metálico curto ao equipar, sino grave discreto ao revelar lendária. Sem locução e sem trilha obrigatória. Volume separado de música/efeitos se música vier a existir.

Não implementar áudio sem assets licenciados. Quando houver: só iniciar após gesto do usuário, controle de som persistente localmente e informação sempre disponível também em texto. O cenário deve funcionar integralmente em silêncio. Enquanto áudio não existir, omitir o botão “Som” do layout ilustrado.

## 10. Cosméticos futuros

O usuário definiu a intenção: **obtidos jogando na conta e equipáveis**. Esta versão prepara organização visual; não cria contas, inventário, missões, recompensas ou tela de coleção.

Categorias futuras previstas:

- Conjunto de aparência das peças.
- Moldura e pedestal do tabuleiro.
- Retrato e moldura do jogador.
- Efeito curto de entrada/resultado.

As casas pretas e brancas permanecem a referência funcional. Uma aparência nunca altera hitbox, silhueta de identificação, cor do lado, destinos legais, descrição de habilidade, orçamento ou regra. Preferências locais de movimento reduzido e efeitos discretos prevalecem sobre cosméticos de qualquer jogador.

Projetar futuramente uma preferência local “Usar aparência padrão” para substituir os cosméticos de ambos os lados apenas na própria tela. Molduras personalizadas não mudam as dimensões úteis do tabuleiro. Retratos ficam dentro da área reservada e não deslocam relógios. Efeitos não cobrem coordenadas nem imitam xeque, captura ou melhoria equipada. A futura prévia de conjunto mostra as seis silhuetas em casas claras e escuras antes de equipar; manter essa regra como critério de criação dos assets.

### Separação para não precisar refazer o desenho

- `Piece`: recebe identidade de xadrez e desenha uma aparência padrão através de tokens/variante visual.
- `BoardFrame`: desenha moldura, coordenadas e pedestal sem calcular jogadas.
- `PlayerBadge`: retrato e moldura, independentes de relógio/turno.
- `AbilityBadge`: comunica poder real da peça; não é modificado por raridade cosmética.
- `EffectLayer`: decorativa, sem eventos de ponteiro, desligável por preferência/acessibilidade.

Esses são limites de componentes, não pedido para criar serviço de cosméticos. Implementar somente a aparência padrão quando começar o redesenho. IDs de propriedade, desbloqueio e seleção por conta pertencem a uma fase futura com validação de propriedade pelo servidor.

Não reutilizar moedas de preparação para exibir preço cosmético. Não adicionar botão “Comprar”, moeda premium, baú, passe, cadeado de coleção ou saldo fictício. A raridade de uma habilidade comunica o catálogo de jogo; a futura raridade de um cosmético, se existir, deverá ser um atributo distinto.

## 11. Acessibilidade e interação

- Toda ação disponível com mouse também funciona com toque e teclado.
- Tabuleiro com navegação por setas entre casas; Enter/Espaço seleciona e confirma destino; Esc cancela seleção. Manter um ponto de entrada no tabuleiro e descrever a casa focada. Não obrigar 64 pressionamentos de Tab.
- O inspector e as cartas usam ordem de leitura equivalente à visual. Compatibilidade, raridade e preço não dependem de cor.
- Diálogos recebem foco inicial, prendem foco enquanto abertos, fecham por ação explícita/Esc quando permitido e devolvem foco ao controle de origem. Promoção fechada cancela a escolha, não envia promoção automática.
- Mensagens de erro e resultado acessíveis a leitor de tela. Não anunciar relógio a cada segundo. Anunciar turno/xeque/resultado sem repetição a cada snapshot.
- `prefers-reduced-motion` remove deslocamentos, partículas e entradas cênicas. Futuramente uma preferência local “Efeitos discretos” pode reduzir também animações não essenciais.
- `hover` só melhora feedback; nenhuma regra, preço, descrição ou ação depende dele.
- Em celular, respeitar área segura e teclado virtual. Campo de código continua visível durante digitação.
- Não limitar zoom nem bloquear orientação. Texto ampliado pode aumentar cartas e transformar colunas em linhas.
- Foco nunca fica invisível devido ao recorte decorativo de carta ou a `overflow: hidden` de efeitos.
- Erros aparecem perto da ação e continuam disponíveis até correção/dispensa. Notificações efêmeras servem para confirmações simples, como convite copiado.

## 12. Inventário de componentes e assets

### Componentes propostos para implementação incremental

| Componente | Responsabilidade |
|---|---|
| `AppShell` / cabeçalho | Estrutura, largura, navegação existente. |
| `LandingScene` | Composição decorativa de portal escalonado, pedestal e peças grandes. |
| `Board` | Casas, orientação, seleção e destinos confirmados. |
| `BoardFrame` | Moldura e coordenadas. |
| `Piece` | Silhueta e acabamento; nenhuma regra. |
| `PieceInspector` | Peça selecionada, melhoria, condição e ações disponíveis. |
| `BudgetBar` | Material, ouro e poder quando suportado. |
| `ShopOfferCard` | Anatomia da oferta, estado pendente, custo e compatibilidade. |
| `ShopTray` | Espaços estáveis e comportamento responsivo da loja. |
| `AbilityDiagram` | Diagrama estático do efeito documentado. |
| `RaritySeal` / `AbilityBadge` | Raridade textual/visual e efeito equipado, respectivamente. |
| `PlayerBar` / relógio | Identidade, conexão, turno e tempo. |
| `MatchResult` | Resultado confirmado e ações existentes. |
| `Modal` | Base acessível para revisão, promoção e desistência. |

Não criar todos os componentes vazios antecipadamente. Extrair conforme cada etapa substitui uma parte funcional de `GameApp.tsx`.

### Assets a produzir posteriormente

1. Seis silhuetas SVG, reutilizáveis nas duas cores, com gradientes de material locais e IDs únicos por instância.
2. Ícones SVG para material, poder, moeda, três tipos, quatro raridades, conexão, som e alertas, mantendo espessura consistente.
3. Diagrama reutilizável de 5 × 5 casas e legenda de movimento/captura/salto.
4. Cenário SVG/CSS de portal escalonado e pedestal em patamares; versão simplificada para celular.
5. Fontes Cormorant Garamond e Manrope via `next/font`; Next.js gera os assets auto-hospedados durante a compilação. Se futuramente os builds precisarem ser offline, mover as fontes e suas licenças para arquivos locais.

Sem dependência de geração de imagens para o tabuleiro jogável. Qualquer ilustração futura deve funcionar como decoração e não carregar informação necessária para jogar. Não importar peças de outro jogo sem licença.

## 13. Implementação e próximas etapas

### Instruções de trabalho

1. Ler este arquivo inteiro e as regras atuais antes de alterar código.
2. Ler os guias relevantes em `node_modules/next/dist/docs/`, conforme `AGENTS.md`, antes de escrever código Next.js. Não supor APIs de outra versão.
3. Trabalhar em etapas pequenas. Atualizar `docs/implementacao.md` ao terminar cada etapa, com arquivos, propósito, limitações e pendências.
4. Não executar nem criar testes por enquanto. Também não apresentar build, inspeção visual ou acessibilidade como verificados sem execução autorizada e resultado real. Os critérios abaixo ficam como roteiro para a retomada.
5. Usar dados reais. Não mexer em catálogo, saldo, sorteio, servidor, relógio ou regras para preencher um layout.
6. Não implementar cosméticos, conta, loja real, feitiço, ranqueado, nova economia ou melhor de três dentro de uma tarefa de redesenho visual.

### Primeira implementação e dependências

“Implementada” abaixo significa que existe código para a etapa, sem comprovação integral das regras. A primeira versão tinha coordenadas dentro das casas, preenchimento dourado no último lance, ficha móvel sem painel e sacrifício em diálogo separado. P1–P4 corrigiram esses pontos e acrescentaram compra com alvo/custos e destaque de tempo baixo. O acabamento das cartas foi conferido no navegador: entrada luminosa, aura lenta nas raras/lendárias e marcadores de peça com halo estático. Camadas transitórias de captura e cosméticos continuam adiados.

| Etapa | Alterações | Arquivos principais | Estado |
|---|---|---|---|
| D1 — Fundação | Tokens, tipografia, campos/botões/diálogos e estrutura responsiva. | `app/globals.css`, `app/layout.tsx`, `components/Modal.tsx` | Implementada; sem teste visual. |
| D2 — Tabuleiro | Preto/branco, moldura, peças SVG, coordenadas, estados e navegação por setas. | `components/Board.tsx`, `components/Piece.tsx` | Implementada; orientação preservada no código, legibilidade não verificada no navegador. |
| D3 — Entrada | Cenário monumental compacto, chamada direta e acesso a casual/amigos/código. | `components/GameApp.tsx`, CSS da cena | Implementada usando CSS e tabuleiro decorativo; chamada revisada para linguagem direta. |
| D4 — Preparação atual | Inspector, Material/Poder/Ouro, cinco ofertas compactas e diagramas; confirmação do sacrifício. Tabuleiro mostra somente as quatro fileiras próprias e indica zonas avançadas. | `components/GameApp.tsx`, `components/AbilityDiagram.tsx`, `components/Shop.tsx` | Implementada para o catálogo real; a nova etapa aguarda verificação visual. |
| D5 — Partida | Barras, relógios, ficha, histórico, promoção, conexão, revisão e resultado; Feitiço de 30 segundos. | `components/GameApp.tsx`, `app/globals.css` | Estados representados; última etapa sem inspeção visual. |
| D6 — Movimento | Transição da peça por identidade entre origem e destino; Rei e torre no roque; movimento reduzido e cancelamento por nova posição. | `components/Board.tsx`, `app/globals.css` | Implementada; inclui indicação do Segundo coração disponível. |
| R — Novas regras | Classes, raridades, Poder, feitiço, Isca/Segundo coração, reposição paga e preparação em quatro fileiras. | `lib/catalog.ts`, `lib/draft.ts`, `lib/types.ts`, `server/ChessRoom.ts`, `lib/chess.ts`, `lib/clock.ts` | Implementada em servidor e cliente; equilíbrio ainda precisa de partidas humanas. |
| D7 — Interface das novas regras | Poder, loja de cinco espaços, atualização, compatibilidade, aplicação de Isca, feitiço de tempo e acentos de raridade. | `components/GameApp.tsx`, `components/Board.tsx`, `components/PieceInspector.tsx`, `components/Shop.tsx`, `app/globals.css` | Implementada; não testada/inspecionada nesta etapa. |

Isca, Segundo coração e Instante extra já têm regras executáveis. A seção de animações separa essas implementações de efeitos ainda futuros; cosméticos permanecem adiados.

### Aplicação da revisão 1.1, em ordem

| Prioridade | Mudança concreta | Critério para considerar entregue |
|---|---|---|
| P1 — Leitura de partida | Reduzir cabeçalho; distinguir estados do tabuleiro; retirar dourado do fundo do último lance; coordenadas na moldura; destacar relógio baixo. | Seleção, xeque e foco coexistem; barras de jogador identificam corretamente os lados; tabuleiro e relógios têm prioridade de espaço. |
| P2 — Compra compreensível | Reorganizar carta; expor alvo, reembolso, custo líquido e saldo; permitir começar pela oferta; explicar incompatibilidade sem apagar sua regra. | Selecionar não compra; trocar mostra o efeito perdido e adquirido; ação pendente não permite envio duplicado. |
| P3 — Preparação móvel | Faixa de seleção, ficha sob demanda, contexto no mercado e sacrifício na mesma ficha. | Seleção sobrevive a abrir/fechar; retornar do tabuleiro preserva oferta/rolagem; painel não se sobrepõe a outro diálogo ou ao rodapé. |
| P4 — Acabamento | Portal escalonado, pedestal em patamares, menos legendas repetidas e uma única entrada coreografada. | O formulário vem antes da cena no celular; decoração não recebe eventos nem atrasa controles. |
| P5 — Cosméticos futuros | Inventário e itens equipáveis obtidos jogando, sem alterar legibilidade/regras. | Só após conta, persistência e economia de recompensas; manter aparência padrão e movimento reduzido. Cosméticos continuam adiados. |

P1–P4 refinam a interface atual e não dependem da nova economia. Implementar cada prioridade em uma etapa pequena, registrando o resultado. Não acrescentar dependência para painel, ícone ou animação sem necessidade concreta. Os critérios descrevem comportamento esperado, não verificações realizadas nesta revisão documental.

### Aplicação de P1–P4 — 28/09/2026

- P1: cabeçalho da partida compacto; coordenadas na moldura; seleção, xeque e último lance em camadas próprias; captura neutra; relógio abaixo de 30 segundos; lado do adversário e texto de xeque corrigidos. Navegação por setas preserva um ponto de Tab e Esc cancela seleção.
- P2: `Shop` reúne as ofertas reais, preço/compatibilidade, comparação da troca e saldo previsto. “Escolher peça” inicia seleção sem comprar; a oferta recebe foco ao retornar. Servidor envia `draftComplete` para liberar a próxima mutação após processar a anterior.
- P3: seleção compacta; `PieceInspector` em painel inferior sob demanda no celular; confirmação de sacrifício dentro da ficha; faixa de alvo/ouro no mercado, navegação anterior/próxima e revisão fixa com área segura. A ficha da peça e o histórico durante a partida permanecem no fluxo abaixo do tabuleiro, sem painel automático.
- P4: portal escalonado e pedestal em patamares, formulário antes da cena compacta no celular e entradas com duração total de até 700 ms. Movimento reduzido elimina as animações; redimensionamento e mudança de visibilidade cancelam deslocamentos ativos.

A conexão foi revisada separadamente: inicialização conjunta em desenvolvimento/produção, porta configurável, arquivos de ambiente alinhados, origens locais em desenvolvimento, consulta de disponibilidade e nova tentativa. Os detalhes estão em [`historico.md`](historico.md). As regras nextmoves foram adicionadas depois das verificações anteriores. Esta etapa não executou testes, typecheck, build ou inspeção no navegador; responsividade da nova loja segue pendente.

### Critérios de aceite visual para usar quando a verificação for retomada

- [ ] A entrada possui pedestal em patamares, portal escalonado e peças monumentais, com acesso claro a casual/amigos; formulário antes da cena no celular.
- [ ] A partida mantém tabuleiro frontal preto/branco e a1 escura; não há resíduos de verde/creme nas casas.
- [ ] Cada uma das seis peças é identificável nas duas cores e sobre ambas as cores de casa.
- [ ] Material, poder quando existir e ouro são distinguíveis; prévias não se confundem com valores confirmados.
- [ ] Carta exibe alvo, tipo, texto completo, preço, estado e raridade somente quando real.
- [ ] Mercado preserva espaços; não esconde ofertas reais durante transição entre versões.
- [ ] Reposição afeta o espaço correto e compra repetida não é enviada durante espera.
- [ ] Seleção, captura, último lance, xeque e foco podem coexistir sem apagar informação.
- [ ] A compra informa alvo e custo; substituição mostra efeito perdido, novo efeito, reembolso e saldo previsto sem calcular valores fictícios.
- [ ] Selecionar peça no celular não abre painel automaticamente; fechar detalhes restaura foco e contexto da oferta.
- [ ] Diagramas distinguem movimento, captura, ambos e salto conforme o catálogo; “frente” tem significado explícito.
- [ ] Em 360 × 800 e 390 × 844, tabuleiro não tem rolagem horizontal e ações estão acessíveis por toque.
- [ ] Em 320 px há fallback compacto utilizável; em 1440 × 900 a composição usa o espaço sem dispersar controles.
- [ ] Em 1366 × 768 os relógios e o tabuleiro cabem na área da partida; preparação pode rolar.
- [ ] Zoom de texto, nomes longos, erros de conexão e ausência de fonte não quebram ações essenciais.
- [ ] Teclado permite jogar/consultar/equipar sem depender de arrastar ou hover.
- [ ] Movimento reduzido elimina cerimônia/partículas e preserva toda informação.
- [ ] Relógio não pausa visualmente durante animações; reconexão não reproduz lances ou compras antigas.
- [ ] Nenhum cosmético, progresso, ranking ou recompensa fictícia aparece como funcional.

**Esses itens ainda não foram verificados.** O usuário pediu para não executar testes nesta etapa; implementar uma aparência ainda não demonstra como ela se comporta em diferentes navegadores e telas.

## 14. Decisões ainda em aberto

As regras-base de `nextmoves.md` estão implementadas com as interpretações registradas na seção 3 e em `regras-prototipo.md`. Permanecem como trabalho futuro:

1. Balancear 12 moedas, preços, catálogo, Poder máximo 50, avanço de 2 pontos e custo crescente da atualização usando partidas humanas.
2. Definir probabilidades por raridade e ampliar os Feitiços/Encantamentos quando os efeitos tiverem preço, janela de uso, duração e limites claros.
3. Revisar o custo/benefício de Isca, Segundo coração e do Feitiço de tempo; verificar taxa de uso e impacto no resultado por habilidade/composição.
4. Nome definitivo, contas, recompensas persistentes, cosméticos equipáveis e melhor de três continuam fora do escopo desta etapa.

O efeito vertical sem diferença do xadrez tradicional e o Feitiço de aumento do limite de peças sem parâmetros foram deixados fora do catálogo e descritos na seção 3.2.


## 15. Hierarquia e leitura das cartas de melhoria

As cartas devem priorizar nome, tipo, raridade e regra. O nome fica no topo em destaque; abaixo, o tipo aparece com ícone e rótulo de pelo menos 15 px, acompanhado da raridade. Armas usam espada, Encantamentos usam estrela e Feitiços usam varinha com brilho. A classe compatível usa selo curto: **Plebeu** para peão, cavalo e bispo; **Realeza** para torre e dama. O texto da carta explica seu efeito específico.

Ao passar o cursor (e ao focar pelo teclado) em Plebeu, Realeza, tipo, raridade ou símbolos do diagrama, exibir uma explicação simples. Arma acrescenta movimentos/capturas; Encantamento aplica a condição descrita; Feitiço fica guardado para ativação conforme o texto da carta. A raridade é cosmética. O diagrama explica movimento, captura e salto. O Rei continua inelegível e não recebe um selo de classe.

O preço aparece apenas no botão de compra/equipamento. Não duplicar custo, alvo ou sequência de saldo no rodapé da carta. Se a compra substituir uma melhoria, mostrar somente “Substitui [nome]”; se faltarem moedas, mostrar o saldo faltante. Incompatibilidade e estado equipado continuam visíveis porque afetam a ação possível.


Ao selecionar uma peça no tabuleiro, tocar/clicar nela novamente limpa a seleção. Durante a preparação, se o jogador tiver iniciado uma escolha de melhoria, o segundo clique na peça conclui a escolha em vez de desmarcá-la.


## 16. Preparação com loja e painel do jogador

A tela segue o esboço aprovado: o cabeçalho do Gambito permanece no topo; abaixo, a etapa da partida divide uma faixa com o código da sala e “Sair da sala”, alinhados na mesma linha. A área de trabalho tem duas colunas: a loja ocupa a coluna larga à esquerda e mostra cinco cartas em uma fileira; “Atualizar loja” fica abaixo das cartas. O painel “Informações do jogador” permanece visível à direita com Material, Poder total, detalhes da peça selecionada e “Revisar exército”. O saldo aparece centralizado sobre a loja como “Dinheiro”.

Uma aba vertical estreita “Tabuleiro” encosta no canto esquerdo da janela, sem recuo lateral. Recolhida, ela não participa do fluxo da loja. Ao passar o cursor ou focá-la, a aba revela uma camada à frente da coluna da loja, sem cobrir o painel do jogador; nela aparecem jogador adversário, tabuleiro de preparação, jogador local, peças para colocar e inspetor com ações de compra, melhoria e sacrifício. Ao retirar o cursor, ela recolhe. O painel acompanha a altura disponível da área de trabalho e não desloca o conteúdo.

A faixa “Montagem · Revelação · Partida” é uma navegação curta de abas, com a etapa atual sublinhada. O código e a saída da sala usam controles menores na mesma linha. A ficha da peça selecionada mostra uma ilustração ampliada, nome e casa em notação curta (por exemplo, “Peão B2”), além dos ícones e nomes de suas melhorias conectadas. Na loja, “Filtrar Melhorias” vem ligado; cartas incompatíveis somem até o filtro ser desligado, quando aparecem com opacidade reduzida e as compatíveis continuam destacadas.

Em telas sensíveis ao toque, a aba abre/fecha por toque e fecha ao tocar fora. Em telas estreitas, loja e informações do jogador passam a ocupar uma coluna; a aba pode ocupar quase toda a largura para manter o tabuleiro legível, e as cartas voltam ao carrossel horizontal.


## 17. Revisão da loja, retrato e planejamento — versão 2.0

Esta seção substitui os detalhes conflitantes das revisões anteriores.

- **Composição:** cinco cartas à esquerda e ficha do jogador à direita. Fundo quase preto, superfícies de grafite, bordas minerais e ouro discreto nas ações. Saldo junto ao título da loja; código e saída na mesma faixa compacta. Cartas têm largura de referência de 250 px e altura pelo conteúdo, com espaços internos reduzidos; a fileira rola quando as cinco ofertas não cabem, em vez de estreitar os cards.
- **Cartas:** nome e categoria em destaque, compatibilidade em `(Plebeu)` / `(Realeza)` com explicações, desenho do efeito e regra completa. Preço fica no botão. Cartas incompatíveis continuam ocultas com filtro ligado e semitransparentes com filtro desligado. Feitiços exibem “Ativação automática”.
- **Paleta única:** comum prata `#d8dee7`; incomum azul `#a6d0ff`; raro dourado `#f2d789`; lendário âmbar `#ffbd86`. Carta, selo no tabuleiro, retrato e nome da melhoria usam os mesmos tokens de raridade. A seleção não substitui a cor da raridade por outra.
- **Retrato:** nome da peça e coordenada, peça ampliada sobre uma casa em perspectiva, selos empilhados à direita com brilho suave. Abaixo, nome, categoria e raridade dos efeitos. Não repetir classes compatíveis nesta ficha.
- **Jogador:** Vida inicial 1.200 e Tempo base 05:00, acima de Material/Poder. O tempo exibido incorpora feitiços comprados; Instante extra resulta em 05:30. Valores derivam do servidor. Não desenhar barras de dano ou indicar combate por Vida enquanto essa regra não existe.
- **Tabuleiro expandido:** trilho de 36 px colado ao canto esquerdo, painel sobre a loja com aproximadamente 72% da largura em desktop. Sem título ou instrução acima do tabuleiro: adversário, quatro fileiras próprias, jogador, bandeja de recrutamento e ações da seleção. O botão de recolher fica no trilho. O tamanho do tabuleiro considera a altura da janela para manter a bandeja visível. Compra e troca ficam na mesma bandeja inferior: selecionar casa e comprar; casa ocupada substitui a peça, com preço líquido após reembolso. O inspetor mantém apenas efeitos, remoção e sacrifício com confirmação.
- **Interação:** clique só seleciona/desmarca peças existentes; reposicionar exige arrastar. Arraste exibe uma peça acompanhando o ponteiro e destaca o destino vazio; casas ocupadas e regras inválidas não alteram o exército. Há alternativa por teclado. Compra e troca exigem primeiro uma casa selecionada e depois um clique na peça da bandeja. Para cartas, escolher primeiro a carta ilumina os alvos válidos; clicar em um deles equipa diretamente e devolve à loja. A seleção comum de casas continua sem mover peças.
- **Abertura:** cursor sobre o trilho abre; sair do painel recolhe. Clique/toque abre, botão de recolher e toque externo fecham. Painel fechado é inerte para teclado/leitores. Em celular o painel ocupa quase toda a largura e as ações ficam abaixo do tabuleiro.
- **Responsividade e movimento:** reservar espaço para o trilho, rolar apenas as cartas horizontalmente e deixar a revisão dentro da ficha. Manter entrada e aura discreta das raridades existentes, respeitando movimento reduzido.

**Limite de regra:** Vida é atributo inicial, sem mecânica de dano definida. O único feitiço atual é Instante extra; novos feitiços precisam ter sua resolução automática definida no servidor antes de entrar no catálogo.

## 18. Referências e registro desta entrega

- Brief principal: pedido de design do usuário e [nextmoves.md](nextmoves.md), lido em 27/09/2026, incluindo a seção de feitiços e os exemplos ainda incompletos.
- Base real consultada: `components/GameApp.tsx`, `components/Board.tsx`, `components/Piece.tsx`, `app/globals.css`, `lib/types.ts`, `lib/draft.ts`, README e documentação existente.
- Skill instalada: [frontend-design, repositório público da Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design), através da skill `skill-installer`, em 27/09/2026. Caminho local: `/home/valeria/.codex/skills/frontend-design/SKILL.md`.
- Registro da cópia lida: SHA-256 `d91970639e9f5c37682ac7ab60094d35f1c7c1f38d731bd56396563aee10c1d3`. A instalação usou a referência `main`; esse hash identifica o conteúdo consultado nesta entrega.
- Aplicação da skill: direção específica ao xadrez, hierarquia tipográfica, composição deliberada, protagonismo visual concentrado e movimento com propósito.
- Este documento foi originalmente produzido antes de alterar a interface. A aplicação posterior de D1–D6 e seus limites está registrada em [historico.md](historico.md) e [implementacao.md](implementacao.md). Os detalhes de peça são SVG/CSS; não foram adicionados imagens raster nem áudio.
- Revisão 1.2 em 28/09/2026: aplicado `nextmoves.md` ao catálogo, servidor, montagem, motor, interface e animações; regras executáveis registradas em `regras-prototipo.md`. Esta etapa não rodou testes, typecheck, build nem inspeção visual.

## Atualização de interface — regras 0.4.0 (30/09/2026)

- Vida atual/máxima aparece nas barras dos dois jogadores durante a partida, com medidor e valor numérico. Capturas registram o dano ao lado do lance. Ameaça ao Rei é aviso informativo; não indica jogada obrigatória.
- Feitiços Vitalidade e Vigor maior usam emblema de coração com cruz, dentro da moldura de ícones existente, nas cores incomum e rara. Os bônus aparecem na Vida da preparação antes de confirmar.
- Vender peça é um botão largo em bronze/dourado, com ícone de moeda, reembolso destacado e área que recebe arraste. Ao arrastar sobre ele, a borda e o fundo realçam o destino.
- Sem melhorias, vende imediatamente; com Arma/Encantamento, abre confirmação com nomes, raridades e reembolso. O Rei não pode ser vendido na preparação. Isso substitui as recomendações anteriores de confirmar qualquer sacrifício.
- A captura/sacrifício do Rei durante a partida é permitida. As regras completas estão em `regras-prototipo.md`; instruções anteriores sobre mate não se aplicam à versão 0.4.0.

### Cartas de atributos — 0.4.1

Tempo e vida têm três faixas com custos 3/5/8 e raridades incomum/rara/lendária. Ampulheta e coração preservam os emblemas existentes. As descrições mostram só o bônus; removidos “Ativação automática” e “Aplicado ao iniciar”, inclusive no resumo. O alvo dos feitiços é “Jogador”. A lógica continua aplicando os bônus ao iniciar a partida.
