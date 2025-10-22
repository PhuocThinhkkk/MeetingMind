import { log } from "./logger";

export function initAudioContext() {
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
  return audioContext;
}

export async function requestSystemAudio() {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
  } catch (err) {
    log.error("System audio permission denied:", err);
    return null;
  }
}

export async function requestMicrophoneAudio() {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    log.error("Microphone permission denied:", err);
    return null;
  }
}

export async function mixAudioStreams(
  audioContext: AudioContext,
  systemStream: MediaStream | null,
  micStream: MediaStream | null,
): Promise<MediaStream> {
  try {
    const destination = audioContext.createMediaStreamDestination();

    if (systemStream) {
      const systemSource = audioContext.createMediaStreamSource(systemStream);
      systemSource.connect(destination);
    }
    if (micStream) {
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    }
    return destination.stream;
  } catch (err) {
    log.error("Error mixing audio streams:", err);
    throw err;
  }
}

export async function setupAudioWorklet(
  audioContext: AudioContext,
  mixedStream: MediaStream,
) {
  await audioContext.audioWorklet.addModule("/worklet-processor.js");

  const source = audioContext.createMediaStreamSource(mixedStream);
  const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");

  source.connect(workletNode).connect(audioContext.destination);
  return workletNode;
}
