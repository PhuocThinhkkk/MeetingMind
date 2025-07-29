class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0 || input[0].length === 0) return true;

    const channelData = input[0];
    const floatChunk = new Float32Array(channelData); // Copy to avoid buffer reuse

    this.port.postMessage(floatChunk, [floatChunk.buffer]); // zero-copy transfer
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
