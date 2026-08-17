import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth";
import billingRoutes from "./routes/billing";
import documentRoutes from "./routes/documents";
import highlightRoutes from "./routes/highlights";
import notebookRoutes from "./routes/notebooks";
import { ensureAsaasBillingWebhook } from "./services/asaas";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Margem API",
      version: "1.0.0",
      description: "API for Margem - A platform for reading and annotating documents",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/billing", billingRoutes);
app.use("/documents", documentRoutes);
app.use("/highlights", highlightRoutes);
app.use("/notebooks", notebookRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Margem API running at http://localhost:${port}`);
  ensureAsaasBillingWebhook().catch((error) => {
    console.error(
      "Failed to configure Asaas billing webhook:",
      error instanceof Error ? error.message : error
    );
  });
});
