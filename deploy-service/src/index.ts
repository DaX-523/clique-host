import { createClient, commandOptions } from "redis";
import { downloadFromS3, uploadBuildToS3 } from "./utils/cloudfare";
import buildProject from "./utils/buildProject";

const subscriber = createClient();
subscriber.connect();
const publisher = createClient();
publisher.connect();

async function main() {
  while (true) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    const id = response?.element;
    console.log(response, `output/${id}/`);
    await downloadFromS3(`output/${id}/`);
    console.log("downloaded");
    await buildProject(id || "");
    console.log("built");
    await uploadBuildToS3(id || "");
    await publisher.hSet("status", id as string, "deployed");
  }
}
main();
