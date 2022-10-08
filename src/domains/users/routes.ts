import Router from "@koa/router";
import Body from "koa-body";

import { getDB } from "@app/shared/db";
import { getCache } from "@app/shared/cache";
import * as DomainErrors from "@app/domains/errors";
import { traceAsync } from "@app/shared/trace";

import Repo from "./repository";
import Model from "./model";

import type { Middleware } from "koa";

const router = new Router();

const getModel = () => {
  const DB = getDB();
  const cache = getCache();

  return new Model(new Repo(DB), cache);
};

export const createUser: Middleware = async (ctx) => {
  const model = getModel();
  const reqData = ctx.request.body;
  const result = await model.create(reqData);

  ctx.status = 201;
  ctx.body = { data: result };
};

export const getById: Middleware = async (ctx) => {
  const model = getModel();
  const result = await model.getById(ctx.params.id);

  if (!result) {
    throw new DomainErrors.DomainItemNotFound("Users", ctx.params.id);
  }

  ctx.status = 200;
  ctx.body = { data: result };
};

export const updateById: Middleware = async (ctx) => {
  const model = getModel();
  const result = await model.updateById(ctx.params.id, ctx.request.body);

  if (!result) {
    throw new DomainErrors.DomainItemNotFound("Users", ctx.params.id);
  }

  ctx.status = 200;
  ctx.body = { data: result };
};

export default router
  .post(
    "/",
    Body(),
    traceAsync(createUser, { reason: "domains::users::create-user" })
  )
  .get("/:id", traceAsync(getById, { reason: "domains::users::get-by-id" }))
  .patch(
    "/:id",
    Body(),
    traceAsync(updateById, { reason: "domains::users::-update-by-id" })
  )
  .routes();
