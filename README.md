
# Gambito — nome provisório

Primeira etapa jogável de um xadrez online com montagem de exércitos e loja aleatória de melhorias. Interface em português, responsiva, com partidas únicas de 10 minutos por jogador, sem acréscimo.

**Andamento:** protótipo local com preparação avançada, cinco ofertas, classes de peças, armas, encantamentos, feitiços, quatro raridades e validação autoritativa no servidor. A direção visual de [design-do-jogo.md](docs/design-do-jogo.md) está aplicada. Esta versão continua sem conta, saldo persistente, ranking, recompensas pós-partida, PostgreSQL ou cosméticos. A etapa `nextmoves` foi implementada, mas não foi verificada com testes ou inspeção visual nesta alteração.

## Documentação do projeto

- [Direção de design do jogo](docs/design-do-jogo.md): especificação visual de referência para tabuleiro preto/branco, peças, telas, cartas, animações e cosméticos futuros. Aplicada à interface atual; cosméticos continuam adiados.
- [Próximas regras desejadas](docs/nextmoves.md): anotações originais do usuário. As decisões aplicadas e as regras que não entraram no catálogo estão documentadas em [regras atuais](docs/regras-prototipo.md).
- [Registro da implementação](docs/implementacao.md): o que foi feito, arquivos criados, decisões provisórias, arquitetura atual, histórico de verificações e pendências.
- [Regras atuais](docs/regras-prototipo.md): economia temporária, loja, habilidades, sacrifícios, relógio e condições de encerramento.
- [Proposta inicial](docs/plano-mvp.md): os 15 entregáveis de planejamento, preservados como histórico; recomendações conflitantes foram substituídas pelas regras atuais.

A documentação distingue decisões expressas do usuário de parâmetros escolhidos provisoriamente durante a implementação. Doze moedas iniciais, teto de 50 de Poder, preço de cartas e custo crescente para atualizar a loja são parâmetros iniciais para balancear.

## O que já funciona

- Sala privada por código/convite e pareamento casual entre duas pessoas.
- 39 pontos de material, 12 moedas iniciais, Poder máximo 50, recrutamento, reposicionamento e sacrifício de peças, incluindo peões.
- Cinco ofertas geradas de um catálogo com 16 Armas, Encantamentos e Feitiços. Ambos recebem a mesma loja inicial; compras repõem o espaço individualmente e atualizar o mercado custa 1, 2, 3… moedas.
- Compatibilidade por classe: peças menores (peão, cavalo, bispo) e maiores (torre, dama). Cada peça pode combinar uma Arma e um Encantamento; Feitiços ficam na reserva da sala.
- Raridades comum, incomum, raro e lendário, com animação breve em cartas raras e lendárias; movimento reduzido desativa o efeito.
- Preparação em quatro fileiras próprias, com custo de 2 Poder por peça nas duas fileiras avançadas.
- Montagens privadas, revisão do exército e revelação simultânea de oito segundos.
- Servidor Colyseus validando todas as mudanças de orçamento, jogadas, habilidades e resultados.
- Movimentos tradicionais, roque, en passant, promoção, xeque/mate, empates, desistência, relógios e reconexão por até 60 segundos.
- Interface por clique/toque, indicação de movimentos legais, consulta às melhorias do adversário e registro de lances da sala.
- Direção visual monumental aplicada: tabuleiro preto/branco, peças com acabamento de porcelana/obsidiana, diagramas de melhorias, orçamento, confirmação de sacrifício e layouts responsivos.

**Esta etapa é um protótipo local.** Não há contas, ranking, moeda acumulada, PostgreSQL integrado nem recuperação após reiniciar o servidor. Salas e resultados ficam em memória. O pareamento casual junta dois jogadores disponíveis; ainda não estima nível. Para jogar pela internet será necessário hospedar a interface e o servidor com HTTPS/WSS.

## Executar

Requisitos: **Node.js 22 ou superior** (24 recomendado) e npm.

```sh
npm ci
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O comando inicia tanto a interface quanto o servidor de partidas (porta 2567). `Ctrl+C` encerra ambos. Opções adicionais podem ser colocadas em `.env`, a partir de `.env.example`.

Após alterações no inicializador ou na configuração do servidor, encerre a execução anterior e inicie novamente com `npm run dev`. Abrir apenas `npm run dev:web` deixa a loja sem conexão, a menos que `npm run dev:server` esteja ativo em outro terminal. A loja faz parte da preparação: informe um apelido, entre em casual ou crie uma sala com amigo e use **Ir para a loja** abaixo do tabuleiro. Não é preciso esperar outro jogador para preparar o exército.

`npm start` agora inicia os dois serviços em produção, após uma compilação existente. `npm run start:web` e `npm run start:server` são as opções separadas para hospedagem. O inicializador fixa a porta web (`PORT`, padrão 3000) e encerra os serviços juntos; não abre silenciosamente a interface numa porta alternativa. A porta de partidas vem de `GAME_PORT`, também transmitida à página durante a requisição. `NEXT_PUBLIC_GAME_SERVER_URL` prevalece para um servidor em outro endereço e precisa ser configurado antes da compilação.

Se aparecer um erro de conexão, a interface oferece **Tentar novamente**. Ela consulta `/health` antes de criar a sala e preserva o convite de reconexão em falhas de rede. A resposta de saúde confirma apenas a disponibilidade HTTP; a entrada na sala ainda depende da conexão WebSocket. O servidor deve ser reiniciado junto com esta atualização para fornecer a resposta de saúde e a confirmação de alterações da preparação. Em produção, configure `ALLOWED_ORIGINS` com a origem pública exata e disponibilize HTTPS/WSS.

Neste computador, o Node padrão do sistema é 18. A execução feita pelo Codex usa o Node 24 já disponível no ambiente:

```sh
PATH=/home/valeria/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run dev
```

Para conferir no celular na mesma rede, abra `http://IP-DO-COMPUTADOR:3000` e mantenha as portas web/partidas acessíveis na rede local. Em desenvolvimento, localhost e endereços privados de rede são aceitos; em produção, as origens precisam estar em `ALLOWED_ORIGINS`. O cliente usa automaticamente o mesmo nome de host para o servidor. Para hosts distintos, defina `NEXT_PUBLIC_GAME_SERVER_URL` antes de compilar a interface.

## Roteiro manual de preparação

1. Abra duas abas independentes. Na primeira, informe um apelido e crie uma sala. Na segunda, use outro apelido e o código exibido na sala.
2. Na preparação, confira as cinco ofertas, os valores Material / Poder / Ouro e as casas avançadas. Mova uma peça, depois selecione um peão e equipe uma melhoria compatível; o servidor atualiza orçamento e poder. Sacrifique outro peão e confira o reembolso.
3. Compare as duas abas: a loja inicial deve ser igual e os exércitos devem ficar ocultos durante a montagem. Compre uma oferta em uma aba e confirme que apenas o espaço daquela pessoa é reposto.
4. Atualize a loja e confira o custo crescente. Se possível, compre um Feitiço e use-o no próprio turno durante a partida.
5. Clique em **Revisar exército** e **Confirmar exército** nas duas abas. Depois de oito segundos de revelação, começa o relógio das brancas.
6. Mova peças por clique/toque. Apenas o jogador da vez pode jogar; o relógio não ganha segundos após um lance. Consulte habilidades e tente resolver Isca se ela for ativada.
7. Recarregue uma aba durante a partida: deve recuperar a sala e o estado. O relógio continua. Proponha e aceite empate, ou desista. Uma nova sala começa com 39 pontos e 12 moedas.

Os relógios dão até cerca de 20 minutos por partida, somados os dois lados. A preparação tem um limite de 20 minutos neste protótipo para evitar salas esquecidas; esse limite não representa a duração casual pretendida e será ajustado com o uso. As verificações feitas em etapas anteriores estão registradas em [implementacao.md](docs/implementacao.md); não foram repetidas após as regras `nextmoves`.

## Comandos de verificação disponíveis para depois

Mantidos como referência; sem nova execução durante a etapa atual de documentação.

```sh
npm run typecheck
npm test
npm run build
```

Os testes mantidos no repositório cobrem o motor e o orçamento, categorias e atualizações da loja, sacrifício, habilidades e uma sala online com dois clientes. As mudanças recentes ainda não foram executadas nessa suíte.

## Organização

- `app/`, `components/`: interface Next.js/React.
- `lib/catalog.ts`: orçamento, relógio, melhorias e sorteio da loja.
- `lib/draft.ts`: preparação e conservação do saldo.
- `lib/chess.ts`: motor determinístico com movimentos e ameaças ampliados pelas habilidades.
- `lib/clock.ts`: relógio sem acréscimo.
- `server/`: salas, comandos, validação e conexões Colyseus.
- `tests/`: regras e integração online.

O motor é próprio porque as habilidades alteram também ameaças, xeque e movimentos legais. `chess.js` é usado como referência de teste para o xadrez tradicional, sem ser apresentado como suporte a variantes arbitrárias.

## Etapas posteriores — ainda não iniciadas

1. Verificar a nova preparação completa e, com partidas humanas, ajustar dinheiro inicial, ofertas, classes, preços, limite de Poder e posições avançadas.
2. Integrar PostgreSQL: contas, snapshots, eventos, histórico e encerramento idempotente; recuperar salas após falha do servidor.
3. Implementar autenticação e ranqueado com validação de versão/catálogo, Elo inicial e fila por nível.
4. Registrar métricas por habilidade, composição, cor, nível e versão; revisar balanceamento antes de abrir o ranqueado.
5. Avaliar séries curtas/melhor de três sem exigir sessões de uma hora. Melhorias não persistem entre partidas nesta versão. A economia de recompensas pós-partida ainda está em aberto.

Veja as [regras atuais e decisões do protótipo](docs/regras-prototipo.md). A [proposta original](docs/plano-mvp.md) foi preservada como histórico, com recomendações que foram alteradas pelo usuário.
