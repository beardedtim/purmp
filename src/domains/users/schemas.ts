import Joi from "joi";

import { Insertable, Updateable } from "kysely";
import type { Users } from "kysely-codegen";

const emailSchema = () => Joi.string().email();
const passwordSchema = () => Joi.string().min(6).max(50);

export const create = Joi.object<Insertable<Users>>({
  email: emailSchema().required(),
  password: passwordSchema().required(),
});

export const update = Joi.object<Updateable<Users>>({
  email: emailSchema().optional(),
  password: passwordSchema().optional(),
});
