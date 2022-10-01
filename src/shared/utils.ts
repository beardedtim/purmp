import Chars from "@app/shared/chars";
import { randomUUID } from "crypto";

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
