import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
import { Client, type Room } from '@colyseus/sdk';
import { abilityById, CLOCK_MS, STARTING_HEALTH } from '../lib/catalog';
import type { Snapshot } from '../lib/types';

async function until(check: () => boolean, message: string, timeout = 5000) {
  const end = Date.now() + timeout;
  while (!check()) {
    if (Date.now() > end) throw new Error(`Timed out: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
function observe(room: Room) {
  const observed = { state: null as Snapshot | null, errors: [] as string[], updates: 0, draftCompletions: 0 };
  room.onMessage('snapshot', (state: Snapshot) => { observed.state = state; observed.updates++; });
  room.onMessage('error', (error: string) => observed.errors.push(error));
  room.onMessage('draftComplete', () => observed.draftCompletions++);
  room.onMessage('clock', (clocks: Snapshot['clocks']) => { if (observed.state) observed.state.clocks = clocks; });
  room.send('sync');
  return observed;
}

test('two real clients: private draft, validation, identical shop, play, reconnect and terminal state', { timeout: 30000 }, async t => {
  const port = randomInt(31000, 49000);
  const server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { cwd: process.cwd(), env: { ...process.env, GAME_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  server.stdout.on('data', data => { output += data.toString(); });
  server.stderr.on('data', data => { output += data.toString(); });
  const rooms: Room[] = [];
  t.after(async () => {
    for (const room of rooms) {
      room.reconnection.enabled = false;
      if (room.connection?.isOpen) await room.leave().catch(() => {});
    }
    server.kill('SIGTERM');
  });
  await until(() => output.includes('Servidor de partidas disponível'), 'game server boot: ' + output);
  const client = new Client(`ws://127.0.0.1:${port}`);
  const first = await client.create('friends', { name: 'Alice' }); rooms.push(first);
  const a = observe(first);
  await until(() => !!a.state, 'initial snapshot');
  assert.equal(a.state!.draft.gold, 12);
  assert.deepEqual(a.state!.playerStats, { health: STARTING_HEALTH, timeMs: CLOCK_MS });
  assert.equal(a.state!.game, null);
  await assert.rejects(client.join('friends', { name: 'Uninvited' }));
  const second = await client.joinById(first.roomId, { name: 'Beto' }); rooms.push(second);
  const b = observe(second);
  await until(() => !!b.state && a.state?.players.length === 2, 'both seats');
  assert.deepEqual(a.state!.shop, b.state!.shop);
  assert.equal(a.state!.shop.length, 5);
  assert.notEqual(a.state!.you, b.state!.you);
  assert.ok(a.state!.players.every(player => !('draft' in player)));
  await assert.rejects(client.joinById(first.roomId, { name: 'Third' }));

  const white = a.state!.you === 'w' ? { room: first, probe: a } : { room: second, probe: b };
  const black = a.state!.you === 'b' ? { room: first, probe: a } : { room: second, probe: b };
  const originalShop = [...white.probe.state!.shop];
  assert.equal(white.probe.state!.refreshCost, 1);
  const spell = black.probe.state!.shop.map(id => abilityById(id)!).find(item => item.type === 'spell')!;
  const expectedTime = CLOCK_MS + (spell.trigger === 'time' ? spell.timeBonusSeconds! * 1000 : 0);
  const expectedHealth = STARTING_HEALTH + (spell.trigger === 'health' ? spell.healthBonus! : 0);
  black.room.send('draft', { type: 'buySpell', ability: spell.id });
  await until(() => black.probe.state?.draft.spells.includes(spell.id) === true, 'buy spell');
  await until(() => black.probe.draftCompletions === 1, 'spell purchase confirmation');
  assert.equal(black.probe.state!.draft.gold, 12 - spell.price);
  assert.deepEqual(black.probe.state!.playerStats, { health: expectedHealth, timeMs: expectedTime });
  const blackShopAfterSpell = [...black.probe.state!.shop];
  const ability = white.probe.state!.shop.map(id => abilityById(id)!).find(item => item.type === 'weapon' && item.classes.includes('minor'))!;
  white.room.send('draft', { type: 'equip', square: 12, ability: ability.id });
  await until(() => white.probe.state?.draft.board[12]?.weapon === ability.id, 'equip pawn');
  assert.notDeepEqual(white.probe.state!.shop, originalShop);
  assert.deepEqual(black.probe.state!.shop, blackShopAfterSpell);
  await until(() => white.probe.draftCompletions === 1, 'draft confirmation');
  assert.equal(white.probe.state!.draft.gold, 12 - ability.price);
  const shopBeforeRefresh = [...white.probe.state!.shop];
  white.room.send('refreshShop');
  await until(() => white.probe.state?.refreshCost === 2, 'shop refresh');
  assert.ok(white.probe.state!.shop.every(id => !shopBeforeRefresh.includes(id)), 'refresh excludes the currently visible offers');
  assert.equal(white.probe.state!.draft.gold, 11 - ability.price);
  assert.deepEqual(black.probe.state!.shop, blackShopAfterSpell);
  assert.equal(black.probe.state!.draft.board[12], null);
  assert.equal(black.probe.state!.game, null);
  white.room.send('draft', { type: 'sacrifice', square: 4 });
  await until(() => white.probe.errors.length > 0, 'king cannot be sacrificed');
  await until(() => white.probe.draftCompletions === 3, 'rejected draft confirmation');
  assert.ok(white.probe.errors.pop()!.includes('Rei'));
  white.room.send('draft', { type: 'equip', square: 12, ability: ability.id, gold: 999 });
  await until(() => white.probe.errors.length > 0, 'forged command rejected');
  assert.equal(white.probe.errors.pop(), 'Comando inválido.');

  first.send('ready', true); second.send('ready', true);
  await until(() => a.state?.phase === 'reveal' && b.state?.phase === 'reveal', 'simultaneous reveal');
  assert.deepEqual(a.state!.game!.board, b.state!.game!.board);
  assert.equal(b.state!.game!.board[12]?.weapon, ability.id);
  assert.equal(black.probe.state!.clocks.b, expectedTime);
  assert.deepEqual(black.probe.state!.game!.spells.b, [], 'automatic spell consumed at reveal');
  const goldBefore = white.probe.state!.draft.gold;
  white.room.send('draft', { type: 'sacrifice', square: 8 });
  await until(() => white.probe.errors.length > 0, 'locked preparation');
  assert.equal(white.probe.state!.draft.gold, goldBefore);
  white.probe.errors.length = 0;

  await until(() => white.probe.state?.phase === 'playing', 'clock start after reveal', 10000);
  assert.equal(white.probe.state!.clocks.b, expectedTime);
  black.room.send('move', { from: 52, to: 36, ply: 0 });
  await until(() => black.probe.errors.length > 0, 'out of turn rejection');
  assert.match(black.probe.errors.pop()!, /sua vez/);
  white.room.send('move', { from: 12, to: 28, ply: 0 });
  await until(() => white.probe.state?.game?.ply === 1 && black.probe.state?.game?.ply === 1, 'accepted move');
  assert.deepEqual(white.probe.state!.game!.board, black.probe.state!.game!.board);
  assert.ok(white.probe.state!.clocks.w < CLOCK_MS);
  black.room.send('useSpell', spell.id);
  await until(() => black.probe.errors.length > 0, 'manual spell rejected');
  assert.match(black.probe.errors.pop()!, /automaticamente/);
  assert.ok(black.probe.state!.clocks.b <= expectedTime, 'no double bonus');
  assert.equal(black.probe.state!.game!.ply, 1, 'the spell does not consume a move');
  black.room.send('move', { from: 52, to: 36, ply: 0 });
  await until(() => black.probe.errors.length > 0, 'stale position rejected');
  assert.match(black.probe.errors.pop()!, /anterior/);

  const token = black.room.reconnectionToken;
  black.room.reconnection.enabled = false;
  black.room.connection.close();
  await until(() => white.probe.state!.players.some(p => p.color === 'b' && !p.connected), 'disconnect detected');
  const reconnected = await client.reconnect(token); rooms.push(reconnected);
  const resumed = observe(reconnected);
  await until(() => resumed.state?.game?.ply === 1, 'recovered position');
  assert.deepEqual(resumed.state!.shop, black.probe.state!.shop);
  assert.ok(resumed.state!.clocks.b < expectedTime, 'disconnect does not pause the clock');
  reconnected.send('move', { from: 52, to: 36, ply: 1 });
  await until(() => white.probe.state?.game?.ply === 2, 'play after reconnection');
  reconnected.send('resign');
  await until(() => white.probe.state?.phase === 'finished', 'resignation');
  assert.deepEqual(white.probe.state!.result, { winner: 'w', reason: 'Desistência' });
  white.room.send('move', { from: 6, to: 21, ply: 2 });
  await until(() => white.probe.errors.length > 0, 'finished game immutable');
  assert.equal(white.probe.state!.game!.ply, 2);
  const fresh = await client.create('friends', { name: 'Nova' }); rooms.push(fresh);
  const freshState = observe(fresh);
  await until(() => !!freshState.state, 'fresh preparation');
  assert.equal(freshState.state!.draft.gold, 12);
  assert.ok(freshState.state!.draft.board.every(p => !p?.weapon && !p?.enchantment));
});
