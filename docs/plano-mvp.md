# Plano de produto e tecnologia — jogo de xadrez online

**Status:** histórico da proposta inicial, anterior às correções do usuário. A implementação foi autorizada e começou. As regras atuais estão em [regras-prototipo.md](regras-prototipo.md), que substituem recomendações conflitantes abaixo.  
**Nome do projeto:** provisório  
**Data:** 27 de setembro de 2026

## Resumo executivo

Um jogo de estratégia para navegador que mantém o tabuleiro, o objetivo e a leitura do xadrez tradicional, mas permite montar um exército e equipar algumas habilidades antes da partida. O servidor valida a preparação, cada jogada e o resultado. O primeiro lançamento concentra-se em partidas entre pessoas, com interface responsiva, salas privadas e um modo ranqueado com catálogo e regras fixos.

**Recomendação de formato para o MVP:** um único conjunto de regras, um orçamento de 39 pontos por jogador, Rei obrigatório, posições iniciais fixas, catálogo de habilidades pequeno e igual para todos. Casuais e ranqueadas compartilham as regras; amigos usam as mesmas regras por padrão. IA, loja com dinheiro real e progressão de poder permanente ficam fora do MVP.

## 1. Visão geral e pilares

1. **Xadrez reconhecível:** Rei, xeque, xeque-mate, turnos e objetivo seguem a lógica tradicional. Habilidades têm texto explícito e não resolvem ambiguidades por julgamento do servidor.
2. **Preparação estratégica:** escolhas de peças e habilidades são feitas antes da partida sob o mesmo teto de 39 pontos.
3. **Justiça competitiva:** o servidor é a fonte de verdade; as regras, versões e opções do ranqueado são iguais para todos.
4. **Legibilidade:** cada habilidade mostra custo, alvo, condição, duração, limite de uso e interação com xeque/captura antes de ser equipada.
5. **Acesso simples:** a interface funciona com toque ou mouse, sem depender de arrastar peças.

## 2. Regras definidas e decisões pendentes

### Definido

- Navegador em computadores e celulares; TypeScript como linguagem principal.
- Partidas casuais, com amigos e ranqueadas; sem IA adversária no MVP.
- Custos de referência: peão 1, cavalo 3, bispo 3, torre 5, dama 9.
- Teto de 39 pontos por exército, correspondente às 15 peças não-Rei do lado tradicional.
- Composição e melhorias definidas antes da partida; validação no servidor.
- Sem melhorias de poder desbloqueadas permanentemente no MVP e sem vantagem paga.

### Precisa de decisão

- Se moedas de pós-partida compram poder para jogos futuros ou apenas itens sem impacto de jogo.
- Arranjo das peças no começo da partida.
- Lista, custos e interações das primeiras habilidades, incluindo o que significa uma peça “ser destruída duas vezes”.
- Relógio, janela de reconexão e regras de empate por repetição/limite de lances.
- Provedor de login e hospedagem, que podem ser escolhidos depois da aprovação do escopo.

## 3. Fluxo de preparação e partida

1. **Escolher modo:** casual, ranqueado ou criar/entrar em sala de amigos.
2. **Montar o exército:** consultar Rei obrigatório, peças, custos e espaços iniciais; adicionar ou remover peças até 39 pontos.
3. **Equipar habilidades:** selecionar uma peça-alvo e uma habilidade compatível. A interface atualiza custo total, pontos restantes, usos e regras.
4. **Sacrificar, se aplicável:** uma peça que não vai à partida pode liberar espaço no orçamento. Sacrifício é uma decisão de preparação, não perda permanente de inventário. Cada habilidade que exija uma quantidade específica de sacrifícios precisa dizer isso claramente.
5. **Validar e confirmar:** o servidor recalcula composição, compatibilidade, custo, versão de regras e limites. A configuração confirmada fica congelada para a partida.
6. **Encontrar adversário:** matchmaking ou convite/código privado; ambos confirmam prontidão.
7. **Jogar:** o cliente envia intenções de jogada. O servidor valida turno, movimento, xeque, habilidade e relógio; atualiza estado e retransmite o resultado.
8. **Encerrar:** mostrar resultado, motivo, histórico de lances e recompensa definida para o modo; oferecer revanche ou retorno ao menu.

### Regras propostas para a montagem

- O Rei é obrigatório, não tem custo e não recebe habilidades no primeiro catálogo.
- No primeiro catálogo, habilidades podem ser equipadas apenas em cavalo, bispo, torre ou dama; peões e Rei ficam sem melhorias para evitar interações ambíguas com promoção e xeque.
- Até 15 outras peças podem ocupar as casas de saída do lado do jogador; o total gasto em peças e habilidades não passa de 39.
- Para preservar a abertura conhecida no primeiro protótipo: Rei fixo na casa central tradicional da fileira de trás; peões apenas na fileira da frente; as outras sete casas da fileira de trás recebem cavalo, bispo, torre, dama ou ficam vazias. Promoção segue a regra tradicional.
- Movimento, roque, captura en passant, promoção e xeque seguem as regras tradicionais sempre que as peças e casas necessárias estiverem presentes.
- Habilidade tem custo próprio em pontos e limites declarados; uma peça recebe no máximo uma habilidade no MVP. Não se acumulam efeitos não previstos na ficha.
- Habilidades não podem deixar o Rei em xeque ao final da ação. O Rei não pode ser capturado. Uma habilidade que altere captura, xeque ou vitalidade precisa ser descrita como regra especial e aprovada antes de entrar no catálogo.
- **Interpretação recomendada de “sacrifício”:** não escolher uma peça para poder gastar seus pontos em outra parte do mesmo orçamento. Não há destruição de itens da conta nem moeda adicional. Se o objetivo for exigir “sacrificar três peças”, a habilidade deve dizer se são três casas de peça vazias, três pontos de valor sacrificados ou três unidades omitidas; escolher uma definição por habilidade.

## 4. Orçamento, sacrifícios, habilidades e economia

### Orçamento

Usar uma única conta visível: `soma dos custos das peças ativas + soma dos custos das habilidades ≤ 39`. Exemplo tradicional: 8 peões + 2 cavalos + 2 bispos + 2 torres + 1 dama = 39, sem habilidades. O jogador pode trocar peças por melhorias, mas precisa aceitar o custo em força/quantidade. Nenhuma habilidade pode ser comprada acima do teto.

### Habilidades

Cada ficha publicada precisa conter: ID e versão; custo; tipos de peça permitidos; alvo; descrição do efeito; quando ativa; número de usos; duração/cooldown, se houver; interações com captura, xeque, promoção, empate e desconexão; exemplos positivos e casos inválidos. A lista competitiva é versionada e só muda entre temporadas ou partidas, nunca durante um jogo.

**Recomendação de escopo:** começar com 2–3 habilidades de baixa complexidade, sem pontos de vida nem captura em múltiplos turnos. A ideia de exigir duas “destruições” muda radicalmente a noção tradicional de captura e deve ficar como decisão de produto até que se defina se a peça sobrevive à primeira captura, pode continuar dando xeque e como se registra isso no tabuleiro.

### Economia: opções e recomendação

| Opção | Moedas permanecem? | Uso | Consequência |
|---|---|---|---|
| A. Poder persistente | Sim | Compra peças/habilidades para partidas futuras | Dá variedade, mas cria vantagem por tempo de jogo; precisa equalização no ranqueado. Também entra em tensão com “sem melhorias permanentes” no MVP. |
| B. Orçamento temporário | Não | O mesmo orçamento 39 recomeça em cada preparação | Competitivo e simples; moedas pós-partida não compram poder futuro. |
| C. Moeda persistente sem poder (recomendada) | Sim | Itens cosméticos/perfil; o catálogo de jogo é gratuito e igual para todos | Preserva recompensas sem afetar o exército. Adia a loja de poder até validar balanceamento. |

**Recomendação concreta:** adotar C no MVP, se uma recompensa persistente for importante; conceder 5 moedas por partida concluída, independentemente de vitória, empate ou derrota; sem bônus por objetivos no início. Uma desistência/abandono intencional não dá moeda. A moeda só compra personalização visual, sem efeito em jogabilidade. Não há compra com dinheiro real. Se o requisito de moedas para comprar peças/habilidades futuras for inegociável, escolher A e aceitar que a ranqueada deve emprestar/acesso livre a todo o catálogo e ignorar inventário; essa exceção também precisa da sua aprovação.

**Como evitar vantagem acumulada:** orçamento 39 e catálogo ranqueado idêntico, sem poderes bloqueados por conta, nível ou saldo. Se futuramente houver desbloqueios, eles não podem restringir acesso competitivo. Separar na interface e no banco moeda de jogo e qualquer produto pago futuro; não incluir pagamentos reais no MVP.

## 5. Posição inicial: opções

1. **Posições tradicionais, escolha limitada de peças (recomendada):** Rei e fileira de peões mantêm casas fixas; peças da fileira de trás podem ser substituídas por tipos elegíveis ou casas deixadas vazias. É mais simples de validar e mantém a leitura visual familiar.
2. **Posicionamento livre em zonas:** distribuir peças em casas autorizadas do próprio território. Amplia estratégia, mas cria mais combinações de abertura e exige balanceamento e interface maiores.
3. **Formações predefinidas:** escolher entre modelos prontos. Dá controle e leitura rápida, mas exige desenhar e balancear vários modelos antes de ter dados.

A opção 1 é a recomendação do MVP. O formato exato de slots acima é uma proposta para evitar uma tela de montagem ambígua; requer aprovação porque restringe onde certos tipos podem começar.

## 6. Vitória, empate, abandono e desconexão

- **Vitória:** xeque-mate; desistência; ou derrota por tempo. Nenhuma captura do Rei.
- **Empate:** afogamento; acordo mútuo; repetição tripla reivindicada e confirmada pelo servidor; regra dos 50 lances reivindicada; ou material insuficiente, se o motor conseguir verificar com segurança o catálogo ativo. A chave de repetição inclui estado das habilidades (usos restantes/efeitos temporários), além do tabuleiro e turno.
- **Relógio recomendado:** 10 minutos por jogador, mais 5 segundos por lance; relógio só é alterado pelo servidor.
- **Desconexão:** o relógio segue correndo; permitir reconexão por até 60 segundos. Se o tempo acabar antes, perde por tempo; se a janela expirar sem reconexão, perde por abandono. O cliente recupera o estado confirmado e o histórico ao voltar.
- **Falha do servidor:** guardar estado e lances aceitos para recuperar a sala ou marcar partida interrompida sem alterar ranking/recompensa. Impedir que reenvio da mesma jogada ou resultado aplique duas vezes.

## 7. Arquitetura técnica e custos

- **Interface:** Next.js + React + TypeScript, com App Router para páginas de entrada, perfil, preparação, histórico e navegação. A tela da partida é um cliente React responsivo que se liga ao servidor de sala. Next.js documenta App Router, componentes de servidor/cliente e estrutura por rotas; não deve hospedar a lógica autoritativa da partida. ([Next.js App Router](https://nextjs.org/docs/app), [componentes servidor e cliente](https://nextjs.org/docs/app/getting-started/server-and-client-components)).
- **Partidas online:** um serviço Node.js/TypeScript separado usando Colyseus. Cada sala mantém estado de uma partida; o cliente manda comandos, e só o servidor muta o estado. Colyseus oferece salas, sincronização de estado e matchmaking. ([Visão geral Colyseus](https://docs.colyseus.io/), [salas](https://docs.colyseus.io/room), [sincronização de estado](https://docs.colyseus.io/state), [matchmaking](https://docs.colyseus.io/matchmaker)).
- **Regras:** pacote TypeScript puro compartilhado para tipos, catálogo e validação determinística. O servidor é a autoridade; o navegador pode usar o pacote apenas para prévias. Avaliar `chess.js` como base/referência para movimentos tradicionais, xeque e xeque-mate; habilidades precisam de uma camada de regras própria e não se deve presumir que a biblioteca implemente efeitos customizados. ([chess.js no GitHub](https://github.com/jhlywa/chess.js)).
- **Persistência:** PostgreSQL para contas, configurações, resultados, ranking e histórico. Guardar o estado atual e cada ação aceita com versão do conjunto de regras. Transações protegem atualizações relacionadas, por exemplo resultado, ranking e ledger de moedas, para evitar recompensa duplicada. JSONB pode guardar snapshots/versionados, enquanto colunas relacionais mantêm IDs, datas, modo e resultado consultáveis. ([transações PostgreSQL](https://www.postgresql.org/docs/current/tutorial-transactions.html), [tipos JSON](https://www.postgresql.org/docs/current/datatype-json.html)).
- **Acesso ao banco:** SQL parametrizado com driver `pg` e migrações versionadas; evitar escolher ORM antes de haver necessidade. Migrações exigem disciplina manual, mas reduzem abstrações e dependências num MVP pequeno.
- **Implantação inicial:** web, API e um processo Colyseus, PostgreSQL gerenciado ou local de desenvolvimento. Manter Colyseus em processo persistente apto a conexões em tempo real; não colocar partidas em função serverless de curta duração. Sem Redis, fila ou microserviços no primeiro deploy. A escalabilidade horizontal de salas traz custo operacional adicional de presença e matchmaking entre processos; só adicionar após métricas de carga justificarem.
- **IA futura:** o estado serializado e as regras versionadas dão uma interface para um processo Python experimentar busca/avaliação mais tarde. Python não participa do fluxo de jogada nem é dependência do MVP.

**Custos de complexidade:** duas aplicações executáveis (Next.js e servidor de jogo); coordenação de deploy/endpoints; estado em memória com recuperação; regras tradicionais mais extensões próprias; autenticação entre web/API/sala; persistência idempotente de resultado. Colyseus reduz trabalho de WebSocket e sincronização, mas não elimina regras, segurança, matchmaking ou operação.

## 8. Modelo inicial de dados

- `users`: id, handle único, credencial/provedor de login, data de criação, estado da conta.
- `loadouts`: id, user_id, nome, versão de regras, estado (rascunho/confirmado), total de pontos, hash da configuração, data de edição.
- `loadout_units`: loadout_id, slot, tipo, custo, id estável da unidade, indicação de slot vazio/sacrifício se necessário.
- `loadout_abilities`: loadout_id, unit_id, ability_id, versão, custo e parâmetros aprovados.
- `matches`: id, modo, status, ruleset_id, jogadores/brancas-negras, loadout hashes, horários, resultado/motivo, rating antes/depois, versão do servidor.
- `match_actions`: match_id, sequência, jogador, comando validado, estado/hash resultante, relógios, timestamp; append-only após aceito.
- `match_snapshots`: match_id, sequência, estado JSONB, hash, timestamp para recuperação rápida.
- `rating_history`: user_id, match_id, rating antes/depois, algoritmo/versão.
- `currency_ledger` (se opção C aprovada): user_id, match_id opcional, delta, motivo, chave idempotente, timestamp. Saldo é derivado ou atualizado atomicamente com o ledger.
- `rulesets` e `ability_catalog_versions`: identificador, versão, configuração publicada, data de vigência; uma partida sempre fixa as versões usadas.

## 9. Estrutura de telas

1. Entrada, criação/recuperação de conta e nome público.
2. Início: atalhos para casual, ranqueado e amigos; status/partida em andamento.
3. Arsenal: orçamento 39, catálogo com busca/filtros, slots de saída, custo e validadores em tempo real.
4. Detalhe de peça/habilidade: efeito, custo, compatibilidade, limite e exemplos.
5. Revisão e confirmação: composição final, pontos, slots vazios/sacrifícios, regras e versão.
6. Sala/matchmaking: código privado, prontidão, conexão e adversário encontrado.
7. Tabuleiro: grade que adapta a telas pequenas, toque para selecionar/destino, indicação de xeque/última jogada/habilidade, relógio, lances, ações de empate/desistência.
8. Resultado: vitória/empate/motivo, histórico, recompensa, revanche.
9. Perfil: rating e partidas recentes; cosméticos/saldo apenas se economia C for aprovada.

## 10. Segurança e prevenção básica contra trapaças

- Nunca aceitar estado, peça movida, resultado, saldo ou relógio declarados pelo cliente como verdade.
- Validar formato e tamanho das mensagens; verificar usuário autenticado, assento da sala, turno, origem e limites de frequência.
- Validar cada jogada contra estado atual e regras/versionamento da sala; rejeitar comandos fora de turno, movimento impossível, habilidade inválida, replay e alteração de loadout após início.
- Usar identificadores de ação/resultado idempotentes; consultas parametrizadas; segredos só no servidor; limitar tentativas de código privado e matchmaking.
- Persistir hash de loadout/regras/estado e histórico append-only para suporte e auditoria básica.
- Tokens de reconexão não são credenciais permanentes; limitar sessão e validar sua posse pelo servidor.
- Logs operacionais registram eventos úteis sem guardar senha, token ou dados pessoais desnecessários.

## 11. Matchmaking e ranking

- **Casual:** busca de adversário e partida sem alteração de rating.
- **Amigos:** sala não listada com código/convite, dois assentos e as mesmas regras/catalogo padrão; anfitrião não pode mudar regra competitiva escondida. Opções customizadas ficam para depois.
- **Ranqueado:** apenas fila global para o ruleset publicado; servidor recarrega e valida loadout, teto de 39, compatibilidade e versões antes de aceitar. Configuração inválida não entra em fila; mudanças no catálogo não alteram partidas em andamento.
- **Rating:** começar com Elo interno simples (valor inicial e fator de atualização configuráveis), partidas de colocação e rating visível separado de tier visual. Expandir gradualmente a faixa de rating aceitável enquanto espera, com limite máximo de espera; mostrar fila sem prometer duração exata.
- Considerar rating e cor/primeiro turno nas análises; inicialmente parear por rating e ruleset, não por habilidade/composição (não há evidência inicial para um modelo mais complexo). Monitorar diferenças por composição e ajustar regras/catálogo, não mascarar desequilíbrio no pareamento.

## 12. Plano de balanceamento

### Dados a registrar

- Resultado, cor/primeiro turno, rating dos jogadores, duração, lances, desistência/desconexão.
- Peças/habilidades selecionadas e realmente usadas; versões, custo total e espaços vazios.
- Vitórias e derrotas por tipo de peça, habilidade, combinação e composição; frequência de escolha e taxa de uso.
- Resultados por faixa de rating e por jogador recorrente/novo, evitando expor identidade em relatórios de produto.
- Tempo até terminar, percentual de partidas abandonadas, quedas por turno e incidentes técnicos.

### Ciclo simples

1. Fazer partidas internas com combinações planejadas, cores alternadas e jogadores de níveis diferentes antes da fila ranqueada.
2. Publicar catálogo pequeno em casual/beta; acompanhar métricas de exposição e resultado por versão.
3. Comparar vitórias com frequência de escolha, habilidade do jogador, cor, duração e composição adversária; olhar também confrontos e extremos, não só média global.
4. Alterar uma variável por versão (custo, elegibilidade ou efeito), registrar razão e resultado esperado; manter changelog, versão e histórico de métricas.
5. Promover ao ranqueado apenas quando regras, explicações, métricas e correções de falhas estiverem prontos. Acompanhar pós-publicação e reverter versão se necessário.

Volume sozinho não prova equilíbrio: jogadores escolhem habilidades em que já são bons, combinações e cores não aparecem na mesma proporção, diferenças de rating confundem resultados, e média próxima de 50% pode ocultar uma habilidade dominante em um confronto e inútil em outro. Relatar tamanho de amostra, distribuição, intervalos de incerteza e recortes; não tomar decisão por uma única taxa agregada.

## 13. Escopo do MVP e itens adiados

### Incluído

- Conta e perfil básicos; catálogo aberto para todos.
- Preparação de exército com 39 pontos, composição/slots iniciais aprovados e 2–3 habilidades simples e versionadas.
- Partidas online 1 contra 1 com regra autoritativa, relógio, reconexão, histórico e resultado persistido.
- Casual, sala privada por código e ranqueado com validação rigorosa; rating Elo básico.
- Interface responsiva; resultado e histórico; análise de eventos para balanceamento.
- Recompensa sem dinheiro real, apenas se economia C for aprovada.

### Adiado

- IA, chat, torneios, espectador, replay visual, clãs, temporadas, loja com dinheiro real, cosméticos extensos, desbloqueios de poder, matchmaking por composição, habilidades com múltiplos pontos de vida/estados complexos, tabuleiro ou posições customizadas, app nativo, multi-região e escala horizontal.

## 14. Roadmap por fases

1. **Aprovação e especificação:** validar orçamento, posição, primeiras habilidades, economia, relógio e derrotas por desconexão; congelar um ruleset inicial.
2. **Fundação:** estrutura Next.js + serviço Colyseus + PostgreSQL; tipos compartilhados; catálogo versionado e fluxo de deploy local.
3. **Motor de regras:** posições, movimento tradicional, validação, turnos, xeque/mate/empates e contrato para habilidades; estado determinístico.
4. **Montagem:** catálogo, orçamento, slots, habilidades, revisão, gravação e revalidação no servidor.
5. **Partida ao vivo:** salas casuais/privadas, sincronização, relógio, reconexão, persistência, resultado e histórico.
6. **Ranqueado:** validação estrita de regras/loadout, fila por rating, cálculo Elo e histórico de rating.
7. **Beta e balanceamento:** partidas internas, instrumentação, ajustes de interface/regra, revisão de métricas e primeira versão pública pequena.

Cada etapa deve terminar com uma demonstração funcional e passos de verificação manual; automatizar apenas os testes que forem acordados durante a implementação.

## 15. Critérios de aceite do MVP

- Uma pessoa consegue criar conta, montar e rever um exército que nunca excede 39 pontos; tentativa inválida é recusada pelo servidor.
- Catálogo expõe custo, efeito e condições de cada habilidade; composição e habilidades ficam congeladas ao entrar na partida.
- Dois jogadores em desktop ou celular concluem uma partida ao vivo; apenas o jogador da vez pode enviar ação legal e estado final é igual nos dois clientes.
- Regras tradicionais funcionam, incluindo xeque, xeque-mate, promoção, roque, captura en passant, empates acordados e relógio; habilidade não pode produzir estado ilegal do Rei.
- Resignação, empate, tempo, reconexão e abandono dão resultado determinístico; falha/reenvio não duplica rating ou recompensa.
- Casual não altera ranking; sala privada não aparece em busca pública; ranqueada recusa versão ou loadout inválidos.
- Histórico tem lances, resultado, versão de regras, loadouts e hash; métricas agregadas podem ser calculadas por peça/habilidade/rating/cor sem identificar publicamente jogadores.
- Catálogo competitivo pode ser alterado entre versões com registro do que mudou; partidas em andamento mantêm a sua versão original.
- Nenhuma compra com dinheiro real ou desbloqueio de poder é necessária para usar qualquer opção do ranqueado.

## Aprovações solicitadas antes de implementar

1. **Economia:** aprovar C (moeda persistente apenas cosmética; 5 por partida concluída, sem bônus de objetivo) ou escolher A/B. Esta é a maior decisão de escopo.
2. **Posição inicial:** aprovar o arranjo recomendado de Rei fixo, peões na fileira frontal e sete casas de trás flexíveis/vazias, ou pedir zona livre/formações.
3. **Habilidades:** aprovar catálogo inicial de 2–3 habilidades simples; deixar a ideia de duas destruições fora até especificar precisamente seus estados e interações.
4. **Regras de partida:** aprovar relógio 10+5 e reconexão de 60s com relógio correndo; confirmar a lista de empates indicada.
5. **Escopo geral:** aprovar Next.js + React, Colyseus, PostgreSQL, motor compartilhado TypeScript, sem IA nem compras reais.

## Referências técnicas oficiais

- [Next.js App Router](https://nextjs.org/docs/app) e [Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).
- [Colyseus — visão geral](https://docs.colyseus.io/), [Rooms](https://docs.colyseus.io/room), [State Synchronization](https://docs.colyseus.io/state), [Matchmaking](https://docs.colyseus.io/matchmaker) e [reconexão](https://docs.colyseus.io/room/reconnection).
- [PostgreSQL — transações](https://www.postgresql.org/docs/current/tutorial-transactions.html) e [JSON types](https://www.postgresql.org/docs/current/datatype-json.html).
- [chess.js — código e documentação do projeto](https://github.com/jhlywa/chess.js).
