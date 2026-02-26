import { AppSidebar } from '@/components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SidebarInset } from '@/components/ui/sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  )
}
