import { Middleware } from "koa";

import * as CTX from "@app/shared/ctx";
import Log from "@app/shared/log";
import { uuid, genPrettyID } from "@app/shared/utils";
import { traceAsync } from "@app/shared/trace";

export const globalErrorHandler = (): Middleware => async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    const err = e as Error & { statusCode?: number };
    ctx.status = err.statusCode || 500;
    ctx.body = {
      error: {
        message: err.message || "Internal Error Message",
      },
    };
  }
};

export const globalHandler = (ctx: { [x: string]: any }): Middleware =>
  traceAsync(
    async (_ctx, next) => {
      Log.trace("Server handling request");

      await CTX.run(next);

      Log.trace("Server handled request");
    },
    {
      ...ctx,
      req_id: uuid(),
      reason: "global-handler",
    }
  );

export const reqLogger = (): Middleware => async (ctx, next) => {
  Log.trace(
    {
      req: ctx.req,
      res: ctx.res,
    },
    "Handling Request"
  );

  const tracedNext = traceAsync(next, {
    reason: "middleware",
  });

  await tracedNext();

  Log.trace(
    {
      req: ctx.req,
      res: ctx.res,
      status: ctx.status,
    },
    "Request Handled"
  );
};

/**
 * Allows setting the Trace ID inside of the
 * CTX so that if the request coming in happens
 * to be a part of a larger Trace, it can set
 * the ID it wants us to use and we can wrap
 * all of the async work we are doing inside of it
 */
export const useTraceId =
  (header = "x-trace-id"): Middleware =>
  async (ctx, next) => {
    const trace =
      ctx.headers[header.toLowerCase()] ??
      `${genPrettyID(5)}-${genPrettyID(8)}-${genPrettyID(5)}`;

    return CTX.run(next, {
      trace,
    });
  };
