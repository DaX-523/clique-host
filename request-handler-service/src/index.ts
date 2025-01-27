import express, { Request, Response, NextFunction } from "express";
import { S3 } from "aws-sdk";
import { CLOUD_FLARE_ACC_ID, CLOUD_FLARE_BUCKET_URL } from "./constants";

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

let s3: S3;
try {
  const secretAccessKey = process.env.CLOUD_FLARE_SECRET;
  if (!secretAccessKey) {
    throw new Error("CLOUD_FLARE_SECRET environment variable is not set");
  }

  s3 = new S3({
    endpoint: CLOUD_FLARE_BUCKET_URL,
    accessKeyId: CLOUD_FLARE_ACC_ID,
    secretAccessKey: secretAccessKey,
  });
} catch (error) {
  console.error("Failed to initialize S3:", error);
  process.exit(1);
}

const app = express();

// Main route with error handling
app.get("/*", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostname = req.hostname;
    const id = hostname.split(".")[0];
    const filePath = req.path;

    const content = await s3
      .getObject({
        Bucket: "clique-host",
        Key: `dist/${id}${filePath}`,
      })
      .promise();

    const type = filePath.endsWith("html")
      ? "text/html"
      : filePath.endsWith("css")
      ? "text/css"
      : "application/javascript";

    if (!content.Body) {
      throw new Error("No content found");
    }

    res.set("Content-Type", type);
    res.send(content.Body);
  } catch (error: any) {
    if (error.code === "NoSuchKey") {
      res.status(404).json({ error: "File not found" });
    } else {
      next(error);
    }
  }
});

app.use(errorHandler);

const server = app
  .listen(3001, () => {
    console.log("Listening on 3001");
  })
  .on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
