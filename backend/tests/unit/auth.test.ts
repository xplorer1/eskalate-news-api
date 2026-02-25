import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// Mock the models before importing app
vi.mock("../../src/models", () => {
  const User = {
    findOne: vi.fn(),
    create: vi.fn(),
    init: vi.fn(),
    hasMany: vi.fn(),
    belongsTo: vi.fn(),
  };
  const Article = { init: vi.fn(), hasMany: vi.fn(), belongsTo: vi.fn() };
  const ReadLog = { init: vi.fn(), hasMany: vi.fn(), belongsTo: vi.fn() };
  const DailyAnalytics = { init: vi.fn(), hasMany: vi.fn(), belongsTo: vi.fn() };
  return { User, Article, ReadLog, DailyAnalytics };
});

vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    verify: vi.fn(),
  },
}));

import app from "../../src/app";
import { User } from "../../src/models";
import argon2 from "argon2";

const mockedUser = User as any;
const mockedArgon2 = argon2 as any;

const validSignupBody = {
  Name: "John Doe",
  Email: "john@example.com",
  Password: "Strong@123",
  Role: "author",
};

describe("POST /auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    mockedUser.findOne.mockResolvedValue(null);
    mockedUser.create.mockResolvedValue({
      Id: "uuid-123",
      Name: "John Doe",
      Email: "john@example.com",
      Role: "author",
      CreatedAt: new Date(),
    });

    const res = await request(app).post("/auth/signup").send(validSignupBody);

    expect(res.status).toBe(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object.Email).toBe("john@example.com");
    expect(res.body.Object).not.toHaveProperty("Password");
  });

  it("should return 409 for duplicate email", async () => {
    mockedUser.findOne.mockResolvedValue({ Id: "existing-user" });

    const res = await request(app).post("/auth/signup").send(validSignupBody);

    expect(res.status).toBe(409);
    expect(res.body.Success).toBe(false);
    expect(res.body.Errors).toContain("A user with this email already exists");
  });

  it("should return 400 for weak password", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ ...validSignupBody, Password: "weak" });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
    expect(res.body.Errors.length).toBeGreaterThan(0);
  });

  it("should return 400 for invalid name with numbers", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ ...validSignupBody, Name: "John123" });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("should return 400 for invalid role", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ ...validSignupBody, Role: "admin" });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });

  it("should return 400 for invalid email", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ ...validSignupBody, Email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });
});

describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully with valid credentials", async () => {
    mockedUser.findOne.mockResolvedValue({
      Id: "uuid-123",
      Name: "John Doe",
      Email: "john@example.com",
      Password: "hashed_password",
      Role: "author",
    });
    mockedArgon2.verify.mockResolvedValue(true);

    const res = await request(app)
      .post("/auth/login")
      .send({ Email: "john@example.com", Password: "Strong@123" });

    expect(res.status).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object.token).toBeDefined();

    // Verify JWT payload
    const decoded = jwt.decode(res.body.Object.token) as any;
    expect(decoded.sub).toBe("uuid-123");
    expect(decoded.role).toBe("author");
  });

  it("should return 401 for non-existent email", async () => {
    mockedUser.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/login")
      .send({ Email: "nobody@example.com", Password: "Strong@123" });

    expect(res.status).toBe(401);
    expect(res.body.Success).toBe(false);
    expect(res.body.Errors).toContain("Invalid email or password");
  });

  it("should return 401 for wrong password", async () => {
    mockedUser.findOne.mockResolvedValue({
      Id: "uuid-123",
      Password: "hashed_password",
    });
    mockedArgon2.verify.mockResolvedValue(false);

    const res = await request(app)
      .post("/auth/login")
      .send({ Email: "john@example.com", Password: "WrongPass@1" });

    expect(res.status).toBe(401);
    expect(res.body.Success).toBe(false);
  });

  it("should return 400 for missing email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ Password: "Strong@123" });

    expect(res.status).toBe(400);
    expect(res.body.Success).toBe(false);
  });
});
