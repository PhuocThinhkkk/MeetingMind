import { AudioProvider } from "@/components/context/audios-list-context";
import TranscriptHistoryPage from "./transcript-history-page";
import { Suspense } from "react";

/**
 * Render the History Recording page layout.
 *
 * Includes a header and a centered container that provides audio context to the transcript history content.
 *
 * @returns A JSX element for the History Recording page containing the header and a content area wrapped with an audio provider context.
 */
export default function HistoryPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {" "}
        <div className="mb-6 border-b pb-3">
          <h1 className="text-xl font-semibold text-foreground">
            History Recording
          </h1>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AudioProvider>
            <TranscriptHistoryPage />
          </AudioProvider>
        </Suspense>
      </div>
    </main>
  );
}
