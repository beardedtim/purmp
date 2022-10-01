import path from "path";

export const logLevel = process.env.LOG_LEVEL || "trace";
export const port = process.env.PORT || 5050;
export const version = process.env.VERSION || "0.0.1";

export const artifactDir =
  process.env.ARTIFACT_DIR || path.resolve(__dirname, "..", "..", "artifacts");

export const migrationDir =
  process.env.MIGRATION_DIR || path.resolve(artifactDir, "db", "migrations");
