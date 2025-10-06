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

export default function Page() {
  return (
    <RealtimeRecorderProvider>
      <SidebarInset>
        <SideBarHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <HomePage />
        </div>
      </SidebarInset>
    </RealtimeRecorderProvider>
  );
}

