/**
 * Unit tests for helper functions in useRealtimeTranscription
 */
import { float32ToInt16 } from "@/components/context/realtime-recorder-context"; // adjust import path
import { handlingSaveAudioAndTranscript } from "@/components/context/realtime-recorder-context";

jest.mock("@/lib/query/audio-operations", () => ({
  saveAudioFile: jest.fn().mockResolvedValue({ id: "mock-audio-id" }),
}));
jest.mock("@/lib/query/transcription-operations", () => ({
  saveTranscript: jest.fn().mockResolvedValue({ id: "mock-transcript-id" }),
}));
jest.mock("@/lib/query/transcription-operations", () => ({
  saveTranscriptWords: jest.fn().mockResolvedValue(true),
}));

const { saveAudioFile } = jest.requireMock("@/lib/query/audio-operations");
const { saveTranscript } = jest.requireMock("@/lib/query/transcription-operations");
const { saveTranscriptWords } = jest.requireMock("@/lib/query/transcription-operations");

describe("float32ToInt16", () => {
  it("should convert float32 samples to int16 correctly", () => {
    const input = new Float32Array([0, 1, -1, 0.5, -0.5]);
    const output = float32ToInt16(input);

    expect(output).toBeInstanceOf(Int16Array);
    expect(output.length).toBe(input.length);
    expect(output[1]).toBe(32767); // 1.0 → max int16
    expect(output[2]).toBe(-32768); // -1.0 → min int16
  });

  it("should clamp values outside [-1, 1]", () => {
    const input = new Float32Array([2, -2]);
    const output = float32ToInt16(input);
    expect(output[0]).toBe(32767);
    expect(output[1]).toBe(-32768);
  });
});


describe("handlingSaveAudioAndTranscript", () => {
  const mockBlob = new Blob(["audio"]);
  const mockUser = { id: "mock-user" };
  const mockTranscript = [{ text: "Hello", word_is_final: true }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should save audio and transcript when inputs are valid", async () => {
    await handlingSaveAudioAndTranscript(
      mockUser as any,
      mockBlob,
      mockTranscript as any,
    );

    expect(saveAudioFile).toHaveBeenCalledWith(mockBlob, "mock-user", "Unnamed");
    expect(saveTranscript).toHaveBeenCalled();
    expect(saveTranscriptWords).toHaveBeenCalled();
  });

  it("should throw if user is missing", async () => {
    await handlingSaveAudioAndTranscript(
      null as any,
      mockBlob,
      mockTranscript as any,
    );
    expect(saveAudioFile).not.toHaveBeenCalled();
  });

  it("should throw if blob is missing", async () => {
    await handlingSaveAudioAndTranscript(
      mockUser as any,
      null as any,
      mockTranscript as any,
    );
    expect(saveAudioFile).not.toHaveBeenCalled();
  });

  it("should throw if transcriptWords is empty", async () => {
    await handlingSaveAudioAndTranscript(mockUser as any, mockBlob, []);
    expect(saveAudioFile).not.toHaveBeenCalled();
  });
});

