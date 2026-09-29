# Histórico cronológico da implementação

Este arquivo guarda o registro **etapa a etapa** do trabalho, de 27/09 a 29/09/2026. Ele foi separado de [implementacao.md](implementacao.md), que passou a concentrar o estado atual do projeto (decisões, inventário de arquivos, arquitetura, pendências e orientações de documentação).

- Estado atual e decisões vigentes: [implementacao.md](implementacao.md)
- Regras executadas pelo servidor: [regras-prototipo.md](regras-prototipo.md)
- Direção visual: [design-do-jogo.md](design-do-jogo.md)

As verificações citadas abaixo foram executadas na etapa em que estão registradas e não representam necessariamente o estado mais recente do código. A numeração das seções foi preservada da divisão original, por isso este índice começa na seção 11.

## Índice das etapas

**27 de setembro de 2026**

- 11. Direção de design — 27/09/2026
- 12. Aplicação da direção visual — 27/09/2026

**28 de setembro de 2026**

- 13. Ajuste do tom das casas escuras — 28/09/2026
- 14. Revisão das decisões de design — 28/09/2026
- 15. Aplicação do design 1.1 e correção do acesso à preparação — 28/09/2026
- 16. Ajustes da tela de preparação — 28/09/2026
- 17. Revisão da entrada e prévia — 28/09/2026
- 18. Posição da prévia do tabuleiro — 28/09/2026
- 19. Refinamento da posição da prévia — 28/09/2026
- 20. Implementação das regras de `nextmoves.md` — 28/09/2026
- 21. Cartas com acabamento por raridade e marcadores — 28/09/2026
- 22. Selos das peças em coluna — 28/09/2026
- 23. Hierarquia dos cards de melhoria — 28/09/2026
- 24. Ícone de arma, dicas estáveis e desmarcação — 28/09/2026

**29 de setembro de 2026**

- 25. Loja ao lado do tabuleiro na preparação — 29/09/2026
- 26. Ficha da peça e planejamento no tabuleiro expandido — 29/09/2026
- 27. Revisão visual da loja e correções de interação — 29/09/2026
- 28. Bandeja única de compra/troca e aplicação direta de cartas — 29/09/2026

---

## 11. Direção de design — 27/09/2026

### Pedido e trabalho realizado

O usuário pediu uma skill de design e um documento para outro modelo executar posteriormente: aparência grandiosa, tabuleiro preto e branco, cores compatíveis, atenção às animações e previsão de cosméticos equipáveis conquistados jogando na conta. Cosméticos não devem ser implementados agora. Continua vigente a orientação de não executar testes.

- Lido `docs/nextmoves.md`, incluindo novos tipos de habilidade, feitiços, quatro raridades, cinco ofertas com reposição, atualização paga e posicionamento avançado.
- Consultados componentes visuais, tipos e preparação existentes para distinguir intenção de produto de implementação real.
- Instalada a skill `frontend-design`, do repositório público `anthropics/skills`, usando o instalador de skills. Local: `/home/valeria/.codex/skills/frontend-design/`. Suas orientações foram lidas e usadas na elaboração do guia; a skill estará disponível para seleção no próximo turno.
- Criado [design-do-jogo.md](design-do-jogo.md), com direção “Salão de Obsidiana”, tokens de cor e tipografia, silhuetas, estados de tabuleiro, anatomia das cartas, layouts responsivos, orçamento, fluxo de compra, animações com duração, acessibilidade, estrutura para aparência personalizável e etapas de execução.
- Atualizado o índice do README para dar acesso ao guia e às anotações de próximas regras.

### Decisões e limites

A direção visual está especificada: pedra negra, porcelana branca, prata e ouro envelhecido, arquitetura monumental na entrada e leitura concentrada durante a partida. Raras e lendárias recebem revelações especiais curtas. Cosméticos ficam separados de habilidades e regras, sem inventário, conta, desbloqueios ou recompensas nesta etapa.

O guia registra recomendações ainda dependentes de regra: cálculo e teto de poder, classificação de peões, evolução do custo de atualização, reembolso, efeitos incompletos, feitiços e consequências do posicionamento avançado. Em especial, a reposição após compra exige impedir sorteios gratuitos por compra e remoção com reembolso integral.

Há uma divergência documentada: as anotações consideram o reposicionamento existente, mas o protocolo atual não possui ação de mover peça durante a preparação; ele permite recrutar/trocar na casa, sacrificar, equipar e remover melhoria. O guia trata deslocamento preservando identidade e fileiras avançadas como implementação futura.

**Arquivos do projeto alterados:** `docs/design-do-jogo.md` (novo), `docs/implementacao.md` e `README.md`. `docs/nextmoves.md` foi preservado. Nenhum código do jogo, dependência do aplicativo, asset visual ou regra foi alterado. A instalação da skill ocorreu fora da pasta do projeto, por solicitação do usuário.

**Verificações:** nenhuma execução de testes, compilação ou inspeção no navegador nesta etapa. Critérios visuais foram documentados para a retomada; não são resultados obtidos.

## 12. Aplicação da direção visual — 27/09/2026

O usuário pediu para colocar em prática o [guia de design](design-do-jogo.md). Foram atualizados os estilos globais, a fonte/moldura do aplicativo, as telas de entrada, preparação e partida e a apresentação da loja existente.

- `app/globals.css`: paleta de obsidiana, prata e ouro; tabuleiro preto/branco; layouts de computador/celular; cartas, orçamento, ficha da peça, estados de seleção/xeque, modais, foco e movimento reduzido.
- `app/layout.tsx`: título/metadados e Cormorant Garamond/Manrope auto-hospedadas por `next/font`, conforme o guia local do Next.js 16 instalado.
- `components/Piece.tsx`: gradientes separados para porcelana/obsidiana, contorno e base sombreados, com IDs independentes por SVG.
- `components/Board.tsx`: novos estados visuais, movimento animado entre origem/destino pela identidade da peça (inclusive roque), foco móvel por setas e uma única casa na ordem de Tab.
- `components/AbilityDiagram.tsx` (novo): diagrama 5 × 5 das casas adicionais de movimento e captura, derivados dos offsets presentes no catálogo.
- `components/GameApp.tsx`: composição monumental da entrada; fluxo atual de casual/amigos/código; preparação separando tabuleiro, orçamento, ficha de peça e mercado; oito ofertas reais em grade rolável; revisão e confirmação do sacrifício; partida, relógios, histórico e resultado.
- `README.md`: andamento atualizado.

A implementação preserva oito ofertas e os preços/efeitos do catálogo atual. A interface não inventa raridade, compra/atualização da loja, feitiços, colocação avançada, saldo persistente ou conta/cosméticos. O sacrifício continua a usar a mesma ação validada pelo servidor; a nova etapa apenas pede confirmação antes de enviá-la.

**Verificações:** respeitada a orientação vigente de não testar por enquanto. Não foram executados testes, typecheck, build ou inspeção no navegador. Fontes auto-hospedadas por `next/font` podem exigir acesso à rede na próxima compilação, pois o ambiente de desenvolvimento pode ainda não ter gerado os assets da fonte.

## 13. Ajuste do tom das casas escuras — 28/09/2026

As casas escuras do tabuleiro passaram de quase preto para cinza-carvão `#373B43`, preservando o contraste com as casas claras `#F5F5F3`. O guia de design foi atualizado para registrar a paleta aplicada.

**Verificações:** conforme solicitado, nenhum teste, compilação ou inspeção no navegador foi executado.

## 14. Revisão das decisões de design — 28/09/2026

O pedido de revisar e melhorar as decisões resultou na versão 1.1 de `docs/design-do-jogo.md`, usando a skill `frontend-design` e a leitura da interface existente como referência.

- Direção monumental mais específica: portal escalonado e pedestal em três patamares; decoração concentrada na entrada e controles mais discretos durante a partida.
- Preparação com alvo/custo explícitos, comparação entre melhorias, reembolso e saldo previsto; possibilidade de iniciar pela oferta, sem compra automática.
- Celular com seleção compacta, ficha aberta sob demanda e preservação da posição do mercado; sacrifício confirmado na mesma ficha.
- Estados do tabuleiro com formas/camadas distintas; diagramas com orientação, movimento/captura combinados e salto definido pela regra.
- Cerimônias executadas uma vez por oferta nova; orçamento de duração sem bloqueio de ações; limites de legibilidade para cosméticos futuros.
- Registro corrigido: D1–D6 são a primeira implementação com divergências; novas regras ainda estão pendentes. P1–P4 priorizam refinamentos da interface atual, e P5 depende de recursos futuros.

**Arquivos alterados nesta revisão:** `docs/design-do-jogo.md` e `docs/implementacao.md`. As mudanças do tom cinza anteriores foram preservadas. Esta etapa revisa a especificação; os novos refinamentos não foram aplicados ao código. `docs/nextmoves.md` foi mantido como fonte original.

**Verificações:** leitura de arquivos e revisão das alterações documentais. Nenhum teste, typecheck, compilação ou inspeção no navegador foi executado, conforme orientação vigente.

## 15. Aplicação do design 1.1 e correção do acesso à preparação — 28/09/2026

O usuário pediu a aplicação da revisão e relatou falha de conexão ao tentar acessar a loja. A loja depende da entrada em uma sala autoritativa. A leitura mostrou problemas concretos na inicialização: `npm start` iniciava somente Next.js; o cliente fixava a porta 2567; o servidor lia apenas `.env` e a autorização local considerava apenas parte dos endereços privados e a porta 3000. Não foi reproduzida a falha em execução, portanto não se atribui uma causa única ao incidente relatado.

### Conexão e inicialização

- `scripts/dev.mjs` agora inicia interface e partidas em desenvolvimento e produção, verifica Node 22+, lê os arquivos de ambiente na ordem de precedência e fixa a porta web. Erros/encerramento de um processo encerram o conjunto com mensagem identificável.
- `package.json`: `npm start` usa o inicializador conjunto; `start:web` preserva o comando separado para hospedagem. Não houve mudança de dependências.
- `app/page.tsx` lê `GAME_PORT` em tempo de requisição com `connection()`, conforme a documentação do Next.js instalada. `NEXT_PUBLIC_GAME_SERVER_URL` continua prevalecendo para hospedagem separada.
- `server/index.ts`: leitura de ambiente alinhada ao inicializador; origens privadas/locais permitidas em desenvolvimento; produção mantém lista explícita. `/health` identifica o serviço e responde com CORS para origens permitidas, sem cache.
- `GameApp`: consulta de disponibilidade com limite de seis segundos antes de criar/retomar sala; erro de configuração de conexão segura e botão de nova tentativa; indisponibilidade de rede não apaga o token de reconexão nem afirma que a sala terminou.
- O servidor deve ser reiniciado com a atualização. O novo cliente exige a resposta `/health` atual e a confirmação `draftComplete`. A disponibilidade HTTP não garante que o WebSocket esteja acessível; HTTPS/WSS, portas e origem pública ainda dependem da hospedagem.

### Interface e interação

- `Shop.tsx` (novo): mantém as oito ofertas, preço/efeito/compatibilidade reais; exibe alvo, melhoria que sai/entra, reembolso e saldo previsto; seleção iniciada pela oferta volta ao tabuleiro e retorna à carta sem compra automática. Faixa contextual, destaque de compatíveis e navegação anterior/próxima no celular.
- `PieceInspector.tsx` (novo): ficha extraída do componente principal; motivos de indisponibilidade ao recrutar e confirmação de sacrifício no próprio painel, com custo discriminado. Seleção compacta abre ficha móvel somente por pedido.
- `GameApp.tsx`: atalho “Ir para a loja”, acesso de volta ao tabuleiro, revisão fixa no celular, menos repetição na partida e correção da cor do adversário e dos avisos de xeque.
- `server/ChessRoom.ts`: mensagem `draftComplete` após processar uma alteração, inclusive em caso de rejeição. O cliente mantém um bloqueio local imediato contra cliques duplicados até receber a confirmação; essa mensagem não altera orçamento ou regras.
- `Board.tsx`: coordenadas fora das casas, camadas independentes para seleção/xeque, foco persistente por setas, Esc para cancelar e cancelamento de animações ao redimensionar ou mudar a visibilidade.
- `AbilityDiagram.tsx`: frente explícita, legenda, símbolo combinado para movimento/captura e salto indicado somente para a habilidade real que possui essa regra.
- `Modal.tsx`: variante de painel inferior, contenção de foco e retorno sem deslocar a rolagem.
- `app/globals.css`: portal escalonado e pedestal em patamares, cena móvel compacta depois do formulário, estados neutros de captura/último lance, alerta de tempo baixo, cartas mais legíveis, rodapé com área segura e movimento reduzido. Casas escuras mantidas em `#373B43`.

### Documentação e limites

Atualizados `README.md`, `.env.example` e `docs/design-do-jogo.md`. O roteiro de aplicação registra P1–P4 e explicita que novas regras, raridades, cosméticos e animações dependentes desses sistemas seguem adiados. A ficha/histórico durante a partida permanecem no fluxo abaixo do tabuleiro; a camada transitória de captura e o catálogo completo de efeitos não foram apresentados como concluídos.

**Causa reproduzida:** `tsx watch` falhava ao criar o pipe local `/tmp/tsx-1000/*.pipe` dentro do inicializador, encerrando o servidor de partidas enquanto a interface aparecia em outra porta. O runner TSX sem watch continua tentando criar esse pipe; o inicializador usa `node --import tsx server/index.ts` para iniciar o serviço diretamente. Depois dessa correção, ambos os serviços iniciaram e o fluxo foi confirmado.

**Verificações concluídas:** navegador local: criou sala casual, preparou e selecionou peão, carregou oito ofertas e equipou `Retirada` no peão. A resposta do servidor confirmou a melhoria e o saldo mudou de 12 para 10 moedas. A sala temporária de verificação foi encerrada. Typecheck passou. Suíte completa passou: 15 testes, incluindo integração de dois clientes, validação, partida, reconexão e resultado. A verificação do servidor exigiu iniciar fora do sandbox, que bloqueava sockets/portas locais. Sem build; responsividade em outras telas não foi inspecionada. Executar o novo `npm run dev` com Node 22+ para posteriores sessões; o README inclui o caminho do Node 24 deste computador.

## 16. Ajustes da tela de preparação — 28/09/2026

Aplicadas as anotações visuais do navegador:

- Removidos o rótulo “Partida casual”, o título e subtítulo de preparação, a faixa de seleção de peça, a explicação de reembolso na ficha, o cabeçalho da loja e o mote do rodapé. O código da sala permanece no topo, alinhado à direita.
- Na preparação, o tabuleiro exibe apenas as quatro fileiras do próprio jogador (1–4 para brancas; 5–8 para pretas). A partida continua usando as oito fileiras.
- A loja continua abaixo do tabuleiro e da revisão do exército. Mostra cinco cartões por padrão, com cartões mais compactos. O botão “Mostrar as 8 ofertas · dev” aparece apenas fora de produção.
- O indicador de navegação da loja recalcula a oferta visível quando a grade muda de tamanho.

**Verificações desta etapa:** typecheck passou com Node 24; suíte completa passou (15 testes). Conferência da tela aberta no navegador confirmou o código da sala no topo, o tabuleiro com quatro fileiras próprias, ausência da faixa removida, cinco cartões e botão de expansão marcado como desenvolvimento. A partida existente foi mantida aberta.

## 17. Revisão da entrada e prévia — 28/09/2026

- A prévia do tabuleiro e a cena monumental foram reduzidas levemente em desktop, tablet e celular para dar mais respiro ao formulário.
- A chamada da tela inicial foi reescrita em linguagem direta: “Sua formação muda a partida.” A descrição agora explica em uma frase o que o jogador faz.
- Removidos o rótulo “1 contra 1” e a microcopy que explicava que as escolhas valem para uma sala.

**Verificações desta etapa:** typecheck passou com Node 24; conferi no navegador os textos novos e a remoção do rótulo e da microcopy. A comparação visual dos breakpoints segue pendente.

## 18. Posição da prévia do tabuleiro — 28/09/2026

Desloquei o tabuleiro decorativo para cima e à esquerda em desktop, tablet e celular, mantendo a escala definida na etapa anterior.

## 19. Refinamento da posição da prévia — 28/09/2026

A pedido do usuário, avancei mais um pouco o tabuleiro para cima e à esquerda nas mesmas faixas responsivas.

## 20. Implementação das regras de `nextmoves.md` — 28/09/2026

O usuário pediu para ler o roteiro e implementá-lo. O arquivo original foi preservado; as escolhas necessárias para resolver exemplos incompletos estão discriminadas em `docs/regras-prototipo.md` e na seção 3 de `docs/design-do-jogo.md`.

### Regras de montagem e catálogo

- `lib/catalog.ts`: versão `workshop-0.2.0`; 16 cartas com classes menor/maior, tipos Arma/Encantamento/Feitiço, raridades comum/incomum/raro/lendário e catálogo de custos/efeitos. O sorteio gera cinco espaços com ao menos uma Arma de cada classe, um Encantamento, um Feitiço e uma quinta oferta.
- `lib/draft.ts` e `lib/types.ts`: Poder `material + melhorias equipadas + feitiços guardados + 2 por peça avançada`, limitado a 50; material limitado a 39; quatro fileiras próprias; casa do Rei fixa; compatibilidade de classe; espaço separado para uma Arma e um Encantamento; inventário de Feitiços; custo crescente de reposição e contabilização desse gasto para impedir criação de moedas.
- A composição inicial conserva 39 pontos de material e 12 moedas. Trocar/sacrificar peça reembolsa o valor da peça e as melhorias nela equipadas. Substituir/remover melhoria reembolsa a carta anterior. Armas podem repetir em peças diferentes. Não há saldo ou progresso persistente.
- Loja inicial igual para os dois lados. Cada compra repõe só o espaço de quem comprou; atualizar loja substitui cinco ofertas, custa 1, 2, 3… moedas e evita as ofertas visíveis e os Feitiços já comprados daquela pessoa.
- As anotações de ataque vertical adjacente foram omitidas por duplicarem um ataque já disponível para torre e dama. O efeito de Feitiço que aumentaria o limite de peças ficou para depois por ainda não ter custo nem janela de uso definidos. Instante extra implementa o exemplo de ampliar relógio.

### Efeitos durante a partida e apresentação

- `lib/chess.ts` e `lib/clock.ts`: suporte ao encantamento Segundo coração, que cancela uma captura e consome o turno; captura de Isca, com espera e escolha de uma opção compatível grátis; Feitiço Instante extra, que concede 30 segundos no próprio turno sem gastar o lance. Armas aplicam ameaças adicionais conforme o catálogo.
- `server/ChessRoom.ts`: validação autoritativa de compras, reposições, montagens, alvos, Isca e Feitiço. Reposições/atualizações são pessoais após a loja inicial. A partida aguarda a decisão de Isca antes de aceitar lance ou ação de empate; desistência é permitida. O snapshot só mostra as opções de Isca ao jogador que deve escolhê-las.
- `components/Board.tsx`, `components/PieceInspector.tsx`, `components/Shop.tsx` e `components/GameApp.tsx`: movimentação durante preparação, classe e espaços da peça, Material/Poder/Ouro, cinco cartas menores, compra de Feitiço, botão de atualização, revisão com avanço/poder, seletor de Isca e botão de ativação do Feitiço.
- `app/globals.css`: selos de raridade e pulsações curtas em raras/lendárias. `prefers-reduced-motion` remove essas animações. Não foi adicionado um efeito vertical sem função nem cerimonial que interrompa a preparação.
- Loja continua temporária e de jogo; não há monetização real, conta, saldo permanente, recompensas pós-partida, ranqueado ou cosméticos.

### Documentação e limitações

Atualizados `docs/regras-prototipo.md`, `docs/design-do-jogo.md` e `README.md`. A seção 20 e as regras 0.2.0 substituem valores das seções históricas que diziam oito ofertas, onze habilidades ou classificavam poder, reposicionamento e raridades como pendentes.

Os custos, raridades e o teto de poder são parâmetros iniciais para balancear com partidas, não valores finais. A loja não usa probabilidades ponderadas explicitamente. Isca sorteia até três opções compatíveis ao ser ativada. A economia continua reiniciando em cada sala, conforme o escopo atual.

**Verificações desta etapa:** nenhuma. Não foram executados testes, typecheck, build ou inspeção no navegador. O pedido anterior de documentar e deixar verificações para depois permanece atendido; os critérios de aceitação funcional e visual estão no README e no guia de design.

## 21. Cartas com acabamento por raridade e marcadores — 28/09/2026

Pedido: aproximar as melhorias da linguagem visual de itens de Diablo 3/4, com cor na carta inteira, uma entrada bonita e efeitos sutis persistentes nas raridades altas. O usuário aprovou os emblemas vetoriais e pediu que os marcadores das peças compartilhassem a cor e o brilho da melhoria; informou também que parte do catálogo será removida, portanto não ampliar a ilustração para todas as cartas.

- `components/Shop.tsx` e `app/globals.css`: comum prata, incomum azul, raro ouro e lendário âmbar. Fundos tingidos, moldura dupla, títulos em serif e selo de raridade; botões e estados de compatibilidade preservam a paleta da carta. A descrição continua legível sobre fundo escuro.
- Entrada: passagem diagonal de luz de 720 ms, com 45 ms entre espaços. Raras têm aura de 8 s; lendárias, aura de 6,5 s e três brasas pequenas junto às bordas. Decoração não captura eventos. Observação de visibilidade pausa efeitos quando a loja sai da tela ou a aba fica oculta. Movimento reduzido deixa a carta estática.
- `components/OfferSigil.tsx`: emblemas SVG originais para Isca, Segundo coração e Instante extra. Armas mantêm diagramas, agora centralizados, com casas dimensionadas sem sobrepor a legenda.
- `components/Board.tsx`: marcadores com SVG monocromático, cor e halo da raridade de cada melhoria; uma peça com dois equipamentos mantém dois marcadores independentes. Raridade incluída no título e no texto acessível da casa. O brilho do tabuleiro é estático para não disputar atenção com os lances.
- Atualizados o guia de design (1.3) e a descrição visual nas regras. Nenhuma dependência adicionada por esta etapa.

**Verificações:** TypeScript passou. Inspeção no navegador local confirmou as quatro paletas, reposição de ofertas, emblemas, diagramas sem sobreposição e marcador lendário em um peão. A conferência usou sala privada temporária. Não foi executada suíte de regras ou build de produção; não há afirmação de verificação móvel nesta etapa.


## 22. Selos das peças em coluna — 28/09/2026

Pedido: empilhar os selos de melhoria, integrar seu acabamento ao tabuleiro e animá-los.

- `app/globals.css`: coluna no canto superior direito, com 2 px de intervalo; Arma acima e Encantamento abaixo quando ambos estão presentes. Largura proporcional à casa, limitada entre 11 e 18 px.
- Selos quadrados com cantos discretamente suavizados, fundo grafite e moldura metálica dupla inspirada na moldura do tabuleiro. Preservados os símbolos SVG, as cores de raridade e os títulos acessíveis.
- Entrada de 280 ms, com atraso de 80 ms no segundo selo. Uma camada de luz varia suavemente sua opacidade em ciclos de 6,6 s, mantendo posição, símbolo e tamanho estáveis durante o reflexo. A animação de entrada ocorre quando o selo é montado, inclusive ao aparecer em outra casa.
- Camadas decorativas não interceptam cliques. Movimento reduzido desativa as animações e mantém um halo estático. Nenhuma dependência ou regra de jogo alterada.
- Guia de design atualizado para 1.4 e descrição visual atualizada nas regras. Esta seção substitui o acabamento estático dos selos descrito na seção 21.

**Verificações:** revisão do código e da documentação. Não executados testes, typecheck, build ou inspeção no navegador nesta etapa.


## 23. Hierarquia dos cards de melhoria — 28/09/2026

- `components/Shop.tsx`: removido o custo da parte superior; o preço fica só no botão. O alvo não se repete no rodapé. A troca informa apenas qual melhoria será substituída, e falta de moedas continua explícita.
- Tipo de carta ganhou ícones SVG de espada, estrela e varinha; o rótulo cresceu para 15 px. Compatibilidade agora usa selos **Plebeu** e **Realeza**, cada um com explicação ao passar o cursor ou focar pelo teclado. Tipo e raridade também explicam seus conceitos por tooltip.
- `components/AbilityDiagram.tsx`: explicações ao passar/focar em movimento, captura, salto e orientação. A descrição específica de cada regra permanece escrita na carta.
- `app/globals.css`: maior destaque ao nome, tipo e descrição; selos de compatibilidade combinam com a moldura e cor de raridade. Sem mudança nas regras, economia ou catálogo.
- Guia de design atualizado com a hierarquia desejada.

**Verificações:** revisão visual do código e documentação. Não foram executados testes nem typecheck nesta etapa.


## 24. Ícone de arma, dicas estáveis e desmarcação — 28/09/2026

- `components/AbilityIcon.tsx` reúne o desenho do selo de arma do tabuleiro e o reutiliza na categoria das cartas, com a mesma geometria e traços. Encantamentos e Feitiços mantêm ícones distintos.
- `components/TermHelp.tsx` substitui as dicas nativas do navegador por um balão próprio, flutuante sobre a página, que permanece visível enquanto o cursor estiver sobre o termo ou até o foco do teclado sair. Assim não é cortado pelo carrossel da loja e não pisca quando a página recebe clique. Aplicado às classes, tipos, raridade e símbolos dos diagramas.
- `components/GameApp.tsx`: durante a preparação, clicar outra vez na peça selecionada desmarca-a. Quando uma melhoria está sendo apontada, o clique ainda aplica a melhoria conforme o fluxo existente.
- **Verificações:** revisão de código e `git diff --check`. Sem testes automatizados ou typecheck nesta etapa.


## 25. Loja ao lado do tabuleiro na preparação — 29/09/2026

- `components/GameApp.tsx` e `components/Shop.tsx`: a preparação segue o esboço de referência. A loja ocupa a coluna esquerda; cinco cartas aparecem em uma fileira e o botão de atualizar fica abaixo. A coluna direita exibe informações do jogador, Material, Poder total, peça selecionada e revisão. O dinheiro aparece sobre a loja e não se repete no resumo compacto.
- `app/globals.css`: a aba vertical do tabuleiro fica à esquerda da área de trabalho e expande sobre a coluna da loja, preservando o painel do jogador à direita. No modo aberto ela contém as barras de jogador e o tabuleiro grande; no fechado não desloca o conteúdo. Código e saída ficam alinhados na faixa do cabeçalho. Em telas estreitas, as colunas empilham e as cartas retornam ao carrossel; toque abre/fecha e toque externo recolhe.
- Guia de design atualizado (1.8). Nenhuma regra de jogo foi alterada.

**Verificações:** revisão estática do JSX/CSS e `git diff --check`. Não executados testes, typecheck ou inspeção no navegador, conforme orientação de deixar os testes para depois.

## 26. Ficha da peça e planejamento no tabuleiro expandido — 29/09/2026

- `components/PieceInspector.tsx` e `components/GameApp.tsx`: painel do jogador agora mostra uma ficha visual da peça selecionada com miniatura ampliada, nome e casa (por exemplo, “Peão B2”), além dos ícones e nomes das melhorias conectadas. A explicação de classe da peça saiu do inspetor; a compatibilidade continua identificada nas cartas.
- O tabuleiro expandido ganhou a área de planejamento: adversário, tabuleiro, jogador local, bandeja “Peças para colocar” e inspetor com recrutamento, melhorias e sacrifício. A bandeja permite escolher uma peça e depois colocá-la numa casa vazia permitida.
- A faixa de etapas virou uma fileira compacta de abas, o código/saída reduziram e a aba do tabuleiro encosta no limite esquerdo da janela.
- `components/Shop.tsx`: “Filtrar Melhorias” fica ligado por padrão e oculta ofertas incompatíveis. Ao desativar, as ofertas incompatíveis voltam com opacidade reduzida e as aplicáveis continuam destacadas.
- Guia de design atualizado para 1.9. Sem alterações às regras de partida.

**Verificações:** revisão estática e `git diff --check`. Testes e typecheck não executados conforme pedido anterior.

## 27. Revisão visual da loja e correções de interação — 29/09/2026

Pedido atual: reformular a loja com foco no acabamento, corrigir o zoom/raridades, melhorar a aba expandida, separar seleção de reposicionamento e acrescentar Vida/Tempo com feitiços automáticos. Esta etapa teve autorização expressa para verificar bugs.

### Design e interface

- `app/globals.css`: reorganizada a seção de preparação, substituindo os estilos anteriores do painel lateral. Loja aberta sobre fundo preto, títulos e regras legíveis, fileira de cinco cartas, saldo junto ao título e ficha do jogador em grafite. O trilho permanece no limite esquerdo da janela, com espaço reservado para não cobrir a primeira carta.
- Raridades passaram a usar tokens compartilhados em todos os elementos com `data-rarity`. Corrigida a divergência entre carta, selo do tabuleiro e selo do retrato: prata, azul, dourado e âmbar. Compatibilidade mantém a cor original da carta.
- `components/PieceInspector.tsx`: retrato maior sobre uma casa em perspectiva, nome/coordenada, selos verticais com reflexo suave e lista legível de melhorias. Removidas informações repetidas sobre classe. Ações junto ao tabuleiro; troca de peça numa seção recolhível para preservar a função sem repetir toda a bandeja.
- `components/GameApp.tsx`: painel expandido com cabeçalho, botão próprio para recolher, adversário, tabuleiro, jogador e recrutamento. Indica quando o orçamento de material está completo. Painel fechado fica inerte; clicar fora também recolhe. No celular as ações são empilhadas e a revisão permanece no painel do jogador.
- `components/Shop.tsx`: compatibilidade entre parênteses, feitiços com ativação automática, preço no botão, paginação sem estado “1 de 0” e retorno ao começo da fileira quando a seleção/filtro muda. Compras que ultrapassam Poder agora são desabilitadas com motivo explícito. A validação final continua no servidor.

### Interações e regras

- `components/Board.tsx` / `GameApp.tsx`: clique seleciona/desmarca; na preparação, clicar em casa vazia não reposiciona a seleção. Arraste usa Pointer Events, limiar de movimento, captura do ponteiro, imagem acompanhando o cursor, indicação do destino e supressão do clique residual. Casas ocupadas são bloqueadas e a formação continua validada pelo servidor. Espaço/setas/Enter oferecem alternativa de teclado; Escape cancela essa operação.
- `lib/catalog.ts`: tempo base alterado para cinco minutos, Vida inicial 1.200 e regras identificadas como `workshop-0.3.0`. Corrigidas descrições que ainda mencionavam movimento de cavalo ou ataques da dama em melhorias agora permitidas para classes inteiras.
- `lib/player-stats.ts`, `lib/types.ts` e `server/ChessRoom.ts`: atributos iniciais derivados das compras validadas e enviados no estado da sala. Instante extra acrescenta 30 segundos automaticamente na transição para a revelação, sem consumir lance; o painel já mostra 05:30 na preparação. Feitiços resolvidos saem do inventário ativo e reconectar não reaplica o efeito. O antigo comando manual é rejeitado.
- Vida ainda é apenas o atributo inicial: não foram inventadas regras de dano nem alteradas as condições de vitória. Novos feitiços exigem resolução automática explícita antes de entrar no catálogo.
- `README.md`, `docs/regras-prototipo.md` e guia de design 2.0 atualizados. As anotações originais em `nextmoves.md` foram preservadas.

### Verificações

- Verificação de tipos e `git diff --check`: sem erros.
- O teste de atualização da loja tinha uma expectativa aleatória incorreta: comparava as ofertas novas com a loja inicial, mesmo após uma compra repor um dos espaços. Corrigido para comparar com as ofertas visíveis imediatamente antes da atualização. A execução seguinte passou.
- 19 testes automatizados aprovados, incluindo regras clássicas, orçamento, preparação avançada, habilidades, relógio e dois clientes reais conectados ao servidor local. O teste online foi atualizado para conferir Vida/Tempo, bônus automático de 30 segundos na revelação, rejeição da ativação manual e reconexão sem duplicação do bônus.
- Inspeção no navegador em 1440 × 960, 768 × 1024 e 390 × 844: cartas, ficha e painel expandido. Conferidos clique sem movimento, desmarcação, arraste nas duas orientações, bloqueio de destino ocupado, alternativa de teclado, filtro/transparência, compra/remoção e tempo 05:30 após comprar o feitiço. Conferido bloqueio visual de compra acima de 50 Poder.
- Cor computada `#f2d789` conferida simultaneamente em carta rara, selo do tabuleiro e retrato; azul de melhoria incomum conferido no retrato da peça preta. Nenhum erro de console na sessão final.
- A verificação de celular foi feita por largura de viewport e interação com ponteiro; não substitui teste físico em tela de toque. Build de produção não executado nesta revisão.

### Ajuste solicitado durante a revisão

Removidos o título “Seu exército” e a instrução “Clique para selecionar. Arraste para reposicionar.” do painel expandido. O botão de recolher foi para o trilho lateral. O tabuleiro subiu e sua largura agora considera a altura disponível da janela, reservando espaço para os jogadores e a bandeja de peças sem exigir rolagem em janelas usuais. As instruções de teclado permanecem acessíveis aos leitores de tela.

As cartas também foram alargadas para uma referência de 250 px, com menos altura e espaçamento vertical. Categoria e raridade compartilham a mesma linha quando couberem. As cinco ofertas permanecem disponíveis em uma fileira com rolagem e navegação, que aparece apenas quando necessária.


## 28. Bandeja única de compra/troca e aplicação direta de cartas — 29/09/2026

- Removida a seção “Trocar peça” do inspetor e seus controles duplicados. `components/RecruitmentTray.tsx` concentra as cinco peças compráveis abaixo do tabuleiro. Primeiro se seleciona a casa; clicar numa peça da bandeja compra para uma casa vazia ou substitui a ocupante. Sem casa selecionada, os botões orientam a seleção e ficam desabilitados. O Rei continua protegido; a opção correspondente à peça atual fica marcada como “Atual”.
- Os preços exibidos são líquidos: o valor da peça e de suas melhorias entra no reembolso da troca. Crédito aparece como `+N ◉`; custo zero aparece como “Grátis”. O texto da bandeja identifica a casa e explica o reembolso. Limites e saldo usam uma prévia da mesma função pura de validação do servidor; a compra só altera o estado após resposta autoritativa.
- Cartas: peça selecionada → botão Equipar/Trocar continua imediato. Carta sem alvo → abre o tabuleiro, mostra nome/custo e destaca apenas peças onde a compra é válida. Clicar no alvo aplica diretamente, sem voltar à carta para repetir a confirmação. A aba fica aberta durante essa escolha; Cancelar, Escape, recolher ou clicar fora encerram a intenção. Compras pendentes bloqueiam duplo envio.
- Durante aplicação de carta, a bandeja de recrutamento fica temporariamente oculta e reposicionamento/ações do inspetor ficam indisponíveis, para evitar comandos concorrentes. A loja ganhou “Escolher peça” / “Trocar alvo” no contexto da seleção. Regras, preços do catálogo e validação final do servidor permanecem vigentes.
- Documentação atualizada; não foram adicionados nem executados testes automatizados nesta etapa. Inspeção visual da bandeja e revisão de código feitas durante a alteração.

---

Registro mantido em [implementacao.md](implementacao.md). Atualize este arquivo ao registrar uma nova etapa.
