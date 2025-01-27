import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import cors from "cors";
import path from "path";
import generate from "./utils/generate";
import simpleGit from "simple-git";
import validate from "./utils/validation";
import getAllfiles from "./utils/getAllfiles";
import uploadFileToS3 from "./utils/cloudflare";
import { createClient } from "redis";
import fs from "fs";

// Error handling middleware
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
};

// Helper function for cleanup
async function cleanup(path: string) {
  try {
    if (fs.existsSync(path)) {
      await fs.promises.rm(path, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

// Initialize Redis clients with error handling
const publisher = createClient();
const subscriber = createClient();

// Handle Redis connection errors
publisher.on("error", (err) => console.error("Redis Publisher Error:", err));
subscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));

// Connect to Redis with error handling
Promise.all([publisher.connect(), subscriber.connect()]).catch((err) => {
  console.error("Failed to connect to Redis:", err);
  process.exit(1);
});

const app = express();

app.use(cors());
app.use(express.json());

// Status endpoint with error handling
app.get("/status", (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.query.id;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid or missing id parameter" });
    }

    const response = await subscriber.hGet("status", id);
    if (!response) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.json({ status: response });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

// Deploy endpoint with error handling
app.post("/api/deploy", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const outputPath = path.join(__dirname, "output");
  try {
    const repoUrl = req.body.repoUrl as string;
    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    console.log(repoUrl);
    if (!validate(repoUrl)) {
      return res.status(400).json({ error: "Please enter a valid URL" });
    }

    const id = generate();
    const projectPath = path.join(outputPath, id);

    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Clone repository
    try {
      await simpleGit().clone(repoUrl, projectPath);
    } catch (gitError) {
      await cleanup(projectPath);
      return res.status(400).json({
        error: "Failed to clone repository",
        message: "Please ensure the repository exists and is accessible",
      });
    }

    // Get and upload files
    let files;
    try {
      files = getAllfiles(projectPath);
    } catch (error) {
      await cleanup(projectPath);
      return res.status(500).json({
        error: "Failed to read repository contents",
        message: "Repository structure may be invalid",
      });
    }

    if (files.length === 0) {
      await cleanup(projectPath);
      return res.status(400).json({
        error: "Empty repository",
        message: "The repository contains no files",
      });
    }

    await Promise.all(
      files.map(async (file: string) => {
        try {
          await uploadFileToS3(file.slice(__dirname.length + 1), file);
        } catch (error) {
          console.error(`Failed to upload file ${file}:`, error);
          throw error;
        }
      })
    );

    // Update status
    await Promise.all([
      publisher.lPush("build-queue", id),
      publisher.hSet("status", id, "uploaded"),
    ]);

    res.json({ message: "Ready", id });

    // Cleanup: Remove local files after successful upload
    fs.rm(projectPath, { recursive: true, force: true }, (err) => {
      if (err) console.error("Failed to cleanup:", err);
    });
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(path.join(outputPath, req.body.id))) {
      fs.rm(
        path.join(outputPath, req.body.id),
        { recursive: true, force: true },
        () => {}
      );
    }
    console.log("here", error);
    next(error);
  }
}) as RequestHandler);

// Register error handling middleware
app.use(errorHandler);

// Start server with error handling
const server = app
  .listen(3000, () => {
    console.log("Server is running on port 3000");
  })
  .on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");

  // Close Redis connections
  await Promise.all([publisher.quit(), subscriber.quit()]).catch(console.error);

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
