import type { Redis } from "ioredis";
import { Insertable, Selectable, Updateable } from "kysely";
import { Users } from "kysely-codegen";

import Log from "@app/shared/log";
import * as DomainErrors from "@app/domains/errors";
import { parseDataAsSchema } from "@app/shared/utils";

import UserRepo from "./repository";
import * as Schemas from "./schemas";
import { setTimeout } from "timers/promises";
import { DB } from "@app/shared/db";

const log = Log.child({
  system: "User Model",
});

/**
 * A Model is an abstraction _over_ the
 * Repository that allows for caching the
 * data and house cleaning that goes along
 * with that
 */
class UserModel {
  connections: {
    repo: UserRepo;
    cache: Redis;
  };

  static Prefixes = {
    IS_UPDATING: "IS_UPDATING",
  };

  constructor(repo: UserRepo, cache: Redis) {
    this.connections = {
      repo,
      cache,
    };
  }

  #isUpdating(id: string) {
    return this.connections.cache.exists(
      `${UserModel.Prefixes.IS_UPDATING}::${id}`
    );
  }

  async #startCacheUpdate(id: string) {
    log.trace({ id }, "Starting to Update Cache");

    await this.connections.cache.set(
      `${UserModel.Prefixes.IS_UPDATING}::${id}`,
      "1"
    );
  }

  async #stopCacheUpdate(id: string) {
    log.trace({ id }, "Stopping to Update Cache");

    await this.connections.cache.del(
      `${UserModel.Prefixes.IS_UPDATING}::${id}`
    );
  }

  async #clearById(id: string) {
    log.trace({ id }, "Clearing User Data");

    await this.connections.cache.hdel(id);
  }

  async #storeById(id: string, data: any) {
    log.trace({ id, data }, "Storing User Data");
    // Set it in the cache by the ID
    await this.connections.cache.hset(id, data);

    // Set an expire in EXPIRE seconds
    const EXPIRE_IN_SEC = 60;
    await this.connections.cache.expire(id, EXPIRE_IN_SEC);
  }

  async getById(
    id: string,
    retry = 0
  ): Promise<Pick<Selectable<Users>, "id" | "email" | "created_at">> {
    if (await this.#isUpdating(id)) {
      if (retry === 5) {
        return this.connections.repo.getById(id);
      }

      await setTimeout(10);

      return this.getById(id, retry++);
    }

    if (!(await this.connections.cache.exists(id))) {
      log.trace({ id }, "Cache Miss");

      await this.#storeById(id, await this.connections.repo.getById(id));
    }

    log.trace({ id }, "Getting User from cache");

    return this.connections.cache.hgetall(id) as unknown as Promise<
      Pick<Selectable<Users>, "id" | "email" | "created_at">
    >;
  }

  async updateById(id: string, update: Updateable<Users>) {
    await this.#startCacheUpdate(id);
    const parsed = parseDataAsSchema<Updateable<Users>>(Schemas.update, update);

    const saved = await this.connections.repo.updateById(id, parsed);

    await this.#storeById(id, saved);

    await this.#stopCacheUpdate(id);

    return saved;
  }

  async create(user: Insertable<Users>) {
    try {
      const parsed = parseDataAsSchema<Insertable<Users>>(Schemas.create, user);

      const data = await this.connections.repo.create(parsed);

      await this.#storeById(data.id, data);

      return data;
    } catch (e: unknown) {
      const err = e as Error;

      log.warn({ err }, "Error creating user");

      if (
        err.message.includes(
          'duplicate key value violates unique constraint "users_email_key"'
        )
      ) {
        throw new DomainErrors.DuplicateDomainItemFound(
          "Users",
          "email",
          user.email
        );
      }

      log.warn({ err }, "unhandled error. bubbling up");

      throw e;
    }
  }
}

export default UserModel;
