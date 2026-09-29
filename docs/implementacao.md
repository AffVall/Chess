# Registro da implementação

> **Estado vigente:** o roteiro `docs/nextmoves.md` foi implementado no conjunto de regras `workshop-0.2.0`. Consulte a seção 20 e `docs/regras-prototipo.md` para o comportamento atual; os registros anteriores descrevem etapas históricas e valores já substituídos. Esta etapa foi documentada sem executar testes, typecheck, build ou inspeção visual.

**Data:** 27 de setembro de 2026.  
**Etapa:** primeiro protótipo local, com preparação e partidas entre dois convidados.  
**Orientação mais recente do usuário:** documentar o trabalho e não continuar os testes por enquanto. Após essa orientação, o trabalho desta etapa passou a ser exclusivamente de documentação.

Este documento registra o estado real do projeto. A presença de uma funcionalidade no código não significa que ela esteja equilibrada, pronta para produção ou completamente verificada.

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

**Registro histórico:** esta tabela descreve a primeira versão 0.1.0. As regras vigentes após `nextmoves.md` estão na seção 20 e em `docs/regras-prototipo.md`.

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

**Histórico da versão 0.1.0.** A economia e a conservação descritas abaixo foram substituídas pelo orçamento de Poder, avanço e custo de atualização da versão 0.2.0, registrados na seção 20.

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
