// Forms for commands that need input. Field types are the GUI's: text, textarea, select, multi, check, tatemono, project.
import { C, st, fit, wrap, strW } from './screen.js'
import { listTatemonos, listProjects } from './data.js'

const norm = (o) => (typeof o === 'string' ? { v: o, l: o } : { v: o.v, l: o.l ?? o.v })

function optionsOf(def) {
  let opts = def.type === 'tatemono' ? listTatemonos().map(norm) : def.type === 'project' ? listProjects().map(norm) : (def.options ?? []).map(norm)
  if (def.type === 'tatemono' || def.type === 'project') {
    if (def.optional) opts = [{ v: '', l: def.optionalLabel ?? '(none)' }, ...opts]
  } else if (def.optional) opts = [{ v: '', l: def.optionalLabel ?? '(none)' }, ...opts]
  return opts
}

export class Form {
  constructor(item) {
    this.item = item
    this.fields = item.form.fields.map((def) => {
      const f = { def, opts: [], sub: 0 }
      if (['select', 'tatemono', 'project'].includes(def.type)) {
        f.opts = optionsOf(def)
        const want = def.value ?? (def.type === 'select' && !def.optional ? f.opts[0]?.v : '')
        f.value = f.opts.some((o) => o.v === want) ? want : ''
      } else if (def.type === 'multi') { f.opts = (def.options ?? []).map(norm); f.value = [...(def.value ?? [])] }
      else if (def.type === 'check') f.value = !!def.value
      else f.value = def.value ?? ''
      return f
    })
    this.idx = 0            // fields.length = the Run button
    this.error = ''
    this.picker = null
  }

  values() { return Object.fromEntries(this.fields.map((f) => [f.def.id, f.value])) }

  validate() {
    for (const f of this.fields) {
      const d = f.def, label = d.label ?? d.id
      if (d.required && (f.value === '' || f.value == null)) return `${label} is required.`
      if (d.pattern && f.value && !d.pattern.test(f.value)) return d.hint ? `${label}: ${d.hint}` : `${label} is not valid.`
    }
    return this.item.form.validate?.(this.values()) || ''
  }

  label(f) { return f.opts.find((o) => o.v === f.value)?.l ?? (f.def.type === 'tatemono' || f.def.type === 'project' ? '(choose…)' : '') }

  key(k) {
    if (this.picker) return this.pickerKey(k)
    const f = this.fields[this.idx], t = f?.def.type
    if (k.name === 'esc') return { cancel: true }
    if (k.name === 'up' || k.name === 'shift-tab') { this.idx = (this.idx + this.fields.length) % (this.fields.length + 1); return null }
    if (k.name === 'down' || k.name === 'tab') { this.idx = (this.idx + 1) % (this.fields.length + 1); return null }
    if (!f) { // Run button
      if (k.name === 'enter') { this.error = this.validate(); return this.error ? null : { submit: this.values() } }
      return null
    }
    this.error = ''
    if (t === 'text' || t === 'textarea') {
      if (k.name === 'char') f.value += k.ch
      else if (k.name === 'backspace') f.value = f.value.slice(0, -1)
      else if (k.name === 'enter') this.idx++
    } else if (t === 'check') {
      if ((k.name === 'char' && k.ch === ' ') || k.name === 'left' || k.name === 'right') f.value = !f.value
      else if (k.name === 'enter') this.idx++
    } else if (t === 'multi') {
      if (k.name === 'left') f.sub = (f.sub + f.opts.length - 1) % f.opts.length
      else if (k.name === 'right') f.sub = (f.sub + 1) % f.opts.length
      else if (k.name === 'char' && k.ch === ' ') { const v = f.opts[f.sub].v; f.value = f.value.includes(v) ? f.value.filter((x) => x !== v) : [...f.value, v] }
      else if (k.name === 'enter') this.idx++
    } else { // select-like
      const i = f.opts.findIndex((o) => o.v === f.value)
      if (k.name === 'left' && f.opts.length) f.value = f.opts[(i + f.opts.length - 1) % f.opts.length].v
      else if (k.name === 'right' && f.opts.length) f.value = f.opts[(i + 1) % f.opts.length].v
      else if (k.name === 'enter' || (k.name === 'char' && k.ch === ' ')) this.picker = { filter: '', sel: Math.max(0, i), f }
    }
    return null
  }

  pickerKey(k) {
    const p = this.picker, list = this.filtered()
    if (k.name === 'esc') this.picker = null
    else if (k.name === 'up') p.sel = Math.max(0, p.sel - 1)
    else if (k.name === 'down') p.sel = Math.min(list.length - 1, p.sel + 1)
    else if (k.name === 'enter') { if (list[p.sel]) { p.f.value = list[p.sel].v; this.picker = null; this.idx++ } }
    else if (k.name === 'backspace') { p.filter = p.filter.slice(0, -1); p.sel = 0 }
    else if (k.name === 'char') { p.filter += k.ch; p.sel = 0 }
    return null
  }

  filtered() {
    const q = this.picker.filter.toLowerCase()
    return this.picker.f.opts.filter((o) => o.l.toLowerCase().includes(q))
  }

  draw(scr) {
    const w = Math.min(scr.w - 4, 68), inner = w - 4
    const rows = this.fields.reduce((n, f) => n + (f.def.type === 'check' ? 1 : 2), 0)
    const desc = wrap(this.item.desc ?? '', inner).slice(0, 2)
    const h = Math.min(scr.h - 2, rows + desc.length + 7)
    const x = Math.floor((scr.w - w) / 2), y = Math.max(0, Math.floor((scr.h - h) / 2))
    scr.fill(x, y, w, h, '')
    scr.box(x, y, w, h, C.pink, `✿ ${this.item.title}`)
    let r = y + 1
    desc.forEach((d) => scr.put(x + 2, r++, fit(d, inner), C.mute))
    r++
    this.fields.forEach((f, i) => {
      const on = this.idx === i, d = f.def, t = d.type
      const lab = (d.label ?? d.id) + (d.required ? ' *' : '')
      if (t === 'check') {
        scr.put(x + 2, r, on ? '▸' : ' ', C.pink)
        scr.put(x + 4, r, `${f.value ? '[✓]' : '[ ]'} ${fit(lab, inner - 6)}`, on ? st(C.white, C.bold) : C.mute)
        r++; return
      }
      scr.put(x + 2, r, on ? '▸' : ' ', C.pink)
      scr.put(x + 4, r, fit(lab, inner - 2), on ? st(C.pink, C.bold) : C.mute)
      r++
      const bg = on ? C.field : ''
      scr.fill(x + 4, r, inner - 2, 1, bg)
      if (t === 'text' || t === 'textarea') {
        const val = String(f.value), shown = strW(val) > inner - 6 ? '…' + val.slice(-(inner - 7)) : val
        if (!val && !on) scr.put(x + 5, r, fit(d.placeholder ?? '', inner - 4), st(C.dim, bg))
        else scr.put(x + 5, r, shown + (on ? '▏' : ''), st(C.white, bg))
        if (!val && on && d.placeholder) scr.put(x + 6, r, fit(d.placeholder, inner - 6), st(C.dim, bg))
      } else if (t === 'multi') {
        let cx = x + 5
        f.opts.forEach((o, j) => {
          const hit = on && f.sub === j
          cx = scr.put(cx, r, `${f.value.includes(o.v) ? '[✓]' : '[ ]'} ${o.l}`, st(hit ? C.pink : C.white, hit && C.bold, bg)) + 2
        })
      } else {
        const lab2 = this.label(f)
        scr.put(x + 5, r, fit(lab2, inner - 8), st(f.value === '' && lab2.startsWith('(choose') ? C.dim : C.white, bg))
        if (on) scr.put(x + inner + 1 - 2, r, '▾', st(C.pink, bg))
      }
      r++
    })
    const bi = this.fields.length
    r = Math.min(r + 0, y + h - 4)
    scr.put(x + 2, r, this.idx === bi ? '▸' : ' ', C.pink)
    scr.put(x + 4, r, ' ▶ Run ', this.idx === bi ? st('38;5;232', '48;5;211', C.bold) : st(C.pink, C.field))
    if (this.error) scr.put(x + 14, r, fit(this.error, inner - 12), C.red)
    scr.put(x + 2, y + h - 2, fit('↑↓ field   ←→ change   ␣ toggle   ⏎ next / pick   esc cancel', inner), C.dim)
    if (this.picker) this.drawPicker(scr)
  }

  drawPicker(scr) {
    const p = this.picker, list = this.filtered()
    const w = Math.min(scr.w - 8, 52), vis = Math.min(Math.max(list.length, 1), 10), h = vis + 4
    const x = Math.floor((scr.w - w) / 2), y = Math.max(0, Math.floor((scr.h - h) / 2))
    scr.fill(x, y, w, h, '')
    scr.box(x, y, w, h, C.rose, 'Choose')
    scr.put(x + 2, y + 1, '⌕ ' + p.filter + '▏', C.white)
    const top = Math.max(0, Math.min(p.sel - vis + 1, list.length - vis))
    if (!list.length) scr.put(x + 2, y + 3, 'Nothing matches', C.dim)
    list.slice(top, top + vis).forEach((o, i) => {
      const on = top + i === p.sel
      scr.fill(x + 1, y + 3 + i, w - 2, 1, on ? C.sel : '')
      scr.put(x + 2, y + 3 + i, (on ? '▸ ' : '  ') + fit(o.l, w - 6), on ? st(C.pink, C.bold, C.sel) : C.white)
    })
  }
}
