import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "News API",
      version: "1.0.0",
      description:
        "A RESTful API for a news platform with authentication, articles CRUD, read tracking, and analytics.",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        variables: {
          port: { default: env.PORT },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        BaseResponse: {
          type: "object",
          properties: {
            Success: { type: "boolean" },
            Message: { type: "string" },
            Object: { type: "object", nullable: true },
            Errors: {
              type: "array",
              items: { type: "string" },
              nullable: true,
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            Success: { type: "boolean" },
            Message: { type: "string" },
            Object: { type: "array", items: { type: "object" } },
            Errors: {
              type: "array",
              items: { type: "string" },
              nullable: true,
            },
            PageNumber: { type: "integer" },
            PageSize: { type: "integer" },
            TotalSize: { type: "integer" },
          },
        },
        User: {
          type: "object",
          properties: {
            Id: { type: "string", format: "uuid" },
            Name: { type: "string" },
            Email: { type: "string", format: "email" },
            Role: { type: "string", enum: ["author", "reader"] },
            CreatedAt: { type: "string", format: "date-time" },
          },
        },
        Article: {
          type: "object",
          properties: {
            Id: { type: "string", format: "uuid" },
            Title: { type: "string" },
            Content: { type: "string" },
            Category: { type: "string" },
            Status: { type: "string", enum: ["Draft", "Published"] },
            AuthorId: { type: "string", format: "uuid" },
            CreatedAt: { type: "string", format: "date-time" },
            UpdatedAt: { type: "string", format: "date-time" },
            DeletedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
        DashboardEntry: {
          type: "object",
          properties: {
            Id: { type: "string", format: "uuid" },
            Title: { type: "string" },
            CreatedAt: { type: "string", format: "date-time" },
            TotalViews: { type: "integer" },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../modules/**/*.routes.{ts,js}")],
};

export const swaggerSpec = swaggerJsdoc(options);
