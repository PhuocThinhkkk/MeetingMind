
import {
  encodeWAV,
  mergeChunks,
  getAudioDuration,
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

