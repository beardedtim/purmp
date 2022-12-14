import { createServer } from "@app/server";
import * as Env from "@app/shared/env";
import Log from "@app/shared/log";
import * as DB from "@app/shared/db";
import { traceAsync } from "@app/shared/trace";

const main = traceAsync(
  async () => {
    Log.debug("System Starting");
    const app = createServer();

    Log.trace({ port: Env.port }, "Opening Port");

    await new Promise((res) => {
      app.listen(Env.port, () => {
        res(void 0);
      });
    });

    Log.trace("Port Opened");
  },
  {
    reason: "app::global",
  }
);

DB.migrate().then(main);
