const { execSync, spawn } = require('child_process')
const path = require('path')

const root = path.resolve(__dirname, '..')
const RESTART_DELAY = 3000

function clearCache() {
  try {
    execSync('rm -rf .next', { cwd: root, stdio: 'ignore' })
  } catch {}
}

function start() {
  clearCache()
  console.log('\n[dev:auto] Starting Next.js dev server...\n')

  const child = spawn('npx', ['next', 'dev'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\n[dev:auto] Crashed (exit ${code}) — clearing cache and restarting in 3s...\n`)
      setTimeout(start, RESTART_DELAY)
    }
  })

  // Forward SIGINT/SIGTERM to child and exit cleanly
  const cleanup = () => {
    child.kill()
    process.exit(0)
  }
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

start()
