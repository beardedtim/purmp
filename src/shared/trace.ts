import * as CTX from "@app/shared/ctx";
import Log from "@app/shared/log";

export const traceAsync = <T = unknown>(
  fn: (...args: any[]) => Promise<T>,
  state: { [x: string]: any }
) =>
  CTX.runWith<Promise<T>>(async (...args: any[]) => {
    Log.trace("Span Begin");

    const result = await fn(...args);

    Log.trace("Span End");

    return result;
  }, state);

export const trace = <T = unknown>(
  fn: (...args: any[]) => T,
  state: { [x: string]: any }
) =>
  CTX.runWith<T>((...args: any[]) => {
    Log.trace("Span Begin");

    const result = fn(...args);

    Log.trace("Span End");

    return result as T;
  }, state);
