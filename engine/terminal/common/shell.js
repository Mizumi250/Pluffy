// Splits the `cmd:` of a command example into arguments: single quotes, double quotes and
// backslash escapes work the way they do in a POSIX shell. Nothing is expanded.
export function splitArgs(text) {
  const out = []
  let current = '', has = false, quote = null
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quote === "'") {
      if (c === "'") quote = null
      else current += c
    } else if (quote === '"') {
      if (c === '"') quote = null
      else if (c === '\\' && /["\\$`]/.test(text[i + 1] ?? '')) current += text[++i]
      else current += c
    } else if (c === "'" || c === '"') {
      quote = c; has = true
    } else if (c === '\\' && i + 1 < text.length) {
      current += text[++i]; has = true
    } else if (/\s/.test(c)) {
      if (has || current) { out.push(current); current = ''; has = false }
    } else {
      current += c
    }
  }
  if (quote) throw new Error(`unterminated ${quote} quote in: ${text}`)
  if (has || current) out.push(current)
  return out
}

// expect_stdout / expect_stderr: a value written as /pattern/ is a regular expression, anything
// else is a substring.
export function matchesExpectation(text, expectation) {
  if (expectation.length > 2 && expectation.startsWith('/') && expectation.endsWith('/')) {
    return new RegExp(expectation.slice(1, -1)).test(text)
  }
  return text.includes(expectation)
}
