import { exec } from "child_process";
import path from "path";

export default async function (id: string) {
  return new Promise((resolve) => {
    const childProcess = exec(
      `cd ${path.join(
        __dirname,
        "..",
        `output/${id}`
      )} && npm install && npm run build`
    );

    childProcess.stdout?.on("data", (data) => {
      console.log("Processing...", data);
    });

    childProcess.stderr?.on("data", (err) => {
      console.error("Error occured: ", err);
    });

    childProcess.on("close", () => {
      resolve("");
    });
  });
}
