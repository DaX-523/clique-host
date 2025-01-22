import { S3 } from "aws-sdk";
import { CLOUD_FLARE_ACC_ID, CLOUD_FLARE_BUCKET_URL } from "./constants";
import fs from "fs";

const s3 = new S3({
  endpoint: CLOUD_FLARE_BUCKET_URL,
  accessKeyId: CLOUD_FLARE_ACC_ID,
  secretAccessKey: process.env.CLOUD_FLARE_SECRET,
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
  const response = await s3
    .upload({
      Bucket: uploadParams.bucket,
      Key: uploadParams.key,
      Body: uploadParams.body,
    })
    .promise();
  console.log(response, "uploaded");
}
