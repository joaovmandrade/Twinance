/**
 * Generates placeholder PNG assets for Expo.
 * Uses only Node.js built-ins (zlib, fs) — no external dependencies.
 * Color: primary-600 violet #7c3aed (124, 58, 237)
 */
const fs   = require('fs')
const zlib = require('zlib')
const path = require('path')

// --- CRC-32 table ---
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function u32BE(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n, 0)
  return b
}

function pngChunk(type, data) {
  const tb = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.concat([tb, data])
  return Buffer.concat([u32BE(data.length), tb, data, u32BE(crc32(crcBuf))])
}

function createSolidPNG(width, height, r, g, b) {
  const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width,  0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8]  = 8 // bit depth
  ihdr[9]  = 2 // RGB
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // no interlace

  // Raw scanlines: 1 filter byte + RGB per pixel
  const stride = 1 + width * 3
  const raw    = Buffer.alloc(stride * height)
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0 // filter: None
    for (let x = 0; x < width; x++) {
      const i = y * stride + 1 + x * 3
      raw[i]     = r
      raw[i + 1] = g
      raw[i + 2] = b
    }
  }

  const idat = zlib.deflateSync(raw, { level: 1 }) // level 1 = fast

  return Buffer.concat([
    SIG,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const assetsDir = path.join(__dirname, '..', 'assets')
fs.mkdirSync(assetsDir, { recursive: true })

// Twinance violet: #7c3aed
const R = 124, G = 58, B = 237

const files = [
  { name: 'icon.png',          w: 1024, h: 1024 },
  { name: 'splash.png',        w: 640,  h: 1136 },
  { name: 'adaptive-icon.png', w: 1024, h: 1024 },
  { name: 'favicon.png',       w: 32,   h: 32   },
]

console.log('Generating Twinance placeholder assets...\n')
for (const { name, w, h } of files) {
  const dest = path.join(assetsDir, name)
  fs.writeFileSync(dest, createSolidPNG(w, h, R, G, B))
  console.log(`  ✓  ${name} (${w}×${h})`)
}
console.log('\nDone! Replace with real assets before shipping.')
