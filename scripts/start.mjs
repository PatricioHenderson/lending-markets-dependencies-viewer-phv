import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'

const processes = [
  {
    name: 'backend',
    args: ['workspace', '@lending-markets/backend', 'start'],
  },
  {
    name: 'app',
    args: ['workspace', '@lending-markets/app', 'dev'],
  },
]

let shuttingDown = false

const children = processes.map(({ name, args }) => {
  const child = spawn('yarn', args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    env: process.env,
  })

  prefix(child.stdout, name)
  prefix(child.stderr, name)

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`[${name}] exited with ${signal || code}`)
    shutdown(code || 1)
  })

  return child
})

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

function prefix(stream, name) {
  const lines = createInterface({ input: stream })
  lines.on('line', (line) => {
    console.log(`[${name}] ${line}`)
  })
}

function shutdown(code) {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }

  setTimeout(() => process.exit(code), 300).unref()
}
