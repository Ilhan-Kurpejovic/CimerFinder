// PostToolUse hook: poslije svake izmjene fajla pokreće Prettier na tom fajlu.
// Pravilo „formatiraj kod“ u CLAUDE.md bi bila molba; ovaj hook je garancija.
import { execFileSync } from 'node:child_process'

let ulaz = ''
process.stdin.on('data', (dio) => (ulaz += dio))
process.stdin.on('end', () => {
  const fajl = JSON.parse(ulaz).tool_input?.file_path ?? ''
  if (!/\.(tsx?|css|json|md)$/.test(fajl)) return
  try {
    execFileSync('npx', ['prettier', '--write', fajl], { stdio: 'ignore', shell: process.platform === 'win32' })
  } catch {
    // Neuspjelo formatiranje ne smije da zaustavi agenta.
  }
})
