import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SignOutBtn } from "@/components/sign-out-btn";
import { HelpModal } from "./help-btn-modal";

/**
 * Render the sidebar header containing a sidebar trigger, a vertical separator, the title "Transcription", and a right-aligned sign-out button.
 *
 * @returns The header JSX element used at the top of the sidebar.
 */
export default function SideBarHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <span className="text-lg font-semibold">Transcription</span>{" "}
      <div className="flex justify-end flex-1">
        <HelpModal />
        <SignOutBtn />
      </div>
    </header>
  );
}

