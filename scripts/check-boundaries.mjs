// Provjera granica između slojeva: shared (components, lib, hooks) -> features -> app.
// Pokreće se kao dio `npm run lint`. Bez zavisnosti, samo Node.
//
// Pravila:
// 1. Feature ne uvozi drugi feature (src/features/X ne uvozi iz src/features/Y).
// 2. Zajednički kod (src/components, src/lib, src/hooks) ne uvozi iz src/features ni iz src/app.
// 3. Feature ne uvozi iz src/app.
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const KORIJEN = path.resolve(import.meta.dirname, '..')
const SRC = path.join(KORIJEN, 'src')
const ZAJEDNICKI = ['components', 'lib', 'hooks']

// import x from '...', import '...', export ... from '...', import('...')
const IMPORT_REGEX =
  /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

function sviFajlovi(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((stavka) => {
    const putanja = path.join(folder, stavka.name)
    if (stavka.isDirectory()) return sviFajlovi(putanja)
    return /\.tsx?$/.test(stavka.name) ? [putanja] : []
  })
}

// Vraća putanju relativnu u odnosu na src/ sa "/" (i na Windowsu), ili null ako import nije iz src/.
function uSrc(apsolutna) {
  const relativna = path.relative(SRC, apsolutna)
  if (relativna.startsWith('..') || path.isAbsolute(relativna)) return null
  return relativna.split(path.sep).join('/')
}

function cilj(fajl, specifikator) {
  if (specifikator.startsWith('@/')) return uSrc(path.join(SRC, specifikator.slice(2)))
  if (specifikator.startsWith('.')) return uSrc(path.resolve(path.dirname(fajl), specifikator))
  return null // paket iz node_modules
}

function oblast(putanjaUSrc) {
  const [prvi, drugi] = putanjaUSrc.split('/')
  if (prvi === 'features') return { sloj: 'features', feature: drugi }
  if (prvi === 'app') return { sloj: 'app' }
  if (ZAJEDNICKI.includes(prvi)) return { sloj: 'zajednicki' }
  return { sloj: 'ostalo' }
}

function prekrsaj(od, ka) {
  if (od.sloj === 'features' && ka.sloj === 'features' && od.feature !== ka.feature) {
    return `feature "${od.feature}" ne smije da uvozi iz feature-a "${ka.feature}". Zajednički kod premjesti u src/lib ili src/components, a feature-e spoji u ruti (src/app/routes).`
  }
  if (od.sloj === 'zajednicki' && (ka.sloj === 'features' || ka.sloj === 'app')) {
    return `zajednički kod (src/components, src/lib, src/hooks) ne smije da uvozi iz src/${ka.sloj}.`
  }
  if (od.sloj === 'features' && ka.sloj === 'app') {
    return 'feature ne smije da uvozi iz src/app. Ruta koristi feature, nikad obrnuto.'
  }
  return null
}

const greske = []

for (const fajl of sviFajlovi(SRC)) {
  const od = oblast(uSrc(fajl))
  const kod = readFileSync(fajl, 'utf8')
  for (const pogodak of kod.matchAll(IMPORT_REGEX)) {
    const specifikator = pogodak[1] ?? pogodak[2]
    const putanja = cilj(fajl, specifikator)
    if (!putanja) continue
    const poruka = prekrsaj(od, oblast(putanja))
    if (poruka) greske.push(`  src/${uSrc(fajl)}\n    import '${specifikator}'\n    -> ${poruka}`)
  }
}

if (greske.length > 0) {
  console.error(`\nProvjera granica nije prošla (${greske.length}):\n\n${greske.join('\n\n')}\n`)
  process.exit(1)
}

console.log('Provjera granica: sve u redu.')
