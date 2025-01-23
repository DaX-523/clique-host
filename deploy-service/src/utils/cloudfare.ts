import { CLOUD_FLARE_ACC_ID, CLOUD_FLARE_BUCKET_URL } from "./constants";

const secretAccessKey = process.env.CLOUD_FLARE_SECRET;
if (!secretAccessKey) {
  throw new Error("CLOUD_FLARE_SECRET environment variable is not set");
}

import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new S3({
  endpoint: CLOUD_FLARE_BUCKET_URL,
  accessKeyId: CLOUD_FLARE_ACC_ID,
  secretAccessKey: secretAccessKey,
});

// output/asdasd
export async function downloadFromS3(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "clique-host",
      Prefix: prefix,
    })
    .promise();

  console.log(allFiles);
  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, "..", Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: "clique-host",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];
  console.log("awaiting");

  await Promise.all(allPromises?.filter((x) => x !== undefined));
}
