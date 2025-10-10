import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

/**
 * Root layout component that wraps page content with the sidebar provider and renders the application sidebar.
 *
 * @param children - Page content to render inside the layout, after the sidebar.
 * @returns A React element that provides sidebar context and renders the `AppSidebar` followed by `children`.
 */
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