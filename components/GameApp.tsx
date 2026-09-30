'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, type Room } from '@colyseus/sdk';
import { abilityById, classForKind, NAMES, RARITY_NAMES, RULESET, STARTING_GOLD, TYPE_NAMES, VALUES, type AbilityType, type Color, type Kind } from '@/lib/catalog';
import { advancedCost, advancedPieces, applyDraftAction, createDraft, currentMaterialCap, currentPowerCap, inHome, material, other, powerScore, spentOnAbilities, spentOnSpells, squareName } from '@/lib/draft';
import { CAPTURE_DAMAGE } from '@/lib/combat';
import { inCheck } from '@/lib/chess';
import { startingStats } from '@/lib/player-stats';
import type { DraftAction, Move, Snapshot } from '@/lib/types';
import { Board } from './Board';
import { Piece } from './Piece';
import { AbilityIcon } from './AbilityIcon';
import { Shop } from './Shop';
import { RecruitmentTray } from './RecruitmentTray';
import { PieceInspector, SelectedPieceSummary } from './PieceInspector';
import { Modal } from './Modal';
import { AbilityDiagram } from './AbilityDiagram';
import { OfferSigil } from './OfferSigil';

const TOKEN_KEY = 'gambito-room-token';
function endpoint(port: string) {
  const url = new URL(process.env.NEXT_PUBLIC_GAME_SERVER_URL || location.origin);
  if (!process.env.NEXT_PUBLIC_GAME_SERVER_URL) url.port = port;
  url.protocol = url.protocol === 'https:' || url.protocol === 'wss:' ? 'wss:' : 'ws:';
  return url.toString().replace(/\/$/, '');
}
async function checkServer(address: string) {
  const url = new URL(address);
  if (location.protocol === 'https:' && url.protocol === 'ws:') throw new Error('A conexão da partida precisa de um endereço seguro. Configure o servidor com HTTPS/WSS.');
  url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:';
  url.pathname = `${url.pathname.replace(/\/$/, '')}/health`;
  let response: Response;
  try { response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(6000) }); }
  catch { throw new Error('O servidor de partidas não respondeu. Tente novamente em alguns instantes.'); }
  if (!response.ok) throw new Error(response.status === 429 ? 'Muitas tentativas. Aguarde um minuto.' : 'O servidor de partidas não está disponível neste endereço.');
  const health = await response.json().catch(() => null);
  if (!health?.ok || health.service !== 'gambito') throw new Error('O endereço configurado não está respondendo como servidor do jogo.');
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
demo[12] = { ...demo[12]!, weapon: 'spear' };
demo[1] = { ...demo[1]!, weapon: 'knight-step' };

export default function GameApp({ gamePort }: { gamePort: string }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connection, setConnection] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'lost'>('idle');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [boardExpanded, setBoardExpanded] = useState(false);
  const boardDrawerRef = useRef<HTMLElement>(null);
  const [modal, setModal] = useState<'rules' | 'review' | 'leave' | 'resign' | 'piece' | 'bait' | 'sell' | null>(null);
  const [saleTarget, setSaleTarget] = useState<{ square: number; id: string; weapon?: string; enchantment?: string } | null>(null);
  const [wantedOffer, setWantedOffer] = useState<string | null>(null);
  const [draftPending, setDraftPending] = useState(false);
  const draftPendingRef = useRef(false);
  const [lastConnect, setLastConnect] = useState<'friends' | 'casual' | 'join' | null>(null);
  const [resumeToken, setResumeToken] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<Move[] | null>(null);
  const [baitAbility, setBaitAbility] = useState('');
  const [baitSquare, setBaitSquare] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!boardExpanded) return;
    const closeOnOutsideTap = (event: PointerEvent) => {
      if (!boardDrawerRef.current?.contains(event.target as Node)) { setBoardExpanded(false); setWantedOffer(null); }
    };
    document.addEventListener('pointerdown', closeOnOutsideTap, true);
    return () => document.removeEventListener('pointerdown', closeOnOutsideTap, true);
  }, [boardExpanded]);
  const intentionalLeave = useRef(false);
  const connectingRef = useRef(false);

  const attach = useCallback((room: Room) => {
    roomRef.current = room;
    setResumeToken(null);
    intentionalLeave.current = false;
    room.reconnection.maxRetries = 45;
    room.reconnection.minDelay = 500;
    room.reconnection.maxDelay = 2000;
    room.reconnection.minUptime = 0;
    sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken);
    room.onMessage('snapshot', (state: Snapshot) => {
      if (state.ruleset !== RULESET) {
        setError('A versão da sala mudou. Reinicie o servidor de partidas e abra uma sala nova.');
        setSnapshot(null); setConnection('lost'); sessionStorage.removeItem(TOKEN_KEY);
        roomRef.current = null; void room.leave(); return;
      }
      setSnapshot(state);
      setConnection('connected');
      sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken);
    });
    room.onMessage('draftComplete', () => { draftPendingRef.current = false; setDraftPending(false); });
    room.onMessage('clock', (clocks: Record<Color, number>) => setSnapshot(state => state ? { ...state, clocks } : state));
    room.onMessage('error', (message: string) => setError(message));
    room.onDrop(() => { draftPendingRef.current = false; setDraftPending(false); setConnection('reconnecting'); setError(''); });
    room.onReconnect(() => { setConnection('connected'); sessionStorage.setItem(TOKEN_KEY, room.reconnectionToken); room.send('sync'); });
    room.onError((_code, message) => setError(message ?? 'A conexão com a sala encontrou um problema.'));
    room.onLeave(() => {
      if (!intentionalLeave.current && roomRef.current === room) { setConnection('lost'); setError('A conexão foi encerrada. Você pode voltar ao início para criar outra sala.'); sessionStorage.removeItem(TOKEN_KEY); }
    });
    setConnection('connected');
    room.send('sync');
  }, []);
  const resume = useCallback(async (token: string) => {
    setConnection('connecting'); setError(''); setResumeToken(token);
    try {
      const address = endpoint(gamePort);
      await checkServer(address);
      attach(await new Client(address).reconnect(token));
    } catch (failure) {
      setConnection('idle');
      const message = failure instanceof Error ? failure.message : '';
      if (/not found|expired|invalid.*token|seat reservation|does not exist/i.test(message)) {
        sessionStorage.removeItem(TOKEN_KEY); setResumeToken(null);
        setNotice('A sala anterior já terminou. Você pode começar outra.');
      } else setError(readableError(failure));
    }
  }, [attach, gamePort]);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setName(localStorage.getItem('gambito-name') ?? '');
    setCode(new URLSearchParams(location.search).get('sala')?.toUpperCase() ?? '');
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) void resume(token);
  }, [resume]);
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
    setResumeToken(null);
    setLastConnect(mode);
    setConnection('connecting'); setError(''); setSelected(null);
    localStorage.setItem('gambito-name', name.trim());
    try {
      const address = endpoint(gamePort);
      await checkServer(address);
      const client = new Client(address);
      const room = mode === 'join' ? await client.joinById(code.trim(), { name: name.trim() }) : mode === 'friends' ? await client.create('friends', { name: name.trim() }) : await client.joinOrCreate('casual', { name: name.trim() });
      attach(room);
    } catch (error) { setConnection('idle'); setError(readableError(error)); }
    finally { connectingRef.current = false; }
  }
  const send = (type: string, data?: unknown) => {
    if (connection !== 'connected') { setError('Aguarde a reconexão para continuar.'); return; }
    setError(''); roomRef.current?.send(type, data);
  };
  const draftAction = (action: DraftAction) => {
    if (draftPendingRef.current || connection !== 'connected') return;
    draftPendingRef.current = true;
    setDraftPending(true);
    send('draft', action);
  };
  async function leave() {
    intentionalLeave.current = true;
    const room = roomRef.current;
    roomRef.current = null;
    sessionStorage.removeItem(TOKEN_KEY);
    draftPendingRef.current = false; setDraftPending(false); setWantedOffer(null);
    setSnapshot(null); setConnection('idle'); setSelected(null); setBoardExpanded(false); setError(''); setModal(null); setPromotion(null);
    await room?.leave().catch(() => {});
  }
  async function copyInvite() {
    if (!snapshot) return;
    try { await navigator.clipboard.writeText(`${location.origin}/?sala=${snapshot.roomId}`); setNotice('Convite copiado. Envie para quem vai jogar com você.'); }
    catch { setNotice(`Compartilhe o código ${snapshot.roomId}.`); }
  }
  function play(move: Move) {
    if (move.spell) send('castSpell', { spell: move.spell, from: move.from, to: move.to, ply: snapshot!.game!.ply });
    else send('move', { from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}), ply: snapshot!.game!.ply });
    setSelected(null); setPromotion(null);
  }
  function selectSquare(square: number) {
    if (!snapshot) return;
    if (snapshot.pendingBait) {
      if (baitAbility) {
        if (baitTargets.some(t => t.square === square)) {
          send('chooseBait', { ability: baitAbility, square });
        } else {
          setNotice('Escolha uma de suas peças válidas (destacadas no tabuleiro) para equipar.');
        }
      }
      return;
    }
    if (snapshot.phase === 'preparation') {
      if (!inHome(square, snapshot.you)) return;
      const ability = abilityById(wantedOffer ?? undefined);
      if (selected === square && !ability) { setSelected(null); return; }
      setSelected(square);
      if (ability) {
        const target = snapshot.draft.board[square];
        if (ability.type === 'spell' || !target || !classForKind(target.kind) || !ability.classes.includes(classForKind(target.kind)!)) { setNotice('Escolha uma peça compatível com esta melhoria.'); return; }
        if (!editable) return;
        if (target[ability.type === 'weapon' ? 'weapon' : 'enchantment'] === ability.id) { setNotice('Esta peça já tem essa melhoria.'); return; }
        if (purchase({ type: 'equip', square, ability: ability.id })) { setWantedOffer(null); closeBoard(); }
      }
      return;
    }
    const targets = [...snapshot.legalMoves, ...snapshot.spellMoves].filter(m => m.from === selected && m.to === square);
    if (targets.length && connection === 'connected') {
      if (targets.some(m => m.promotion)) setPromotion(targets);
      else play(targets[0]);
    } else setSelected(square === selected ? null : square);
  }

  function moveDraftPiece(from: number, to: number) {
    if (!snapshot || !editable || !inHome(to, snapshot.you)) return;
    if (snapshot.draft.board[to]) { setNotice('Solte a peça em uma casa vazia.'); return; }
    setWantedOffer(null);
    draftAction({ type: 'movePiece', from, to });
    setSelected(to);
  }
  function closeBoard() {
    setWantedOffer(null);
    setBoardExpanded(false);
    boardDrawerRef.current?.querySelector<HTMLButtonElement>('.board-drawer-handle')?.focus({ preventScroll: true });
  }

  const preparing = snapshot?.phase === 'preparation';
  const board = snapshot ? preparing || !snapshot.game ? snapshot.draft.board : snapshot.game.board : demo;
  const selectedPiece = selected !== null ? board[selected] : null;
  const selectedWeapon = abilityById(selectedPiece?.weapon), selectedEnchantment = abilityById(selectedPiece?.enchantment);
  const editable = !!snapshot && preparing && !snapshot.draft.ready && connection === 'connected' && !draftPending;
  const opponent = snapshot?.players.find(p => p.color !== snapshot.you);
  const self = snapshot?.players.find(p => p.color === snapshot.you);
  const spent = snapshot ? material(snapshot.draft.board) : 39;
  const playerStats = snapshot ? snapshot.playerStats ?? startingStats(snapshot.draft) : startingStats({ spells: [] });
  const checked = snapshot?.game && inCheck(snapshot.game.board, snapshot.game.turn) ? snapshot.game.board.findIndex(p => p?.kind === 'k' && p.color === snapshot.game!.turn) : undefined;
  const offers = (snapshot?.shop ?? []).map(id => abilityById(id)!).filter(Boolean);
  const highlightMoves = snapshot ? [...snapshot.legalMoves, ...snapshot.spellMoves] : [];
  const refund = selectedPiece ? VALUES[selectedPiece.kind] + (selectedWeapon?.price ?? 0) + (selectedEnchantment?.price ?? 0) : 0;
  const resultTitle = snapshot?.result ? snapshot.result.winner === null ? 'Empate' : snapshot.result.winner === snapshot.you ? 'Vitória' : 'Derrota' : '';
  const readyForInput = connection === 'connected' && !draftPending;
  const checkMessage = snapshot?.game?.turn === snapshot?.you ? 'Seu Rei está ameaçado (1.000 de dano).' : 'Rei adversário ameaçado (1.000 de dano).';
  const inspect = () => { setWantedOffer(null); setBoardExpanded(true); };
  const inspector = snapshot && <PieceInspector key={`${selected}-${selectedPiece?.id}-${selectedPiece?.weapon ?? ''}-${selectedPiece?.enchantment ?? ''}`} selected={selected} piece={selectedPiece} color={snapshot.you} editable={editable && !wantedOffer} refund={refund} onSacrifice={() => selected !== null && requestSale(selected)} onUnequip={slot => selected !== null && draftAction({ type: 'unequip', square: selected, slot })}/>;
  function requestSale(square: number) {
    const piece = snapshot?.draft.board[square];
    if (!editable || wantedOffer || !piece || piece.color !== snapshot?.you || piece.kind === 'k') return;
    setSelected(square);
    if (piece.weapon || piece.enchantment) {
      setSaleTarget({ square, id: piece.id, weapon: piece.weapon, enchantment: piece.enchantment });
      setModal('sell');
    } else purchase({ type: 'sacrifice', square });
  }
  function confirmSale() {
    if (!saleTarget || !snapshot || !editable) return;
    const piece = snapshot.draft.board[saleTarget.square];
    if (!piece || piece.id !== saleTarget.id || piece.weapon !== saleTarget.weapon || piece.enchantment !== saleTarget.enchantment) {
      setModal(null); setSaleTarget(null); setNotice('A peça mudou. Selecione-a novamente para vender.'); return;
    }
    if (purchase({ type: 'sacrifice', square: saleTarget.square })) { setModal(null); setSaleTarget(null); }
  }
  const salePiece = saleTarget ? snapshot?.draft.board[saleTarget.square] : null;
  const saleRefund = salePiece ? VALUES[salePiece.kind] + (abilityById(salePiece.weapon)?.price ?? 0) + (abilityById(salePiece.enchantment)?.price ?? 0) : 0;
  function purchase(action: DraftAction) {
    if (!snapshot || !editable || draftPendingRef.current) return false;
    try { applyDraftAction(snapshot.draft, snapshot.you, snapshot.shop, action); }
    catch (error) { setNotice((error as Error).message); return false; }
    draftAction(action);
    return true;
  }
  const wantedAbility = abilityById(wantedOffer ?? undefined);
  const offerTargets = wantedAbility && snapshot ? snapshot.draft.board.flatMap((piece, square) => {
    if (!piece || wantedAbility.type === 'spell' || piece[wantedAbility.type === 'weapon' ? 'weapon' : 'enchantment'] === wantedAbility.id) return [];
    try { applyDraftAction(snapshot.draft, snapshot.you, snapshot.shop, { type: 'equip', square, ability: wantedAbility.id }); return [square]; }
    catch { return []; }
  }) : undefined;
  function chooseOffer(id: string) {
    if (!editable || !snapshot) return;
    const ability = abilityById(id);
    if (!ability || ability.type === 'spell') return;
    let reason = 'Não é possível equipar esta carta.';
    let possible = false;
    for (let square = 0; square < 64; square++) {
      const piece = snapshot.draft.board[square];
      if (!piece || piece.color !== snapshot.you || piece.kind === 'k' || !classForKind(piece.kind) || !ability.classes.includes(classForKind(piece.kind)!)) continue;
      if (ability.type === 'weapon' && piece.weapon === ability.id) continue;
      if (ability.type === 'enchantment' && piece.enchantment === ability.id) continue;
      try {
        applyDraftAction(snapshot.draft, snapshot.you, snapshot.shop, { type: 'equip', square, ability: id });
        possible = true;
        break;
      } catch (error) {
        reason = (error as Error).message;
      }
    }
    if (!possible) {
      setNotice(reason);
      return;
    }
    setWantedOffer(id); setNotice(''); setModal(null);
    setBoardExpanded(true);
    requestAnimationFrame(() => boardDrawerRef.current?.querySelector<HTMLButtonElement>('.square[tabindex="0"]')?.focus({ preventScroll: true }));
  }
  useEffect(() => { if (snapshot?.phase !== 'preparation') { setWantedOffer(null); setBoardExpanded(false); setModal(value => value === 'piece' || value === 'sell' ? null : value); setSaleTarget(null); } }, [snapshot?.phase]);
  const pendingBaitKey = snapshot?.pendingBait?.choices.join('|') ?? '';
  useEffect(() => {
    if (!snapshot?.pendingBait) { setBaitAbility(''); setBaitSquare(null); if (modal === 'bait') setModal(null); return; }
    setBaitAbility(snapshot.pendingBait.choices[0] ?? '');
    setBaitSquare(null);
    setModal('bait');
  }, [pendingBaitKey]);
  const baitTargets = snapshot?.pendingBait && snapshot.game ? snapshot.game.board.flatMap((piece, square) => {
    const ability = abilityById(baitAbility), pieceClass = classForKind(piece?.kind);
    if (!piece || piece.color !== snapshot.you || !pieceClass || !ability || !ability.classes.includes(pieceClass)) return [];
    if (ability.type === 'weapon' ? piece.weapon : ability.type === 'enchantment' ? piece.enchantment : true) return [];
    return [{ square, name: `${NAMES[piece.kind]} em ${squareName(square)}` }];
  }) : [];
  const resolvedBaitSquare = baitTargets.some(target => target.square === baitSquare) ? baitSquare : baitTargets[0]?.square ?? null;

  return <div className={`app-shell ${snapshot && !preparing ? 'match-shell' : ''} ${modal || promotion ? 'has-dialog' : ''}`}>
    <header className="topbar">
      <button className="brand" onClick={() => snapshot ? setModal('leave') : null} aria-label="Gambito, início">
        <span className="brand-mark"><Piece kind="n" color="w"/></span>
        <span>gambito</span>
      </button>
      <nav aria-label="Navegação principal"><span className="nav-active">Jogar</span><button onClick={() => setModal('rules')}>Regras do jogo</button></nav>
      <span className="version-pill"><span/> Partidas casuais</span>
    </header>

    {error && <div className="feedback error" role="alert"><span>{error}</span>{!snapshot && (resumeToken || lastConnect) && <button className="retry-button" disabled={connection === 'connecting'} onClick={() => resumeToken ? resume(resumeToken) : lastConnect && connect(lastConnect)}>{resumeToken ? 'Retomar partida' : 'Tentar novamente'}</button>}<button type="button" aria-label="Fechar aviso" onClick={() => setError('')}>×</button></div>}
    {notice && <div className="feedback notice" role="status">{notice}</div>}

    {!snapshot ? <main className="landing">
      <section className="hero-copy">

        <h1>Xadrez com melhorias.</h1>
        <p className="hero-description">Compre peças, equipe melhorias e jogue contra outra pessoa.</p>
        <p className="session-facts">Partida única · 5 minutos por jogador, sem acréscimo</p>
        <section className="lobby-card" aria-label="Entrar em uma partida">
          <div className="section-title"><h2>Encontre sua partida</h2></div>
          <label htmlFor="nickname">Seu apelido</label>
          <input id="nickname" value={name} onChange={event => setName(event.target.value)} maxLength={24} placeholder="Apelido" autoComplete="nickname"/>
          <div className="lobby-actions"><button className="button primary" disabled={connection === 'connecting'} onClick={() => connect('casual')}>{connection === 'connecting' ? 'Conectando…' : 'Jogar casual'}</button><button className="button secondary" disabled={connection === 'connecting'} onClick={() => connect('friends')}>Jogar com amigo</button></div>
          <div className="join-divider"><span>ou entre com um convite</span></div>
          <form className="join-form" onSubmit={event => { event.preventDefault(); void connect('join'); }}><input aria-label="Código da sala" value={code} onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8))} maxLength={8} placeholder="Código da sala" autoComplete="off"/><button className="button secondary" disabled={connection === 'connecting' || code.length !== 8}>Entrar</button></form>
        </section>
      </section>

      <section className="hero-visual" aria-label="Prévia do tabuleiro e das peças">
        <div className="monument-scene" aria-hidden="true"><div className="monument-arch"/><div className="monument-pillar pillar-left"/><div className="monument-pillar pillar-right"/></div>
        <div className="hero-board" aria-hidden="true"><Board board={demo} color="w"/></div>
        <div className="hero-piece hero-piece-light"><Piece kind="b" color="w"/></div><div className="hero-piece hero-piece-dark"><Piece kind="r" color="b"/></div>
        <div className="scene-plinth" aria-hidden="true"><span>G</span><i/></div>
      </section>

      <section className="how-cards" aria-label="Como funciona a partida">
        <article><span className="step-glyph">I</span><div><h2>Monte seu exército</h2><p>Troque peças, sacrifique material e prepare sua formação.</p></div></article>
        <article><span className="step-glyph">II</span><div><h2>Escolha melhorias</h2><p>Equipe armas e encantamentos nas suas peças.</p></div></article>
        <article><span className="step-glyph">III</span><div><h2>Jogue a partida</h2><p>Cinco minutos por jogador, sem acréscimo.</p></div></article>
      </section>
    </main> : <main className={`workspace ${!preparing ? 'match-workspace' : ''} ${snapshot.phase === 'reveal' ? 'is-revealing' : ''}`}>
      {!preparing && <div className="workspace-heading"><div><h1>{snapshot.phase === 'reveal' ? 'Revelação dos exércitos' : snapshot.phase === 'finished' ? resultTitle : 'Partida'}</h1></div><div className="room-label"><span>{snapshot.mode === 'friends' ? 'Sala com amigo' : 'Partida casual'}</span><button onClick={copyInvite} title="Copiar convite">{snapshot.roomId}<span aria-hidden="true">⧉</span></button></div></div>}
      <div className="step-row"><span className={preparing ? 'current' : 'complete'}><b>{preparing ? '1' : '✓'}</b> Montagem</span><i/><span className={snapshot.phase === 'reveal' ? 'current' : snapshot.phase !== 'preparation' ? 'complete' : ''}><b>2</b> Revelação</span><i/><span className={['playing', 'finished'].includes(snapshot.phase) ? 'current' : ''}><b>3</b> Partida <small>5 + 0</small></span>{preparing ? <div className="room-controls"><button onClick={copyInvite} title="Copiar convite">{snapshot.roomId}<span aria-hidden="true">⧉</span></button><button className="text-button leave-link" onClick={() => setModal('leave')}>Sair da sala</button></div> : <button className="text-button leave-link" onClick={() => setModal('leave')}>Sair da sala</button>}</div>
      {connection === 'reconnecting' && <div className="connection-banner" role="status">Reconectando. Seu relógio continua correndo.</div>}
      {connection === 'lost' && <div className="connection-banner" role="status">Conexão encerrada. <button className="text-button" onClick={leave}>Voltar ao início</button></div>}

      {preparing ? <>
        <div className={`workshop-page ${boardExpanded ? 'is-board-open' : ''}`}>
          <section ref={boardDrawerRef} className={`board-drawer ${boardExpanded ? 'is-open' : ''}`} id="army" aria-label="Planejamento do exército"
            onPointerEnter={event => { if (event.pointerType === 'mouse') setBoardExpanded(true); }}
            onPointerLeave={event => { if (event.pointerType === 'mouse' && !event.buttons && !wantedOffer) setBoardExpanded(false); }}>
            <button type="button" className="board-drawer-handle" aria-expanded={boardExpanded} aria-controls="board-planning" aria-label="Abrir tabuleiro de preparação" onClick={() => setBoardExpanded(true)}>
              <span className="drawer-chevron" aria-hidden="true">›</span><Piece kind="r" color={snapshot.you}/><span className="board-drawer-label">Tabuleiro</span>
            </button>
            <div className="board-drawer-content" id="board-planning" inert={!boardExpanded}>
              <button className="planning-close" onClick={closeBoard} aria-label="Recolher tabuleiro">‹</button>
              {wantedAbility && <div className="target-offer" data-rarity={wantedAbility.rarity} role="status"><AbilityIcon type={wantedAbility.type}/><strong>{wantedAbility.name} <small>· {wantedAbility.price} moedas antes do reembolso</small></strong><p>{offerTargets?.length ? 'Escolha uma peça destacada.' : 'Sem alvos disponíveis com o saldo e o Poder atuais.'}</p><button className="text-button" onClick={() => setWantedOffer(null)}>Cancelar</button></div>}
              <div className="planning-drawer-layout">
                <section className="board-column workshop-board">
                  <PlayerBar name={opponent?.name ?? (snapshot.mode === 'casual' ? 'Buscando adversário…' : 'Esperando seu amigo…')} detail={opponent ? !opponent.connected ? 'Reconectando…' : opponent.ready ? 'Exército confirmado' : 'Preparando o exército' : ''} color={other(snapshot.you)} ready={opponent?.ready ?? false} preparation/>
                  <Board board={board} color={snapshot.you} selected={selected} onSquare={selectSquare} onDropPiece={editable && !wantedOffer ? moveDraftPiece : undefined} onDragSelect={setSelected} onSellPiece={editable && !wantedOffer ? requestSale : undefined} targetSquares={offerTargets} onCancel={() => { setSelected(null); setWantedOffer(null); }} preparation/>
                  <PlayerBar name={self?.name ?? name} detail={snapshot.you === 'w' ? 'Brancas · primeiro lance' : 'Pretas · segundo lance'} color={snapshot.you} ready={self?.ready ?? false} preparation self/>
                  {!wantedOffer && <RecruitmentTray draft={snapshot.draft} color={snapshot.you} selected={selected} editable={editable && !wantedOffer} onRecruit={kind => { if (selected !== null) purchase({ type: 'recruit', square: selected, kind }); }}/>}
                </section>
                <aside className="planning-inspector" aria-label="Detalhes e ações da peça">
                  {inspector}
                </aside>
              </div>
            </div>
          </section>
          <div className="workshop-main">
            <div className="workshop-content-grid">
              <section className="shop-column" aria-label="Loja e melhorias">
                <div className="workshop-currency"><strong><i aria-hidden="true">◉</i> {snapshot.draft.gold}</strong><small>moedas</small></div>
                <Shop offers={offers} selected={selected} piece={selectedPiece} gold={snapshot.draft.gold} power={powerScore(snapshot.draft, snapshot.you)} powerCap={currentPowerCap(snapshot.draft)} refreshCost={snapshot.refreshCost} spells={snapshot.draft.spells} editable={editable} pending={draftPending} wanted={wantedOffer} onCancel={() => setWantedOffer(null)} onChoose={chooseOffer} onEquip={id => { const ability = abilityById(id); if (ability?.type === 'spell') purchase({ type: 'buySpell', ability: id }); else if (selected !== null) purchase({ type: 'equip', square: selected, ability: id }); }} onRefresh={() => { if (draftPendingRef.current || connection !== 'connected') return; setWantedOffer(null); draftPendingRef.current = true; setDraftPending(true); send('refreshShop'); }} onInspect={inspect}/>
              </section>
              <aside className="workshop-side player-info-panel" aria-label="Informações do jogador">
                <div className="player-info-title"><span className="player-color-dot" data-color={snapshot.you}/><h2>{self?.name ?? name}</h2></div>
                <div className="player-vitals" aria-label="Atributos do jogador">
                  <div><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20 3 11C-2 4 7-1 12 6c5-7 14-2 9 5Z"/></svg>Vida</span><strong>{playerStats.health.toLocaleString('pt-BR')}</strong></div>
                  <div><span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>Tempo</span><strong>{clockLabel(playerStats.timeMs)}</strong></div>
                </div>
                <BudgetBar draft={snapshot.draft} color={snapshot.you} includeGold={false}/>
                <div id="piece-inspector" className="desktop-inspector" tabIndex={-1}><SelectedPieceSummary selected={selected} piece={selectedPiece} color={snapshot.you}/></div>
                {snapshot.draft.spells.length > 0 && <div className="prepared-spells"><span>Feitiços</span>{snapshot.draft.spells.map(id => <div key={id} data-rarity={abilityById(id)?.rarity}><AbilityIcon type="spell"/><strong>{abilityById(id)?.name}</strong></div>)}</div>}
                <div className="ready-panel">{snapshot.draft.ready && <p><strong>Exército confirmado</strong><small>Aguardando o adversário.</small></p>}<button className={`button ${snapshot.draft.ready ? 'secondary' : 'primary'}`} disabled={!readyForInput} onClick={() => snapshot.draft.ready ? send('ready', false) : setModal('review')}>{snapshot.draft.ready ? 'Editar exército' : 'Revisar exército'}</button></div>
              </aside>
            </div>
            {draftPending && <p className="pending-status" role="status">Confirmando alteração…</p>}
          </div>
        </div>
      </> : <div className="game-layout">
        <section className="board-column">
          <PlayerBar name={opponent?.name ?? 'Adversário'} detail={opponent ? !opponent.connected ? 'Reconectando…' : snapshot.you === 'w' ? 'Peças negras' : 'Peças brancas' : 'Conectando jogador…'} color={other(snapshot.you)} health={snapshot.game?.health?.[other(snapshot.you)]} maxHealth={snapshot.game?.maxHealth?.[other(snapshot.you)]} clock={snapshot.clocks[other(snapshot.you)]} active={snapshot.game?.turn === other(snapshot.you) && snapshot.phase === 'playing'}/>
          <Board board={board} color={snapshot.you} selected={selected} legal={highlightMoves} lastMove={snapshot.game?.lastMove} checked={checked} onSquare={selectSquare} onCancel={() => { setSelected(null); setWantedOffer(null); }} targetSquares={snapshot?.pendingBait && baitAbility ? baitTargets.map(t => t.square) : undefined}/>
          <PlayerBar name={self?.name ?? name} detail={snapshot.you === 'w' ? 'Brancas · você começa' : 'Negras · segundo lance'} color={snapshot.you} health={snapshot.game?.health?.[snapshot.you]} maxHealth={snapshot.game?.maxHealth?.[snapshot.you]} clock={snapshot.clocks[snapshot.you]} active={snapshot.game?.turn === snapshot.you && snapshot.phase === 'playing'} self/>
          <p className={`board-hint ${checked !== undefined ? 'check-hint' : ''}`}><span aria-hidden="true">{checked !== undefined ? '!' : '✧'}</span>{snapshot.phase === 'reveal' ? <>Os exércitos estão revelados. A partida começa em <span aria-live="off">{Math.max(0, Math.ceil(((snapshot.revealUntil ?? 0) - now) / 1000))} s</span>.</> : snapshot.phase === 'finished' ? snapshot.result?.reason : checked !== undefined ? checkMessage : snapshot.canPass ? 'Sem movimentos disponíveis. Passe o turno.' : snapshot.game?.turn === snapshot.you ? 'Sua vez.' : 'Aguarde a jogada do adversário.'}</p>
          <span className="sr-only" role="status">{checked !== undefined ? checkMessage : snapshot.phase === 'playing' ? snapshot.game?.turn === snapshot.you ? 'Sua vez de jogar.' : 'Turno do adversário.' : ''}</span>
        </section>
        <aside className="side-column">
          {snapshot.phase === 'finished' ? <section className="result-card"><span className="result-icon">{snapshot.result?.winner === snapshot.you ? '♛' : snapshot.result?.winner === null ? '＝' : '♚'}</span><p className="eyebrow">{snapshot.result?.winner === null ? 'Empate' : snapshot.result?.winner === snapshot.you ? 'Vitória' : 'Partida encerrada'}</p><h2>{resultTitle}</h2><p>{snapshot.result?.reason}</p><button className="button primary" onClick={leave}>Voltar ao início</button></section> : null}
          {selectedPiece && <section className="piece-detail"><Piece kind={selectedPiece.kind} color={selectedPiece.color}/><div><p className="eyebrow">{squareName(selected!)}</p><h3>{NAMES[selectedPiece.kind]} {selectedPiece.color === 'w' ? 'branco' : 'preto'}</h3><p>Se capturada: {CAPTURE_DAMAGE[selectedPiece.kind]} de dano ao dono.</p>{selectedWeapon && <p>Arma · {selectedWeapon.name}: {selectedWeapon.description}</p>}{selectedEnchantment && <p>Encantamento · {selectedEnchantment.name}: {selectedEnchantment.description}</p>}{!selectedWeapon && !selectedEnchantment && <p>Movimentos tradicionais de xadrez.</p>}{selectedPiece.heart && <small>Segundo coração disponível.</small>}{selectedPiece.kind === 'p' && (selectedWeapon || selectedEnchantment) && <small>As melhorias do peão terminam quando ele promove.</small>}</div></section>}
          <section className="moves-panel"><div className="section-title"><h3>Registro de jogadas</h3><span className="little-label">{snapshot.moves.length} lances</span></div>{snapshot.moves.length === 0 ? <p className="empty-history">Nenhum lance ainda.</p> : <ol>{Array.from({ length: Math.ceil(snapshot.moves.length / 2) }, (_, index) => <li key={index}><span>{index + 1}.</span><strong>{snapshot.moves[index * 2]}</strong><strong>{snapshot.moves[index * 2 + 1] ?? '…'}</strong></li>)}</ol>}</section>
          {snapshot.phase === 'playing' && <div className="match-actions">{snapshot.canPass && <button className="button primary" disabled={!readyForInput} onClick={() => send('pass', snapshot.game!.ply)}>Passar turno</button>}{snapshot.drawOfferedBy && snapshot.drawOfferedBy !== snapshot.you ? <div className="draw-offer"><p>Seu adversário propôs empate.</p><button className="button secondary" onClick={() => send('answerDraw', true)}>Aceitar empate</button><button className="text-button" onClick={() => send('answerDraw', false)}>Recusar</button></div> : <button className="button secondary" disabled={!readyForInput || !!snapshot.drawOfferedBy} onClick={() => send('offerDraw')}>{snapshot.drawOfferedBy ? 'Empate proposto…' : 'Propor empate'}</button>}{snapshot.claimableDraw && <button className="button secondary" disabled={!readyForInput} onClick={() => send('claimDraw')}>Reivindicar empate</button>}<button className="text-button danger" disabled={!readyForInput} onClick={() => setModal('resign')}>Desistir da partida</button></div>}
        </aside>
      </div>}
    </main>}

    <footer className="footer"><span>gambito <i>· nome provisório</i></span><button className="text-button" onClick={() => setModal('rules')}>Consultar regras</button></footer>

    {modal === 'rules' && <Modal title="Regras do jogo" close={() => setModal(null)}><div className="rules-copy"><p>Você começa com o exército tradicional de <strong>39 pontos de material e {STARTING_GOLD} moedas</strong>. Na preparação, o Rei é obrigatório e fica na casa inicial. As peças podem ser reposicionadas nas quatro fileiras do seu lado.</p><p><strong>Avançar custa poder.</strong> Uma peça nas fileiras 3–4 para brancas ou 6–5 para pretas adiciona 2 pontos ao poder total. Material tem limite 39; poder total tem limite 50 e soma material, melhorias compradas e avanço.</p><p><strong>Classes e espaços.</strong> Peões, cavalos e bispos são peças menores; torres e damas são maiores. Cada peça pode receber uma arma e um encantamento. Feitiços aumentam a vida ou o tempo inicial do jogador.</p><p><strong>Mercado.</strong> A sala sorteia cinco cartas, iguais para os dois jogadores no começo. Quando alguém compra, aquele espaço recebe uma nova carta apenas na loja dessa pessoa. Atualizar a loja custa 1 moeda, depois 2, 3 e assim por diante. Melhorias e moedas não passam para a próxima sala.</p><p><strong>Efeitos especiais.</strong> Isca permite escolher uma entre três melhorias gratuitas quando a peça encantada é capturada. Segundo coração cancela uma captura uma vez. As cartas de tempo dão +1, +2 ou +3 minutos; as de vida dão +200, +400 ou +600. Feitiços diferentes acumulam; cada carta pode ser comprada uma vez por preparação.</p><p><strong>Vida e capturas.</strong> Você começa com 1.200 de vida, mais os bônus de feitiços. Perder peão causa 50 de dano; cavalo ou bispo 150; torre 250; dama 500; Rei 1.000. Vida zero encerra a partida. Segundo coração evita a primeira captura e seu dano. Uma peça promovida passa a valer o dano de sua nova classe.</p><p><strong>Rei capturável.</strong> Você pode expor ou sacrificar seu Rei durante a partida e continuar sem ele. Não há obrigação de responder a xeque nem vitória por mate. Roque exige Rei e torre sem movimento e caminho vazio, mesmo em casas ameaçadas. En passant e promoção continuam; promover remove as melhorias do peão.</p><p><strong>5 minutos por jogador, sem acréscimo.</strong> Após confirmar os exércitos, ambos têm oito segundos para observá-los. Quem esgota o próprio relógio perde, independentemente das peças ou da vida restante. O relógio continua durante uma desconexão; a reconexão é permitida por até 60 segundos.</p><p><strong>Empate</strong> pode ocorrer por acordo ou quando nenhum jogador tem movimentos. Se só você não puder mover, use Passar turno. Material insuficiente para mate não encerra a partida. Repetição tripla e 50 lances podem ser reivindicados no turno; cinco repetições e 75 lances encerram automaticamente.</p><p className="rules-footnote">Esta versão oferece partidas casuais e salas com amigos. Contas, ranking, histórico persistente, recompensas e melhorias permanentes ainda não estão disponíveis.</p></div></Modal>}
    {modal === 'review' && snapshot && <Modal title="Revise seu exército" close={() => setModal(null)}><p className="modal-description">O adversário verá sua formação quando os dois confirmarem.</p><BudgetBar draft={snapshot.draft} color={snapshot.you}/><div className="review-stats"><div><strong>{snapshot.draft.board.filter(Boolean).length}</strong><span>peças, incluindo o Rei</span></div><div><strong>{spentOnAbilities(snapshot.draft.board) + spentOnSpells(snapshot.draft)}</strong><span>moedas em melhorias e feitiços</span></div><div><strong>{advancedPieces(snapshot.draft.board, snapshot.you)}</strong><span>peças avançadas · {advancedCost(snapshot.draft.board, snapshot.you)} pontos</span></div></div><ul className="review-list">{snapshot.draft.board.map((piece, square) => piece ? [piece.weapon, piece.enchantment].filter(Boolean).map(id => <li key={piece.id + id}><Piece kind={piece.kind} color={piece.color}/><span><strong>{NAMES[piece.kind]} · {squareName(square)}</strong><small>{abilityById(id)?.name}</small></span><span className="price">{abilityById(id)?.price} moedas</span></li>) : null)}</ul>{snapshot.draft.spells.map(id => <p key={id} className="modal-description">Feitiço: {abilityById(id)?.name} · {abilityById(id)?.price} moedas.</p>)}<p className="modal-description">Restam {snapshot.draft.gold} moedas. Pontuação de poder {powerScore(snapshot.draft, snapshot.you)} / {currentPowerCap(snapshot.draft)}. {opponent ? 'A partida começa oito segundos depois das duas confirmações.' : 'Aguardaremos um adversário entrar e confirmar.'}</p><button className="button primary full-width" disabled={!readyForInput} onClick={() => { send('ready', true); setModal(null); setSelected(null); }}>Confirmar exército</button></Modal>}
    {snapshot?.pendingBait && (
      <div className="bait-overlay">
        {!baitAbility ? (
          <div className="bait-selection-center">
            <div className="bait-header">
              <h2>Isca ativada!</h2>
              <p>A peça encantada foi capturada. Escolha uma melhoria grátis.</p>
            </div>
            <div className="offer-grid bait-cards">
              {snapshot.pendingBait.choices.map(id => {
                const ability = abilityById(id)!;
                return <article id={`offer-${ability.id}`} key={ability.id} data-rarity={ability.rarity} className={`offer-card rarity-${ability.rarity}`} onClick={() => setBaitAbility(ability.id)}>
                  <div className="offer-top"><h3>{ability.name}</h3></div>
                  <p className="offer-meta"><span className="offer-type"><AbilityIcon type={ability.type} className="offer-type-icon"/>{TYPE_NAMES[ability.type]}</span><span className="rarity-label" data-rarity={ability.rarity}>{RARITY_NAMES[ability.rarity]}</span></p>
                  <div className="offer-class-list">{ability.classes.map(pieceClass => <span key={pieceClass} className="offer-class">({pieceClass === 'minor' ? 'Plebeu' : 'Realeza'})</span>)}</div>
                  <div className="offer-body">{ability.moves?.length || ability.captures?.length ? <AbilityDiagram ability={ability}/> : <OfferSigil ability={ability}/>}<p>{ability.description}</p></div>
                  <div className="offer-foot">
                    <button className="button primary full-width" onClick={() => setBaitAbility(ability.id)}>Selecionar Carta</button>
                  </div>
                </article>;
              })}
            </div>
          </div>
        ) : (
          <div className="bait-selected-side">
            <div className="bait-header">
              <h2>Equipar Melhoria</h2>
              <p>Clique em uma peça destacada no tabuleiro para equipar.</p>
            </div>
            {(() => {
              const ability = abilityById(baitAbility)!;
              return <article data-rarity={ability.rarity} className={`offer-card rarity-${ability.rarity} is-wanted`}>
                  <div className="offer-top"><h3>{ability.name}</h3></div>
                  <p className="offer-meta"><span className="offer-type"><AbilityIcon type={ability.type} className="offer-type-icon"/>{TYPE_NAMES[ability.type]}</span><span className="rarity-label" data-rarity={ability.rarity}>{RARITY_NAMES[ability.rarity]}</span></p>
                  <div className="offer-class-list">{ability.classes.map(pieceClass => <span key={pieceClass} className="offer-class">({pieceClass === 'minor' ? 'Plebeu' : 'Realeza'})</span>)}</div>
                  <div className="offer-body">{ability.moves?.length || ability.captures?.length ? <AbilityDiagram ability={ability}/> : <OfferSigil ability={ability}/>}<p>{ability.description}</p></div>
              </article>;
            })()}
            <button className="button secondary full-width bait-back-btn" onClick={() => setBaitAbility('')}>Voltar e Escolher Outra</button>
          </div>
        )}
      </div>
    )}
    {modal === 'sell' && saleTarget && salePiece && <Modal title={`Vender ${NAMES[salePiece.kind]} em ${squareName(saleTarget.square).toUpperCase()}?`} close={() => { setModal(null); setSaleTarget(null); }}>
      <p className="modal-description">A peça e as melhorias abaixo serão removidas. Você recebe {saleRefund} moedas no total.</p>
      <ul className="sale-upgrades">{[salePiece.weapon, salePiece.enchantment].filter(Boolean).map(id => { const ability = abilityById(id)!; return <li key={id} data-rarity={ability.rarity}><AbilityIcon type={ability.type}/><strong>{ability.name}</strong><span>+{ability.price} moedas</span></li>; })}</ul>
      <div className="modal-actions"><button className="button secondary" onClick={() => { setModal(null); setSaleTarget(null); }}>Manter peça</button><button className="button primary" disabled={!editable} onClick={confirmSale}>Vender · +{saleRefund} moedas</button></div>
    </Modal>}
    {modal === 'piece' && snapshot && preparing && <Modal title="Ficha da peça" close={() => setModal(null)} sheet>{inspector}{draftPending && <p role="status">Confirmando alteração…</p>}</Modal>}
    {(modal === 'leave' || modal === 'resign') && <Modal title={modal === 'resign' ? 'Desistir desta partida?' : 'Sair desta sala?'} close={() => setModal(null)}><p className="modal-description">{snapshot?.phase === 'playing' || snapshot?.phase === 'reveal' ? 'Sair encerra a partida e concede a vitória ao adversário.' : 'A preparação será encerrada. Uma nova sala terá um novo sorteio de melhorias.'}</p><div className="modal-actions"><button className="button secondary" onClick={() => setModal(null)}>Continuar aqui</button><button className="button danger-button" onClick={() => { if (modal === 'resign') { send('resign'); setModal(null); } else void leave(); }}>{modal === 'resign' ? 'Desistir' : 'Sair da sala'}</button></div></Modal>}
    {promotion && <Modal title="Escolha a promoção" close={() => setPromotion(null)}><p className="modal-description">A melhoria do peão se encerra. Escolha sua nova peça.</p><div className="promotion-options">{promotion.map(move => <button key={move.promotion} onClick={() => play(move)}><Piece kind={move.promotion!} color={snapshot!.you}/><span>{NAMES[move.promotion!]}</span></button>)}</div></Modal>}
  </div>;
}

function PlayerBar({ name, detail, color, ready, clock, health, maxHealth, active, preparation, self }: { name: string; detail: string; color: Color; ready?: boolean; clock?: number; health?: number; maxHealth?: number; active?: boolean; preparation?: boolean; self?: boolean }) {
  return <div className={`player-bar ${self ? 'self' : ''}`}><div className="avatar"><Piece kind="k" color={color}/></div><div className="player-copy"><strong>{name} {self && <span className="you-label">você</span>}</strong><small>{detail}</small>{health !== undefined && maxHealth !== undefined && <div className="match-health" aria-label={`Vida de ${name}: ${health} de ${maxHealth}`}><span>♥ {health.toLocaleString('pt-BR')} <small>/ {maxHealth.toLocaleString('pt-BR')}</small></span><meter min={0} max={maxHealth} value={health} aria-label={`Vida de ${name}`}/></div>}</div>{preparation ? <span className={`status-chip ${ready ? 'ready' : ''}`}>{ready ? '✓ Pronto' : self ? 'Montando' : '•••'}</span> : <span className={`clock ${active ? 'ticking' : ''} ${clock !== undefined && clock <= 30000 ? 'low-time' : ''}`} aria-label={`Tempo de ${name}${clock !== undefined && clock <= 30000 ? ', menos de 30 segundos' : ''}`} >{clockLabel(clock ?? 0)}</span>}</div>;
}

function BudgetBar({ draft, color, includeGold = true }: { draft: Snapshot['draft']; color: Color; includeGold?: boolean }) {
  const spent = material(draft.board), power = powerScore(draft, color), advancement = advancedCost(draft.board, color);
  const maxMat = currentMaterialCap(draft), maxPow = currentPowerCap(draft);
  return <section className="budget-bar" aria-label="Orçamento do exército"><div className="budget-item"><span>Material</span><strong>{spent}<small> / {maxMat} pts</small></strong><div className="budget-track" role="progressbar" aria-label="Material usado" aria-valuemin={0} aria-valuemax={maxMat} aria-valuenow={spent}><i style={{ width: `${Math.min(100, spent / maxMat * 100)}%` }}/></div></div><div className="budget-item power-budget"><span>Poder total</span><strong>{power}<small> / {maxPow} pts</small></strong><div className="budget-track" role="progressbar" aria-label="Poder total" aria-valuemin={0} aria-valuemax={maxPow} aria-valuenow={power}><i style={{ width: `${Math.min(100, power / maxPow * 100)}%` }}/></div></div>{includeGold && <div className="gold-counter"><span>Ouro disponível</span><strong><i aria-hidden="true">◉</i> {draft.gold}</strong><small>Para recrutar, melhorar ou atualizar a loja</small></div>}</section>;
}
