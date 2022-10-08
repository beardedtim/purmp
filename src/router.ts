import Router from "@koa/router";
import * as DB from "@app/shared/db";
import * as Cache from "@app/shared/cache";
import DomainRoutes from "@app/domains/routes";

const router = new Router();

router.get("/healthcheck", async (ctx) => {
  const dbHealthy = await DB.isHealthy();
  const cacheHealthy = await Cache.isHealthy();

  if (!dbHealthy || !cacheHealthy) {
    ctx.body = "Not Healthy";
    ctx.status = 500;
  } else {
    ctx.body = "Healthy";
    ctx.status = 200;
  }
});

export default router.use(DomainRoutes);
