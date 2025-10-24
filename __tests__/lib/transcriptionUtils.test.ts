import {
  encodeWAV,
  mergeChunks,
  getAudioDuration,
  resampleTo16kHz,
  float32ToInt16,
} from "@/lib/transcriptionUtils"; 

beforeAll(() => {
  // @ts-ignore
  global.URL.createObjectURL = jest.fn(() => "mock-url");
  // @ts-ignore
  global.URL.revokeObjectURL = jest.fn();
});


describe("encodeWAV", () => {
  it("should return a Blob with audio/wav type", () => {
    const samples = new Int16Array([0, 1, -1]);
    const blob = encodeWAV(samples);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBeGreaterThan(44);
  });

  it("should encode with default sample rate of 16000", () => {
    const samples = new Int16Array([100, 200, 300]);
    const blob = encodeWAV(samples);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(44 + samples.length * 2);
  });

  it("should encode with custom sample rate", () => {
    const samples = new Int16Array([100, 200]);
    const blob = encodeWAV(samples, 48000);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(44 + samples.length * 2);
  });

  it("should handle empty samples array", () => {
    const samples = new Int16Array([]);
    const blob = encodeWAV(samples);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(44);
  });

  it("should encode large audio samples", () => {
    const samples = new Int16Array(48000); // 1 second at 48kHz
    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.floor(Math.random() * 65536) - 32768;
    }
    const blob = encodeWAV(samples, 48000);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(44 + samples.length * 2);
  });

  it("should properly encode WAV header with RIFF structure", async () => {
    const samples = new Int16Array([1000, -1000, 2000, -2000]);
    const blob = encodeWAV(samples, 16000);
    const arrayBuffer = await blob.arrayBuffer();
    const view = new DataView(arrayBuffer);
    
    // Check RIFF header
    expect(String.fromCharCode(view.getUint8(0))).toBe('R');
    expect(String.fromCharCode(view.getUint8(1))).toBe('I');
    expect(String.fromCharCode(view.getUint8(2))).toBe('F');
    expect(String.fromCharCode(view.getUint8(3))).toBe('F');
    
    // Check WAVE format
    expect(String.fromCharCode(view.getUint8(8))).toBe('W');
    expect(String.fromCharCode(view.getUint8(9))).toBe('A');
    expect(String.fromCharCode(view.getUint8(10))).toBe('V');
    expect(String.fromCharCode(view.getUint8(11))).toBe('E');
  });
});

describe("mergeChunks", () => {
  it("should merge Uint8Array chunks", () => {
    const chunk1 = new Uint8Array([1, 2]);
    const chunk2 = new Uint8Array([3, 4]);
    const merged = mergeChunks([chunk1, chunk2]);
    expect(merged).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("should handle empty chunks array", () => {
    const merged = mergeChunks([]);
    expect(merged).toEqual(new Uint8Array([]));
    expect(merged.length).toBe(0);
  });

  it("should handle single chunk", () => {
    const chunk = new Uint8Array([5, 10, 15]);
    const merged = mergeChunks([chunk]);
    expect(merged).toEqual(chunk);
  });

  it("should merge multiple chunks in correct order", () => {
    const chunk1 = new Uint8Array([1]);
    const chunk2 = new Uint8Array([2, 3]);
    const chunk3 = new Uint8Array([4, 5, 6]);
    const chunk4 = new Uint8Array([7, 8, 9, 10]);
    const merged = mergeChunks([chunk1, chunk2, chunk3, chunk4]);
    expect(merged).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  });

  it("should handle empty chunks within array", () => {
    const chunk1 = new Uint8Array([1, 2]);
    const chunk2 = new Uint8Array([]);
    const chunk3 = new Uint8Array([3, 4]);
    const merged = mergeChunks([chunk1, chunk2, chunk3]);
    expect(merged).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("should merge large chunks efficiently", () => {
    const largeChunk1 = new Uint8Array(10000).fill(1);
    const largeChunk2 = new Uint8Array(20000).fill(2);
    const merged = mergeChunks([largeChunk1, largeChunk2]);
    expect(merged.length).toBe(30000);
    expect(merged[0]).toBe(1);
    expect(merged[9999]).toBe(1);
    expect(merged[10000]).toBe(2);
    expect(merged[29999]).toBe(2);
  });
});

describe("getAudioDuration", () => {
  it("should resolve with audio duration", async () => {
    const mockBlob = new Blob([], { type: "audio/wav" });
    const mockDuration = 123.45;

    const createElementSpy = jest.spyOn(document, "createElement");
    const mockAudio = {
      addEventListener: (event: string, cb: () => void) => {
        if (event === "loadedmetadata") cb();
      },
      duration: mockDuration,
      src: "",
    } as unknown as HTMLAudioElement;

    createElementSpy.mockReturnValue(mockAudio);

    const duration = await getAudioDuration(mockBlob);
    expect(duration).toBe(mockDuration);

    createElementSpy.mockRestore();
  });

  it("should reject on error", async () => {
    const mockBlob = new Blob([], { type: "audio/wav" });

    const createElementSpy = jest.spyOn(document, "createElement");
    const mockAudio = {
      addEventListener: (event: string, cb: (err?: unknown) => void) => {
        if (event === "error") cb(new Error("Load failed"));
      },
      src: "",
    } as unknown as HTMLAudioElement;

    createElementSpy.mockReturnValue(mockAudio);

    await expect(getAudioDuration(mockBlob)).rejects.toThrow("Load failed");

    createElementSpy.mockRestore();
  });

  it("should handle zero duration audio", async () => {
    const mockBlob = new Blob([], { type: "audio/wav" });

    const createElementSpy = jest.spyOn(document, "createElement");
    const mockAudio = {
      addEventListener: (event: string, cb: () => void) => {
        if (event === "loadedmetadata") cb();
      },
      duration: 0,
      src: "",
    } as unknown as HTMLAudioElement;

    createElementSpy.mockReturnValue(mockAudio);

    const duration = await getAudioDuration(mockBlob);
    expect(duration).toBe(0);

    createElementSpy.mockRestore();
  });

  it("should properly revoke object URL", async () => {
    const mockBlob = new Blob([], { type: "audio/wav" });

    const createElementSpy = jest.spyOn(document, "createElement");
    const mockAudio = {
      addEventListener: (event: string, cb: () => void) => {
        if (event === "loadedmetadata") cb();
      },
      duration: 10.5,
      src: "",
    } as unknown as HTMLAudioElement;

    createElementSpy.mockReturnValue(mockAudio);

    await getAudioDuration(mockBlob);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mock-url");

    createElementSpy.mockRestore();
  });
});

describe("resampleTo16kHz", () => {
  beforeEach(() => {
    // Mock AudioBuffer
    global.AudioBuffer = jest.fn().mockImplementation(function(options) {
      this.length = options.length;
      this.numberOfChannels = options.numberOfChannels;
      this.sampleRate = options.sampleRate;
      this.duration = options.length / options.sampleRate;
      this.copyToChannel = jest.fn();
      this.getChannelData = jest.fn(() => new Float32Array(options.length));
    }) as any;

    // Mock OfflineAudioContext
    global.OfflineAudioContext = jest.fn().mockImplementation(function(options) {
      this.numberOfChannels = options.numberOfChannels;
      this.length = options.length;
      this.sampleRate = options.sampleRate;
      this.destination = {};
      this.createBufferSource = jest.fn(() => ({
        buffer: null,
        connect: jest.fn().mockReturnThis(),
        start: jest.fn(),
      }));
      this.startRendering = jest.fn().mockResolvedValue({
        getChannelData: jest.fn(() => new Float32Array(options.length)),
      });
    }) as any;
  });

  it("should resample from 48000 Hz to 16000 Hz", async () => {
    const inputSamples = new Float32Array(48000); // 1 second at 48kHz
    for (let i = 0; i < inputSamples.length; i++) {
      inputSamples[i] = Math.sin(2 * Math.PI * 440 * i / 48000);
    }

    const resampled = await resampleTo16kHz(inputSamples);
    
    expect(resampled).toBeInstanceOf(Float32Array);
    expect(resampled.length).toBe(16000);
  });

  it("should handle empty input", async () => {
    const inputSamples = new Float32Array(0);
    const resampled = await resampleTo16kHz(inputSamples);
    
    expect(resampled).toBeInstanceOf(Float32Array);
    expect(resampled.length).toBe(0);
  });

  it("should handle small input buffers", async () => {
    const inputSamples = new Float32Array(480); // 10ms at 48kHz
    inputSamples.fill(0.5);

    const resampled = await resampleTo16kHz(inputSamples);
    
    expect(resampled).toBeInstanceOf(Float32Array);
    expect(resampled.length).toBe(160); // 10ms at 16kHz
  });

  it("should use correct sample rates in resampling", async () => {
    const inputLength = 9600; // 200ms at 48kHz
    const inputSamples = new Float32Array(inputLength);
    
    await resampleTo16kHz(inputSamples);
    
    expect(global.AudioBuffer).toHaveBeenCalledWith({
      length: inputLength,
      numberOfChannels: 1,
      sampleRate: 48000,
    });
    
    expect(global.OfflineAudioContext).toHaveBeenCalledWith({
      numberOfChannels: 1,
      length: 3200, // 200ms at 16kHz
      sampleRate: 16000,
    });
  });
});

describe("float32ToInt16", () => {
  it("should convert normalized float samples to int16", () => {
    const floatSamples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const int16Samples = float32ToInt16(floatSamples);
    
    expect(int16Samples).toBeInstanceOf(Int16Array);
    expect(int16Samples.length).toBe(5);
    expect(int16Samples[0]).toBe(0);
    expect(int16Samples[1]).toBe(16383); // 0.5 * 0x7fff
    expect(int16Samples[2]).toBe(-16384); // -0.5 * 0x8000
    expect(int16Samples[3]).toBe(32767); // max positive
    expect(int16Samples[4]).toBe(-32768); // max negative
  });

  it("should clamp values outside [-1, 1] range", () => {
    const floatSamples = new Float32Array([1.5, -1.5, 2.0, -2.0]);
    const int16Samples = float32ToInt16(floatSamples);
    
    expect(int16Samples[0]).toBe(32767); // clamped to 1
    expect(int16Samples[1]).toBe(-32768); // clamped to -1
    expect(int16Samples[2]).toBe(32767); // clamped to 1
    expect(int16Samples[3]).toBe(-32768); // clamped to -1
  });

  it("should handle empty array", () => {
    const floatSamples = new Float32Array([]);
    const int16Samples = float32ToInt16(floatSamples);
    
    expect(int16Samples).toBeInstanceOf(Int16Array);
    expect(int16Samples.length).toBe(0);
  });

  it("should handle all zeros", () => {
    const floatSamples = new Float32Array(1000).fill(0);
    const int16Samples = float32ToInt16(floatSamples);
    
    expect(int16Samples.length).toBe(1000);
    expect(int16Samples.every(val => val === 0)).toBe(true);
  });

  it("should preserve sign for small values", () => {
    const floatSamples = new Float32Array([0.001, -0.001, 0.1, -0.1]);
    const int16Samples = float32ToInt16(floatSamples);
    
    expect(int16Samples[0]).toBeGreaterThan(0);
    expect(int16Samples[1]).toBeLessThan(0);
    expect(int16Samples[2]).toBeGreaterThan(0);
    expect(int16Samples[3]).toBeLessThan(0);
  });

  it("should handle alternating positive and negative values", () => {
    const floatSamples = new Float32Array(100);
    for (let i = 0; i < 100; i++) {
      floatSamples[i] = i % 2 === 0 ? 0.5 : -0.5;
    }
    const int16Samples = float32ToInt16(floatSamples);
    
    for (let i = 0; i < 100; i++) {
      if (i % 2 === 0) {
        expect(int16Samples[i]).toBe(16383);
      } else {
        expect(int16Samples[i]).toBe(-16384);
      }
    }
  });

  it("should properly scale near-zero values", () => {
    const floatSamples = new Float32Array([0.0001, -0.0001, 0.00001, -0.00001]);
    const int16Samples = float32ToInt16(floatSamples);
    
    // Very small values should round to small integers
    expect(Math.abs(int16Samples[0])).toBeLessThan(10);
    expect(Math.abs(int16Samples[1])).toBeLessThan(10);
    expect(Math.abs(int16Samples[2])).toBeLessThan(5);
    expect(Math.abs(int16Samples[3])).toBeLessThan(5);
  });

  it("should handle maximum and minimum edge cases precisely", () => {
    const floatSamples = new Float32Array([1.0, -1.0, 0.9999, -0.9999]);
    const int16Samples = float32ToInt16(floatSamples);
    
    expect(int16Samples[0]).toBe(0x7fff); // 32767
    expect(int16Samples[1]).toBe(-0x8000); // -32768
    expect(int16Samples[2]).toBeLessThan(0x7fff);
    expect(int16Samples[3]).toBeGreaterThan(-0x8000);
  });
});