import {
  initAudioContext,
  requestSystemAudio,
  requestMicrophoneAudio,
  mixAudioStreams,
  setupAudioWorklet,
} from "@/lib/audioWorkletUtils";
import { log } from "@/lib/logger";

jest.mock("@/lib/logger", () => ({
  log: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("audioWorkletUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initAudioContext", () => {
    it("should create and return a new AudioContext", () => {
      const mockAudioContext = {
        state: "running",
        sampleRate: 48000,
      };

      global.AudioContext = jest.fn(() => mockAudioContext) as any;

      const audioContext = initAudioContext();

      expect(global.AudioContext).toHaveBeenCalled();
      expect(audioContext).toBe(mockAudioContext);
    });

    it("should use webkitAudioContext as fallback", () => {
      const mockAudioContext = {
        state: "running",
        sampleRate: 48000,
      };

      // @ts-ignore
      delete global.AudioContext;
      (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

      const audioContext = initAudioContext();

      expect((global as any).webkitAudioContext).toHaveBeenCalled();
      expect(audioContext).toBe(mockAudioContext);

      // Cleanup
      delete (global as any).webkitAudioContext;
      global.AudioContext = jest.fn(() => mockAudioContext) as any;
    });

    it("should return context with correct properties", () => {
      const mockAudioContext = {
        state: "running",
        sampleRate: 48000,
        destination: {},
        createMediaStreamSource: jest.fn(),
      };

      global.AudioContext = jest.fn(() => mockAudioContext) as any;

      const audioContext = initAudioContext();

      expect(audioContext.state).toBe("running");
      expect(audioContext.sampleRate).toBe(48000);
    });
  });

  describe("requestSystemAudio", () => {
    let mockGetDisplayMedia: jest.Mock;

    beforeEach(() => {
      mockGetDisplayMedia = jest.fn();
      global.navigator.mediaDevices = {
        getDisplayMedia: mockGetDisplayMedia,
      } as any;
    });

    it("should request system audio with correct constraints", async () => {
      const mockStream = {
        id: "system-stream",
        getTracks: jest.fn(() => []),
      };

      mockGetDisplayMedia.mockResolvedValue(mockStream);

      const stream = await requestSystemAudio();

      expect(mockGetDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: true,
      });
      expect(stream).toBe(mockStream);
    });

    it("should return null when permission is denied", async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error("Permission denied"));

      const stream = await requestSystemAudio();

      expect(stream).toBeNull();
      expect(log.error).toHaveBeenCalledWith(
        "System audio permission denied:",
        expect.any(Error)
      );
    });

    it("should return null on NotAllowedError", async () => {
      const notAllowedError = new Error("NotAllowedError");
      notAllowedError.name = "NotAllowedError";
      mockGetDisplayMedia.mockRejectedValue(notAllowedError);

      const stream = await requestSystemAudio();

      expect(stream).toBeNull();
      expect(log.error).toHaveBeenCalled();
    });

    it("should return null on user cancellation", async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error("User cancelled"));

      const stream = await requestSystemAudio();

      expect(stream).toBeNull();
    });
  });

  describe("requestMicrophoneAudio", () => {
    let mockGetUserMedia: jest.Mock;

    beforeEach(() => {
      mockGetUserMedia = jest.fn();
      global.navigator.mediaDevices = {
        getUserMedia: mockGetUserMedia,
      } as any;
    });

    it("should request microphone audio with correct constraints", async () => {
      const mockStream = {
        id: "mic-stream",
        getTracks: jest.fn(() => []),
      };

      mockGetUserMedia.mockResolvedValue(mockStream);

      const stream = await requestMicrophoneAudio();

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(stream).toBe(mockStream);
    });

    it("should return null when permission is denied", async () => {
      mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));

      const stream = await requestMicrophoneAudio();

      expect(stream).toBeNull();
      expect(log.error).toHaveBeenCalledWith(
        "Microphone permission denied:",
        expect.any(Error)
      );
    });

    it("should return null on NotAllowedError", async () => {
      const notAllowedError = new Error("NotAllowedError");
      notAllowedError.name = "NotAllowedError";
      mockGetUserMedia.mockRejectedValue(notAllowedError);

      const stream = await requestMicrophoneAudio();

      expect(stream).toBeNull();
      expect(log.error).toHaveBeenCalled();
    });

    it("should return null when microphone is not available", async () => {
      mockGetUserMedia.mockRejectedValue(new Error("NotFoundError"));

      const stream = await requestMicrophoneAudio();

      expect(stream).toBeNull();
    });
  });

  describe("mixAudioStreams", () => {
    let mockAudioContext: any;
    let mockSystemStream: MediaStream;
    let mockMicStream: MediaStream;

    beforeEach(() => {
      const mockDestination = {
        stream: { id: "mixed-stream" },
      };

      const mockSource = {
        connect: jest.fn().mockReturnThis(),
      };

      mockAudioContext = {
        createMediaStreamDestination: jest.fn(() => mockDestination),
        createMediaStreamSource: jest.fn(() => mockSource),
      };

      mockSystemStream = { id: "system" } as any;
      mockMicStream = { id: "mic" } as any;
    });

    it("should mix both system and microphone streams", async () => {
      const mixedStream = await mixAudioStreams(
        mockAudioContext,
        mockSystemStream,
        mockMicStream
      );

      expect(mockAudioContext.createMediaStreamDestination).toHaveBeenCalled();
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledTimes(2);
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(
        mockSystemStream
      );
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(
        mockMicStream
      );
      expect(mixedStream).toEqual({ id: "mixed-stream" });
    });

    it("should mix only system stream when mic is null", async () => {
      const mixedStream = await mixAudioStreams(
        mockAudioContext,
        mockSystemStream,
        null
      );

      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledTimes(1);
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(
        mockSystemStream
      );
      expect(mixedStream).toBeDefined();
    });

    it("should mix only microphone stream when system is null", async () => {
      const mixedStream = await mixAudioStreams(
        mockAudioContext,
        null,
        mockMicStream
      );

      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledTimes(1);
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(
        mockMicStream
      );
      expect(mixedStream).toBeDefined();
    });

    it("should return empty stream when both inputs are null", async () => {
      const mixedStream = await mixAudioStreams(mockAudioContext, null, null);

      expect(mockAudioContext.createMediaStreamSource).not.toHaveBeenCalled();
      expect(mixedStream).toBeDefined();
    });

    it("should throw error if audio context operations fail", async () => {
      mockAudioContext.createMediaStreamSource.mockImplementation(() => {
        throw new Error("Failed to create source");
      });

      await expect(
        mixAudioStreams(mockAudioContext, mockSystemStream, null)
      ).rejects.toThrow("Failed to create source");

      expect(log.error).toHaveBeenCalledWith(
        "Error mixing audio streams:",
        expect.any(Error)
      );
    });

    it("should connect sources to destination", async () => {
      const mockSource = {
        connect: jest.fn().mockReturnThis(),
      };

      mockAudioContext.createMediaStreamSource.mockReturnValue(mockSource);

      await mixAudioStreams(mockAudioContext, mockSystemStream, mockMicStream);

      expect(mockSource.connect).toHaveBeenCalledTimes(2);
    });
  });

  describe("setupAudioWorklet", () => {
    let mockAudioContext: any;
    let mockMixedStream: MediaStream;

    beforeEach(() => {
      const mockWorkletNode = {
        connect: jest.fn().mockReturnThis(),
        port: {
          postMessage: jest.fn(),
          addEventListener: jest.fn(),
        },
      };

      const mockSource = {
        connect: jest.fn().mockReturnValue(mockWorkletNode),
      };

      mockAudioContext = {
        audioWorklet: {
          addModule: jest.fn().mockResolvedValue(undefined),
        },
        createMediaStreamSource: jest.fn(() => mockSource),
        destination: {},
      };

      global.AudioWorkletNode = jest.fn(() => mockWorkletNode) as any;

      mockMixedStream = { id: "mixed" } as any;
    });

    it("should load worklet module and setup audio processing", async () => {
      const workletNode = await setupAudioWorklet(
        mockAudioContext,
        mockMixedStream
      );

      expect(mockAudioContext.audioWorklet.addModule).toHaveBeenCalledWith(
        "/worklet-processor.js"
      );
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(
        mockMixedStream
      );
      expect(global.AudioWorkletNode).toHaveBeenCalledWith(
        mockAudioContext,
        "pcm-processor"
      );
      expect(workletNode).toBeDefined();
    });

    it("should connect source to worklet and worklet to destination", async () => {
      const mockWorkletNode = {
        connect: jest.fn().mockReturnThis(),
      };

      const mockSource = {
        connect: jest.fn().mockReturnValue(mockWorkletNode),
      };

      mockAudioContext.createMediaStreamSource.mockReturnValue(mockSource);

      await setupAudioWorklet(mockAudioContext, mockMixedStream);

      expect(mockSource.connect).toHaveBeenCalledWith(mockWorkletNode);
      expect(mockWorkletNode.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );
    });

    it("should throw error if worklet module fails to load", async () => {
      mockAudioContext.audioWorklet.addModule.mockRejectedValue(
        new Error("Module not found")
      );

      await expect(
        setupAudioWorklet(mockAudioContext, mockMixedStream)
      ).rejects.toThrow("Module not found");
    });

    it("should throw error if AudioWorkletNode creation fails", async () => {
      (global.AudioWorkletNode as any) = jest.fn(() => {
        throw new Error("Invalid processor name");
      });

      await expect(
        setupAudioWorklet(mockAudioContext, mockMixedStream)
      ).rejects.toThrow("Invalid processor name");
    });

    it("should return worklet node with message port", async () => {
      const workletNode = await setupAudioWorklet(
        mockAudioContext,
        mockMixedStream
      );

      expect(workletNode.port).toBeDefined();
      expect(workletNode.port.postMessage).toBeDefined();
    });
  });
});