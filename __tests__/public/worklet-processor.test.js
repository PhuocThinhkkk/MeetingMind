/**
 * Tests for public/worklet-processor.js
 * 
 * These tests validate the PCM audio worklet processor implementation
 * using a simulated AudioWorkletProcessor environment.
 */

describe('PCMProcessor AudioWorklet', () => {
  let PCMProcessor;
  let processorInstance;

  beforeAll(() => {
    // Mock AudioWorkletProcessor base class
    global.AudioWorkletProcessor = class AudioWorkletProcessor {
      constructor() {
        this.port = {
          postMessage: jest.fn(),
        };
      }
    };

    // Mock registerProcessor
    global.registerProcessor = jest.fn((name, ProcessorClass) => {
      if (name === 'pcm-processor') {
        PCMProcessor = ProcessorClass;
      }
    });

    // Load the worklet processor code
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');
    const workletCode = fs.readFileSync(
      path.join(__dirname, '../../public/worklet-processor.js'),
      'utf8'
    );
    
    // Execute the worklet code in a controlled context
    new vm.Script(workletCode).runInThisContext();

    // Create an instance for testing
    processorInstance = new PCMProcessor();
  });

  describe('Processor Registration', () => {
    it('should register as pcm-processor', () => {
      expect(global.registerProcessor).toHaveBeenCalledWith(
        'pcm-processor',
        expect.any(Function)
      );
    });

    it('should extend AudioWorkletProcessor', () => {
      expect(processorInstance).toBeInstanceOf(global.AudioWorkletProcessor);
    });
  });

  describe('process() method', () => {
    it('should process single channel audio', () => {
      const inputs = [
        [new Float32Array([0.1, 0.2, 0.3, 0.4])], // Single channel
      ];

      const result = processorInstance.process(inputs);

      expect(result).toBe(true);
      expect(processorInstance.port.postMessage).toHaveBeenCalledWith(
        inputs[0][0]
      );
    });

    it('should mix multiple channels into mono', () => {
      const channel1 = new Float32Array([0.5, 0.6]);
      const channel2 = new Float32Array([0.3, 0.4]);
      const inputs = [[channel1, channel2]];

      const postMessageSpy = jest.spyOn(processorInstance.port, 'postMessage');

      const result = processorInstance.process(inputs);

      expect(result).toBe(true);
      expect(postMessageSpy).toHaveBeenCalled();

      const mixedData = postMessageSpy.mock.calls[0][0];
      expect(mixedData).toBeInstanceOf(Float32Array);
      expect(mixedData.length).toBe(2);
      expect(mixedData[0]).toBeCloseTo(0.4, 5); // (0.5 + 0.3) / 2
      expect(mixedData[1]).toBeCloseTo(0.5, 5); // (0.6 + 0.4) / 2
    });

    it('should handle empty inputs gracefully', () => {
      const inputs = [[]];

      const result = processorInstance.process(inputs);

      expect(result).toBe(true);
      expect(processorInstance.port.postMessage).not.toHaveBeenCalled();
    });

    it('should handle null/undefined inputs', () => {
      const inputs = [];

      const result = processorInstance.process(inputs);

      expect(result).toBe(true);
    });

    it('should handle 3+ channel mixing', () => {
      const channel1 = new Float32Array([0.3]);
      const channel2 = new Float32Array([0.3]);
      const channel3 = new Float32Array([0.3]);
      const inputs = [[channel1, channel2, channel3]];

      processorInstance.port.postMessage.mockClear();
      const result = processorInstance.process(inputs);

      expect(result).toBe(true);
      const mixedData = processorInstance.port.postMessage.mock.calls[0][0];
      expect(mixedData[0]).toBeCloseTo(0.3, 5); // (0.3 + 0.3 + 0.3) / 3
    });

    it('should preserve sample length', () => {
      const sampleLength = 128;
      const channel1 = new Float32Array(sampleLength).fill(0.5);
      const channel2 = new Float32Array(sampleLength).fill(0.3);
      const inputs = [[channel1, channel2]];

      processorInstance.port.postMessage.mockClear();
      processorInstance.process(inputs);

      const mixedData = processorInstance.port.postMessage.mock.calls[0][0];
      expect(mixedData.length).toBe(sampleLength);
    });

    it('should handle zero-filled channels', () => {
      const channel1 = new Float32Array([0, 0, 0]);
      const inputs = [[channel1]];

      processorInstance.port.postMessage.mockClear();
      const result = processorInstance.process(inputs);

      expect(result).toBe(true);
      expect(processorInstance.port.postMessage).toHaveBeenCalledWith(channel1);
    });

    it('should handle maximum amplitude values', () => {
      const channel1 = new Float32Array([1.0, -1.0, 1.0]);
      const inputs = [[channel1]];

      processorInstance.port.postMessage.mockClear();
      const result = processorInstance.process(inputs);

      expect(result).toBe(true);
      const sentData = processorInstance.port.postMessage.mock.calls[0][0];
      expect(sentData[0]).toBe(1.0);
      expect(sentData[1]).toBe(-1.0);
      expect(sentData[2]).toBe(1.0);
    });

    it('should continue processing after errors', () => {
      // Mock console.error to suppress error output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by making postMessage throw
      processorInstance.port.postMessage.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const inputs = [[new Float32Array([0.1, 0.2])]];
      const result = processorInstance.process(inputs);

      // Should still return true to keep processing
      expect(result).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid successive calls', () => {
      const inputs = [[new Float32Array([0.5])]];

      processorInstance.port.postMessage.mockClear();

      for (let i = 0; i < 100; i++) {
        const result = processorInstance.process(inputs);
        expect(result).toBe(true);
      }

      expect(processorInstance.port.postMessage).toHaveBeenCalledTimes(100);
    });
  });

  describe('Channel Mixing Algorithm', () => {
    it('should average channels correctly', () => {
      const testCases = [
        {
          channels: [
            new Float32Array([0.8]),
            new Float32Array([0.2]),
          ],
          expected: 0.5,
        },
        {
          channels: [
            new Float32Array([0.6]),
            new Float32Array([0.3]),
            new Float32Array([0.6]),
          ],
          expected: 0.5,
        },
        {
          channels: [
            new Float32Array([0.0]),
            new Float32Array([1.0]),
          ],
          expected: 0.5,
        },
      ];

      testCases.forEach(({ channels, expected }) => {
        processorInstance.port.postMessage.mockClear();
        processorInstance.process([channels]);

        const mixedData = processorInstance.port.postMessage.mock.calls[0][0];
        expect(mixedData[0]).toBeCloseTo(expected, 5);
      });
    });

    it('should handle negative and positive mixing', () => {
      const channel1 = new Float32Array([0.5, -0.5]);
      const channel2 = new Float32Array([-0.5, 0.5]);
      const inputs = [[channel1, channel2]];

      processorInstance.port.postMessage.mockClear();
      processorInstance.process(inputs);

      const mixedData = processorInstance.port.postMessage.mock.calls[0][0];
      expect(mixedData[0]).toBeCloseTo(0.0, 5);
      expect(mixedData[1]).toBeCloseTo(0.0, 5);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle standard audio buffer size (128 samples)', () => {
      const inputs = [[new Float32Array(128).fill(0.5)]];

      const startTime = Date.now();
      processorInstance.process(inputs);
      const endTime = Date.now();

      // Processing should be very fast (< 10ms even in JS test environment)
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('should handle different buffer sizes', () => {
      const bufferSizes = [64, 128, 256, 512, 1024];

      bufferSizes.forEach((size) => {
        const inputs = [[new Float32Array(size).fill(0.5)]];
        processorInstance.port.postMessage.mockClear();

        const result = processorInstance.process(inputs);

        expect(result).toBe(true);
        const sentData = processorInstance.port.postMessage.mock.calls[0][0];
        expect(sentData.length).toBe(size);
      });
    });
  });
});