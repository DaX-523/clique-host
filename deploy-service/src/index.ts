import express, { Request, Response } from "express";
import cors from "cors";
import generate from "./utils/generate";
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/deploy", async (req: Request, res: Response) => {
  const repoUrl = req.body.repoUrl as string;
  console.log(repoUrl);
  const id = generate();
  res.json({ message: "Deployed", id });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
