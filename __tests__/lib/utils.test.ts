import {
  convertFloat32ToInt16,
  waitFor,
  formatDuration,
  formatFileSize,
  formatDate,
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

