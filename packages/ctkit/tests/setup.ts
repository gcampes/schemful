import { vi } from "vitest";

// Mock fs operations to prevent actual file system operations during tests
vi.mock("fs", () => {
  const fsMock = {
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    existsSync: vi.fn(() => false),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(() => []),
  };
  return { ...fsMock, default: fsMock };
});

// Mock child_process to prevent actual command execution
vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

// Mock ora spinner with all methods used in the codebase
vi.mock("ora", () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: "",
  })),
}));

// Mock inquirer prompts
vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn(),
  },
  prompt: vi.fn(),
}));

// Mock contentful client
vi.mock("../src/utils/contentfulClient", () => ({
  getContentfulEnvironment: vi.fn(),
  getContentfulConfig: vi.fn(() => ({
    accessToken: "test-token",
    spaceId: "test-space",
    environmentId: "test",
  })),
  testContentfulConnection: vi.fn(() => Promise.resolve(true)),
}));
