import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { CLOUD_FLARE_ACC_ID, CLOUD_FLARE_BUCKET_URL } from "./constants";
import fs from "fs";

if (!process.env.CLOUD_FLARE_SECRET) {
  throw new Error("CLOUD_FLARE_SECRET environment variable is required");
}

const s3 = new S3Client({
  endpoint: CLOUD_FLARE_BUCKET_URL,
  region: "auto",
  credentials: {
    accessKeyId: CLOUD_FLARE_ACC_ID,
    secretAccessKey: process.env.CLOUD_FLARE_SECRET,
  },
});

//fileName = key (for location of file inside the bucket)

export default async function uploadFileToS3(
  fileName: string,
  localFilePath: string
) {
  if (!fs.existsSync(localFilePath)) throw new Error("File Does Not Exists");
  const fileContent = fs.createReadStream(localFilePath);
  const uploadParams = {
    key: fileName,
    bucket: "clique-host",
    body: fileContent,
  };
  const input = {
    Bucket: uploadParams.bucket,
    Key: uploadParams.key,
    Body: uploadParams.body,
  };
  const uploadCmd = new PutObjectCommand(input);
  const response = await s3.send(uploadCmd);
  console.log("uploaded", response);
}
