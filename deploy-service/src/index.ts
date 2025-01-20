import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import generate from "./utils/generate";
import simpleGit from "simple-git";
import validate from "./utils/validation";
import getAllfiles from "./utils/getAllfiles";
import uploadFileToS3 from "./utils/cloudflare";
const app = express();
// uploadFileToS3(
//   "test/index.ts",
//   "/home/kaydee/clique-host/deploy-service/dist/output/J0PR9n/deploy-service/src/index.ts"
// );
app.use(cors());
app.use(express.json());

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
  console.log(files);
  files.forEach((file) => {
    uploadFileToS3("", file);
  });
  res.json({ message: "Ready", id });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
