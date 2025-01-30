import fs from "fs";
import path from "path";

export default function getAllfiles(folderPath: string): string[] {
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
