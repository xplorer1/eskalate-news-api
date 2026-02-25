import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

const { mockArticle, mockReadLog } = vi.hoisted(() => ({
  mockArticle: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    init: vi.fn(),
    hasMany: vi.fn(),
    belongsTo: vi.fn(),
  },
  mockReadLog: {
    create: vi.fn().mockResolvedValue({}),
    init: vi.fn(),
    belongsTo: vi.fn(),
  },
}));

vi.mock("../../src/models", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
    init: vi.fn(),
    hasMany: vi.fn(),
    belongsTo: vi.fn(),
  },
  Article: mockArticle,
  ReadLog: mockReadLog,
  DailyAnalytics: { init: vi.fn(), hasMany: vi.fn(), belongsTo: vi.fn() },
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

const validArticle = {
  Title: "Test Article Title",
  Content:
    "This is a test article with enough content to pass the fifty character minimum requirement for validation.",
  Category: "Tech",
  Status: "Draft",
};

describe("POST /articles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should create an article for an author", async () => {
    mockArticle.create.mockResolvedValue({
      Id: "article-1",
      ...validArticle,
      AuthorId: "author-1",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    });

    const res = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${authorToken}`)
      .send(validArticle);

    expect(res.status).toBe(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object.Title).toBe("Test Article Title");
  });

  it("should return 403 for a reader trying to create an article", async () => {
    const res = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${readerToken}`)
      .send(validArticle);

    expect(res.status).toBe(403);
    expect(res.body.Success).toBe(false);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).post("/articles").send(validArticle);

    expect(res.status).toBe(401);
    expect(res.body.Success).toBe(false);
  });

  it("should return 400 for short content", async () => {
    const res = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ ...validArticle, Content: "Too short" });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("should return 400 for title exceeding 150 characters", async () => {
    const res = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ ...validArticle, Title: "A".repeat(151) });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });
});

describe("GET /articles/me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return paginated list of author's articles", async () => {
    mockArticle.findAndCountAll.mockResolvedValue({
      rows: [{ Id: "article-1", Title: "My Article" }],
      count: 1,
    });

    const res = await request(app)
      .get("/articles/me")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.PageNumber).toBe(1);
    expect(res.body.PageSize).toBe(10);
    expect(res.body.TotalSize).toBe(1);
  });

  it("should return 403 for a reader", async () => {
    const res = await request(app)
      .get("/articles/me")
      .set("Authorization", `Bearer ${readerToken}`);

    expect(res.status).toBe(403);
  });
});

describe("PUT /articles/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should update an article owned by the author", async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    mockArticle.findByPk.mockResolvedValue({
      Id: "article-1",
      AuthorId: "author-1",
      Title: "Updated Title",
      update: mockUpdate,
    });

    const res = await request(app)
      .put("/articles/article-1")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ Title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ Title: "Updated Title" });
  });

  it("should return 403 when updating another author's article", async () => {
    mockArticle.findByPk.mockResolvedValue({
      Id: "article-1",
      AuthorId: "other-author",
    });

    const res = await request(app)
      .put("/articles/article-1")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ Title: "Hijacked" });

    expect(res.status).toBe(403);
    expect(res.body.Success).toBe(false);
  });

  it("should return 404 for non-existent article", async () => {
    mockArticle.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put("/articles/nonexistent")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ Title: "New Title" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /articles/:id", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should soft-delete an article owned by the author", async () => {
    const mockDestroy = vi.fn().mockResolvedValue(undefined);
    mockArticle.findByPk.mockResolvedValue({
      Id: "article-1",
      AuthorId: "author-1",
      destroy: mockDestroy,
    });

    const res = await request(app)
      .delete("/articles/article-1")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("should return 403 when deleting another author's article", async () => {
    mockArticle.findByPk.mockResolvedValue({
      Id: "article-1",
      AuthorId: "other-author",
    });

    const res = await request(app)
      .delete("/articles/article-1")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /articles (public feed)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return published articles without auth", async () => {
    mockArticle.findAndCountAll.mockResolvedValue({
      rows: [{ Id: "article-1", Title: "Published Article", Status: "Published" }],
      count: 1,
    });

    const res = await request(app).get("/articles");

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.PageNumber).toBe(1);
    expect(res.body.PageSize).toBe(10);
  });

  it("should support pagination params", async () => {
    mockArticle.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

    const res = await request(app).get("/articles?page=2&size=5");

    expect(res.status).toBe(200);
    expect(res.body.PageNumber).toBe(2);
    expect(res.body.PageSize).toBe(5);
  });
});

describe("GET /articles/:id (single article)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return article and log read for guest", async () => {
    mockArticle.findByPk.mockResolvedValue({
      Id: "article-1",
      Title: "A Great Article",
      DeletedAt: null,
    });

    const res = await request(app).get("/articles/article-1");

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(mockReadLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ArticleId: "article-1",
        ReaderId: null,
      })
    );
  });

  it("should return error for soft-deleted article", async () => {
    mockArticle.findByPk.mockResolvedValue({
      Id: "article-1",
      DeletedAt: new Date(),
    });

    const res = await request(app).get("/articles/article-1");

    expect(res.status).toBe(404);
    expect(res.body.Errors).toContain("News article no longer available");
  });

  it("should return 404 for non-existent article", async () => {
    mockArticle.findByPk.mockResolvedValue(null);

    const res = await request(app).get("/articles/nonexistent");

    expect(res.status).toBe(404);
  });

  it("should capture ReaderId from JWT when logged in", async () => {
    mockArticle.findByPk.mockResolvedValue({
      Id: "article-1",
      DeletedAt: null,
    });

    const res = await request(app)
      .get("/articles/article-1")
      .set("Authorization", `Bearer ${readerToken}`);

    expect(res.status).toBe(200);
    expect(mockReadLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ArticleId: "article-1",
        ReaderId: "reader-1",
      })
    );
  });
});
