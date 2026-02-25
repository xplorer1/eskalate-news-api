import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

const { mockFindAndCountAll } = vi.hoisted(() => ({
  mockFindAndCountAll: vi.fn(),
}));

vi.mock("../../src/models", () => ({
  User: {
    findOne: vi.fn(),
    init: vi.fn(),
    hasMany: vi.fn(),
    belongsTo: vi.fn(),
  },
  Article: {
    findAndCountAll: mockFindAndCountAll,
    findByPk: vi.fn(),
    create: vi.fn(),
    init: vi.fn(),
    hasMany: vi.fn(),
    belongsTo: vi.fn(),
  },
  ReadLog: {
    create: vi.fn().mockResolvedValue({}),
    init: vi.fn(),
    belongsTo: vi.fn(),
  },
  DailyAnalytics: {
    upsert: vi.fn(),
    init: vi.fn(),
    hasMany: vi.fn(),
    belongsTo: vi.fn(),
  },
}));

vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
    verify: vi.fn(),
  },
}));

import app from "../../src/app";

const JWT_SECRET = "test_jwt_secret_that_is_long_enough";
const authorToken = jwt.sign({ sub: "author-1", role: "author" }, JWT_SECRET);
const readerToken = jwt.sign({ sub: "reader-1", role: "reader" }, JWT_SECRET);

describe("GET /author/dashboard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return paginated dashboard for an author", async () => {
    mockFindAndCountAll.mockResolvedValue({
      rows: [
        {
          Id: "article-1",
          Title: "My Article",
          CreatedAt: new Date(),
          get: vi.fn().mockReturnValue(42),
        },
      ],
      count: [{ count: 1 }],
    });

    const res = await request(app)
      .get("/author/dashboard")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.PageNumber).toBe(1);
    expect(res.body.PageSize).toBe(10);
    expect(res.body.TotalSize).toBe(1);
    expect(res.body.Object.length).toBe(1);
  });

  it("should return 403 for a reader", async () => {
    const res = await request(app)
      .get("/author/dashboard")
      .set("Authorization", `Bearer ${readerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.Success).toBe(false);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).get("/author/dashboard");

    expect(res.status).toBe(401);
    expect(res.body.Success).toBe(false);
  });

  it("should support custom pagination params", async () => {
    mockFindAndCountAll.mockResolvedValue({
      rows: [],
      count: [],
    });

    const res = await request(app)
      .get("/author/dashboard?page=3&size=5")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.PageNumber).toBe(3);
    expect(res.body.PageSize).toBe(5);
    expect(res.body.TotalSize).toBe(0);
  });

  it("should return empty dashboard for author with no articles", async () => {
    mockFindAndCountAll.mockResolvedValue({
      rows: [],
      count: [],
    });

    const res = await request(app)
      .get("/author/dashboard")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.Object).toEqual([]);
    expect(res.body.TotalSize).toBe(0);
  });
});
