import app from "./app";
import { env } from "./config/env";
import { sequelize } from "./config/database";
import "./models";

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync({ alter: env.NODE_ENV === "development" });
    console.log("Database models synchronized.");

    app.listen(env.PORT, () => {
      console.log(
        `Server running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
