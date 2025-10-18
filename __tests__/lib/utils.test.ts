import {
  convertFloat32ToInt16,
  waitFor,
  formatDuration,
  formatFileSize,
  formatDate,
  encodeWAV,
  mergeChunks,
  getAudioDuration,
} from "@/lib/utils"; 

beforeAll(() => {
  // @ts-ignore
  global.URL.createObjectURL = jest.fn(() => "mock-url");
  // @ts-ignore
  global.URL.revokeObjectURL = jest.fn();
});



describe("convertFloat32ToInt16", () => {
  it("should correctly convert float samples to int16", () => {
    const floatSamples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const result = convertFloat32ToInt16(floatSamples);
    expect(result).toBeInstanceOf(Int16Array);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(16383);
    expect(result[2]).toBe(-16384);
    expect(result[3]).toBe(0x7fff);
    expect(result[4]).toBe(-0x8000);
  });
});

describe("waitFor", () => {
  jest.useFakeTimers();
  it("should wait for the specified time", async () => {
    const promise = waitFor(2000);
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBeUndefined();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
});

describe("formatDuration", () => {
  it("should format duration with hours", () => {
    expect(formatDuration(3661)).toBe("1h 1m 1s");
  });
  it("should format duration without hours", () => {
    expect(formatDuration(61)).toBe("1m 1s");
  });
});

describe("formatFileSize", () => {
  it("should format size in MB", () => {
    const bytes = 10 * 1024 * 1024; // 10 MB
    expect(formatFileSize(bytes)).toBe("10.00 MB");
  });
  it("should format size in GB", () => {
    const bytes = 2 * 1024 * 1024 * 1024; // 2 GB
    expect(formatFileSize(bytes)).toBe("2.00 GB");
  });
});

describe("formatDate", () => {
  it("should format ISO date correctly", () => {
    const formatted = formatDate("2023-10-05T14:48:00.000Z");
    // e.g. "Oct 5, 2023, 02:48 PM" (depends on timezone)
    expect(formatted).toMatch(/Oct 5, 2023/);
  });
});

describe("encodeWAV", () => {
  it("should return a Blob with audio/wav type", () => {
    const samples = new Int16Array([0, 1, -1]);
    const blob = encodeWAV(samples);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBeGreaterThan(44);
  });
});

describe("mergeChunks", () => {
  it("should merge Uint8Array chunks", () => {
    const chunk1 = new Uint8Array([1, 2]);
    const chunk2 = new Uint8Array([3, 4]);
    const merged = mergeChunks([chunk1, chunk2]);
    expect(merged).toEqual(new Uint8Array([1, 2, 3, 4]));
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
});

