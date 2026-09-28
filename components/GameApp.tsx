'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, type Room } from '@colyseus/sdk';
import { abilityById, BUYABLE, MATERIAL_CAP, NAMES, STARTING_GOLD, VALUES, type Color } from '@/lib/catalog';
import { createDraft, inHome, material, other, spentOnAbilities, squareName } from '@/lib/draft';
import { inCheck } from '@/lib/chess';
import type { DraftAction, Move, Snapshot } from '@/lib/types';
import { Board } from './Board';
import { Piece } from './Piece';
import { AbilityDiagram } from './AbilityDiagram';
import { Modal } from './Modal';

const TOKEN_KEY = 'gambito-room-token';
function endpoint() {
  return process.env.NEXT_PUBLIC_GAME_SERVER_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:2567`;
}
function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (/room.*(not found|does not exist)|not found|expired/i.test(message)) return 'Sala não encontrada ou convite expirado. Confira o código.';
  if (/locked|full|complete/i.test(message)) return 'Esta sala já está completa ou a partida começou.';
  if (/fetch|network|ECONN|connection/i.test(message) || !message) return 'Não foi possível conectar. Confira se o servidor de partidas está disponível.';
  return message;
}
function clockLabel(ms: number) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
const demo = createDraft('w').board.map((p, square) => p ?? createDraft('b').board[square]);
demo[12] = { ...demo[12]!, ability: 'spear' };
demo[1] = { ...demo[1]!, ability: 'knight-step' };

export default function GameApp() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connection, setConnection] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'lost'>('idle');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [modal, setModal] = useState<'rules' | 'review' | 'leave' | 'resign' | 'sacrifice' | null>(null);
  const [sacrificeSquare, setSacrificeSquare] = useState<number | null>(null);
  const [promotion, setPromotion] = useState<Move[] | null>(null);
  const [now, setNow] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const initialized = useRef(false);
  const intentionalLeave = useRef(false);
  const connectingRef = useRef(false);

  const attach = useCallback((room: Room) => {
    roomRef.current = room;
    intentionalLeave.current = false;
    room.reconnection.maxRetries = 45;
    room.reconnection.minDelay = 500;
    room.reconnection.maxDelay = 2000;
    room.reconnection.minUptime = 0;
    sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken);
    room.onMessage('snapshot', (state: Snapshot) => {
      setSnapshot(state);
      setConnection('connected');
      sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken);
    });
    room.onMessage('clock', (clocks: Record<Color, number>) => setSnapshot(state => state ? { ...state, clocks } : state));
    room.onMessage('error', (message: string) => setError(message));
    room.onDrop(() => { setConnection('reconnecting'); setError(''); });
    room.onReconnect(() => { setConnection('connected'); sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken); room.send('sync'); });
    room.onError((_code, message) => setError(message ?? 'A conexão com a sala encontrou um problema.'));
    room.onLeave(() => {
      if (!intentionalLeave.current && roomRef.current === room) { setConnection('lost'); setError('A conexão foi encerrada. Você pode voltar ao início para criar outra sala.'); sessionStorage.removeItem(TOKEN_KEY); }
    });
    setConnection('connected');
    room.send('sync');
  }, []);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setName(localStorage.getItem('gambito-name') ?? '');
    setCode(new URLSearchParams(location.search).get('sala')?.toUpperCase() ?? '');
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      setConnection('connecting');
      new Client(endpoint()).reconnect(token).then(attach).catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setConnection('idle');
        setNotice('A sala anterior já terminou. Vamos começar outra?');
      });
    }
  }, [attach]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function connect(mode: 'friends' | 'casual' | 'join') {
    if (connectingRef.current || connection === 'connecting') return;
    if (!name.trim()) { setError('Escolha um apelido para entrar na partida.'); document.getElementById('nickname')?.focus(); return; }
    if (mode === 'join' && !/^[A-F0-9]{8}$/.test(code.trim())) { setError('O código da sala tem oito letras ou números.'); return; }
    connectingRef.current = true;
    setConnection('connecting'); setError(''); setSelected(null);
    localStorage.setItem('gambito-name', name.trim());
    try {
      const client = new Client(endpoint());
      const room = mode === 'join' ? await client.joinById(code.trim(), { name: name.trim() }) : mode === 'friends' ? await client.create('friends', { name: name.trim() }) : await client.joinOrCreate('casual', { name: name.trim() });
      attach(room);
    } catch (error) { setConnection('idle'); setError(readableError(error)); }
    finally { connectingRef.current = false; }
  }
  const send = (type: string, data?: unknown) => {
    if (connection !== 'connected') { setError('Aguarde a reconexão para continuar.'); return; }
    setError(''); roomRef.current?.send(type, data);
  };
  const draftAction = (action: DraftAction) => send('draft', action);
  async function leave() {
    intentionalLeave.current = true;
    const room = roomRef.current;
    roomRef.current = null;
    sessionStorage.removeItem(TOKEN_KEY);
    setSnapshot(null); setConnection('idle'); setSelected(null); setError(''); setModal(null); setPromotion(null);
    await room?.leave().catch(() => {});
  }
  async function copyInvite() {
    if (!snapshot) return;
    try { await navigator.clipboard.writeText(`${location.origin}/?sala=${snapshot.roomId}`); setNotice('Convite copiado. Envie para quem vai jogar com você.'); }
    catch { setNotice(`Compartilhe o código ${snapshot.roomId}.`); }
  }
  function play(move: Move) {
    send('move', { from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}), ply: snapshot!.game!.ply });
    setSelected(null); setPromotion(null);
  }
  function selectSquare(square: number) {
    if (!snapshot) return;
    if (snapshot.phase === 'preparation') { if (inHome(square, snapshot.you)) setSelected(square); return; }
    const targets = snapshot.legalMoves.filter(m => m.from === selected && m.to === square);
    if (targets.length && connection === 'connected') {
      if (targets.some(m => m.promotion)) setPromotion(targets);
      else play(targets[0]);
    } else setSelected(square === selected ? null : square);
  }

  const preparing = snapshot?.phase === 'preparation';
  const board = snapshot ? preparing || !snapshot.game ? snapshot.draft.board : snapshot.game.board : demo;
  const selectedPiece = selected !== null ? board[selected] : null;
  const selectedAbility = abilityById(selectedPiece?.ability);
  const editable = !!snapshot && preparing && !snapshot.draft.ready && connection === 'connected';
  const opponent = snapshot?.players.find(p => p.color !== snapshot.you);
  const self = snapshot?.players.find(p => p.color === snapshot.you);
  const spent = snapshot ? material(snapshot.draft.board) : 39;
  const checked = snapshot?.game && inCheck(snapshot.game.board, snapshot.game.turn) ? snapshot.game.board.findIndex(p => p?.kind === 'k' && p.color === snapshot.game!.turn) : undefined;
  const offers = (snapshot?.shop ?? []).map(id => abilityById(id)!).filter(Boolean);
  const refund = selectedPiece ? VALUES[selectedPiece.kind] + (selectedAbility?.price ?? 0) : 0;
  const resultTitle = snapshot?.result ? snapshot.result.winner === null ? 'Empate no tabuleiro.' : snapshot.result.winner === snapshot.you ? 'A vitória é sua.' : 'Uma nova chance vem aí.' : '';
  const readyForInput = connection === 'connected';

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => snapshot ? setModal('leave') : null} aria-label="Gambito, início">
        <span className="brand-mark"><Piece kind="n" color="w"/></span>
        <span>gambito<span className="brand-caption">Xadrez de novas possibilidades</span></span>
      </button>
      <nav aria-label="Navegação principal"><span className="nav-active">Jogar</span><button onClick={() => setModal('rules')}>Regras do jogo</button></nav>
      <span className="version-pill"><span/> Partidas casuais</span>
    </header>

    {error && <div className="feedback error" role="alert"><span>{error}</span><button type="button" aria-label="Fechar aviso" onClick={() => setError('')}>×</button></div>}
    {notice && <div className="feedback notice" role="status">{notice}</div>}

    {!snapshot ? <main className="landing">
      <section className="hero-copy">
        <p className="eyebrow"><span className="tiny-line"/> Uma partida. Um exército seu.</p>
        <h1>A partida começa antes do primeiro lance.</h1>
        <p className="hero-description">Monte seu exército. Escolha como cada peça pode surpreender. Depois, enfrente outro jogador em uma partida de xadrez.</p>
        <div className="hero-facts"><span><b>39</b> pontos de material</span><span><b>12</b> moedas por partida</span><span><b>10 min</b> por jogador</span></div>
        <section className="lobby-card" aria-label="Entrar em uma partida">
          <div className="section-title"><h2>Encontre sua partida</h2><span className="little-label">1 contra 1</span></div>
          <label htmlFor="nickname">Seu apelido</label>
          <input id="nickname" value={name} onChange={event => setName(event.target.value)} maxLength={24} placeholder="Como podemos chamar você?" autoComplete="nickname"/>
          <div className="lobby-actions"><button className="button primary" disabled={connection === 'connecting'} onClick={() => connect('casual')}>{connection === 'connecting' ? 'Conectando…' : 'Jogar casual'}</button><button className="button secondary" disabled={connection === 'connecting'} onClick={() => connect('friends')}>Jogar com amigo</button></div>
          <div className="join-divider"><span>ou entre com um convite</span></div>
          <form className="join-form" onSubmit={event => { event.preventDefault(); void connect('join'); }}><input aria-label="Código da sala" value={code} onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8))} maxLength={8} placeholder="Código da sala" autoComplete="off"/><button className="button secondary" disabled={connection === 'connecting' || code.length !== 8}>Entrar</button></form>
          <p className="microcopy">Cada partida começa do zero. As escolhas valem apenas para esta sala.</p>
        </section>
      </section>

      <section className="hero-visual" aria-label="Prévia do tabuleiro e das peças">
        <div className="monument-scene" aria-hidden="true"><div className="monument-arch"/><div className="monument-pillar pillar-left"/><div className="monument-pillar pillar-right"/><div className="monument-caption"><span>Estratégia em cada escolha</span><i>·</i><span>Um jogo de xadrez</span></div></div>
        <div className="hero-board" aria-hidden="true"><Board board={demo} color="w"/></div>
        <div className="hero-piece hero-piece-light"><Piece kind="b" color="w"/></div><div className="hero-piece hero-piece-dark"><Piece kind="r" color="b"/></div>
        <div className="scene-plinth" aria-hidden="true"><span>G</span><i/></div>
      </section>

      <section className="how-cards" aria-label="Como funciona a partida">
        <article><span className="step-glyph">I</span><div><h2>Monte seu exército</h2><p>Troque peças, sacrifique material e prepare sua formação.</p></div></article>
        <article><span className="step-glyph">II</span><div><h2>Escolha melhorias</h2><p>Conheça a loja sorteada para a sala e equipe as peças compatíveis.</p></div></article>
        <article><span className="step-glyph">III</span><div><h2>Jogue a partida</h2><p>Dez minutos para cada jogador. Regras de xadrez com efeitos explicados.</p></div></article>
      </section>
    </main> : <main className={`workspace ${snapshot.phase === 'reveal' ? 'is-revealing' : ''}`}>
      <div className="workspace-heading"><div><p className="eyebrow">{preparing ? 'Antes do primeiro lance' : snapshot.phase === 'finished' ? 'Partida encerrada' : 'O tabuleiro está posto'}</p><h1>{preparing ? 'Prepare seu exército.' : snapshot.phase === 'reveal' ? 'Conheça o outro lado.' : snapshot.phase === 'finished' ? resultTitle : 'É hora de jogar.'}</h1></div><div className="room-label"><span>{snapshot.mode === 'friends' ? 'Sala com amigo' : 'Partida casual'}</span><button onClick={copyInvite} title="Copiar convite">{snapshot.roomId}<span aria-hidden="true">⧉</span></button></div></div>
      <div className="step-row"><span className={preparing ? 'current' : 'complete'}><b>{preparing ? '1' : '✓'}</b> Montagem</span><i/><span className={snapshot.phase === 'reveal' ? 'current' : snapshot.phase !== 'preparation' ? 'complete' : ''}><b>2</b> Revelação</span><i/><span className={['playing', 'finished'].includes(snapshot.phase) ? 'current' : ''}><b>3</b> Partida <small>10 + 0</small></span><button className="text-button leave-link" onClick={() => setModal('leave')}>Sair da sala</button></div>
      {connection === 'reconnecting' && <div className="connection-banner" role="status">Reconectando. Seu relógio continua correndo.</div>}
      {connection === 'lost' && <div className="connection-banner" role="status">Conexão encerrada. <button className="text-button" onClick={leave}>Voltar ao início</button></div>}

      {preparing ? <>
        <div className="workshop-grid">
          <section className="board-column">
            <PlayerBar name={opponent?.name ?? (snapshot.mode === 'casual' ? 'Buscando adversário…' : 'Esperando seu amigo…')} detail={opponent ? !opponent.connected ? 'Reconectando…' : opponent.ready ? 'Exército confirmado' : 'Preparando o exército' : 'Você já pode montar seu exército.'} color={other(snapshot.you)} ready={opponent?.ready ?? false} preparation/>
            <Board board={board} color={snapshot.you} selected={selected} legal={snapshot.legalMoves} lastMove={snapshot.game?.lastMove} checked={checked} onSquare={selectSquare} preparation/>
            <PlayerBar name={self?.name ?? name} detail={snapshot.you === 'w' ? 'Peças brancas · você começa' : 'Peças pretas · segundo lance'} color={snapshot.you} ready={self?.ready ?? false} preparation self/>
            <p className="board-hint"><span aria-hidden="true">✧</span> Selecione uma das suas 15 casas iniciais. Peões também podem ser trocados, sacrificados ou melhorados.</p>
          </section>
          <aside className="workshop-side">
            <BudgetBar spent={spent} gold={snapshot.draft.gold}/>
            <PieceInspector selected={selected} selectedPiece={selectedPiece} selectedAbility={selectedAbility} color={snapshot.you} editable={editable} refund={refund} onRecruit={kind => draftAction({ type: 'recruit', square: selected!, kind })} onSacrifice={() => { setSacrificeSquare(selected); setModal('sacrifice'); }} onUnequip={() => draftAction({ type: 'unequip', square: selected! })} spent={spent} materialCap={MATERIAL_CAP} canAffordGold={snapshot.draft.gold + refund}/>
            <div className="ready-panel"><div><span className={`ready-icon ${snapshot.draft.ready ? 'ready' : ''}`}>{snapshot.draft.ready ? '✓' : '♜'}</span><p><strong>{snapshot.draft.ready ? 'Exército confirmado' : 'Revise suas escolhas'}</strong><small>{snapshot.draft.ready ? 'Aguardando o adversário.' : 'Confira orçamento, peças e melhorias.'}</small></p></div><button className={`button ${snapshot.draft.ready ? 'secondary' : 'primary'}`} disabled={!readyForInput} onClick={() => snapshot.draft.ready ? send('ready', false) : setModal('review')}>{snapshot.draft.ready ? 'Editar exército' : 'Revisar exército'}</button></div>
          </aside>
        </div>
        <section className="shop" aria-label="Mercado de melhorias">
          <div className="shop-heading"><div><p className="eyebrow">As mesmas ofertas para os dois</p><h2>Mercado de melhorias</h2></div><span className="offer-count">{offers.length} ofertas</span></div>
          <div className="shop-note"><span aria-hidden="true">✦</span><p>Escolha uma peça no tabuleiro para ver quais melhorias são compatíveis. Sacrificar peças devolve moedas.</p></div>
          <div className="offer-grid">{offers.map(ability => {
            const compatible = !!selectedPiece && ability.kinds.includes(selectedPiece.kind);
            const equipped = selectedPiece?.ability === ability.id;
            const affordable = snapshot.draft.gold + (selectedAbility?.price ?? 0) >= ability.price;
            const hasMove = !!ability.moves?.length;
            const hasCapture = !!ability.captures?.length;
            const actionLabel = equipped ? 'Equipada' : !selectedPiece ? 'Escolha uma peça' : !compatible ? `Exige ${ability.kinds.map(kind => NAMES[kind].toLowerCase()).join(' ou ')}` : !affordable ? 'Faltam moedas' : selectedAbility ? 'Trocar melhoria' : 'Equipar melhoria';
            return <article key={ability.id} className={`offer-card ${compatible ? 'compatible' : ''} ${equipped ? 'is-equipped' : ''}`}>
              <div className="offer-top"><span className="ability-icon">{ability.badge}</span><span className="price">{ability.price}<small> moedas</small></span></div>
              <div className="offer-kind">Compatível com {ability.kinds.map(kind => NAMES[kind]).join(' · ')}</div>
              <div className="offer-body"><AbilityDiagram ability={ability}/><h3>{ability.name}</h3><p>{ability.description}</p></div>
              <div className="offer-foot"><span>{hasMove && hasCapture ? 'Movimento e captura' : hasCapture ? 'Captura adicional' : 'Movimento adicional'}</span><button disabled={!editable || !compatible || !affordable || equipped} onClick={() => selected !== null && draftAction({ type: 'equip', square: selected, ability: ability.id })}>{actionLabel}</button></div>
            </article>;
          })}</div>
        </section>
      </> : <div className="game-layout">
        <section className="board-column">
          <PlayerBar name={opponent?.name ?? 'Adversário'} detail={opponent ? !opponent.connected ? 'Reconectando…' : 'Peças negras' : 'Conectando jogador…'} color={other(snapshot.you)} clock={snapshot.clocks[other(snapshot.you)]} active={snapshot.game?.turn === other(snapshot.you) && snapshot.phase === 'playing'}/>
          <Board board={board} color={snapshot.you} selected={selected} legal={snapshot.legalMoves} lastMove={snapshot.game?.lastMove} checked={checked} onSquare={selectSquare}/>
          <PlayerBar name={self?.name ?? name} detail={snapshot.you === 'w' ? 'Brancas · você começa' : 'Negras · segundo lance'} color={snapshot.you} clock={snapshot.clocks[snapshot.you]} active={snapshot.game?.turn === snapshot.you && snapshot.phase === 'playing'} self/>
          <p className={`board-hint ${checked !== undefined ? 'check-hint' : ''}`}><span aria-hidden="true">{checked !== undefined ? '!' : '✧'}</span>{snapshot.phase === 'reveal' ? <>Os exércitos estão revelados. A partida começa em <span aria-live="off">{Math.max(0, Math.ceil(((snapshot.revealUntil ?? 0) - now) / 1000))} s</span>.</> : snapshot.phase === 'finished' ? snapshot.result?.reason : checked !== undefined ? 'Xeque. Proteja seu Rei.' : snapshot.game?.turn === snapshot.you ? 'Sua vez. Selecione uma peça para ver os destinos.' : 'Aguarde a jogada do adversário.'}</p>
          <span className="sr-only" role="status">{checked !== undefined ? 'Xeque. Proteja seu Rei.' : snapshot.phase === 'playing' ? snapshot.game?.turn === snapshot.you ? 'Sua vez de jogar.' : 'Turno do adversário.' : ''}</span>
        </section>
        <aside className="side-column">
          {snapshot.phase === 'finished' ? <section className="result-card"><span className="result-icon">{snapshot.result?.winner === snapshot.you ? '♛' : snapshot.result?.winner === null ? '＝' : '♚'}</span><p className="eyebrow">{snapshot.result?.winner === null ? 'Empate' : snapshot.result?.winner === snapshot.you ? 'Vitória' : 'Partida encerrada'}</p><h2>{resultTitle}</h2><p>{snapshot.result?.reason}</p><button className="button primary" onClick={leave}>Voltar ao início</button><small>Uma nova partida traz um novo exército.</small></section> : <section className="turn-card"><p className="eyebrow">{snapshot.phase === 'reveal' ? 'Exércitos revelados' : 'Partida em andamento'}</p><h2>{snapshot.phase === 'reveal' ? 'Observe as possibilidades.' : snapshot.game?.turn === snapshot.you ? 'É a sua vez.' : 'O adversário está pensando.'}</h2><p>{snapshot.phase === 'reveal' ? 'Toque nas peças do adversário para consultar as melhorias. O relógio começa depois da revelação.' : 'Os efeitos das peças respeitam a segurança do Rei.'}</p></section>}
          {selectedPiece && <section className="piece-detail"><Piece kind={selectedPiece.kind} color={selectedPiece.color}/><div><p className="eyebrow">{squareName(selected!)}</p><h3>{NAMES[selectedPiece.kind]} {selectedPiece.color === 'w' ? 'branco' : 'preto'}</h3><p>{selectedAbility ? `${selectedAbility.name}: ${selectedAbility.description}` : 'Movimentos tradicionais de xadrez.'}</p>{selectedPiece.kind === 'p' && selectedAbility && <small>A melhoria termina quando o peão promove.</small>}</div></section>}
          <section className="moves-panel"><div className="section-title"><h3>Registro de jogadas</h3><span className="little-label">{snapshot.moves.length} lances</span></div>{snapshot.moves.length === 0 ? <p className="empty-history">A história desta partida começa no primeiro lance.</p> : <ol>{Array.from({ length: Math.ceil(snapshot.moves.length / 2) }, (_, index) => <li key={index}><span>{index + 1}.</span><strong>{snapshot.moves[index * 2]}</strong><strong>{snapshot.moves[index * 2 + 1] ?? '…'}</strong></li>)}</ol>}</section>
          {snapshot.phase === 'playing' && <div className="match-actions">{snapshot.drawOfferedBy && snapshot.drawOfferedBy !== snapshot.you ? <div className="draw-offer"><p>Seu adversário propôs empate.</p><button className="button secondary" onClick={() => send('answerDraw', true)}>Aceitar empate</button><button className="text-button" onClick={() => send('answerDraw', false)}>Recusar</button></div> : <button className="button secondary" disabled={!readyForInput || !!snapshot.drawOfferedBy} onClick={() => send('offerDraw')}>{snapshot.drawOfferedBy ? 'Empate proposto…' : 'Propor empate'}</button>}{snapshot.claimableDraw && <button className="button secondary" disabled={!readyForInput} onClick={() => send('claimDraw')}>Reivindicar empate</button>}<button className="text-button danger" disabled={!readyForInput} onClick={() => setModal('resign')}>Desistir da partida</button></div>}
        </aside>
      </div>}
    </main>}

    <footer className="footer"><span>gambito <i>· nome provisório</i></span><span>Um exército, uma estratégia.</span><button className="text-button" onClick={() => setModal('rules')}>Consultar regras</button></footer>

    {modal === 'rules' && <Modal title="Seu exército. Sua estratégia." close={() => setModal(null)}><div className="rules-copy"><p>Você começa com o exército tradicional de <strong>39 pontos de material e {STARTING_GOLD} moedas</strong>. As 15 casas iniciais ao redor do Rei podem receber qualquer peça, inclusive peões. O Rei é obrigatório e fica na casa inicial.</p><p><strong>Troque, equipe ou sacrifique.</strong> Remover uma peça devolve seu valor em moedas: peão 1, cavalo e bispo 3, torre 5, dama 9. Uma peça nova custa o mesmo valor. Trocas e remoções também devolvem o custo da melhoria equipada.</p><p><strong>A loja muda a cada sala.</strong> O servidor sorteia oito ofertas entre onze melhorias, com pelo menos três compatíveis com peões. Os dois jogadores recebem as mesmas ofertas. Cada peça pode receber uma melhoria.</p><p><strong>O xadrez continua reconhecível.</strong> Xeque, mate, roque, en passant e promoção continuam. Melhorias acrescentam movimentos ou capturas informados na oferta. Movimentos sem captura não ameaçam o Rei; a melhoria do peão termina ao promover.</p><p><strong>10 minutos por jogador, sem acréscimo.</strong> Após confirmar os exércitos, ambos têm oito segundos para observá-los. O relógio continua durante uma desconexão; a reconexão é permitida por até 60 segundos.</p><p><strong>Empate</strong> pode ocorrer por acordo, afogamento ou material insuficiente reconhecido. Repetição tripla e 50 lances podem ser reivindicados no turno; cinco repetições e 75 lances encerram automaticamente.</p><p className="rules-footnote">Esta versão oferece partidas casuais e salas com amigos. Contas, ranking, histórico persistente, recompensas e melhorias permanentes ainda não estão disponíveis.</p></div></Modal>}
    {modal === 'review' && snapshot && <Modal title="Revise seu exército" close={() => setModal(null)}><p className="modal-description">O adversário verá sua formação quando os dois confirmarem.</p><BudgetBar spent={spent} gold={snapshot.draft.gold}/><div className="review-stats"><div><strong>{snapshot.draft.board.filter(Boolean).length}</strong><span>peças, incluindo o Rei</span></div><div><strong>{spentOnAbilities(snapshot.draft.board)}</strong><span>moedas em melhorias</span></div></div><ul className="review-list">{snapshot.draft.board.map((piece, square) => piece?.ability ? <li key={piece.id}><Piece kind={piece.kind} color={piece.color}/><span><strong>{NAMES[piece.kind]} · {squareName(square)}</strong><small>{abilityById(piece.ability)?.name}</small></span><span className="price">{abilityById(piece.ability)?.price} moedas</span></li> : null)}</ul>{spentOnAbilities(snapshot.draft.board) === 0 && <p className="small-muted">Você escolheu jogar sem melhorias. Isso também é uma estratégia.</p>}<p className="modal-description">Restam {snapshot.draft.gold} moedas. O saldo não passa para a próxima partida. {opponent ? 'A partida começa oito segundos depois das duas confirmações.' : 'Aguardaremos um adversário entrar e confirmar.'}</p><button className="button primary full-width" disabled={!readyForInput} onClick={() => { send('ready', true); setModal(null); setSelected(null); }}>Confirmar exército</button></Modal>}
    {modal === 'sacrifice' && selectedPiece && sacrificeSquare !== null && <Modal title="Sacrificar esta peça?" close={() => { setModal(null); setSacrificeSquare(null); }}><div className="sacrifice-review"><Piece kind={selectedPiece.kind} color={selectedPiece.color}/><div><strong>{NAMES[selectedPiece.kind]} em {squareName(sacrificeSquare)}</strong><p>{selectedAbility ? `${selectedAbility.name} também será removida.` : 'Esta peça será removida do exército.'}</p><span>Você receberá {refund} {refund === 1 ? 'moeda' : 'moedas'}.</span></div></div><div className="modal-actions"><button className="button secondary" onClick={() => { setModal(null); setSacrificeSquare(null); }}>Manter peça</button><button className="button danger-button" disabled={!editable} onClick={() => { draftAction({ type: 'sacrifice', square: sacrificeSquare }); setModal(null); setSacrificeSquare(null); }}>Confirmar sacrifício</button></div></Modal>}
    {(modal === 'leave' || modal === 'resign') && <Modal title={modal === 'resign' ? 'Desistir desta partida?' : 'Sair desta sala?'} close={() => setModal(null)}><p className="modal-description">{snapshot?.phase === 'playing' || snapshot?.phase === 'reveal' ? 'Sair encerra a partida e concede a vitória ao adversário.' : 'A preparação será encerrada. Uma nova sala terá um novo sorteio de melhorias.'}</p><div className="modal-actions"><button className="button secondary" onClick={() => setModal(null)}>Continuar aqui</button><button className="button danger-button" onClick={() => { if (modal === 'resign') { send('resign'); setModal(null); } else void leave(); }}>{modal === 'resign' ? 'Desistir' : 'Sair da sala'}</button></div></Modal>}
    {promotion && <Modal title="Escolha a promoção" close={() => setPromotion(null)}><p className="modal-description">A melhoria do peão se encerra. Escolha sua nova peça.</p><div className="promotion-options">{promotion.map(move => <button key={move.promotion} onClick={() => play(move)}><Piece kind={move.promotion!} color={snapshot!.you}/><span>{NAMES[move.promotion!]}</span></button>)}</div></Modal>}
  </div>;
}

function PlayerBar({ name, detail, color, ready, clock, active, preparation, self }: { name: string; detail: string; color: Color; ready?: boolean; clock?: number; active?: boolean; preparation?: boolean; self?: boolean }) {
  return <div className={`player-bar ${self ? 'self' : ''}`}><div className="avatar"><Piece kind="k" color={color}/></div><div className="player-copy"><strong>{name} {self && <span className="you-label">você</span>}</strong><small>{detail}</small></div>{preparation ? <span className={`status-chip ${ready ? 'ready' : ''}`}>{ready ? '✓ Pronto' : self ? 'Montando' : '•••'}</span> : <span className={`clock ${active ? 'ticking' : ''}`} aria-label={`Tempo de ${name}`}>{clockLabel(clock ?? 0)}</span>}</div>;
}

function BudgetBar({ spent, gold }: { spent: number; gold: number }) {
  return <section className="budget-bar" aria-label="Orçamento do exército"><div className="budget-item"><span>Material</span><strong>{spent}<small> / {MATERIAL_CAP} pts</small></strong><div className="budget-track" role="progressbar" aria-label="Material usado" aria-valuemin={0} aria-valuemax={MATERIAL_CAP} aria-valuenow={spent}><i style={{ width: `${Math.min(100, spent / MATERIAL_CAP * 100)}%` }}/></div></div><div className="gold-counter"><span>Ouro disponível</span><strong><i aria-hidden="true">◉</i> {gold}</strong><small>Para recrutar ou melhorar</small></div></section>;
}

function PieceInspector({ selected, selectedPiece, selectedAbility, color, editable, refund, onRecruit, onSacrifice, onUnequip, spent, materialCap, canAffordGold }: { selected: number | null; selectedPiece: Snapshot['draft']['board'][number]; selectedAbility?: ReturnType<typeof abilityById>; color: Color; editable: boolean; refund: number; onRecruit: (kind: (typeof BUYABLE)[number]) => void; onSacrifice: () => void; onUnequip: () => void; spent: number; materialCap: number; canAffordGold: number }) {
  return <section className="inspector"><div className="section-title"><div><p className="eyebrow">Peça selecionada</p><h2>{selected !== null ? `${selectedPiece ? NAMES[selectedPiece.kind] : 'Casa vazia'} · ${squareName(selected)}` : 'Escolha uma peça'}</h2></div>{selectedPiece?.kind !== 'k' && selectedPiece && <button className="sacrifice-button" disabled={!editable} onClick={onSacrifice}>Sacrificar <span>+{refund} moedas</span></button>}</div>
    {selected === null ? <p className="small-muted">Toque em uma casa das suas duas fileiras iniciais para consultar e alterar a peça.</p> : selectedPiece?.kind === 'k' ? <div className="inspector-copy"><Piece kind="k" color={color}/><p>O Rei é obrigatório e permanece na casa inicial.</p></div> : <><p className="small-muted">{selectedPiece ? `${NAMES[selectedPiece.kind]} vale ${VALUES[selectedPiece.kind]} ${VALUES[selectedPiece.kind] === 1 ? 'ponto' : 'pontos'}.` : 'Recrute uma peça para esta casa vazia.'}</p><div className="recruit-options" aria-label="Escolha uma peça">{BUYABLE.map(kind => { const materialAfter = spent - (selectedPiece ? VALUES[selectedPiece.kind] : 0) + VALUES[kind]; const disabled = !editable || selectedPiece?.kind === kind || materialAfter > materialCap || canAffordGold < VALUES[kind]; return <button key={kind} disabled={disabled} onClick={() => onRecruit(kind)} aria-label={`Recrutar ${NAMES[kind]} por ${VALUES[kind]} moedas`}><Piece kind={kind} color={color}/><span>{NAMES[kind]}</span><small>{VALUES[kind]} moedas</small></button>; })}</div>{selectedAbility && <div className="equipped"><span><strong>{selectedAbility.name}</strong><small>{selectedAbility.description}</small></span><button className="text-button" disabled={!editable} onClick={onUnequip}>Remover · +{selectedAbility.price} moedas</button></div>}</>}
  </section>;
}
