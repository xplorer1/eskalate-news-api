import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { User } from "../../models";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors";
import { SignupInput, LoginInput } from "./auth.schema";

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 86400; // default 24h
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s": return num;
    case "m": return num * 60;
    case "h": return num * 3600;
    case "d": return num * 86400;
    default: return 86400;
  }
}

export class AuthService {
  async signup(data: SignupInput) {
    const existingUser = await User.findOne({ where: { Email: data.Email } });

    if (existingUser) {
      throw AppError.conflict("A user with this email already exists");
    }

    const hashedPassword = await argon2.hash(data.Password);

    const user = await User.create({
      Name: data.Name,
      Email: data.Email,
      Password: hashedPassword,
      Role: data.Role,
    });

    return {
      Id: user.Id,
      Name: user.Name,
      Email: user.Email,
      Role: user.Role,
      CreatedAt: user.CreatedAt,
    };
  }

  async login(data: LoginInput) {
    const user = await User.findOne({ where: { Email: data.Email } });

    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const isValidPassword = await argon2.verify(user.Password, data.Password);

    if (!isValidPassword) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const expiresInSeconds = parseExpiresIn(env.JWT_EXPIRES_IN);

    const token = jwt.sign(
      { sub: user.Id, role: user.Role },
      env.JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    return {
      token,
      user: {
        Id: user.Id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
      },
    };
  }
}
