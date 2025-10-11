import { AudioProvider } from "@/components/context/audios-list-context";
import TranscriptHistoryPage from "./transcript-history-page";

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
        <AudioProvider>
            <TranscriptHistoryPage/>
        </AudioProvider>
      </div>
    </main>
  );
}

