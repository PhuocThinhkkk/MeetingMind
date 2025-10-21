import chalk from "chalk";

export type LogContext = unknown;

export const log = {
  info: (msg: string, ctx?: LogContext) =>
    console.log(chalk.blue(`[INFO] ${msg}`), ctx ?? ""),
  warn: (msg: string, ctx?: LogContext) =>
    console.warn(chalk.yellow(`[WARN] ${msg}`), ctx ?? ""),
  error: (msg: string, ctx?: LogContext) =>
    console.error(chalk.red(`[ERROR] ${msg}`), ctx ?? ""),
};
