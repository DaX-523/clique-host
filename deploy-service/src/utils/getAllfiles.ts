import fs from "fs";
import path from "path";

export default function getAllfiles(folderPath: string) {
  let response: string[] = [];
  const fullDirPath = fs.readdirSync(folderPath);
  fullDirPath.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllfiles(fullFilePath));
    } else response.push(fullFilePath);
  });
  return response;
}
