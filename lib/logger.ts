export type LogContext = unknown

const isServer = typeof window === 'undefined'

const serverColors = {
  info: '\x1b[34m', // blue
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
}

// CSS styles for browser
const browserStyles = {
  info: 'color: dodgerblue;',
  warn: 'color: orange;',
  error: 'color: red;',
}

function logMessage(
  level: 'info' | 'warn' | 'error',
  msg: string,
  ctx?: LogContext
) {
  if (isServer) {
    const color = serverColors[level]
    const reset = serverColors.reset
    const prefix = `[${level.toUpperCase()}]`
    // @ts-ignore - console[level] dynamically accessed
    console[level](`${color}${prefix}${reset} ${msg}`, ctx ?? '')
  } else {
    const style = browserStyles[level]
    const prefix = `[${level.toUpperCase()}]`
    // @ts-ignore
    console[level](`%c${prefix} ${msg}`, style, ctx ?? '')
  }
}

export const log = {
  info: (msg: string, ctx?: LogContext) => logMessage('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logMessage('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => logMessage('error', msg, ctx),
}
