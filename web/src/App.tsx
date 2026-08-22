import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { chooseAiMove, freshGame, playTurn, type Difficulty, type GameState, type Player } from './game'
import './App.css'

type Mode = 'pvc' | 'pvp'
type Screen = 'menu' | 'game'
const depth = (value: number) => ({ '--xr-back': `${value}`, '--xr-background-material': 'thin' }) as CSSProperties

function useSound() {
  const context = useRef<AudioContext | null>(null)
  const muted = useRef(false)
  const tone = useCallback((frequency: number, duration = .14) => {
    if (muted.current) return
    context.current ??= new AudioContext()
    const oscillator = context.current.createOscillator(); const gain = context.current.createGain()
    oscillator.type = 'sine'; oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(.09, context.current.currentTime)
    gain.gain.exponentialRampToValueAtTime(.001, context.current.currentTime + duration)
    oscillator.connect(gain).connect(context.current.destination); oscillator.start(); oscillator.stop(context.current.currentTime + duration)
  }, [])
  return { tone, muted, toggle: () => { muted.current = !muted.current; return muted.current } }
}

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [mode, setMode] = useState<Mode>('pvc')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [game, setGame] = useState<GameState>(freshGame)
  const [scores, setScores] = useState({ X: 0, O: 0 })
  const [thinking, setThinking] = useState(false)
  const [muted, setMuted] = useState(false)
  const sound = useSound()

  const start = (nextMode: Mode) => { setMode(nextMode); setGame(freshGame()); setScreen('game') }
  const reset = () => { setThinking(false); setGame(freshGame()) }

  const commitMove = useCallback((index: number) => {
    const next = playTurn(game, index)
    if (next === game) return
    sound.tone(next.winner ? 880 : game.current === 'X' ? 520 : 380, next.winner ? .42 : .14)
    if (next.winner && !game.winner) setScores((s) => ({ ...s, [next.winner!]: s[next.winner!] + 1 }))
    setGame(next)
  }, [game, sound.tone])

  useEffect(() => {
    if (screen !== 'game' || mode !== 'pvc' || game.current !== 'O' || game.winner) return
    setThinking(true)
    const timer = window.setTimeout(() => {
      const move = chooseAiMove(game, difficulty)
      if (move !== null) commitMove(move)
      setThinking(false)
    }, 520)
    return () => window.clearTimeout(timer)
  }, [commitMove, difficulty, game, mode, screen])

  const oldest = (player: Player) => game.history[player].length >= 3 ? game.history[player][0] : -1
  const status = game.winner
    ? `${game.winner === 'X' ? (mode === 'pvc' ? '你' : 'X 玩家') : (mode === 'pvc' ? 'AI' : 'O 玩家')} 赢得本局`
    : thinking ? 'AI 正在推演轨道…' : `${game.current === 'X' ? (mode === 'pvc' ? '你的' : 'X 玩家的') : (mode === 'pvc' ? 'AI 的' : 'O 玩家的')}回合`

  if (screen === 'menu') return (
    <main className="app-shell menu-shell">
      <div className="star-field" /><div className="aurora aurora-a" /><div className="aurora aurora-b" />
      <header className="brandbar"><span className="brand-orbit"><i /></span><div><small>PICO WEBSPATIAL GAME</small><h1>星环井字棋</h1></div><b>循环竞技版</b></header>
      <section className="menu-stage">
        <div className="hero-copy" enable-xr="" style={depth(38)}>
          <span className="eyebrow">ORBITAL TACTICS · 01</span>
          <h2>三子成线，<br/><em>旧子新生。</em></h2>
          <p>每位玩家最多保留三枚棋子。第四枚落下时，最早的棋子会坠出棋盘——胜负永远在变化。</p>
          <div className="rule-chips"><span>最多 6 子</span><span>循环消除</span><span>空间射线</span></div>
        </div>
        <div className="preview-wrap" enable-xr="" style={depth(92)}>
          <div className="mini-board">{Array.from({length:9},(_,i)=><i key={i} className={i===0||i===4?'mini-x':i===2||i===5?'mini-o':''}>{i===0||i===4?'×':i===2||i===5?'○':''}</i>)}</div>
          <span className="orbit-ring ring-one"/><span className="orbit-ring ring-two"/>
        </div>
        <aside className="launch-card" enable-xr="" style={depth(58)}>
          <span className="card-label">选择对局</span>
          <button className="primary-action" onClick={() => start('pvc')}><i>⌁</i><span><b>挑战空间 AI</b><small>单人 · 自适应策略</small></span><strong>→</strong></button>
          <button className="secondary-action" onClick={() => start('pvp')}><i>◎</i><span><b>本地双人对战</b><small>轮流使用控制器</small></span><strong>→</strong></button>
          <div className="difficulty"><span>AI 难度</span>{(['easy','normal','hard'] as Difficulty[]).map((d)=><button className={difficulty===d?'active':''} onClick={()=>setDifficulty(d)} key={d}>{{easy:'轻松',normal:'策略',hard:'大师'}[d]}</button>)}</div>
          <div className="tip"><i/> 使用 PICO 手柄射线点击棋格</div>
        </aside>
      </section>
      <footer>ORBITAL LAB / EXPERIMENT 09 <span>◌</span> WEBSPATIAL READY</footer>
    </main>
  )

  return (
    <main className="app-shell game-shell">
      <div className="star-field" /><div className="aurora aurora-a" /><div className="aurora aurora-b" />
      <header className="game-header" enable-xr="" style={depth(28)}>
        <button className="icon-button" onClick={() => setScreen('menu')} aria-label="返回">←</button>
        <div className="game-brand"><span className="brand-orbit small"><i /></span><div><small>ORBITAL MATCH</small><b>星环井字棋</b></div></div>
        <div className="score-strip"><span className="x-score">X <b>{scores.X}</b></span><i>:</i><span className="o-score"><b>{scores.O}</b> O</span></div>
        <button className="icon-button" onClick={() => { const value = sound.toggle(); setMuted(value) }} aria-label="声音">{muted?'♩':'♫'}</button>
      </header>

      <section className="game-layout">
        <aside className="info-panel" enable-xr="" style={depth(55)}>
          <span className="panel-kicker">MATCH STATUS</span><h2>{status}</h2>
          <div className={`turn-orb ${game.current === 'O' ? 'is-o' : ''}`}><span>{game.current}</span><i/></div>
          <div className="phase-row"><span>回合进度</span><b>{String(game.turns + 1).padStart(2,'0')}</b></div>
          <div className="piece-stock"><div><span className="x-chip">×</span><p>X 棋子<b>{game.history.X.length} / 3</b></p></div><div><span className="o-chip">○</span><p>O 棋子<b>{game.history.O.length} / 3</b></p></div></div>
          <div className="cycle-note"><i>↻</i><p><b>循环规则</b>第 4 枚棋子落下时，带轨道标记的最旧棋子会先行消失。</p></div>
        </aside>

        <section className="board-zone">
          <div className="board-caption"><span>TACTICAL GRID / 3×3</span><b>{game.winner ? 'MATCH COMPLETE' : 'SYSTEM ACTIVE'}</b></div>
          <div className={`board-frame ${game.winner ? 'has-winner' : ''}`} enable-xr="" style={depth(112)}>
            <div className="board-glow" />
            <div className="board-grid">
              {game.board.map((cell, index) => {
                const expiring = !game.winner && (oldest('X') === index || oldest('O') === index)
                const winning = !!game.winLine?.includes(index)
                return <button key={index} type="button" className={`board-cell ${cell ? 'occupied' : ''} ${expiring ? 'expiring' : ''} ${winning ? 'winning' : ''}`} disabled={!!cell || !!game.winner || thinking} onClick={() => commitMove(index)} enable-xr="" style={depth(cell ? 34 : 16)} aria-label={`棋格 ${index + 1}${cell ? `，${cell}` : ''}`}>
                  <span className="cell-index">0{index + 1}</span>
                  {cell && <span className={`piece piece-${cell.toLowerCase()}`}>{cell === 'X' ? <><i/><i/></> : <i/>}</span>}
                  {expiring && <span className="expiry-badge">NEXT OUT</span>}
                </button>
              })}
            </div>
            {game.winner && <div className="victory-panel"><small>LINE ESTABLISHED</small><strong>{game.winner}</strong><h3>{status}</h3><button onClick={reset}>再来一局</button></div>}
          </div>
        </section>

        <aside className="control-panel" enable-xr="" style={depth(55)}>
          <span className="panel-kicker">CONTROL DECK</span><h2>轨道控制台</h2>
          <div className="player-card x-player"><span>×</span><p><small>{mode==='pvc'?'PLAYER 01':'PLAYER X'}</small><b>{mode==='pvc'?'你':'X 玩家'}</b></p><i className={game.current==='X'&&!game.winner?'online':''}/></div>
          <div className="player-card o-player"><span>○</span><p><small>{mode==='pvc'?'SPATIAL AI':'PLAYER O'}</small><b>{mode==='pvc'?{easy:'轻松 AI',normal:'策略 AI',hard:'大师 AI'}[difficulty]:'O 玩家'}</b></p><i className={game.current==='O'&&!game.winner?'online':''}/></div>
          <div className="legend"><b>棋盘信号</b><span><i className="legend-old"/>即将消除</span><span><i className="legend-win"/>胜利连线</span><span><i className="legend-open"/>可落子</span></div>
          <button className="reset-button" onClick={reset}>↻ 重置本局</button>
        </aside>
      </section>
    </main>
  )
}

export default App
