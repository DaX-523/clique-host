import { createClient, commandOptions } from "redis";
import { downloadFromS3, uploadBuildToS3 } from "./utils/cloudfare";
import buildProject from "./utils/buildProject";
import fs from "fs";
import path from "path";

const subscriber = createClient();
const publisher = createClient();

// Handle Redis connection errors
subscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));
publisher.on("error", (err) => console.error("Redis Publisher Error:", err));

// Connect to Redis with error handling
Promise.all([subscriber.connect(), publisher.connect()]).catch((err) => {
  console.error("Failed to connect to Redis:", err);
  process.exit(1);
});

async function cleanup(id: string) {
  try {
    const outputPath = path.join(__dirname, "output", id);
    if (fs.existsSync(outputPath)) {
      await fs.promises.rm(outputPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

async function processDeployment(id: string) {
  try {
    console.log(`Processing deployment for ${id}`);
    await downloadFromS3(`output/${id}/`);
    console.log("Files downloaded successfully");

    await buildProject(id);
    console.log("Project built successfully");

    await uploadBuildToS3(id);
    console.log("Build uploaded successfully");

    await publisher.hSet("status", id, "deployed");
    console.log("Status updated to deployed");

    // Cleanup after successful deployment
    await cleanup(id);
  } catch (error) {
    console.error(`Deployment failed for ${id}:`, error);
    // Update status to failed
    await publisher.hSet("status", id, "failed").catch(console.error);
    // Cleanup on error
    await cleanup(id);
    // Don't rethrow - we want to continue processing other deployments
  }
}

async function main() {
  while (true) {
    try {
      const response = await subscriber.brPop(
        commandOptions({ isolated: true }),
        "build-queue",
        0
      );

      const id = response?.element;
      if (!id) {
        console.warn("Received empty id from build queue");
        continue;
      }

      await processDeployment(id);
    } catch (error) {
      console.error("Error in main loop:", error);
      // Wait a bit before retrying to prevent tight error loops
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  try {
    await Promise.all([subscriber.quit(), publisher.quit()]);
    console.log("Connections closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

// Start the service
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
