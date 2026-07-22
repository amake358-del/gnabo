import { execSync, execFileSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const certDir = join(__dirname, 'certs')
const certFile = join(certDir, 'dev.pem')
const keyFile = join(certDir, 'dev-key.pem')

function findMkcert() {
  const candidates = [
    'mkcert',
    join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'FiloSottile.mkcert_Microsoft.Winget.Source_8wekyb3d8bbwe', 'mkcert.exe'),
    join(os.homedir(), 'scoop', 'shims', 'mkcert.exe'),
    join(os.homedir(), 'go', 'bin', 'mkcert.exe'),
  ]
  for (const c of candidates) {
    try {
      execFileSync(c, ['-version'], { stdio: 'ignore' })
      return c
    } catch {}
  }
  return null
}

export default function httpsDevPlugin() {
  return {
    name: 'https-dev',
    config(config, { command }) {
      if (command !== 'serve') return

      const mkcert = findMkcert()
      if (!mkcert) {
        console.warn('[https-dev] mkcert not found — LAN PWA disabled. Install: winget install FiloSottile.mkcert')
        return
      }

      const nets = os.networkInterfaces()
      const ips = ['localhost', '127.0.0.1', '::1']
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            ips.push(net.address)
          }
        }
      }

      if (!existsSync(certDir)) mkdirSync(certDir, { recursive: true })

      try {
        execFileSync(mkcert, ['-install'], { stdio: 'pipe' })
      } catch {
        console.warn('[https-dev] mkcert -install failed (need admin?) — certs untrusted but will still work')
      }

      try {
        execFileSync(mkcert, [
          '-cert-file', certFile,
          '-key-file', keyFile,
          ...ips
        ], { stdio: 'pipe' })
      } catch (e) {
        console.error('[https-dev] cert generation failed:', e.message)
        return
      }

      return {
        server: {
          https: { cert: certFile, key: keyFile }
        }
      }
    }
  }
}
