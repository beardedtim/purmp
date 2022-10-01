import * as CTX from "@app/shared/ctx";
import Log from "@app/shared/log";

export const traceAsync = (
  fn: (...args: any[]) => Promise<unknown>,
  state: { [x: string]: any }
) =>
  CTX.runWith(async (...args: any[]) => {
    Log.trace("Span Begin");

    const result = await fn(...args);

    Log.trace("Span End");

    return result;
  }, state);

export const trace = (
  fn: (...args: any[]) => Promise<unknown>,
  state: { [x: string]: any }
) =>
  CTX.runWith((...args: any[]) => {
    Log.trace("Span Begin");

    const result = fn(...args);

    Log.trace("Span End");

    return result;
  }, state);
