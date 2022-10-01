import { AsyncLocalStorage } from "async_hooks";
import { genPrettyID } from "@app/shared/utils";

const globalCTX = new AsyncLocalStorage();

interface State {
  [x: string]: any;
  span?: string;
  parentSpan?: string;
}

/**
 * Reads the current State from the current Execution CTX
 */
export const read = () => (globalCTX.getStore() || {}) as State;

/**
 * Merges the passed in State with the current State
 *
 * Returns a new object without affecting the old
 */
const mergeState = (state: State) => Object.assign({}, read(), state);

/**
 * Creates a new State with respect to Span
 */
const newState = (state?: State) => {
  const ctx = read();
  const span = ctx.span;

  const nextState = {
    ...mergeState(state || {}),
    parentSpan: span,
    span: `${genPrettyID(5)}-${genPrettyID(8)}-${genPrettyID(5)}`,
  };

  return nextState as State;
};

/**
 * Runs a specific function with the passed in State
 * merged in with the current scope.
 *
 * A way to run a function in a scope that takes from
 * the current scope
 */
export const run = (fn: () => unknown, state?: State) =>
  globalCTX.run(newState(state), fn);

/**
 * Updates the State with the current keys without
 * creating a new context.
 */
export const set = (state: State) =>
  globalCTX.enterWith(mergeState(newState(state)));

/**
 * A way to wrap a function inside of a run
 *
 * Ex:
 *
 * const getUser = async (id: string, db: Db) => {
 *  return { id, name: "tim" }
 * }
 *
 * const ctxGetUser = runWith(getUser, { reason: "getting user" })
 *
 * ctxGetUser('user-123', db) // Promise<{ id: 'user-123', name: "tim" }>
 */
export const runWith =
  (fn: (...args: any[]) => unknown, state: State) =>
  async (...args: any[]) =>
    run(async () => fn(...args), state);
