"use client";
import SideBarHeader from "@/components/side-bar-header";
import HomePage from "./home-page";
import { SidebarInset } from "@/components/ui/sidebar";
import dynamic from "next/dynamic";

const RealtimeRecorderProvider = dynamic(
  () =>
    import("@/components/context/realtime-recorder-context").then((mod) => ({
      default: mod.RecorderProvider,
    })),
  {
    ssr: false,
    loading: () => <p>Loading recorder…</p>,
  },
);

/**
 * Renders the home page within the realtime recorder provider and sidebar layout.
 *
 * @returns A JSX element with `RealtimeRecorderProvider` wrapping `SidebarInset`, which includes `SideBarHeader` and the `HomePage` content.
 */
export default function Page() {
  return (
    <RealtimeRecorderProvider>
        <SideBarHeader header="Transcription" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <HomePage />
        </div>
    </RealtimeRecorderProvider>
  );
}
