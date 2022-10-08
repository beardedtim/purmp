import { hash } from "bcrypt";

import type { DB } from "@app/shared/db";
import type { Users } from "kysely-codegen";
import type { Insertable, ReferenceExpression, Selectable } from "kysely";

class UserRepo {
  connection: DB;
  safeColumns = ["id", "created_at", "email"] as const;

  constructor(db: DB) {
    this.connection = db;
  }

  async create(userRequest: Insertable<Users>) {
    const { password: plaintext, email } = userRequest;

    const password = await hash(plaintext, 10);

    const saved = await this.connection
      .insertInto("users")
      .values({ email, password })
      .returning(this.safeColumns)
      .executeTakeFirstOrThrow();

    return saved;
  }

  getByKeyUnsafe(key: "id" | "email", value: string) {
    return this.connection
      .selectFrom("users")
      .where(key, "=", value)
      .selectAll()
      .executeTakeFirstOrThrow();
  }

  getByKey(key: "id" | "email", value: string) {
    return this.connection
      .selectFrom("users")
      .where(key, "=", value)
      .select(this.safeColumns)
      .executeTakeFirstOrThrow();
  }

  getById(id: string) {
    return this.getByKey("id", id);
  }

  getByEmail(email: string) {
    return this.getByKey("email", email);
  }

  async updateById(id: string, update: Insertable<Users>) {
    const insertData: any = {};

    if (update.password) {
      insertData.password = await hash(update.password, 10);
    }

    if (update.email) {
      insertData.email = update.email;
    }

    insertData.last_updated = new Date().toISOString();

    return this.connection
      .updateTable("users")
      .set(insertData)
      .where("id", "=", id)
      .returning(this.safeColumns)
      .executeTakeFirstOrThrow();
  }
}

export default UserRepo;
