export type Player = 'X' | 'O'
export type Difficulty = 'easy' | 'normal' | 'hard'
export type GameState = {
  board: Array<Player | null>
  history: Record<Player, number[]>
  current: Player
  winner: Player | null
  winLine: number[] | null
  turns: number
}

export const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

export const freshGame = (): GameState => ({ board: Array(9).fill(null), history: { X: [], O: [] }, current: 'X', winner: null, winLine: null, turns: 0 })

export const findWin = (board: GameState['board'], player: Player) => WIN_LINES.find((line) => line.every((i) => board[i] === player)) ?? null

export const playTurn = (state: GameState, index: number): GameState => {
  if (state.winner || state.board[index]) return state
  const player = state.current
  const board = [...state.board]
  const history = { X: [...state.history.X], O: [...state.history.O] }
  board[index] = player
  history[player].push(index)
  if (history[player].length > 3) board[history[player].shift()!] = null
  const winLine = findWin(board, player)
  return { board, history, current: winLine ? player : player === 'X' ? 'O' : 'X', winner: winLine ? player : null, winLine, turns: state.turns + 1 }
}

const openCells = (state: GameState) => state.board.map((v, i) => v ? -1 : i).filter((i) => i >= 0)

const scorePosition = (state: GameState) => {
  if (state.winner === 'O') return 100 - state.turns * .05
  if (state.winner === 'X') return -100 + state.turns * .05
  const lines = WIN_LINES.reduce((score, line) => {
    const cells = line.map((i) => state.board[i])
    const x = cells.filter((v) => v === 'X').length
    const o = cells.filter((v) => v === 'O').length
    if (x && o) return score
    return score + (o ? 2 ** o : x ? -(2 ** x) : 0)
  }, 0)
  return lines + (state.board[4] === 'O' ? 1.5 : state.board[4] === 'X' ? -1.5 : 0)
}

const minimax = (state: GameState, depth: number, maximizing: boolean, alpha: number, beta: number, seen: Set<string>): number => {
  if (state.winner || depth === 0) return scorePosition(state)
  const key = `${state.board.join('')}/${state.history.X.join('')}/${state.history.O.join('')}/${state.current}`
  if (seen.has(key)) return scorePosition(state) * .25
  const nextSeen = new Set(seen).add(key)
  let best = maximizing ? -Infinity : Infinity
  for (const cell of openCells(state)) {
    const value = minimax(playTurn(state, cell), depth - 1, !maximizing, alpha, beta, nextSeen)
    if (maximizing) { best = Math.max(best, value); alpha = Math.max(alpha, value) }
    else { best = Math.min(best, value); beta = Math.min(beta, value) }
    if (beta <= alpha) break
  }
  return best
}

export const chooseAiMove = (state: GameState, difficulty: Difficulty): number | null => {
  const available = openCells(state)
  if (!available.length) return null
  if (difficulty === 'easy') return available[Math.floor(Math.random() * available.length)]
  for (const cell of available) if (playTurn(state, cell).winner === 'O') return cell
  for (const cell of available) {
    const threat = playTurn({ ...state, current: 'X' }, cell)
    if (threat.winner === 'X') return cell
  }
  if (difficulty === 'normal') {
    const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7].filter((i) => available.includes(i))
    return preferred[Math.floor(Math.random() * Math.min(preferred.length, 3))]
  }
  let best = available[0]
  let bestScore = -Infinity
  for (const cell of available) {
    const score = minimax(playTurn(state, cell), 7, false, -Infinity, Infinity, new Set())
    if (score > bestScore) { bestScore = score; best = cell }
  }
  return best
}
