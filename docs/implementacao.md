# Registro da implementação

> **Estado vigente:** o roteiro `docs/nextmoves.md` foi implementado no conjunto de regras `workshop-0.2.0`. Consulte a seção 20 de [`historico.md`](historico.md) e `docs/regras-prototipo.md` para o comportamento atual; os registros anteriores descrevem etapas históricas e valores já substituídos. Esta etapa foi documentada sem executar testes, typecheck, build ou inspeção visual.

**Data:** 27 de setembro de 2026.  
**Etapa:** primeiro protótipo local, com preparação e partidas entre dois convidados.  
**Orientação mais recente do usuário:** documentar o trabalho e não continuar os testes por enquanto. Após essa orientação, o trabalho desta etapa passou a ser exclusivamente de documentação.

Este documento registra o estado real do projeto. A presença de uma funcionalidade no código não significa que ela esteja equilibrada, pronta para produção ou completamente verificada.

## Índice

1. [Histórico do trabalho](#1-histórico-do-trabalho)
2. [Decisões confirmadas e hipóteses provisórias](#2-decisões-confirmadas-e-hipóteses-provisórias)
3. [Inventário dos arquivos](#3-inventário-dos-arquivos)
4. [Arquitetura que existe hoje](#4-arquitetura-que-existe-hoje)
5. [Fases e comunicação da sala](#5-fases-e-comunicação-da-sala)
6. [Economia implementada](#6-economia-implementada)
7. [Proteções e limitações atuais](#7-proteções-e-limitações-atuais)
8. [Histórico de verificações já executadas](#8-histórico-de-verificações-já-executadas)
9. [Pendências e sequência de trabalho](#9-pendências-e-sequência-de-trabalho)
10. [Como manter a documentação daqui em diante](#10-como-manter-a-documentação-daqui-em-diante)

> **Registro cronológico:** as etapas 11–28 (27/09 a 29/09/2026) foram movidas para [historico.md](historico.md).

## 1. Histórico do trabalho

### Planejamento inicial

- A pasta estava sem código de aplicação. Foi criado `docs/plano-mvp.md` com os 15 entregáveis solicitados.
- Foram consultadas as documentações oficiais de Next.js, Colyseus, PostgreSQL e chess.js. As referências estão na proposta inicial.
- A primeira proposta recomendava restrições para peões, moedas cosméticas e relógio com acréscimo. Essas recomendações foram corrigidas pelo usuário e não devem ser tratadas como regras atuais.

### Correções e autorização para implementar

O usuário autorizou começar a implementação e definiu que:

- peões também podem participar de mudanças de composição, sacrifícios e melhorias;
- cada jogador começa com uma quantia de dinheiro para comprar melhorias;
- a loja é aleatória e oferece bastante variedade;
- o relógio é de 10 minutos por jogador, sem acréscimo;
- melhorias não persistem entre partidas;
- melhor de três deve continuar no planejamento, mas não bloquear o começo da implementação; a duração casual é uma preocupação importante.

### Implementação realizada antes do pedido de focar em documentação

1. Criada a estrutura de aplicação Next.js/React/TypeScript e um processo Colyseus separado para as partidas.
2. Implementado o catálogo de peças e onze habilidades, com oito ofertas sorteadas por sala.
3. Implementado o orçamento de preparação, recrutamento, trocas, sacrifícios e reembolsos.
4. Implementado o motor de xadrez em TypeScript, incluindo as extensões de movimento e captura das habilidades.
5. Implementadas salas privadas, fila casual simples, preparação oculta, confirmação e revelação simultânea.
6. Implementados relógio, jogadas autoritativas, empate, desistência e reconexão.
7. Criadas a interface de entrada, montagem, mercado, partida e resultado, além de peças desenhadas em SVG.
8. Criados arquivos de testes de regras e comunicação entre dois clientes. Algumas verificações foram executadas antes da orientação mais recente; o histórico exato está na seção 8.
9. Criados o `README.md` e `docs/regras-prototipo.md`; a proposta anterior foi marcada como histórica.
10. Após o pedido “documenta tudo [...] não precisa testar por agora”, interrompidas as verificações e iniciada a consolidação deste registro.

Nenhum deploy público ou commit foi realizado nesta etapa. “Online” no protótipo significa comunicação real entre dois clientes e um servidor; ainda não significa um serviço publicado na internet.

## 2. Decisões confirmadas e hipóteses provisórias

**Registro histórico:** esta tabela descreve a primeira versão 0.1.0. As regras vigentes após `nextmoves.md` estão na seção 20 de [`historico.md`](historico.md) e em `docs/regras-prototipo.md`.

| Tema | Origem | Estado atual |
|---|---|---|
| 39 pontos e valores tradicionais das peças | Pedido original | Implementado como teto do material ativo. |
| Peões podem ser alterados, sacrificados e melhorados | Correção do usuário | Implementado. |
| Dinheiro inicial para melhorias | Correção do usuário | Implementado; quantia ainda provisória. |
| Loja aleatória com várias opções | Correção do usuário | Implementado; quantidade e distribuição ainda provisórias. |
| 10 minutos sem acréscimo | Correção do usuário | Implementado. |
| Melhorias não persistem | Correção do usuário | Implementado; cada sala começa do zero. |
| Partidas únicas enquanto se avalia melhor de três | Correção do usuário | Implementado; séries não existem ainda. |
| 12 moedas iniciais | Escolha provisória de implementação | Configurável em `lib/catalog.ts`; não foi um número definido pelo usuário. |
| Material e custo de melhorias separados | Interpretação para este protótipo | 39 pontos limitam as peças; melhorias usam moedas. Difere da fórmula recomendada no plano original. |
| Exército tradicional entregue no início | Escolha provisória de implementação | O jogador começa com 39 pontos em peças e personaliza a formação. Não começa com tabuleiro vazio. |
| Sacrifício reembolsa peça e melhoria | Escolha provisória de implementação | Só durante preparação; recrutar/equipar custa o mesmo valor reembolsável. |
| Rei fixo e obrigatório, outras 15 casas flexíveis | Escolha provisória de implementação | Casas nas duas fileiras iniciais podem receber qualquer peça não-Rei ou ficar vazias. |
| 11 habilidades; oito ofertas por sala | Escolha provisória de implementação | Catálogo e preços ainda precisam de avaliação de produto e balanceamento. |
| Mesma loja para os dois lados, sem novo sorteio | Escolha provisória para reduzir desigualdade por sorte | Sorteio feito no servidor, uma vez por sala. |
| Uma melhoria por peça; cópias sem limite entre peças | Escolha provisória de implementação | Não há disputa por estoque e nem combinações de duas habilidades na mesma peça. Combinações entre peças distintas são possíveis. |
| Habilidade do peão termina ao promover | Escolha provisória para evitar ambiguidade | Promoção escolhe dama, torre, bispo ou cavalo sem melhoria. |
| Oito segundos de revelação | Escolha provisória de interface | Relógios ainda parados durante esse intervalo. |
| Reconexão de até 60 segundos | Recomendação mantida do plano | Relógio continua; servidor guarda o lugar do jogador nessa janela. |
| Expiração de montagem após 20 minutos | Limite operacional provisório | Evita salas esquecidas; não é uma meta de duração casual. |
| “Gambito” | Nome escolhido provisoriamente para a interface | O nome do projeto continua em aberto. |

A preferência por bastante variedade levou o primeiro catálogo além das 2–3 habilidades sugeridas no plano inicial. As onze habilidades compartilham um mecanismo simples: movimentos ou capturas adicionais. Efeitos de sobrevivência, segunda vida e destruição em duas etapas não foram implementados.

## 3. Inventário dos arquivos

### Interface

| Arquivo | Responsabilidade |
|---|---|
| `app/layout.tsx` | Idioma português, título da aplicação, descrição e estilos globais. |
| `app/page.tsx` | Página principal; carrega o componente de jogo. |
| `app/globals.css` | Aparência verde/creme, tabuleiro, mercado, diálogos, estados e regras de layout responsivo. Há ajustes para telas estreitas; verificação específica de celular ainda pendente. |
| `components/GameApp.tsx` | Fluxo da interface, entrada nas salas, apelido, conexão/reconexão, escolha de peças, mercado, revisão, jogadas, promoção e resultado. |
| `components/Board.tsx` | Tabuleiro orientado para cada jogador; seleção por clique/toque, casas legais, último lance, indicação de xeque e marcador de habilidade. |
| `components/Piece.tsx` | Desenhos SVG de Rei, dama, torre, bispo, cavalo e peão. Sem serviço externo de imagens. |
| `components/Modal.tsx` | Diálogos para regras, revisão, promoção e confirmação de saída; tratamento de foco, Tab e Escape. |

### Regras compartilhadas

| Arquivo | Responsabilidade |
|---|---|
| `lib/catalog.ts` | Versão do conjunto de regras, valores das peças, 39 pontos, 12 moedas, 10 minutos, reconexão, catálogo e sorteio de ofertas. |
| `lib/types.ts` | Contratos de peças, tabuleiro, montagem, ações, partida, resultado e visão enviada ao jogador. |
| `lib/draft.ts` | Exército inicial, zona permitida, orçamento, compatibilidade, recrutamento, sacrifício, equipamento e reembolsos. |
| `lib/chess.ts` | Ataques, movimentos possíveis e legais, segurança do Rei, roque, en passant, promoção, repetição, empate, mate e registro textual de lances. |
| `lib/clock.ts` | Contagem autoritativa de tempo, sem acréscimo. Usa tempo monotônico fornecido pelo servidor. |

### Servidor e ambiente

| Arquivo | Responsabilidade |
|---|---|
| `server/index.ts` | Inicializa Colyseus, transporte WebSocket, origens permitidas, limite básico de requisições, leitura opcional de `.env` e rota `/health`. |
| `server/ChessRoom.ts` | Sala de dois jogadores; sorteio, assentos, fases, mensagens, validação, relógios, reconexão, snapshots privados e encerramento. |
| `scripts/dev.mjs` | Inicia interface e servidor de jogo juntos; encerra os dois quando um processo termina ou o comando é interrompido. |
| `package.json` | Dependências e comandos para executar, compilar e verificar. |
| `package-lock.json` | Versões resolvidas das dependências para instalação reproduzível. |
| `tsconfig.json` | Configuração TypeScript compartilhada. Next.js ajustou a opção JSX durante a compilação. |
| `next.config.ts` | Configuração inicial de Next.js; desativa o cabeçalho de identificação da plataforma. |
| `next-env.d.ts` | Declarações de ambiente de Next.js. |
| `.env.example` | Exemplo das configurações de endereço/porta/origens; não contém credenciais. |
| `.gitignore` | Exclui dependências, arquivos gerados e configurações locais com possíveis segredos. |
| `AGENTS.md` e `CLAUDE.md` | Arquivos gerados automaticamente por `next dev` com orientação para consultar a documentação da versão instalada. Não são regras de produto. |

### Verificações e documentação

| Arquivo | Responsabilidade |
|---|---|
| `tests/rules.test.ts` | Verificações do motor, orçamento, habilidades, promoção, xeque, roque, en passant, repetição e relógio. Criado antes do pedido de interromper os testes. |
| `tests/online.test.ts` | Integração com um servidor temporário e dois clientes reais; reconexão, privacidade da montagem e rejeição de comandos inválidos. Criado antes do pedido de interromper os testes. |
| `README.md` | Entrada da documentação, execução, limitações e roteiro de verificação guardado para depois. |
| `docs/regras-prototipo.md` | Fonte atual das regras implementadas, com as alterações do usuário e os parâmetros provisórios. |
| `docs/plano-mvp.md` | Proposta original e roadmap de longo prazo; mantida como histórico. |
| `docs/implementacao.md` | Este registro de andamento, decisões, arquivos e pendências. |

## 4. Arquitetura que existe hoje

O navegador executa a interface Next.js/React e se conecta diretamente ao processo Colyseus. O processo Colyseus mantém as salas e executa as regras. Os dois processos usam TypeScript; o catálogo e os contratos estão em `lib/`.

O cliente envia uma intenção, por exemplo “equipar Lança neste peão” ou “mover de e2 para e4”. O servidor confirma a propriedade da peça, a fase, o saldo, a compatibilidade, o turno e a segurança do Rei. Só então aceita a mudança. O cliente não pode definir o saldo, o tabuleiro, o resultado ou o relógio da sala.

Nesta etapa, a atualização é feita por mensagens com uma cópia do estado público e da montagem do próprio jogador. Ainda não são usados os patches de estado por campo do Colyseus. Para um jogo por turnos pequeno, isso mantém o fluxo inicial simples. O relógio é enviado separadamente a cada 250 ms; snapshots completos são enviados nos eventos relevantes.

O motor de xadrez é próprio porque os efeitos também mudam quais casas são ameaçadas. Uma biblioteca de xadrez tradicional não foi tratada como se já suportasse essas variantes. `chess.js` está apenas nas dependências de desenvolvimento, como referência do comportamento tradicional.

PostgreSQL continua na arquitetura planejada, mas **não está integrado**. A memória da sala é a única fonte de estado da partida atual. Reiniciar o processo perde as salas; reconectar o navegador só funciona enquanto a mesma sala ainda existe.

## 5. Fases e comunicação da sala

| Fase | O que acontece | Transição |
|---|---|---|
| Preparação | Cada jogador altera apenas seu exército. Loja compartilhada; montagem adversária oculta. | Ambos conectados e confirmados, com posição inicial válida. |
| Revelação | Os exércitos completos tornam-se visíveis. A edição fica bloqueada; relógios parados. | Oito segundos após a revelação. |
| Partida | Jogadas, relógios, propostas de empate e desistência. | Mate, empate, tempo, desistência ou abandono. |
| Encerrada | Resultado e registro de lances disponíveis para quem permanece na sala. | Para jogar de novo, criar outra sala. Sem revanche na mesma sala nesta etapa. |

Mensagens de entrada atualmente tratadas:

| Mensagem | Finalidade |
|---|---|
| `sync` | Pedir a visão atual da sala para esse assento. |
| `draft` | Recrutar, sacrificar, equipar ou remover uma melhoria. |
| `ready` | Confirmar ou cancelar a confirmação durante a preparação. |
| `move` | Jogada com origem, destino, promoção opcional e número da posição esperada. |
| `resign` | Desistir da partida em andamento. |
| `offerDraw` | Propor empate; novas propostas têm intervalo mínimo de dez lances individuais por jogador. |
| `answerDraw` | Aceitar ou recusar a proposta do adversário. |
| `claimDraw` | Reivindicar empate por repetição tripla ou 50 lances quando a condição já existe no próprio turno. |

O servidor envia `snapshot`, `clock` e `error`. Campos são validados com Zod. O número de lance esperado impede aplicar uma jogada enviada para uma posição antiga. Encerramento usa uma guarda para não modificar um resultado já finalizado; ainda não há uma transação persistida em banco.

O apelido fica no armazenamento local do navegador. O token temporário de reconexão fica no armazenamento da aba. Não há senha, conta real ou autenticação de identidade; a autorização dentro da sala corresponde ao assento reservado pelo Colyseus.

## 6. Economia implementada

**Histórico da versão 0.1.0.** A economia e a conservação descritas abaixo foram substituídas pelo orçamento de Poder, avanço e custo de atualização da versão 0.2.0, registrados na seção 20 de [`historico.md`](historico.md).

O jogador recebe o exército tradicional e 12 moedas de preparação. O material das peças tem teto 39; as melhorias são pagas com moedas separadas. Sacrificar converte a peça em moedas e abre uma casa. Trocar de peça ou melhoria primeiro reembolsa o valor anterior e depois cobra o novo.

Exemplo do comportamento atual: equipar Passo lateral num peão custa 3 moedas, deixando 9. Sacrificar outro peão adiciona 1 moeda, deixa 10 no saldo e reduz o material para 38. Se for sacrificado o peão equipado, são devolvidos 1 da peça e 3 da melhoria.

A soma `material + melhorias equipadas + saldo` permanece 51. Comprar e sacrificar a mesma peça repetidamente não cria recursos. Não existem juros, recompensas pós-partida, saldo de conta, desbloqueios permanentes nem compras reais.

Este é um modelo provisório para tornar jogável a preparação. A economia persistente discutida no pedido original continua como decisão futura; não foi silenciosamente substituída por uma loja cosmética implementada.

## 7. Proteções e limitações atuais

Já foram implementados validação autoritativa das ações, restrição por fase/assento/turno, orçamento recalculado, compatibilidade das ofertas, Rei obrigatório, rejeição de posição inicial em xeque, ocultação da montagem adversária e bloqueio de resultado encerrado.

O servidor também tem limite de 12 mensagens por segundo por cliente, limite de tamanho de entrada WebSocket, checagem de origem e limitação simples de requisições por endereço. Essas medidas são básicas e não equivalem a uma solução completa de segurança de produção ou antitrapaça. O código de convite dá acesso à sala privada, até ocupação dos dois lugares.

Limitações a manter visíveis:

- Não há autenticação de contas, ranqueado, persistência, recuperação após queda do processo nem publicação pública.
- A fila casual não usa nível/rating.
- O saldo e os preços são hipóteses, sem dados de balanceamento.
- A análise de material insuficiente é conservadora com habilidades; não resolve todas as posições mortas possíveis da variante.
- A reivindicação de empate só considera condições já atingidas; não implementa a modalidade de anunciar um lance futuro para reivindicar.
- Se as formações deixarem um Rei inicialmente em xeque, ambos precisam revisar a montagem. O aviso orienta a proteção de e2/e7; esse fluxo ainda pode ser refinado.
- A interface tem regras responsivas, mas a verificação específica de celular foi interrompida antes de acontecer.
- Um ajuste para evitar que a decoração da página inicial ultrapasse a largura da tela foi aplicado, mas a nova aparência não foi reconferida após o pedido de parar as verificações.
- Os testes existentes foram mantidos. Nenhum novo teste está sendo criado ou executado na etapa atual de documentação.

## 8. Histórico de verificações já executadas

Tudo nesta seção ocorreu **antes** do pedido mais recente do usuário. Não é uma indicação de que os testes continuam em execução.

| Verificação anterior | Resultado registrado | Limite da evidência |
|---|---|---|
| TypeScript | Passou após adicionar/anotar os tipos de Express. | Não foi repetido após as últimas alterações pequenas. |
| Compilação de produção Next.js | Concluída com sucesso. | Foi anterior ao último ajuste visual, à leitura opcional de `.env` e a pequenas alterações de texto/documentação. |
| Conjunto automatizado completo | 15 testes passaram. | Não prova balanceamento nem prontidão para produção. |
| Comparação com xadrez tradicional | Conjuntos de movimentos comparados com chess.js em 12 partidas geradas, com até 90 lances individuais por partida. | Não é uma prova formal de correção e não avalia equilíbrio de habilidades. |
| Integração online | Dois clientes reais montaram exércitos, receberam a mesma loja, fizeram lances, reconectaram e encerraram uma partida; comandos inválidos foram rejeitados. | Ambiente local e convidados; sem banco ou autenticação. |
| Interface no navegador | Página inicial, criação por código, segundo jogador, melhoria em peão e sacrifício foram observados. | A partida completa não foi concluída manualmente na interface. |
| Layout móvel | Não realizado. | A checagem estava planejada quando o usuário pediu para focar em documentação. |

Após o último teste automatizado, foram feitos ajustes pontuais: texto de Salto real para explicar os ataques após o salto; leitura opcional de `.env`; remoção de importações não utilizadas na interface; ajuste da decoração que ultrapassava a largura da tela; documentação. Não há afirmação de uma nova verificação desse estado final.

Na instalação, foi necessário usar o Node 24 já disponível no ambiente, porque o Node padrão do sistema é 18 e o servidor Colyseus instalado exige Node 22 ou superior. Acesso ao registro de pacotes e execução de testes com conexões locais dependeram de permissões do ambiente. As dependências foram instaladas; não há uma aprovação pendente impedindo a documentação.

## 9. Pendências e sequência de trabalho

O foco imediato é manter o trabalho compreensível e documentado. A próxima alteração de implementação deve ser pequena, com propósito e arquivos afetados registrados, antes de ampliar o escopo.

Pendências de produto:

- Balancear 12 moedas, cinco ofertas, preços, distribuição de raridade, teto de Poder e avanço com partidas humanas.
- Avaliar se começar com exército completo é o melhor fluxo e medir a duração da preparação.
- Decidir como explorar séries/revanche sem transformar uma sessão casual em uma hora de jogo.
- Retomar as decisões de recompensas e eventual saldo entre partidas sem vantagem competitiva.
- Definir nome, identidade visual final e requisitos do catálogo competitivo.

Pendências técnicas:

- PostgreSQL, migrações, contas e autenticação.
- Persistência de ações, snapshots e resultados; recuperação após reinício.
- Ranqueado, cálculo de rating e matchmaking por nível.
- Coleta de métricas e acompanhamento por versão de regras.
- Hospedagem, HTTPS/WSS, operação e segurança de produção.
- Revisão de interface móvel, acessibilidade e experiência de preparação quando as verificações forem retomadas.

## 10. Como manter a documentação daqui em diante

- Registrar cada etapa pequena neste documento, dizendo o que mudou e por quê.
- Marcar decisões do usuário, hipóteses de implementação e decisões ainda abertas separadamente.
- Atualizar `docs/regras-prototipo.md` quando mudar qualquer efeito, preço, condição, sacrifício ou regra de partida.
- Atualizar o `README.md` quando mudar como executar o projeto ou o que está realmente disponível.
- Registrar verificações somente quando de fato executadas, com seu alcance e limitações. Durante a orientação atual, preservar os roteiros para depois e não executá-los.
- Evitar apresentar funcionalidades futuras do roadmap como se estivessem implementadas.
- Registrar a linha do tempo etapa a etapa em `docs/historico.md`; este arquivo mantém o estado atual, as decisões e as pendências.

---

O registro cronológico etapa a etapa (seções 11–28, de 27/09 a 29/09/2026) está em [historico.md](historico.md).
