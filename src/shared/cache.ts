import Redis from "ioredis";
import Log from "@app/shared/log";
import { traceAsync } from "@app/shared/trace";

const log = Log.child({
  system: "Cache",
});

const client = new Redis({
  host: "0.0.0.0",
  port: 9998,
});

export const getCache = () => client;

export const isHealthy = traceAsync(
  () =>
    getCache()
      .info()
      .then(() => {
        log.trace("Cache healthy");

        return true;
      })
      .catch((err) => {
        log.warn({ err }, "Cache is not healthy with error");

        return false;
      }),
  {
    reason: "cache::healthcheck",
  }
);
