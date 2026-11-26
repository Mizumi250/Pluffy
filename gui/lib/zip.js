'use strict'
// A tiny read-only zip reader (a .vsix is a plain zip). Supports stored and deflated entries,
// which is all `vsce package` produces. No dependencies.

const fs = require('node:fs')
const zlib = require('node:zlib')

const EOCD = 0x06054b50
const CEN = 0x02014b50
const LOC = 0x04034b50

function readZip(file) {
  const buf = fs.readFileSync(file)
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
    if (buf.readUInt32LE(i) === EOCD) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('Not a zip file: ' + file)
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  const entries = new Map()
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== CEN) throw new Error('Broken zip directory')
    const method = buf.readUInt16LE(p + 10)
    const size = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const offset = buf.readUInt32LE(p + 42)
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen)
    entries.set(name, { method, size, offset })
    p += 46 + nameLen + extraLen + commentLen
  }
  const read = (name) => {
    const e = entries.get(name)
    if (!e) return null
    if (buf.readUInt32LE(e.offset) !== LOC) throw new Error('Broken zip entry: ' + name)
    const start = e.offset + 30 + buf.readUInt16LE(e.offset + 26) + buf.readUInt16LE(e.offset + 28)
    const data = buf.subarray(start, start + e.size)
    if (e.method === 0) return Buffer.from(data)
    if (e.method === 8) return zlib.inflateRawSync(data)
    throw new Error(`Unsupported zip method ${e.method} for ${name}`)
  }
  return { names: () => [...entries.keys()], has: (n) => entries.has(n), read }
}

module.exports = { readZip }
