import Pino from "pino";
import * as Env from "@app/shared/env";
import * as CTX from "@app/shared/ctx";

export default Pino({
  name: "Purmp",
  level: Env.logLevel,
  serializers: Pino.stdSerializers,
  mixin: CTX.read,
});
