import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import generate from "./utils/generate";
import simpleGit from "simple-git";
import validate from "./utils/validation";
import getAllfiles from "./utils/getAllfiles";
import uploadFileToS3 from "./utils/cloudflare";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();
const subscriber = createClient();
subscriber.connect();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.post("/api/deploy", async (req: Request, res: Response) => {
  const repoUrl = req.body.repoUrl as string;
  console.log(repoUrl);
  if (!validate(repoUrl)) {
    res.status(400).json({ message: "Please enter a valid URL" });
    return;
  }
  const id = generate();
  await simpleGit().clone(repoUrl, path.join(__dirname, "output/" + id));
  const files = getAllfiles(path.join(__dirname, "output/" + id));
  files.forEach(async (file: string) => {
    await uploadFileToS3(file.slice(__dirname.length + 1), file);
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  publisher.lPush("build-queue", id);
  publisher.hSet("status", id, "uploaded");
  res.json({ message: "Ready", id });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
