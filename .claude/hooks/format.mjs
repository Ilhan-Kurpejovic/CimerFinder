// PostToolUse hook: poslije svake izmjene fajla pokreće Prettier na tom fajlu.
// Pravilo „formatiraj kod“ u CLAUDE.md bi bila molba; ovaj hook je garancija.
// Koristi lokalni Prettier iz node_modules (instaliran sa `pnpm install`), bez npx-a.
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const projekat = process.env.CLAUDE_PROJECT_DIR ?? path.resolve(import.meta.dirname, '../..')
const prettier = path.join(projekat, 'node_modules', 'prettier', 'bin', 'prettier.cjs')

let ulaz = ''
process.stdin.on('data', (dio) => (ulaz += dio))
process.stdin.on('end', () => {
  try {
    const fajl = JSON.parse(ulaz).tool_input?.file_path ?? ''
    if (!/\.(tsx?|css|json|md)$/.test(fajl)) return
    execFileSync(process.execPath, [prettier, '--write', fajl], { cwd: projekat, stdio: 'ignore' })
  } catch {
    // Neuspjelo formatiranje ne smije da zaustavi agenta.
  }
})
