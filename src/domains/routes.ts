import Router from "@koa/router";
import * as UserDomain from "./users";

const router = new Router();

export default router.use("/users", UserDomain.Routes).routes();
