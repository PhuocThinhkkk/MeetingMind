import {
  convertFloat32ToInt16,
  waitFor,
  formatDuration,
  formatFileSize,
  formatDate,
  cn,
} from "@/lib/utils"; 

beforeAll(() => {
  // @ts-ignore
  global.URL.createObjectURL = jest.fn(() => "mock-url");
  // @ts-ignore
  global.URL.revokeObjectURL = jest.fn();
});

describe("cn (className utility)", () => {
  it("should merge class names", () => {
    const result = cn("class1", "class2");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", { active: true, disabled: false });
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).not.toContain("disabled");
  });

  it("should merge Tailwind classes and resolve conflicts", () => {
    const result = cn("px-2 py-1", "px-4");
    // px-4 should override px-2
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
    expect(result).toContain("class3");
  });

  it("should handle undefined and null values", () => {
    const result = cn("class1", undefined, null, "class2");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
  });
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

  it("should clamp values outside valid range", () => {
    const floatSamples = new Float32Array([2.0, -2.0, 1.5, -1.5]);
    const result = convertFloat32ToInt16(floatSamples);
    expect(result[0]).toBe(0x7fff); // clamped to 1.0
    expect(result[1]).toBe(-0x8000); // clamped to -1.0
    expect(result[2]).toBe(0x7fff);
    expect(result[3]).toBe(-0x8000);
  });

  it("should handle empty buffer", () => {
    const floatSamples = new Float32Array([]);
    const result = convertFloat32ToInt16(floatSamples);
    expect(result.length).toBe(0);
  });

  it("should handle large buffers", () => {
    const floatSamples = new Float32Array(10000);
    floatSamples.fill(0.5);
    const result = convertFloat32ToInt16(floatSamples);
    expect(result.length).toBe(10000);
    expect(result[0]).toBe(16383);
    expect(result[9999]).toBe(16383);
  });
});

describe("waitFor", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should wait for the specified time", async () => {
    const promise = waitFor(2000);
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBeUndefined();
  });

  it("should use default timeout of 5000ms", async () => {
    const promise = waitFor();
    jest.advanceTimersByTime(5000);
    await expect(promise).resolves.toBeUndefined();
  });

  it("should handle zero timeout", async () => {
    const promise = waitFor(0);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBeUndefined();
  });

  it("should handle very short timeouts", async () => {
    const promise = waitFor(1);
    jest.advanceTimersByTime(1);
    await expect(promise).resolves.toBeUndefined();
  });

  it("should handle long timeouts", async () => {
    const promise = waitFor(60000);
    jest.advanceTimersByTime(60000);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe("formatDuration", () => {
  it("should format duration with hours", () => {
    expect(formatDuration(3661)).toBe("1h 1m 1s");
  });

  it("should format duration without hours", () => {
    expect(formatDuration(61)).toBe("1m 1s");
  });

  it("should handle zero seconds", () => {
    expect(formatDuration(0)).toBe("0m 0s");
  });

  it("should handle only hours", () => {
    expect(formatDuration(3600)).toBe("1h 0m 0s");
  });

  it("should handle only minutes", () => {
    expect(formatDuration(120)).toBe("2m 0s");
  });

  it("should handle only seconds", () => {
    expect(formatDuration(45)).toBe("0m 45s");
  });

  it("should handle large durations", () => {
    expect(formatDuration(86399)).toBe("23h 59m 59s");
  });

  it("should floor fractional seconds", () => {
    expect(formatDuration(61.9)).toBe("1m 1s");
    expect(formatDuration(59.999)).toBe("0m 59s");
  });

  it("should handle multiple hours", () => {
    expect(formatDuration(7323)).toBe("2h 2m 3s");
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

  it("should handle zero bytes", () => {
    expect(formatFileSize(0)).toBe("0.00 MB");
  });

  it("should handle small files (less than 1 MB)", () => {
    const bytes = 512 * 1024; // 0.5 MB
    expect(formatFileSize(bytes)).toBe("0.50 MB");
  });

  it("should handle exactly 1 GB", () => {
    const bytes = 1024 * 1024 * 1024;
    expect(formatFileSize(bytes)).toBe("1.00 GB");
  });

  it("should handle fractional GB", () => {
    const bytes = 1.5 * 1024 * 1024 * 1024;
    expect(formatFileSize(bytes)).toBe("1.50 GB");
  });

  it("should round to 2 decimal places", () => {
    const bytes = 1234567;
    const result = formatFileSize(bytes);
    expect(result).toMatch(/\d+\.\d{2} (MB|GB)/);
  });

  it("should handle very large files", () => {
    const bytes = 100 * 1024 * 1024 * 1024; // 100 GB
    expect(formatFileSize(bytes)).toBe("100.00 GB");
  });
});

describe("formatDate", () => {
  it("should format ISO date correctly", () => {
    const formatted = formatDate("2023-10-05T14:48:00.000Z");
    expect(formatted).toMatch(/Oct 5, 2023/);
  });

  it("should include time in format", () => {
    const formatted = formatDate("2023-10-05T14:48:00.000Z");
    expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Should have time like "02:48"
  });

  it("should handle different months", () => {
    expect(formatDate("2023-01-15T00:00:00.000Z")).toMatch(/Jan 15, 2023/);
    expect(formatDate("2023-12-25T00:00:00.000Z")).toMatch(/Dec 25, 2023/);
  });

  it("should handle different years", () => {
    expect(formatDate("2020-06-15T12:00:00.000Z")).toMatch(/Jun 15, 2020/);
    expect(formatDate("2025-03-20T08:30:00.000Z")).toMatch(/Mar 20, 2025/);
  });

  it("should handle midnight", () => {
    const formatted = formatDate("2023-10-05T00:00:00.000Z");
    expect(formatted).toMatch(/Oct 5, 2023/);
    expect(formatted).toMatch(/12:00|00:00/);
  });

  it("should handle noon", () => {
    const formatted = formatDate("2023-10-05T12:00:00.000Z");
    expect(formatted).toMatch(/Oct 5, 2023/);
    expect(formatted).toMatch(/12:00/);
  });

  it("should format consistently", () => {
    const date1 = formatDate("2023-05-10T10:30:00.000Z");
    const date2 = formatDate("2023-05-10T10:30:00.000Z");
    expect(date1).toBe(date2);
  });
});