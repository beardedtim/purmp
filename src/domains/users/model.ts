import type { Redis } from "ioredis";
import { Insertable } from "kysely";
import { Users } from "kysely-codegen";

import Log from "@app/shared/log";
import * as DomainErrors from "@app/domains/errors";
import { parseDataAsSchema } from "@app/shared/utils";

import UserRepo from "./repository";
import * as Schemas from "./schemas";

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

  constructor(repo: UserRepo, cache: Redis) {
    this.connections = {
      repo,
      cache,
    };
  }

  async #storeById(id: string, data: any) {
    log.trace({ id, data }, "Storing User Data");
    // Set it in the cache by the ID
    await this.connections.cache.hset(id, data);
    // Set an expire in EXPIRE seconds
    const EXPIRE_IN_SEC = 60;
    await this.connections.cache.expire(id, EXPIRE_IN_SEC);
  }

  async getById(id: string) {
    if (!(await this.connections.cache.exists(id))) {
      log.trace({ id }, "Cache Miss");
      await this.#storeById(id, await this.connections.repo.getById(id));
    }

    log.trace({ id }, "Getting User from cache");
    return this.connections.cache.hgetall(id);
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
