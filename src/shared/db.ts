// Needed for DB migrations
import { promises as fs } from "fs";
import path from "path";

import { Pool } from "pg";

import {
  Kysely,
  PostgresDialect,
  Migrator,
  FileMigrationProvider,
} from "kysely";

// Generated via db::gen-types
import { DB } from "kysely-codegen";

import * as Env from "@app/shared/env";
import Log from "@app/shared/log";

// Run things in own context
import * as CTX from "@app/shared/ctx";
import { traceAsync } from "@app/shared/trace";

const log = Log.child({
  name: "DB",
});

const underlyingPool = new Pool({
  host: "0.0.0.0",
  database: "purmp",
  port: 9999,
  user: "username",
  password: "password",
});

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: underlyingPool,
  }),
});

const dbDefaultMeta = {
  dbDialect: "pg",
};

export const migrate = traceAsync(
  async () => {
    log.trace("Migrating Database");

    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        migrationFolder: Env.migrationDir,
        fs,
        path,
      }),
    });

    await migrator.migrateToLatest();
    log.trace("DB migrated to latest");
  },
  {
    ...dbDefaultMeta,
    reason: "migration",
  }
);

export const getDB = () => db;

export const isHealthy = traceAsync(
  async () =>
    underlyingPool
      .query("SELECT NOW()")
      .then(() => {
        log.trace("Database healthy");

        return true;
      })
      .catch((err) => {
        log.warn({ err }, "Database not healthy");

        return false;
      }),
  {
    reason: "db::healthcheck",
  }
);
