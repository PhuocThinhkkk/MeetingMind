class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0 || input[0].length === 0) return true;

    const channelData = input[0]; // mono channel
    const buffer = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      buffer[i] = s * 0x7FFF;
    }

    this.port.postMessage(buffer.buffer, [buffer.buffer]);
    return true; // Keep running
  }
}

registerProcessor('pcm-processor', PCMProcessor);

