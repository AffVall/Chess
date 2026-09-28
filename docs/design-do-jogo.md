# Direção de design — Salão de Obsidiana

**Projeto:** Gambito, nome provisório.  
**Versão deste documento:** 1.1 · 28/09/2026.
**Entrega:** direção visual e de interação revisada a partir do protótipo.
**Estado:** D1–D6 têm uma primeira implementação, com diferenças em relação à especificação. Os refinamentos P1–P4 da versão 1.1 foram aplicados ao protótipo, com limites registrados na seção 13. Regras futuras e raridades aguardam suporte do servidor. Conexão, preparação, loja e compra de melhoria foram verificadas no navegador local. Os testes automatizados e o typecheck passaram; outros tamanhos de tela ainda aguardam inspeção.

## 1. Como usar este documento

Este guia é a referência visual para a interface atual e para as próximas etapas. As decisões de aparência, composição, tipografia, materiais e movimento abaixo devem ser seguidas como um conjunto. Evitar substituir a direção por um painel genérico de cartões ou por uma simples troca de verde para cinza.

Ordem de referência:

1. Pedidos atuais do usuário: aparência grandiosa, tabuleiro preto e branco, documentação, cosméticos futuramente equipáveis e obtidos jogando; não implementar cosméticos agora; não testar por enquanto.
2. Este documento: decisões de design e sequência da futura implementação visual.
3. [nextmoves.md](nextmoves.md): intenção de produto para novas pontuações, classes de habilidades, raridades e loja. As anotações incompletas são identificadas abaixo; não equivalem a uma regra executável.
4. [regras-prototipo.md](regras-prototipo.md): comportamento que realmente existe no programa.
5. [implementacao.md](implementacao.md): histórico e limites do trabalho realizado.

**Distinção essencial para executar:** há um redesenho aplicável ao jogo atual e há interfaces previstas para regras futuras. Só mostrar comandos, valores, raridades e efeitos reais que o servidor consegue fornecer e validar. Não simular funcionalidades futuras dentro da partida para fazer a tela parecer completa.

### Resumo para começar

| Decisão | Direção fechada |
|---|---|
| Universo visual | Salão monumental de pedra negra; um tabuleiro elevado como objeto central; luz lateral branca e detalhes metálicos discretos. |
| Tabuleiro | Cinza-carvão `#373B43` e porcelana `#F5F5F3`; acabamento liso, peças com contorno e estados sobrepostos legíveis. |
| Peças | Silhuetas clássicas, porcelana branca e obsidiana negra; SVG com relevo leve, contornos contrastantes e base legível. |
| Tipografia | Cormorant Garamond para títulos; Manrope para interface, regras e números. |
| Cores auxiliares | Prata como estrutura, ouro envelhecido como destaque; azul mineral para raras. |
| Tela inicial | Uma composição cênica com peças monumentais, título curto e acesso direto ao jogo. |
| Preparação | Tabuleiro dominante, ficha persistente da seleção e compra com alvo/preço explícitos; oito ofertas atuais, cinco somente após mudança de regras. |
| Partida | Tabuleiro frontal, relógios próximos aos jogadores, efeitos curtos e informações acessíveis por seleção. |
| Animações | Responder à ação; raras e lendárias têm revelações próprias; nenhuma decoração animada em repetição durante a partida. |
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

A primeira proposta substituiu o verde e creme por pedra, porcelana e metal. A revisão mantém essa direção e as oito ofertas reais, mas concentra a arquitetura no portal/pedestal, reduz legendas decorativas repetidas e aproxima alvo, efeito e custo da compra. O caráter do jogo vem dos objetos de xadrez e da montagem do exército. Tipografia cerimonial e dourado apoiam essa identidade sem dominar os controles.

## 3. O que veio do usuário e o que precisa de regra

### 3.1 Decisões expressas incorporadas ao design

- Peões podem receber melhorias e ser sacrificados.
- A preparação dispõe de dinheiro; a loja é aleatória e deve oferecer variedade.
- Material tem limite de 39 pontos. Há uma segunda pontuação combinando material e gasto em melhorias; **50 é um teto sugerido pelo usuário, ainda provisório**.
- Peças podem ocupar a terceira e a quarta fileiras a partir do próprio lado, com custo de 2 pontos de habilidade por peça nessas fileiras.
- Habilidades terão compatibilidade por grupos, tipos e raridades.
- Tipos citados: **Arma**, **Encantamento** e **Feitiço**.
- Raridades: **Comum**, **Incomum**, **Raro**, **Lendário**. Raras e lendárias precisam de animação especial.
- A nova loja tem **cinco ofertas**, misturando armas e encantamentos; comprar substitui a oferta daquele espaço. Atualizar a loja começa custando 1 e encarece.
- Partidas únicas de 10 minutos por jogador, sem incremento. Melhor de três continua em estudo.
- Futuramente haverá cosméticos equipáveis, conquistados jogando na conta. Não criar essa funcionalidade agora.

### 3.2 Decisões de apresentação e recomendações de regra

Estas recomendações permitem desenhar o fluxo, mas **não autorizam alterar silenciosamente a economia ou o motor**. Uma etapa de regras deve resolver os pontos abaixo antes de ativar essas interfaces.

| Tema | Decisão visual | Recomendação de regra / pendência |
|---|---|---|
| Segunda pontuação | Chamar **Poder total**; decompor material, melhorias e avanço em detalhes. | Recomendo `P = M + U + 2A`, com `M ≤ 39` e `P ≤ limitePoder`. `U` é custo das melhorias atualmente equipadas; `A` é quantidade de peças em fileiras avançadas. Confirmar se o usuário pretendia gasto acumulado, incluindo melhorias removidas. |
| Teto de poder | Mostrar `35 / 50` apenas quando esse teto vier da versão de regras. | 50 configurável. Não fixar em CSS, texto ou cálculo do cliente. |
| Ouro | Saldo separado, ícone de moeda; preço de compra também usa moeda. | Atualizações da loja consomem ouro, mas recomendo não contar seu gasto em `U`. Avanço custa pontos de poder, não ouro, salvo futura regra explícita. |
| Classes | Selos com nome e miniaturas das peças elegíveis. | Recomendo **Peões** como grupo próprio, **Menores = cavalo e bispo**, **Maiores = torre e dama**. Uma habilidade pode aceitar vários grupos. Rei fora das melhorias inicialmente. Não classificar peão como menor sem decisão explícita. |
| Equipamentos | Tipo da melhoria em destaque; um espaço equipado na primeira versão. | Continuar com uma melhoria por peça até existir regra de combinação. Arma e encantamento não implicam automaticamente dois espaços acumuláveis. |
| Feitiços | Modelo de carta de uso imediato, com resumo do estado antes/depois. | Fase de uso, custos, efeitos, presença na loja e limites não foram definidos. Recomendo iniciar apenas com feitiços de preparação. Aumentar tempo de partida ou teto de material exige regra própria. Não disponibilizar ainda. |
| Loja | Cinco espaços numerados internamente, sem números decorativos visíveis. Compra substitui somente o espaço usado. | Recomendo atualização paga em progressão `1, 2, 3…`, reiniciada por preparação, mas a fórmula e probabilidades precisam de decisão. |
| Justiça do sorteio | Nenhuma promessa de “mesmas ofertas” na nova interface sem garantia real. | A loja atual é igual para ambos. Reposição após compras exige definir sequência compartilhada ou individual e distribuição por raridade. Recomendo a mesma distribuição e sequência inicial para ambos; política completa ainda pendente. |
| Reembolso | Prévia clara do que volta, do que é consumido e do efeito no poder. | Compras que renovam ofertas não podem permitir comprar/remover repetidamente com reembolso integral para sortear de graça. Definir custo não reembolsável ou restauração da oferta antes de ativar. |
| Formação avançada | Zonas e custo por peça visíveis durante deslocamento. | Confirmar regras de peões reposicionados, primeiro movimento, en passant, roque e ameaça inicial. Manter Rei em e1/e8 até mudança explícita. |

**Exemplo de orçamento para o layout futuro:** material `15 / 39`; melhorias equipadas `20`; nenhuma peça avançada; poder total `35 / 50`; ouro exibido separadamente conforme saldo do servidor. Com duas peças avançadas: poder total `39 / 50`. A explicação informa que os 2 pontos de avanço são por peça, independentemente de estar na terceira ou quarta fileira.

As anotações `[Height]` e `{Mo}` do arquivo de origem estão incompletas. Não interpretar `Height` como classe válida, inventar o encantamento ou atribuir estatísticas finais. O rascunho de armas diagonais/ortogonais inspira os diagramas da seção 7; as regras finais precisam dizer se **adicionam** ou **substituem** capturas tradicionais.

### 3.3 Limites da implementação atual

O código consultado tem oito ofertas fixas por sala, onze habilidades específicas por peça, 39 pontos de material, 12 moedas iniciais e uma melhoria por peça. Não tem raridade, feitiço, atualização de loja ou poder total.

A preparação atual troca/recruta peças nas casas iniciais; **não há comando de deslocamento que preserve a identidade da peça entre casas**. `nextmoves.md` menciona reposicionamento pronto, mas `DraftAction` ainda só contém recrutar, sacrificar, equipar e remover melhoria. Deslocar e usar fileiras avançadas devem ser tratados como trabalho futuro de regra e interface.

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
| `--color-gold` | `#D8B777` | Destaque cerimonial e lendário. |

Tokens funcionais:

| Token | Cor | Uso |
|---|---|---|
| `--color-surface-raised` | `#252A33` | Popover, hover discreto, conteúdo acima de painel. |
| `--color-text` | `#F5F5F3` | Texto principal. |
| `--color-text-muted` | `#B8C2CE` | Ajuda, legendas, dados secundários. |
| `--color-line` | `#424A58` | Borda decorativa/divisória; não usar como única identificação de controle. |
| `--color-control-edge` | `#8895A8` | Limite visível de entradas e controles secundários. |
| `--color-uncommon` | `#94CCB1` | Incomum. |
| `--color-rare` | `#9FBFFF` | Raro. |
| `--color-success` | `#94CCB1` | Confirmação e estado pronto, acompanhados de texto/ícone. |
| `--color-danger` | `#FF9696` | Erro, xeque e ação destrutiva. |
| `--color-focus` | `#B5D5FF` | Foco de teclado. |

Usar as cores semânticas como texto sobre fundo escuro ou como borda/ícone. Sobre superfícies claras, usar texto `--color-void`. Texto sobre dourado também é escuro. Não usar texto branco sobre dourado nem prata sobre casa branca.

As cores são especificação, não laudo de contraste já medido. Na futura etapa de verificação, exigir contraste de texto de pelo menos 4,5:1, texto grande de 3:1 e indicadores funcionais de 3:1; ajustar tokens mantendo a direção.

O dourado preenchido identifica a ação principal da área. Ouro, seleção e raridade lendária usam formatos diferentes: moeda com valor, cantos da casa e selo com a palavra “Lendário”. Uma carta não ganha contorno dourado apenas por ser compatível. Verde de confirmação exige marca de pronto; verde de raridade exige selo “Incomum”. Vermelho fica reservado a xeque, erro e ação destrutiva; captura possível usa marcas neutras de alto contraste.

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
- Aparência de duas vidas, quando implementada, usa marcador `2`/`1` e descrição. A raridade não substitui esse contador.
- Ícones de habilidade ficam em um canto da casa, com fundo sólido contrastante, sem encobrir a silhueta. No máximo um marcador compacto na versão inicial; detalhes ficam no inspector.
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

Ouro é um saldo numérico. Material e poder usam valores `usado / limite`; a barra de poder, quando existir, é a principal. Material tem uma régua secundária menor: sua contribuição ao poder precisa estar explícita para não sugerir dois orçamentos independentes que podem ser somados. No jogo atual, material é a única barra. Abrir “Como é calculado” expõe a soma e o teto da versão de regras.

Na compra ou deslocamento, mostrar previsão textual `Poder 35 → 39` e `Ouro 8 → 4`. A prévia não altera o saldo real. Se exceder o teto: “Esta escolha excede o poder em 2 pontos.” O botão permanece identificável e sua explicação acessível, mesmo desabilitado.

No jogo atual, renderizar apenas material e ouro. Não acrescentar `50` como se fosse uma restrição já validada.

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

### 6.4 Posicionamento futuro

- Casas próprias normais: fileiras 1/2 para brancas, 8/7 para pretas.
- Casas próprias avançadas: fileiras 3/4 para brancas, 6/5 para pretas.
- “Terceira fileira” é relativa ao jogador. As coordenadas continuam as oficiais do tabuleiro.
- Ao selecionar reposicionamento, mostrar contorno tracejado na zona avançada e legenda “Avanço: +2 de poder por peça”. Não escrever `+2` em todas as casas permanentemente.
- Prévia sobre casa avançada mostra uma cápsula `+2 poder`; retorno à zona normal mostra `−2 poder`, se essa devolução for a regra adotada.
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
| Feitiço | Faísca de três traços | Uso imediato; comparar antes/depois e explicar consumo. Apenas modelo visual futuro. |

Para armas diagonais, desenhar quatro segmentos diagonais saindo da origem. Para ortogonais, quatro segmentos ortogonais. Não usar as letras `X` e `+` como nome da habilidade. Proposta de nomes legíveis: “Golpe diagonal” e “Golpe ortogonal”, dependentes da finalização do catálogo.

Legenda fixa nos detalhes: círculo vazio = movimento sem captura; alvo com quatro marcas = captura; linha tracejada/arco = salto permitido. O diagrama descreve a habilidade isolada e deve dizer “Efeito adicional” quando somar ao movimento tradicional. Não sugerir casas legais em uma posição concreta sem validação do motor.

Indicar “Frente da peça” no diagrama e usar os deslocamentos relativos definidos pelo catálogo; consultar uma peça adversária não deve inverter o significado de “avançar”. Se uma casa permite movimento e captura, combinar os dois símbolos e explicar ambos na legenda. Distância maior que uma casa não prova salto: desenhar salto somente quando a regra o declarar. Efeitos que não cabem em 5 × 5 usam um diagrama maior ou texto específico, nunca destinos cortados sem explicação.

### 7.3 Raridades

| Raridade | Selo / cor | Material da carta | Movimento especial |
|---|---|---|---|
| Comum | Círculo simples / prata | Pedra lisa, contorno neutro | Reposição simples de 160 ms. |
| Incomum | Dois traços / verde mineral | Filete no cabeçalho | Mesma reposição; sem partículas. |
| Raro | Losango / azul mineral | Rebaixo e filete azul | Um traço de luz percorre a borda em 420 ms. |
| Lendário | Coroa geométrica / ouro | Moldura dupla e recorte mais marcado | Selo central abre e acende a moldura em 650 ms; até seis fragmentos locais. |

Raridade nunca é apenas cor. Cartas comuns recebem o mesmo cuidado de tipografia e legibilidade. A cerimônia especial acontece uma vez quando uma oferta nova chega; equipar usa o feedback curto de compra, sem repetir a revelação. Hover, seleção, rolagem e reconexão não repetem a cerimônia. Raridade não significa compra com dinheiro real nem recomendação automática de força: compatibilidade e efeito permanecem mais evidentes que o selo.

### 7.4 Comportamento da loja futura

- **Cinco espaços estáveis**. Comprar no terceiro espaço repõe apenas o terceiro. As demais ofertas mantêm posição, foco e estado.
- Botão “Atualizar loja · 1 moeda” usa o preço real da próxima atualização; após resposta, mostra o novo preço. Não esconder custo numa dica.
- Durante atualização, espaços mantêm altura e exibem o estado pendente. Sem roleta, abertura de pacote ou suspense artificial.
- O servidor escolhe ofertas, valida saldo, compatibilidade, teto e versão da loja. A animação começa após confirmação; jamais sorteia raridade no cliente.
- Enquanto espera, manter a oferta antiga identificável com texto “Comprando…”. Se falhar, preservar oferta/saldo confirmados e explicar a falha.
- Compra exige alvo válido. Sem peça selecionada, ação vira “Escolher peça”; não gastar ouro para deixar uma melhoria num inventário inexistente.
- Se houver só uma melhoria permitida por peça, trocar exige resumo da melhoria removida e custo líquido confirmado pelas regras.
- Usar opção “Destacar compatíveis” para realçar ofertas e explicar incompatíveis. O nome descreve o comportamento: não reordenar nem eliminar espaços durante compra/reposição. Manter texto e regras de ofertas incompatíveis legíveis; reduzir apenas ênfase da ação.
- Quando todas forem incompatíveis, dizer “Estas ofertas não servem à peça selecionada. Escolha outra peça ou atualize a loja.” Não garantir compatibilidade no sorteio sem regra aprovada.
- Mostrar “Armas e encantamentos · 5 ofertas” quando a nova loja existir. Feitiços não entram nesse mercado sem decisão explícita.

**Transição:** o redesenho inicial acomoda a quantidade real de ofertas, atualmente oito, em grade/rolagem. Mudar o número exibido para cinco exige primeiro a mudança autoritativa. Não ocultar três ofertas do jogador.

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

- Cabeçalho compacto 56 px, orçamento logo abaixo em duas colunas hoje e três quando existir poder; com texto ampliado, quebra em linhas.
- Tabuleiro em largura total. A faixa da seleção aparece logo abaixo e abre a ficha somente por “Ver peça”. Na partida, tocar uma peça também não abre um painel que encobre casas automaticamente.
- Mercado abaixo, como faixa horizontal. Carta com largura `min(80vw, 300px)`; rolagem com encaixe suave, barra de rolagem disponível e indicação textual “Oferta 2 de 8”, derivada da quantidade real. Não mover automaticamente a faixa após compra. A faixa contextual do mercado mantém alvo e ouro visíveis.
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
| Reposição comum/incomum | Crossfade no mesmo espaço | 160 ms | Troca imediata. |
| Reposição rara | Luz percorre contorno, sem flash branco | 420 ms | Borda azul estática e selo “Raro”. |
| Reposição lendária | Selo abre, moldura acende, até seis fragmentos dentro da carta | 650 ms | Moldura estática e selo “Lendário”. |
| Revelação dos exércitos | Moldura acende; peças aparecem juntas | 500 ms dentro do prazo do servidor | Aparição imediata. |
| Xeque | Contorno surge uma vez; permanece estático | 160 ms | Contorno imediato. |
| Promoção confirmada | Crossfade peão → nova peça | 200 ms | Troca imediata. |
| Resultado | Filete sob título e iluminação breve da moldura | 500 ms; sem cobrir tabuleiro | Resultado estático. |
| Duas vidas, futuro | Primeiro impacto quebra um pequeno selo; contador passa 2 → 1 | 300 ms, só após regra/evento real | Alterar contador e mensagem. |

Ataque lendário **não** ganha animação longa a cada lance. Sua identidade permanece no marcador e na ficha; o deslocamento respeita o mesmo teto de 220 ms das outras peças. Efeitos não podem denunciar preparação privada do adversário.

Se uma atualização trouxer cinco raras/lendárias, animar as bordas em conjunto, sem cinco explosões: no máximo uma carta com fragmentos, escolhida pela maior raridade e, em empate, pelo primeiro espaço. Todas mantêm selo e acabamento correspondentes.

**Orçamento de atenção:** entrada cênica até 700 ms no total, considerando atrasos; resposta comum até 220 ms; equipamento até 280 ms; cerimônia lendária até 650 ms. Nenhuma duração é um bloqueio de clique. Em segundo plano, finalizar efeitos pendentes; ao retornar, mostrar o estado atual. Sob movimento reduzido, usar acabamento estático e mensagem textual, sem perder informação ou prolongar espera.

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

“Implementada” abaixo significa que existe código para a etapa, sem comprovação visual. A primeira versão tinha coordenadas dentro das casas, preenchimento dourado no último lance, ficha móvel sem painel e sacrifício em diálogo separado. P1–P4 corrigem esses pontos e acrescentam compra com alvo/custos e destaque de tempo baixo. O catálogo completo de animações continua sendo referência: capturas com camada transitória, cerimônias de raridade e cosméticos não estão concluídos.

| Etapa | Alterações | Arquivos principais | Estado |
|---|---|---|---|
| D1 — Fundação | Tokens, tipografia, campos/botões/diálogos e estrutura responsiva. | `app/globals.css`, `app/layout.tsx`, `components/Modal.tsx` | Implementada; sem teste visual. |
| D2 — Tabuleiro | Preto/branco, moldura, peças SVG, coordenadas, estados e navegação por setas. | `components/Board.tsx`, `components/Piece.tsx` | Implementada; orientação preservada no código, legibilidade não verificada no navegador. |
| D3 — Entrada | Cenário monumental, título e acesso a casual/amigos/código. | `components/GameApp.tsx`, CSS da cena | Implementada usando CSS e tabuleiro decorativo. |
| D4 — Preparação atual | Inspector, orçamento atual, cinco ofertas visíveis (oito no controle de desenvolvimento) e diagramas; confirmação do sacrifício. Tabuleiro mostra somente as quatro fileiras do jogador. | `components/GameApp.tsx`, `components/AbilityDiagram.tsx` | Implementada para os efeitos reais; sem raridades ou regras futuras. |
| D5 — Partida | Barras, relógios, ficha, histórico, promoção, conexão, revisão e resultado. | `components/GameApp.tsx`, `app/globals.css` | Estados representados; sem teste visual. |
| D6 — Movimento | Transição da peça por identidade entre origem e destino; rei e torre no roque; movimento reduzido e cancelamento por nova posição. | `components/Board.tsx`, `app/globals.css` | Implementada com eventos de estado recebidos. Efeitos de raridade/vida aguardam catálogo e regras reais. |
| R — Novas regras | Projeto separado para resolver seção 3 e implementar servidor/catálogo antes da interface correspondente. | `lib/catalog.ts`, `lib/draft.ts`, `lib/types.ts`, `server/ChessRoom.ts`, eventualmente `lib/chess.ts` | Pendente: economia, cinco ofertas, reposição, classes, raridades e avanço precisam de validação autoritativa. |
| D7 — Interface das novas regras | Poder, mercado de cinco espaços, atualização, compatibilidade e efeitos de raridade. | Componentes já preparados | Só habilitar o que R realmente entregou. |

Feitiços, efeitos de morte e duas vidas entram somente em etapas específicas de regras. A seção de animações documenta a direção para eles; não é autorização para implementá-los de forma improvisada.

### Aplicação da revisão 1.1, em ordem

| Prioridade | Mudança concreta | Critério para considerar entregue |
|---|---|---|
| P1 — Leitura de partida | Reduzir cabeçalho; distinguir estados do tabuleiro; retirar dourado do fundo do último lance; coordenadas na moldura; destacar relógio baixo. | Seleção, xeque e foco coexistem; barras de jogador identificam corretamente os lados; tabuleiro e relógios têm prioridade de espaço. |
| P2 — Compra compreensível | Reorganizar carta; expor alvo, reembolso, custo líquido e saldo; permitir começar pela oferta; explicar incompatibilidade sem apagar sua regra. | Selecionar não compra; trocar mostra o efeito perdido e adquirido; ação pendente não permite envio duplicado. |
| P3 — Preparação móvel | Faixa de seleção, ficha sob demanda, contexto no mercado e sacrifício na mesma ficha. | Seleção sobrevive a abrir/fechar; retornar do tabuleiro preserva oferta/rolagem; painel não se sobrepõe a outro diálogo ou ao rodapé. |
| P4 — Acabamento | Portal escalonado, pedestal em patamares, menos legendas repetidas e uma única entrada coreografada. | O formulário vem antes da cena no celular; decoração não recebe eventos nem atrasa controles. |
| P5 — Efeitos futuros | Raridades, cargas e prévia de cosméticos conforme as seções 7, 9 e 10. | Ativar somente após catálogo/eventos reais; manter aparência padrão e movimento reduzido. Cosméticos continuam adiados. |

P1–P4 refinam a interface atual e não dependem da nova economia. Implementar cada prioridade em uma etapa pequena, registrando o resultado. Não acrescentar dependência para painel, ícone ou animação sem necessidade concreta. Os critérios descrevem comportamento esperado, não verificações realizadas nesta revisão documental.

### Aplicação de P1–P4 — 28/09/2026

- P1: cabeçalho da partida compacto; coordenadas na moldura; seleção, xeque e último lance em camadas próprias; captura neutra; relógio abaixo de 30 segundos; lado do adversário e texto de xeque corrigidos. Navegação por setas preserva um ponto de Tab e Esc cancela seleção.
- P2: `Shop` reúne as ofertas reais, preço/compatibilidade, comparação da troca e saldo previsto. “Escolher peça” inicia seleção sem comprar; a oferta recebe foco ao retornar. Servidor envia `draftComplete` para liberar a próxima mutação após processar a anterior.
- P3: seleção compacta; `PieceInspector` em painel inferior sob demanda no celular; confirmação de sacrifício dentro da ficha; faixa de alvo/ouro no mercado, navegação anterior/próxima e revisão fixa com área segura. A ficha da peça e o histórico durante a partida permanecem no fluxo abaixo do tabuleiro, sem painel automático.
- P4: portal escalonado e pedestal em patamares, formulário antes da cena compacta no celular e entradas com duração total de até 700 ms. Movimento reduzido elimina as animações; redimensionamento e mudança de visibilidade cancelam deslocamentos ativos.

A conexão foi revisada separadamente: inicialização conjunta em desenvolvimento/produção, porta configurável, arquivos de ambiente alinhados, origens locais em desenvolvimento, consulta de disponibilidade e nova tentativa. Os detalhes e limites estão em `implementacao.md`. P5 e as novas regras continuam adiados. A conexão, preparação, loja e compra foram verificadas no navegador. Os 15 testes automatizados e typecheck passaram; build e inspeção dos breakpoints seguem pendentes.

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

## 14. Decisões pendentes, por prioridade

As decisões visuais estão fechadas neste guia. Antes de implementar as novas regras do arquivo de origem, resolver:

1. Confirmar cálculo de poder, inclusão do avanço, valor máximo e tratamento de melhorias removidas. Recomendação: material + melhorias equipadas + 2 por peça avançada; teto inicial 50 configurável.
2. Confirmar os três grupos propostos, incluindo peões separados e Rei excluído inicialmente.
3. Definir atualização de loja, sequência de sorteio, probabilidades por raridade, reembolso e proteção contra atualizações gratuitas por compra/remoção.
4. Definir posicionamento avançado e consequências para movimentos iniciais, ameaças, roque e en passant.
5. Completar nomes e efeitos incompletos; definir se armas adicionam ataques; decidir número de melhorias simultâneas por peça.
6. Especificar feitiços e efeitos de morte, incluindo janelas de uso e impacto sobre relógio/orçamento. Não usar “ganhar três melhorias ao morrer” sem um fluxo de escolha e tempo definido.

Nome definitivo, distribuição de cosméticos, recompensas e melhor de três podem continuar adiados. Os refinamentos P1–P4 podem avançar sobre o protótipo atual. Resolver R antes de apresentar novas regras de preparação ou o mercado de cinco ofertas.

## 15. Referências e registro desta entrega

- Brief principal: pedido de design do usuário e [nextmoves.md](nextmoves.md), lido em 27/09/2026, incluindo a seção de feitiços e os exemplos ainda incompletos.
- Base real consultada: `components/GameApp.tsx`, `components/Board.tsx`, `components/Piece.tsx`, `app/globals.css`, `lib/types.ts`, `lib/draft.ts`, README e documentação existente.
- Skill instalada: [frontend-design, repositório público da Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design), através da skill `skill-installer`, em 27/09/2026. Caminho local: `/home/valeria/.codex/skills/frontend-design/SKILL.md`.
- Registro da cópia lida: SHA-256 `d91970639e9f5c37682ac7ab60094d35f1c7c1f38d731bd56396563aee10c1d3`. A instalação usou a referência `main`; esse hash identifica o conteúdo consultado nesta entrega.
- Aplicação da skill: direção específica ao xadrez, hierarquia tipográfica, composição deliberada, protagonismo visual concentrado e movimento com propósito.
- Este documento foi originalmente produzido antes de alterar a interface. A aplicação posterior de D1–D6 e seus limites está registrada em [implementacao.md](implementacao.md). Os detalhes de peça são SVG/CSS; não foram adicionados imagens raster nem áudio.
- Revisão 1.1 em 28/09/2026: releitura da skill local, de `nextmoves.md` e da interface existente; decisões refinadas e divergências registradas por leitura de código. Não houve alteração do aplicativo nem teste nesta revisão.
