import { AppSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (<>
    <SidebarProvider>
        <AppSidebar/>
        {children}
    </SidebarProvider>
    </> 
  );
}