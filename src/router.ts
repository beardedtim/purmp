import Router from "@koa/router";
import * as DB from "@app/shared/db";

const router = new Router();

router.get("/healthcheck", async (ctx) => {
  const dbHealthy = await DB.isHealthy();

  if (!dbHealthy) {
    ctx.body = "Not Healthy";
    ctx.status = 500;
  } else {
    ctx.body = "Healthy";
    ctx.status = 200;
  }
});

export default router;
