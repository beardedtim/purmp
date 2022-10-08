import { DB } from "@app/shared/db";
import { compare } from "bcrypt";

import UserRepo from "./repository";
import * as Schemas from "./schemas";
import { parseDataAsSchema } from "@app/shared/utils";

import type { Insertable } from "kysely";
import type { Users } from "kysely-codegen";

export const passwordsMatch = async (
  db: DB,
  check: { password: string; email: string }
) => {
  const parsedCheck = parseDataAsSchema<Insertable<Users>>(
    Schemas.update,
    check
  );

  const { password: plaintext, email } = parsedCheck;

  const repo = new UserRepo(db);
  const user = await repo.getByKeyUnsafe("email", email);

  return compare(plaintext, user.password);
};

export const create = (db: DB, user: { email: string; password: string }) => {
  const parsedUser = parseDataAsSchema<Insertable<Users>>(Schemas.create, user);

  const repo = new UserRepo(db);

  return repo.create(parsedUser);
};
