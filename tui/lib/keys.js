// Raw terminal bytes -> { name, ch }.
const SEQ = {
  '\x1b[A': 'up', '\x1b[B': 'down', '\x1b[C': 'right', '\x1b[D': 'left', '\x1bOA': 'up', '\x1bOB': 'down', '\x1bOC': 'right', '\x1bOD': 'left',
  '\x1b[5~': 'pgup', '\x1b[6~': 'pgdn', '\x1b[H': 'home', '\x1b[F': 'end', '\x1b[1~': 'home', '\x1b[4~': 'end',
  '\x1b[3~': 'delete', '\x1b[Z': 'shift-tab',
}
const SEQS = Object.keys(SEQ).sort((a, b) => b.length - a.length)

export function parseKeys(buf) {
  const keys = []
  let s = String(buf)
  while (s.length) {
    const seq = SEQS.find((q) => s.startsWith(q))
    if (seq) { keys.push({ name: SEQ[seq] }); s = s.slice(seq.length); continue }
    const c = s[0]
    if (c === '\x1b') { if (s.length === 1) keys.push({ name: 'esc' }); s = s.slice(s.length === 1 ? 1 : (/^\x1b\[[0-9;?]*[A-Za-z~]/.exec(s)?.[0].length ?? 1)); continue }
    s = s.slice(1)
    if (c === '\x03') keys.push({ name: 'ctrl-c' })
    else if (c === '\r' || c === '\n') keys.push({ name: 'enter' })
    else if (c === '\t') keys.push({ name: 'tab' })
    else if (c === '\x7f' || c === '\b') keys.push({ name: 'backspace' })
    else if (c >= ' ') keys.push({ name: 'char', ch: c })
  }
  return keys
}
