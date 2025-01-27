import { CLOUD_FLARE_ACC_ID, CLOUD_FLARE_BUCKET_URL } from "./constants";
import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

// Validate environment variables
const secretAccessKey = process.env.CLOUD_FLARE_SECRET;
if (!secretAccessKey) {
  throw new Error("CLOUD_FLARE_SECRET environment variable is not set");
}

// Initialize S3 client
const s3 = new S3({
  endpoint: CLOUD_FLARE_BUCKET_URL,
  accessKeyId: CLOUD_FLARE_ACC_ID,
  secretAccessKey: secretAccessKey,
});

export async function downloadFromS3(prefix: string) {
  try {
    const allFiles = await s3
      .listObjectsV2({
        Bucket: "clique-host",
        Prefix: prefix,
      })
      .promise();

    if (!allFiles.Contents || allFiles.Contents.length === 0) {
      throw new Error(`No files found with prefix: ${prefix}`);
    }

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
  } catch (error) {
    console.error("Error in downloadFromS3:", error);
    throw error;
  }
}

export async function uploadBuildToS3(id: string) {
  try {
    const folderPath = getBuildFolderPath(id);
    const files = getAllfiles(folderPath);

    if (files.length === 0) {
      throw new Error(`No files found in build folder: ${folderPath}`);
    }

    console.log(`Found ${files.length} files to upload`);

    // Upload files in parallel with error handling
    await Promise.all(
      files.map(async (file) => {
        const s3Key =
          `${path.basename(folderPath)}/${id}/` +
          file.slice(folderPath.length + 1);
        try {
          await uploadFileToS3(s3Key, file);
          console.log(`Successfully uploaded: ${s3Key}`);
        } catch (error) {
          console.error(`Failed to upload ${file}:`, error);
          throw error;
        }
      })
    );
  } catch (error) {
    console.error("Error in uploadBuildToS3:", error);
    throw error;
  }
}

function getAllfiles(folderPath: string): string[] {
  try {
    let response: string[] = [];
    const fullDirPath = fs.readdirSync(folderPath);

    fullDirPath.forEach((file) => {
      const fullFilePath = path.join(folderPath, file);
      try {
        const stats = fs.statSync(fullFilePath);
        if (stats.isDirectory()) {
          response = response.concat(getAllfiles(fullFilePath));
        } else {
          response.push(fullFilePath);
        }
      } catch (error) {
        console.error(`Error processing file ${fullFilePath}:`, error);
        // Skip problematic files but continue processing others
      }
    });

    return response;
  } catch (error) {
    console.error(`Error reading directory ${folderPath}:`, error);
    throw error;
  }
}

async function uploadFileToS3(fileName: string, localFilePath: string) {
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

function getBuildFolderPath(id: string): string {
  try {
    const distPath = path.join(__dirname, "..", `output/${id}/dist`);
    const buildPath = path.join(__dirname, "..", `output/${id}/build`);

    if (fs.existsSync(distPath)) {
      return distPath;
    } else if (fs.existsSync(buildPath)) {
      return buildPath;
    }

    throw new Error(
      `Neither 'dist' nor 'build' folder exists for project ${id}. Paths checked: ${distPath}, ${buildPath}`
    );
  } catch (error) {
    console.error(`Error getting build folder path for ${id}:`, error);
    throw error;
  }
}
