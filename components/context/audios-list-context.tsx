"use client";

import React from "react";
import { AudioFile } from "@/types/transcription";

type AudioContextType = {
  audios: AudioFile[];
  setAudios: React.Dispatch<React.SetStateAction<AudioFile[]>>;
};

const AudioContext = React.createContext<AudioContextType | undefined>(
  undefined,
);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audios, setAudios] = React.useState<AudioFile[]>([]);

  return (
    <AudioContext.Provider value={{ audios, setAudios }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = React.useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
