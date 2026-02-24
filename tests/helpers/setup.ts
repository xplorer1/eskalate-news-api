import { vi } from "vitest";

// Mock environment variables before anything else imports env.ts
vi.stubEnv("PORT", "3000");
vi.stubEnv("NODE_ENV", "test");
vi.stubEnv("DB_HOST", "localhost");
vi.stubEnv("DB_PORT", "5432");
vi.stubEnv("DB_NAME", "test_db");
vi.stubEnv("DB_USER", "test_user");
vi.stubEnv("DB_PASSWORD", "test_password");
vi.stubEnv("JWT_SECRET", "test_jwt_secret_that_is_long_enough");
vi.stubEnv("JWT_EXPIRES_IN", "24h");
vi.stubEnv("REDIS_HOST", "localhost");
vi.stubEnv("REDIS_PORT", "6379");

// Mock Sequelize to avoid actual DB connections
vi.mock("../../src/config/database", () => ({
  sequelize: {
    authenticate: vi.fn().mockResolvedValue(undefined),
    sync: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([]),
    define: vi.fn(),
  },
}));
