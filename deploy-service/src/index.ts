import { createClient, commandOptions } from "redis";
import { downloadFromS3 } from "./utils/cloudfare";

const subscriber = createClient();
subscriber.connect();

async function main() {
  while (true) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    console.log(response, `output/${response?.element}/`);
    await downloadFromS3(`output/${response?.element}/`);
    console.log("downloaded");
  }
}
main();
