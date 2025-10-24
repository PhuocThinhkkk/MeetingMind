import chalk from "chalk";

export type LogContext = unknown;
const isServer = typeof window === "undefined";

const browserStyles = {
  info: "color: dodgerblue;",
  warn: "color: orange;",
  error: "color: red;",
};

export const log = {
  info: (msg: string, ctx?: LogContext) => {
    if (isServer)
      console.log(chalk.blue(`[INFO] ${msg}`), ctx ?? "");
    else
      console.log(`%c[INFO] ${msg}`, browserStyles.info, ctx ?? "");
  },
  warn: (msg: string, ctx?: LogContext) => {
    if (isServer)
      console.warn(chalk.yellow(`[WARN] ${msg}`), ctx ?? "");
    else
      console.warn(`%c[WARN] ${msg}`, browserStyles.warn, ctx ?? "");
  },
  error: (msg: string, ctx?: LogContext) => {
    if (isServer)
      console.error(chalk.red(`[ERROR] ${msg}`), ctx ?? "");
    else
      console.error(`%c[ERROR] ${msg}`, browserStyles.error, ctx ?? "");
  },
};

