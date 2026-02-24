import { Request } from "express";

export interface AuthPayload {
  sub: string;
  role: "author" | "reader";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
