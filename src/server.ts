import Koa from "koa";

import Log from "@app/shared/log";
import * as Env from "@app/shared/env";
import { trace } from "@app/shared/trace";
import * as Middleware from "@app/middleware";
import Router from "@app/router";

const app = new Koa();

export const createServer = trace<Koa<Koa.DefaultState, Koa.DefaultContext>>(
  () => {
    Log.debug("Creating new Server");

    app
      .use(Middleware.globalErrorHandler())
      .use(Middleware.useTraceId())
      .use(
        Middleware.globalHandler({
          app: "Purmp",
          version: Env.version,
        })
      )
      .use(Middleware.reqLogger())
      .use(Router.routes());

    Log.debug("Server created");

    return app;
  },
  {
    reason: "create-server",
  }
);
