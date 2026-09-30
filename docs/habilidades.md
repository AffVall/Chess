# Editar habilidades

O catálogo fica em **`lib/abilities.ts`**, compartilhado pela interface e pelo servidor. `lib/catalog.ts` mantém orçamento, peças, funções da loja e reexporta o catálogo para os componentes existentes.

## Alterar uma carta

Edite o objeto correspondente em `ABILITIES`:

| Campo | Uso |
| --- | --- |
| `id` | Identificador único e estável. Não renomeie durante salas abertas. |
| `name`, `description` | Nome e regra exibidos na carta. |
| `short` | Texto curto legado, atualmente não exibido na loja. |
| `price` | Custo em moedas; também entra no Poder. |
| `classes` | `minor`: peão, cavalo, bispo. `major`: torre, dama. |
| `type` | `weapon`, `enchantment` ou `spell`. |
| `rarity` | `common`, `uncommon`, `rare` ou `legendary`. |
| `badge` | Símbolo de identificação legado. Os ícones visuais atuais usam a categoria. |
| `moves` | Deslocamentos adicionais sem captura. |
| `captures` | Deslocamentos adicionais para captura, que também ameaçam casas. |
| `trigger` | Efeito especial implementado no motor. |
| `timeBonusSeconds` | Segundos iniciais extras para feitiços com `trigger: 'time'`; use inteiro positivo. |
| `healthBonus` | Vida inicial extra para feitiços com `trigger: 'health'`; use inteiro positivo. |

## Nova arma de movimento

Adicione um objeto à lista. Exemplo de estrutura (não incluído automaticamente):

```ts
{
  id: 'passo-duplo-lateral',
  name: 'Passo duplo lateral',
  short: '',
  description: 'Salta duas casas para o lado, sem capturar.',
  price: 6,
  classes: ['minor'],
  type: 'weapon',
  rarity: 'rare',
  badge: '↔',
  moves: [[2, 0], [-2, 0]],
}
```

Cada par é `[coluna, avanço]`: `[0, 1]` aponta para a frente de quem controla a peça; `[0, -1]`, para trás. O motor ajusta a direção às brancas e pretas. Deslocamentos maiores que uma casa são saltos: não verificam bloqueio intermediário. Não use esse formato para representar movimentos deslizantes de torre/bispo.

Armas declaradas com os deslocamentos existentes entram na loja, no diagrama e na validação de jogadas sem alterar componentes. O sorteio usa o catálogo completo e procura incluir armas das duas classes, encantamento e feitiço. Mantenha cartas suficientes para preencher as cinco ofertas e suas reposições.

## Efeitos novos

Descrição não executa uma regra. Isca, Segundo coração e o bônus de tempo possuem lógica em `lib/chess.ts`, `lib/draft.ts`, `lib/player-stats.ts` e `server/ChessRoom.ts`. Alguns trechos ainda identificam Isca/Segundo coração por `id`; mantenha esses identificadores. Criar um gatilho novo exige implementar sua resolução e validação no servidor, além de descrevê-lo no catálogo.

Reinicie interface e servidor após alterar o catálogo e crie uma sala nova. Salas em andamento não possuem uma cópia isolada da versão das habilidades. Registre alterações de balanceamento em `docs/historico.md` e atualize `RULESET` quando mudar regras, custos ou efeitos.

## Feitiços de atributos (0.4.1)

| ID | Bônus | Moedas |
| --- | --- | ---: |
| `time-spark` | +60 segundos | 3 |
| `time-reserve` | +120 segundos | 5 |
| `time-vault` | +180 segundos | 8 |
| `vitality` | +200 de vida | 3 |
| `greater-vitality` | +400 de vida | 5 |
| `royal-vitality` | +600 de vida | 8 |

Tempo usa `trigger: 'time'` e `timeBonusSeconds`; vida usa `trigger: 'health'` e `healthBonus`. `startingStats` soma os atributos para a prévia e para a inicialização no servidor. O relógio recebe os segundos convertidos em milissegundos; `Game.health`/`maxHealth` são inicializados uma única vez em `createGame`. Reconexão não reaplica esses bônus.

Altere valor e descrição juntos. Novos valores de tempo e vida precisam apenas de uma entrada no catálogo com o gatilho existente; não crie um gatilho por quantidade. Os ícones reconhecem a categoria do efeito. Cada ID pode ser comprado uma vez; IDs diferentes acumulam. A ativação continua no início da partida, mas as cartas mostram apenas o bônus. Vida adicional não permite sobreviver ao fim do relógio.

Para os danos por captura, edite `CAPTURE_DAMAGE` em `lib/combat.ts`. Esses valores são independentes dos pontos de material de preparação.
