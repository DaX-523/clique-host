import { CLOUD_FLARE_ACC_ID, CLOUD_FLARE_BUCKET_URL } from "./constants";
import fs from "fs";
import { S3 } from "aws-sdk";

const secretAccessKey = process.env.CLOUD_FLARE_SECRET;
if (!secretAccessKey) {
  throw new Error("CLOUD_FLARE_SECRET environment variable is not set");
}

const s3 = new S3({
  endpoint: CLOUD_FLARE_BUCKET_URL,
  accessKeyId: CLOUD_FLARE_ACC_ID,
  secretAccessKey: secretAccessKey,
});

//fileName = key (for location of file inside the bucket)

export default async function uploadFileToS3(
  fileName: string,
  localFilePath: string
) {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File does not exist: ${localFilePath}`);
    }

    const fileContent = fs.createReadStream(localFilePath);
    const uploadParams = {
      Bucket: "clique-host",
      Key: fileName,
      Body: fileContent,
    };

    // Handle stream errors
    fileContent.on("error", (error) => {
      console.error(`Error reading file ${localFilePath}:`, error);
      throw error;
    });

    const response = await s3.upload(uploadParams).promise();
    console.log(`Uploaded ${fileName}:`, response);
    return response;
  } catch (error) {
    console.error(`Error uploading file ${fileName}:`, error);
    throw error;
  }
}
