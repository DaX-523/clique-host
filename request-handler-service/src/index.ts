import express, { Request, Response } from "express";

const app = express();

app.get("/*", async (req: Request, res: Response) => {
  const hostname = req.hostname;
  const id = hostname.split(".")[0];
  console.log(id);
});

app.listen(3001, () => console.log("Listening on 3001"));
