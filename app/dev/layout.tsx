import { log } from "@/lib/logger"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let isDev = false
    const node_env = process.env.NODE_ENV
    if (node_env == 'development' || node_env == "test") isDev = true
    log.info("enviroment: ", node_env)

    if (!isDev) {
        return
    }
    return (
        <>{children}</>

    )
}
