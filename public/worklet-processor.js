// public/worklet-processor.js

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.postMessage({ type: "ready" });
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0]; // Mono input
    const pcmData = new Int16Array(channelData.length);

    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    this.port.postMessage(pcmData.buffer, [pcmData.buffer]); // send via transferable

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
