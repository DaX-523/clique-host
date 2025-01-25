import express, { Request, Response } from "express";
import { S3 } from "aws-sdk";
import { CLOUD_FLARE_ACC_ID, CLOUD_FLARE_BUCKET_URL } from "./constants";
const secretAccessKey = process.env.CLOUD_FLARE_SECRET;
if (!secretAccessKey) {
  throw new Error("CLOUD_FLARE_SECRET environment variable is not set");
}
const app = express();
const s3 = new S3({
  endpoint: CLOUD_FLARE_BUCKET_URL,
  accessKeyId: CLOUD_FLARE_ACC_ID,
  secretAccessKey: secretAccessKey,
});

app.get("/*", async (req: Request, res: Response) => {
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
  res.set("Content-Type", type);
  res.send(content.Body);
});

app.listen(3001, () => console.log("Listening on 3001"));
