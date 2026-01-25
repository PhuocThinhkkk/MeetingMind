class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    try {
      const input = inputs[0]
      if (!input || input.length === 0) return true

      const channelCount = input.length
      if (channelCount > 1) {
        console.log('[INFOR] channelCount: ', channelCount)
      }

      let mixed
      if (channelCount === 1) {
        mixed = input[0]
      } else {
        const length = input[0].length
        mixed = new Float32Array(length)
        for (let i = 0; i < length; i++) {
          let sum = 0
          for (let ch = 0; ch < channelCount; ch++) {
            sum += input[ch][i]
          }
          mixed[i] = sum / channelCount
        }
      }

      this.port.postMessage(mixed)
      return true
    } catch (error) {
      console.error('[ERROR] Error in PCMProcessor:', error)
      return true
    }
  }
}

registerProcessor('pcm-processor', PCMProcessor)
