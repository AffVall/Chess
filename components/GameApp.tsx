'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, type Room } from '@colyseus/sdk';
import { abilityById, BUYABLE, MATERIAL_CAP, NAMES, STARTING_GOLD, VALUES, type Color } from '@/lib/catalog';
import { createDraft, inHome, material, other, spentOnAbilities, squareName } from '@/lib/draft';
import { inCheck } from '@/lib/chess';
import type { DraftAction, Move, Snapshot } from '@/lib/types';
import { Board } from './Board';
import { Piece } from './Piece';
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
  const [filter, setFilter] = useState<'all' | 'pawns' | 'pieces'>('all');
  const [modal, setModal] = useState<'rules' | 'review' | 'leave' | 'resign' | null>(null);
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
  const offers = (snapshot?.shop ?? []).map(id => abilityById(id)!).filter(a => filter === 'all' || (filter === 'pawns' ? a.kinds.includes('p') : !a.kinds.includes('p')));
  const refund = selectedPiece ? VALUES[selectedPiece.kind] + (selectedAbility?.price ?? 0) : 0;
  const resultTitle = snapshot?.result ? snapshot.result.winner === null ? 'Empate no tabuleiro.' : snapshot.result.winner === snapshot.you ? 'A vitória é sua.' : 'Uma nova chance vem aí.' : '';
  const readyForInput = connection === 'connected';

  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => snapshot ? setModal('leave') : null} aria-label="Gambito, início"><span className="brand-mark"><Piece kind="n" color="w"/></span><span>gambito<span className="brand-caption">XADREZ REINVENTADO</span></span></button><nav aria-label="Navegação principal"><span className="nav-active">Jogar</span><button onClick={() => setModal('rules')}>Como funciona <span aria-hidden="true">↗</span></button></nav><div className="version-pill"><span/> Protótipo 0.1</div></header>
    {error && <div className="feedback error" role="alert"><span>{error}</span><button aria-label="Fechar aviso" onClick={() => setError('')}>×</button></div>}
    {notice && <div className="feedback notice" role="status">{notice}</div>}

    {!snapshot ? <main className="landing">
      <section className="hero-copy"><div className="eyebrow"><span className="tiny-line"/> UM NOVO JEITO DE JOGAR</div><h1>O tabuleiro é o mesmo.<br/><em>A estratégia é sua.</em></h1><p className="hero-description">Seu peão pode surpreender. Seu cavalo, ir além.<br className="desktop-break"/> Monte um exército único e faça a próxima jogada.</p><div className="hero-stats"><span><strong>39</strong> pontos de exército</span><span><strong>12</strong> moedas iniciais</span><span><strong>10</strong> min por jogador</span></div>
        <div className="lobby-card"><div className="section-title"><span className="eyebrow">PRONTO PARA O TABULEIRO?</span><span className="little-label">1 × 1 online</span></div><label htmlFor="nickname">Como podemos chamar você?</label><input id="nickname" value={name} onChange={e => setName(e.target.value)} maxLength={24} placeholder="Seu apelido" autoComplete="nickname"/><div className="lobby-actions"><button className="button primary" disabled={connection === 'connecting'} onClick={() => connect('friends')}>{connection === 'connecting' ? 'Conectando…' : 'Criar sala com amigo'} <span>↗</span></button><button className="button secondary" disabled={connection === 'connecting'} onClick={() => connect('casual')}>Buscar partida casual</button></div><div className="join-divider"><span>já tem um convite?</span></div><form className="join-form" onSubmit={e => { e.preventDefault(); void connect('join'); }}><input aria-label="Código da sala" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8))} maxLength={8} placeholder="Código da sala" autoComplete="off"/><button className="button secondary" disabled={connection === 'connecting' || code.length !== 8}>Entrar <span>→</span></button></form><p className="microcopy">Partidas únicas. Sem melhorias permanentes. Um novo começo a cada jogo.</p></div>
      </section>
      <section className="hero-visual" aria-label="Uma prévia do tabuleiro"><div className="floating-tag"><span>✦</span><div><strong>Peças com possibilidades</strong><small>O próximo movimento pode surpreender.</small></div></div><Board board={demo} color="w"/><div className="board-bottom-note"><span className="spark">✧</span> Xadrez conhecido. Novas possibilidades.</div><div className="hero-decoration" aria-hidden="true">♟</div></section>
      <section className="how-cards" aria-label="As etapas da partida">{[['01', 'Monte seu exército', 'Troque peças, sacrifique material e encontre sua formação.'], ['02', 'Descubra a loja', 'Oito melhorias sorteadas. As mesmas oportunidades para os dois.'], ['03', 'Faça sua jogada', 'Dez minutos no relógio e uma estratégia para colocar à prova.']].map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</section>
    </main> : <main className="workspace">
      <div className="workspace-heading"><div><div className="eyebrow">{preparing ? 'ANTES DO PRIMEIRO LANCE' : snapshot.phase === 'finished' ? 'FIM DE PARTIDA' : 'A ESTRATÉGIA GANHA VIDA'}</div><h1>{preparing ? 'Prepare sua próxima jogada.' : snapshot.phase === 'reveal' ? 'Conheça o outro lado.' : snapshot.phase === 'finished' ? resultTitle : 'O tabuleiro é seu.'}</h1></div><div className="room-label"><span>{snapshot.mode === 'friends' ? 'SALA COM AMIGO' : 'PARTIDA CASUAL'}</span><button onClick={copyInvite} title="Copiar convite">{snapshot.roomId} <span>⧉</span></button></div></div>
      <div className="step-row"><span className={preparing ? 'current' : 'complete'}><b>{preparing ? '1' : '✓'}</b> Montagem</span><i/><span className={snapshot.phase === 'reveal' ? 'current' : snapshot.phase !== 'preparation' ? 'complete' : ''}><b>2</b> Revelação</span><i/><span className={['playing', 'finished'].includes(snapshot.phase) ? 'current' : ''}><b>3</b> Partida <small>10 + 0</small></span><button className="text-button leave-link" onClick={() => setModal('leave')}>Sair da sala ↗</button></div>
      {connection === 'reconnecting' && <div className="connection-banner" role="status">Reconectando… Seu lugar está reservado por até 60 segundos. O relógio continua correndo.</div>}
      {connection === 'lost' && <div className="connection-banner">Conexão encerrada. <button className="text-button" onClick={leave}>Voltar ao início</button></div>}
      <div className="game-layout">
        <section className="board-column">
          <div className="player-bar"><div className="avatar opponent">{opponent ? <Piece kind="k" color={other(snapshot.you)}/> : '?'}</div><div><strong>{opponent?.name ?? (snapshot.mode === 'casual' ? 'Buscando adversário…' : 'Esperando seu amigo…')}</strong><small>{opponent ? !opponent.connected ? 'Reconectando…' : preparing ? opponent.ready ? 'Exército confirmado' : 'Preparando o exército' : 'Seu adversário' : 'Você já pode montar seu exército.'}</small></div>{preparing ? <span className={`status-chip ${opponent?.ready ? 'ready' : ''}`}>{opponent?.ready ? '✓ Pronto' : '•••'}</span> : <span className={`clock ${snapshot.game?.turn === other(snapshot.you) && snapshot.phase === 'playing' ? 'ticking' : ''}`} aria-label="Tempo do adversário">{clockLabel(snapshot.clocks[other(snapshot.you)])}</span>}</div>
          <Board board={board} color={snapshot.you} selected={selected} legal={snapshot.legalMoves} lastMove={snapshot.game?.lastMove} checked={checked} onSquare={selectSquare} preparation={preparing}/>
          <div className="player-bar self"><div className="avatar"><Piece kind="k" color={snapshot.you}/></div><div><strong>{self?.name} <span className="you-label">você</span></strong><small>{snapshot.you === 'w' ? 'Peças brancas · você começa' : 'Peças pretas · segundo lance'}</small></div>{preparing ? <span className={`status-chip ${self?.ready ? 'ready' : ''}`}>{self?.ready ? '✓ Pronto' : 'Montando'}</span> : <span className={`clock ${snapshot.game?.turn === snapshot.you && snapshot.phase === 'playing' ? 'ticking' : ''}`} aria-label="Seu tempo">{clockLabel(snapshot.clocks[snapshot.you])}</span>}</div>
          <div className="board-hint"><span>ⓘ</span>{preparing ? 'Toque em uma peça ou casa inicial para personalizar.' : snapshot.phase === 'reveal' ? `Os dois exércitos estão fechados. A partida começa em ${Math.max(0, Math.ceil(((snapshot.revealUntil ?? 0) - now) / 1000))}s.` : snapshot.phase === 'finished' ? snapshot.result?.reason : `${snapshot.game?.turn === snapshot.you ? 'Sua vez. Selecione uma peça para ver as casas disponíveis.' : 'Aguarde a jogada do adversário.'}${checked !== undefined ? ' O Rei está em xeque.' : ''}`}</div>
          {preparing && <section className="inspector"><div className="section-title"><h3>{selected !== null ? `${squareName(selected)} · ${selectedPiece ? NAMES[selectedPiece.kind] : 'Casa vazia'}` : 'Cada peça, uma escolha'}</h3>{selectedPiece?.kind !== 'k' && selectedPiece && <button className="sacrifice-button" disabled={!editable} onClick={() => draftAction({ type: 'sacrifice', square: selected! })}>Sacrificar <span>+{refund} ◉</span></button>}</div>{selected === null ? <p>Selecione uma casa nas suas duas fileiras iniciais. Inclusive os peões podem ser trocados, sacrificados ou melhorados.</p> : selectedPiece?.kind === 'k' ? <p>Seu Rei é obrigatório e permanece nesta casa. Proteja-o; as outras 15 casas podem ser personalizadas.</p> : <><p className="small-muted">{selectedPiece ? 'Trocar por outra peça devolve o valor atual.' : 'Recrute uma peça para esta casa.'}</p><div className="recruit-options">{BUYABLE.map(kind => <button key={kind} disabled={!editable || selectedPiece?.kind === kind || spent - (selectedPiece ? VALUES[selectedPiece.kind] : 0) + VALUES[kind] > MATERIAL_CAP || snapshot.draft.gold + refund < VALUES[kind]} onClick={() => draftAction({ type: 'recruit', square: selected, kind })} aria-label={`Recrutar ${NAMES[kind]} em ${squareName(selected)}`}><Piece kind={kind} color={snapshot.you}/><span>{NAMES[kind]}</span><small>{VALUES[kind]} ◉</small></button>)}</div>{selectedAbility && <div className="equipped"><span>✦ <strong>{selectedAbility.name}</strong><small>{selectedAbility.description}</small></span><button className="text-button" disabled={!editable} onClick={() => draftAction({ type: 'unequip', square: selected })}>Remover<br/>+{selectedAbility.price} ◉</button></div>}</>}</section>}
        </section>
        <aside className="side-column">
          {preparing ? <>
            <div className="budget-bar"><div><span>EXÉRCITO</span><strong>{spent}<small> / 39 pts</small></strong><div className="budget-track"><i style={{ width: `${spent / 39 * 100}%` }}/></div></div><div className="gold-counter"><span>SUAS MOEDAS</span><strong><i>◉</i> {snapshot.draft.gold}</strong><small>Disponíveis na preparação</small></div></div>
            <section className="shop"><div className="shop-heading"><div><span className="eyebrow">O ACASO OFERECE. VOCÊ ESCOLHE.</span><h2>Mercado de melhorias <span>✦</span></h2></div><span className="offer-count">8 ofertas</span></div><p className="shop-description">Mesmas ofertas para os dois. Efeitos válidos só nesta partida.</p><div className="shop-filters" aria-label="Filtrar melhorias">{([['all', 'Todas'], ['pawns', 'Para peões'], ['pieces', 'Outras peças']] as const).map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><div className="offer-grid">{offers.map(ability => {
              const compatible = !!selectedPiece && ability.kinds.includes(selectedPiece.kind);
              const equipped = selectedPiece?.ability === ability.id;
              const affordable = snapshot.draft.gold + (selectedAbility?.price ?? 0) >= ability.price;
              return <article key={ability.id} className={`offer-card ${compatible ? 'compatible' : ''} ${equipped ? 'is-equipped' : ''}`}><div className="offer-top"><span className="ability-icon">{ability.badge}</span><span className="price">{ability.price} <small>◉</small></span></div><span className="offer-kind">{ability.kinds.map(k => NAMES[k]).join(' · ')}</span><h3>{ability.name}</h3><p>{ability.description}</p><button disabled={!editable || !compatible || !affordable || equipped} onClick={() => draftAction({ type: 'equip', square: selected!, ability: ability.id })}>{equipped ? '✓ Equipada' : !selectedPiece ? 'Selecione uma peça' : !compatible ? `Selecione ${NAMES[ability.kinds[0]].toLowerCase()}` : !affordable ? 'Faltam moedas' : selectedAbility ? 'Trocar melhoria ↗' : 'Equipar melhoria ↗'}</button></article>;
            })}</div><div className="shop-note"><span>↻</span><p>A loja é sorteada uma vez por sala. Sacrifique peças para ganhar moedas e abrir espaço para sua estratégia.</p></div></section>
            <div className="ready-panel"><div><span className="ready-icon">{snapshot.draft.ready ? '✓' : '♜'}</span><p><strong>{snapshot.draft.ready ? 'Seu exército está confirmado.' : 'Sua estratégia está pronta?'}</strong><small>{snapshot.draft.ready ? 'Aguardando o adversário confirmar.' : 'Revise as peças e melhorias antes de começar.'}</small></p></div><button className={`button ${snapshot.draft.ready ? 'secondary' : 'primary'}`} disabled={!readyForInput} onClick={() => snapshot.draft.ready ? send('ready', false) : setModal('review')}>{snapshot.draft.ready ? 'Voltar à montagem' : 'Revisar exército'} <span>→</span></button></div>
          </> : <>
            {snapshot.phase === 'finished' ? <section className="result-card"><span className="result-icon">{snapshot.result?.winner === snapshot.you ? '♛' : '♚'}</span><span className="eyebrow">{snapshot.result?.winner === null ? 'EMPATE' : snapshot.result?.winner === snapshot.you ? 'VITÓRIA' : 'FIM DE PARTIDA'}</span><h2>{resultTitle}</h2><p>{snapshot.result?.reason}</p><button className="button primary" onClick={leave}>Voltar ao início <span>→</span></button><small>Uma nova partida traz uma nova loja. Melhorias e moedas não são acumuladas.</small></section> : <section className="turn-card"><span className="eyebrow">{snapshot.phase === 'reveal' ? 'EXÉRCITOS REVELADOS' : 'EM JOGO'}</span><h2>{snapshot.phase === 'reveal' ? 'Observe suas possibilidades.' : snapshot.game?.turn === snapshot.you ? 'É a sua vez.' : 'O adversário está pensando.'}</h2><p>{snapshot.phase === 'reveal' ? 'Toque nas peças do adversário para consultar suas melhorias. O relógio começa após a revelação.' : 'Uma ação por turno. As melhorias ampliam as opções e respeitam a segurança do Rei.'}</p></section>}
            {selectedPiece && <section className="piece-detail"><Piece kind={selectedPiece.kind} color={selectedPiece.color}/><div><span className="eyebrow">{squareName(selected!)}</span><h3>{NAMES[selectedPiece.kind]} {selectedPiece.color === 'w' ? 'branco' : 'preto'}</h3><p>{selectedAbility ? `✦ ${selectedAbility.name}: ${selectedAbility.description}` : 'Movimentos tradicionais de xadrez.'}</p>{selectedPiece.kind === 'p' && selectedAbility && <small>A melhoria se encerra ao promover.</small>}</div></section>}
            <section className="moves-panel"><div className="section-title"><h3>Registro de jogadas</h3><span className="little-label">{snapshot.moves.length} lances</span></div>{snapshot.moves.length === 0 ? <p className="empty-history">A história desta partida começa no primeiro lance.</p> : <ol>{Array.from({ length: Math.ceil(snapshot.moves.length / 2) }, (_, i) => <li key={i}><span>{i + 1}.</span><strong>{snapshot.moves[i * 2]}</strong><strong>{snapshot.moves[i * 2 + 1] ?? '…'}</strong></li>)}</ol>}</section>
            {snapshot.phase === 'playing' && <div className="match-actions">{snapshot.drawOfferedBy && snapshot.drawOfferedBy !== snapshot.you ? <div className="draw-offer"><p>Seu adversário propôs empate.</p><button className="button secondary" onClick={() => send('answerDraw', true)}>Aceitar</button><button className="text-button" onClick={() => send('answerDraw', false)}>Recusar</button></div> : <button className="button secondary" disabled={!readyForInput || !!snapshot.drawOfferedBy} onClick={() => send('offerDraw')}>{snapshot.drawOfferedBy ? 'Empate proposto…' : 'Propor empate'}</button>}{snapshot.claimableDraw && <button className="button secondary" disabled={!readyForInput} onClick={() => send('claimDraw')}>Reivindicar empate</button>}<button className="text-button danger" disabled={!readyForInput} onClick={() => setModal('resign')}>Desistir da partida</button></div>}
          </>}
        </aside>
      </div>
    </main>}
    <footer className="footer"><span>gambito <span>· nome provisório</span></span><span>Estratégia antes do lance. Criatividade em cada peça.</span><button className="text-button" onClick={() => setModal('rules')}>Regras do protótipo ↗</button></footer>

    {modal === 'rules' && <Modal title="Seu exército. Sua estratégia." close={() => setModal(null)}><div className="rules-copy"><p>Você começa com o exército tradicional de <strong>39 pontos de material e {STARTING_GOLD} moedas</strong>. As 15 casas ao redor do Rei podem receber qualquer peça, inclusive peões. O Rei é obrigatório e fixo.</p><p><strong>Sacrifique para melhorar.</strong> Remover uma peça devolve seu valor em moedas: peão 1, cavalo e bispo 3, torre 5, dama 9. Uma peça nova custa esse mesmo valor. Trocas e remoções devolvem também o preço da melhoria equipada.</p><p><strong>A loja muda a cada sala.</strong> Oito das onze melhorias são sorteadas pelo servidor, com pelo menos três para peões. Os dois jogadores recebem as mesmas ofertas, disponíveis sem limite de cópias. Cada peça aceita uma melhoria.</p><p><strong>Regras conhecidas.</strong> Xeque, mate, roque, en passant e promoção continuam. Melhorias são passivas e adicionam movimentos ou capturas descritos na oferta. Movimentos sem captura não ameaçam o Rei. A melhoria de um peão termina quando ele promove.</p><p><strong>10 minutos por jogador, sem acréscimo.</strong> Depois de confirmar os exércitos, ambos têm oito segundos para observar a posição. Os relógios continuam durante uma desconexão; a reconexão é permitida por 60 segundos.</p><p><strong>Empate:</strong> por acordo, afogamento ou material insuficiente reconhecido. Repetição tripla e 50 lances podem ser reivindicados no seu turno; cinco repetições e 75 lances encerram automaticamente. Com melhorias no tabuleiro, a análise de material insuficiente é conservadora.</p><p>A configuração inicial não pode deixar nenhum Rei em xeque. Se isso acontecer, protejam a coluna do Rei (e2/e7) e confirmem novamente. Exércitos ficam escondidos durante a montagem e são revelados juntos.</p><p className="rules-footnote">Esta etapa tem partidas casuais e salas com amigos. Contas, ranking, histórico persistente e recompensas ficam para as próximas etapas. Uma partida nova reinicia moedas, peças e melhorias. Séries de melhor de três continuam em estudo.</p></div></Modal>}
    {modal === 'review' && snapshot && <Modal title="Seu exército está pronto?" close={() => setModal(null)}><p className="modal-description">Confira as escolhas. Os dois exércitos serão revelados quando ambos confirmarem.</p><div className="review-stats"><div><strong>{spent}/39</strong><span>pontos de material</span></div><div><strong>{snapshot.draft.board.filter(Boolean).length}</strong><span>peças, incluindo o Rei</span></div><div><strong>{spentOnAbilities(snapshot.draft.board)}</strong><span>moedas em melhorias</span></div></div><ul className="review-list">{snapshot.draft.board.map((p, square) => p?.ability ? <li key={p.id}><Piece kind={p.kind} color={p.color}/><span><strong>{NAMES[p.kind]} · {squareName(square)}</strong><small>{abilityById(p.ability)?.name}</small></span><span className="price">{abilityById(p.ability)?.price} ◉</span></li> : null)}</ul>{spentOnAbilities(snapshot.draft.board) === 0 && <p className="small-muted">Você escolheu jogar sem melhorias. Isso também é uma estratégia.</p>}<p className="modal-description">Sobram {snapshot.draft.gold} moedas. O saldo não passa para a próxima partida. {opponent ? 'Após os dois confirmarem, a partida começa em 8 segundos.' : 'Aguardaremos um adversário entrar e confirmar.'}</p><button className="button primary full-width" disabled={!readyForInput} onClick={() => { send('ready', true); setModal(null); setSelected(null); }}>Confirmar exército <span>✓</span></button></Modal>}
    {(modal === 'leave' || modal === 'resign') && <Modal title={modal === 'resign' ? 'Desistir desta partida?' : 'Sair desta sala?'} close={() => setModal(null)}><p className="modal-description">{snapshot?.phase === 'playing' || snapshot?.phase === 'reveal' ? 'Sair encerra a partida e concede a vitória ao adversário.' : 'A preparação será encerrada. Uma nova sala terá um novo sorteio de melhorias.'}</p><div className="modal-actions"><button className="button secondary" onClick={() => setModal(null)}>Continuar aqui</button><button className="button danger-button" onClick={() => { if (modal === 'resign') { send('resign'); setModal(null); } else void leave(); }}>{modal === 'resign' ? 'Desistir' : 'Sair da sala'}</button></div></Modal>}
    {promotion && <Modal title="Escolha a promoção" close={() => setPromotion(null)}><p className="modal-description">A melhoria do peão se encerra. Escolha sua nova peça.</p><div className="promotion-options">{promotion.map(move => <button key={move.promotion} onClick={() => play(move)}><Piece kind={move.promotion!} color={snapshot!.you}/><span>{NAMES[move.promotion!]}</span></button>)}</div></Modal>}
  </div>;
}
