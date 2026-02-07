import { log } from '../logger'

/**
 * Create and return a new AudioContext, using a vendor-prefixed fallback if necessary.
 *
 * @returns A newly created AudioContext instance
 */
export function initAudioContext() {
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContextClass()
  return audioContext
}

/**
 * Requests the user's display capture including system audio and video.
 *
 * @returns `MediaStream` containing the captured display (video) and system audio if permission is granted, `null` if permission is denied or an error occurs.
 */
export async function requestSystemAudio() {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      audio: true,
    })
  } catch (err) {
    log.error('System audio permission denied:', err)
    return null
  }
}

/**
 * Request permission to capture microphone audio and return the captured MediaStream.
 *
 * @returns The captured `MediaStream` if permission is granted, `null` otherwise.
 */
export async function requestMicrophoneAudio() {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (err) {
    log.error('Microphone permission denied:', err)
    return null
  }
}

/**
 * Mixes provided system and microphone MediaStreams into a single MediaStream using the given AudioContext.
 *
 * @param audioContext - AudioContext used to create sources and the destination node
 * @param systemStream - Optional system (display) audio MediaStream to include in the mix
 * @param micStream - Optional microphone audio MediaStream to include in the mix
 * @returns A MediaStream that contains the mixed audio from the provided streams
 * @throws If creating media sources or connecting nodes fails
 */
export async function mixAudioStreams(
  audioContext: AudioContext,
  systemStream: MediaStream | null,
  micStream: MediaStream | null
): Promise<MediaStream> {
  try {
    if (!systemStream && !micStream) {
      throw new Error('No audio streams provided for mixing.')
    }
    const destination = audioContext.createMediaStreamDestination()

    if (systemStream) {
      const systemSource = audioContext.createMediaStreamSource(systemStream)
      systemSource.connect(destination)
    }
    if (micStream) {
      const micSource = audioContext.createMediaStreamSource(micStream)
      micSource.connect(destination)
    }
    return destination.stream
  } catch (err) {
    log.error('Error mixing audio streams:', err)
    throw err
  }
}

/**
 * Loads the PCM worklet module and routes the provided MediaStream through a "pcm-processor" AudioWorkletNode into the AudioContext destination.
 *
 * @param audioContext - The AudioContext used to load the worklet and create audio nodes.
 * @param mixedStream - The MediaStream to be processed and routed (e.g., a mixed system and microphone stream).
 * @returns The connected `AudioWorkletNode` named "pcm-processor".
 */
export async function setupAudioWorklet(
  audioContext: AudioContext,
  mixedStream: MediaStream
) {
  await audioContext.audioWorklet.addModule('/worklet-processor.js')

  const source = audioContext.createMediaStreamSource(mixedStream)
  const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor')

  source.connect(workletNode).connect(audioContext.destination)
  return workletNode
}
