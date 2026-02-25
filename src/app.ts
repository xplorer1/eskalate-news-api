import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./modules/auth/auth.routes";
import articlesRoutes from "./modules/articles/articles.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/auth", authRoutes);
app.use("/articles", articlesRoutes);
app.use("/author", analyticsRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
