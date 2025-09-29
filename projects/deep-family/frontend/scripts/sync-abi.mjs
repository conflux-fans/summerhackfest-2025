import { promises as fs } from 'fs'
import path from 'path'

async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function main() {
  const cwd = process.cwd() // frontend/
  const candidates = [
    path.resolve(cwd, '../artifacts/contracts/DeepFamily.sol/DeepFamily.json'), // hardhat
    path.resolve(cwd, '../out/DeepFamily.sol/DeepFamily.json'), // foundry flat
    path.resolve(cwd, '../contracts/out/DeepFamily.sol/DeepFamily.json'), // alternate
  ]

  let src = null
  for (const c of candidates) {
    if (await fileExists(c)) { src = c; break }
  }

  const dest = path.resolve(cwd, 'src/abi/DeepFamily.json')

  if (!src) {
    console.warn('[sync-abi] DeepFamily.json not found in artifacts, keeping existing ABI as fallback. Searched paths:')
    candidates.forEach(c => console.warn('  -', c))
    return
  }

  const buf = await fs.readFile(src)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, buf)
  console.log('[sync-abi] ABI synced ->', path.relative(cwd, dest))
}

main().catch(e => { console.error('[sync-abi] Failed:', e); process.exit(1) })


