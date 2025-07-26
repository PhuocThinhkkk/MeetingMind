class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._targetSamples = 800; // 50ms * 16kHz
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0 || input[0].length === 0) return true;

    const channelData = input[0]; // mono input

    // Convert Float32 → Int16 and accumulate
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      this._buffer.push(s * 0x7FFF);
    }

    // While we have enough for a 50ms chunk
    while (this._buffer.length >= this._targetSamples) {
      const chunk = this._buffer.slice(0, this._targetSamples);
      this._buffer = this._buffer.slice(this._targetSamples);

      const int16 = new Int16Array(chunk);
      this.port.postMessage(int16.buffer, [int16.buffer]);
    }

    return true;
  }

  // This will be called when the node is disconnected
  // Use it to flush any remaining buffer (and pad if needed)
  flushRemaining() {
    if (this._buffer.length > 0) {
      const padded = this._buffer.slice();
      while (padded.length < this._targetSamples) padded.push(0);
      const int16 = new Int16Array(padded);
      this.port.postMessage(int16.buffer, [int16.buffer]);
      this._buffer = [];
    }
  }
}

registerProcessor('pcm-processor', PCMProcessor);
