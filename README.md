# Gambito — nome provisório

Primeira etapa jogável de um xadrez online com montagem de exércitos e loja aleatória de melhorias. Interface em português, responsiva, com partidas únicas de 10 minutos por jogador, sem acréscimo.

**Andamento:** por orientação do usuário, o trabalho atual está concentrado em documentação. Novas verificações e testes estão suspensos por enquanto. Os comandos e roteiros abaixo são referências para uma retomada, não tarefas que estão sendo executadas agora.

## Documentação do projeto

- [Registro da implementação](docs/implementacao.md): o que foi feito, arquivos criados, decisões provisórias, arquitetura atual, histórico de verificações e pendências.
- [Regras atuais](docs/regras-prototipo.md): economia temporária, loja, habilidades, sacrifícios, relógio e condições de encerramento.
- [Proposta inicial](docs/plano-mvp.md): os 15 entregáveis de planejamento, preservados como histórico; recomendações conflitantes foram substituídas pelas regras atuais.

A documentação distingue decisões expressas do usuário de parâmetros escolhidos provisoriamente durante a implementação. Doze moedas iniciais, oito ofertas e os preços das habilidades são exemplos de parâmetros provisórios.

## O que já funciona

- Sala privada por código/convite e pareamento casual entre duas pessoas.
- 39 pontos de material, 12 moedas iniciais, recrutamento e sacrifício de peças, incluindo peões.
- Oito ofertas sorteadas de um catálogo de onze melhorias. Os dois jogadores recebem a mesma loja. Uma melhoria por peça; diferentes peças podem receber a mesma melhoria.
- Montagens privadas, revisão do exército e revelação simultânea de oito segundos.
- Servidor Colyseus validando todas as mudanças de orçamento, jogadas, habilidades e resultados.
- Movimentos tradicionais, roque, en passant, promoção, xeque/mate, empates, desistência, relógios e reconexão por até 60 segundos.
- Interface por clique/toque, indicação de movimentos legais, consulta às melhorias do adversário e registro de lances da sala.

**Esta etapa é um protótipo local.** Não há contas, ranking, moeda acumulada, PostgreSQL integrado nem recuperação após reiniciar o servidor. Salas e resultados ficam em memória. O pareamento casual junta dois jogadores disponíveis; ainda não estima nível. Para jogar pela internet será necessário hospedar a interface e o servidor com HTTPS/WSS.

## Executar

Requisitos: **Node.js 22 ou superior** (24 recomendado) e npm.

```sh
npm ci
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O comando inicia tanto a interface quanto o servidor de partidas (porta 2567). `Ctrl+C` encerra ambos. Opções adicionais podem ser colocadas em `.env`, a partir de `.env.example`.

Neste computador, o Node padrão do sistema é 18. A execução feita pelo Codex usa o Node 24 já disponível no ambiente:

```sh
PATH=/home/valeria/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run dev
```

Para conferir no celular na mesma rede, abra `http://IP-DO-COMPUTADOR:3000`, mantenha as portas 3000/2567 acessíveis na rede local e, se necessário, acrescente essa origem em `ALLOWED_ORIGINS`. O cliente usa automaticamente o mesmo nome de host para o servidor. Para hosts distintos, defina `NEXT_PUBLIC_GAME_SERVER_URL` antes de compilar a interface.

## Roteiro de verificação para uma retomada

Não executar agora. Este roteiro foi preparado antes do pedido de interromper os testes.

1. Abra duas abas independentes. Na primeira, informe um apelido e crie uma sala. Na segunda, use outro apelido e o código exibido na sala.
2. Selecione um peão na primeira aba e equipe uma melhoria compatível. O saldo diminui pelo preço da oferta. Selecione outro peão e sacrifique: o material cai em um ponto e o saldo sobe em uma moeda.
3. Confira que as oito ofertas são iguais nas duas abas e que o exército do adversário fica escondido durante a montagem.
4. Clique em **Revisar exército** e **Confirmar exército** nas duas abas. Depois de oito segundos de revelação, começa o relógio das brancas.
5. Mova peças por clique/toque. Apenas o jogador da vez pode jogar; o relógio não ganha segundos após um lance. Consulte as habilidades selecionando peças.
6. Recarregue uma aba durante a partida: ela deve recuperar a sala e o estado. O relógio continua. A sessão de reconexão pertence à aba; para o segundo jogador, abra uma aba nova em vez de duplicar uma partida em andamento.
7. Proponha e aceite empate, ou desista. O resultado aparece em ambas as abas e bloqueia novas jogadas. Uma nova sala recomeça com 39 pontos e 12 moedas.

Os relógios dão até cerca de 20 minutos por partida, somados os dois lados. A preparação tem um limite de 20 minutos neste protótipo para evitar salas esquecidas; esse limite não representa a duração casual pretendida e será ajustado com o uso.

## Comandos de verificação disponíveis para depois

Mantidos como referência; sem nova execução durante a etapa atual de documentação.

```sh
npm run typecheck
npm test
npm run build
```

Os testes cobrem regras tradicionais comparadas com `chess.js` em partidas geradas, as onze melhorias, orçamento, sacrifícios, promoção, xeque, roque, en passant e relógio. Um teste abre um servidor e conecta dois clientes reais para verificar preparação privada, ofertas iguais, comandos inválidos, reconexão e encerramento. Ele usa uma porta local temporária e dura aproximadamente 10 segundos.

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

1. Revisar a documentação e as hipóteses de economia e preparação. Quando a verificação for retomada, experimentar o fluxo e ajustar dinheiro inicial, ofertas e preços com partidas humanas; medir tempo de preparação e duração.
2. Integrar PostgreSQL: contas, snapshots, eventos, histórico e encerramento idempotente; recuperar salas após falha do servidor.
3. Implementar autenticação e ranqueado com validação de versão/catálogo, Elo inicial e fila por nível.
4. Registrar métricas por habilidade, composição, cor, nível e versão; revisar balanceamento antes de abrir o ranqueado.
5. Avaliar séries curtas/melhor de três sem exigir sessões de uma hora. Melhorias não persistem entre partidas nesta versão. A economia de recompensas pós-partida ainda está em aberto.

Veja as [regras atuais e decisões do protótipo](docs/regras-prototipo.md). A [proposta original](docs/plano-mvp.md) foi preservada como histórico, com recomendações que foram alteradas pelo usuário.
