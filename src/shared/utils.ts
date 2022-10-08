import Chars from "@app/shared/chars";
import { randomUUID } from "crypto";
import Joi from "joi";

export const randomChar = (str: string) =>
  str.charAt(Math.floor(Math.random() * str.length));

export const genPrettyID = (
  len = 10,
  dict = `${Chars.lowercaseAlpha}${Chars.uppercaseAlpha}${Chars.digits}`
) => {
  let str = "";

  for (let i = 0; i < len; i++) {
    str += randomChar(dict);
  }

  return str;
};

export const uuid = () => randomUUID({ disableEntropyCache: true });

export const parseDataAsSchema = <T = unknown>(
  schema: Joi.Schema,
  data: unknown
): T => {
  const result = schema.validate(data);

  if (result.error) {
    throw result.error;
  }

  return result.value as T;
};
