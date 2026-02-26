import { log } from '../logger'
export async function serverCheck() {
  try {
    let wsDomain =
      process.env.NEXT_PUBLIC_WS_SERVER_URL || 'ws://localhost:9090'
    wsDomain = wsDomain.replace(/^wss?:\/\//, '')
    const protocol = location.protocol.replace(':', '')
    const wsUrl = `${protocol}://${wsDomain}`

    log.info(wsUrl)
    const res = await fetch(`${wsUrl}`)
    if (!res.ok) {
      log.error(`Server responded with status ${res.status}`)
      throw new Error('random error words for catching.')
    }
  } catch (e) {
    throw new Error(`Server is waking up, please wait for a bit.`)
  }
}
